import assert from "node:assert/strict";
import test from "node:test";

import {
  actAs,
  createDatabase,
  provisionAdmin,
  registerUser,
  userIds,
} from "./support/database.mjs";

const listingInput = {
  title: "Maple Student Residence",
  description: "A quiet boarding house within walking distance of the university.",
  address: "12 University Avenue",
  monthlyRent: 4500,
  roomType: "private_room",
  availableRooms: 2,
  contactName: "Owner account",
  contactPhone: "+63 900 000 0000",
  latitude: 14.599512,
  longitude: 120.984222,
};

async function createListing(database, ownerId = userIds.owner) {
  return actAs(database, "authenticated", ownerId, () =>
    database.query(
      `insert into public.boarding_houses (
        owner_id, title, description, address_line, monthly_rent, room_type,
        available_rooms, contact_name, contact_phone, latitude, longitude
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      returning id, owner_id, status`,
      [
        ownerId,
        listingInput.title,
        listingInput.description,
        listingInput.address,
        listingInput.monthlyRent,
        listingInput.roomType,
        listingInput.availableRooms,
        listingInput.contactName,
        listingInput.contactPhone,
        listingInput.latitude,
        listingInput.longitude,
      ],
    ),
  );
}

test("the listing foundation enforces ownership, publication, and moderation", async (t) => {
  const database = await createDatabase();
  t.after(() => database.close());

  await registerUser(database, {
    id: userIds.student,
    displayName: "Student account",
    requestedRole: "student",
  });
  await registerUser(database, {
    id: userIds.owner,
    displayName: "Owner account",
    requestedRole: "owner",
  });
  await registerUser(database, {
    id: userIds.secondOwner,
    displayName: "Second owner",
    requestedRole: "owner",
  });
  await provisionAdmin(database, {
    id: userIds.admin,
    displayName: "Admin account",
  });

  const created = await createListing(database);
  const listingId = created.rows[0].id;

  await t.test("only owners can create drafts for themselves", async () => {
    assert.equal(created.rows[0].owner_id, userIds.owner);
    assert.equal(created.rows[0].status, "draft");

    await assert.rejects(createListing(database, userIds.student), /row-level security/i);
    const crossOwnerUpdate = await actAs(database, "authenticated", userIds.secondOwner, () =>
      database.query(
        "update public.boarding_houses set title = 'Taken over' where id = $1 returning id",
        [listingId],
      ),
    );
    assert.deepEqual(crossOwnerUpdate.rows, []);
  });

  await t.test("drafts and pending listings are hidden from public readers", async () => {
    const draftRows = await actAs(database, "anon", null, () =>
      database.query("select id from public.boarding_houses"),
    );
    assert.deepEqual(draftRows.rows, []);

    const submitted = await actAs(database, "authenticated", userIds.owner, () =>
      database.query("select status from public.submit_boarding_house($1)", [listingId]),
    );
    assert.deepEqual(submitted.rows, [{ status: "pending" }]);

    const pendingRows = await actAs(database, "anon", null, () =>
      database.query("select id from public.boarding_houses"),
    );
    assert.deepEqual(pendingRows.rows, []);
  });

  await t.test("non-owners cannot submit and non-admins cannot moderate", async () => {
    await assert.rejects(
      actAs(database, "authenticated", userIds.student, () =>
        database.query("select public.submit_boarding_house($1)", [listingId]),
      ),
      /not found/i,
    );
    await assert.rejects(
      actAs(database, "authenticated", userIds.owner, () =>
        database.query("select public.moderate_boarding_house($1, 'approved')", [listingId]),
      ),
      /Only administrators/i,
    );
  });

  await t.test("administrators approve pending listings and record the outcome", async () => {
    const approved = await actAs(database, "authenticated", userIds.admin, () =>
      database.query(
        "select status, moderated_by from public.moderate_boarding_house($1, 'approved')",
        [listingId],
      ),
    );
    assert.deepEqual(approved.rows, [{ status: "approved", moderated_by: userIds.admin }]);

    const visible = await actAs(database, "anon", null, () =>
      database.query("select id from public.boarding_houses"),
    );
    assert.deepEqual(visible.rows, [{ id: listingId }]);

    const events = await actAs(database, "authenticated", userIds.owner, () =>
      database.query(
        "select actor_id, action, reason from public.moderation_events where boarding_house_id = $1",
        [listingId],
      ),
    );
    assert.deepEqual(events.rows, [{ actor_id: userIds.admin, action: "approved", reason: null }]);
  });

  await t.test("availability changes preserve approval but hide unavailable listings", async () => {
    await actAs(database, "authenticated", userIds.owner, () =>
      database.query("update public.boarding_houses set available_rooms = 0 where id = $1", [
        listingId,
      ]),
    );
    const unavailable = await actAs(database, "anon", null, () =>
      database.query("select id from public.boarding_houses"),
    );
    assert.deepEqual(unavailable.rows, []);

    const ownerView = await actAs(database, "authenticated", userIds.owner, () =>
      database.query("select status from public.boarding_houses where id = $1", [listingId]),
    );
    assert.deepEqual(ownerView.rows, [{ status: "approved" }]);
  });

  await t.test("material owner edits return approved listings to pending review", async () => {
    await actAs(database, "authenticated", userIds.owner, () =>
      database.query(
        "update public.boarding_houses set title = 'Maple Residence Updated', available_rooms = 2 where id = $1",
        [listingId],
      ),
    );
    const ownerView = await actAs(database, "authenticated", userIds.owner, () =>
      database.query("select status, moderation_note from public.boarding_houses where id = $1", [
        listingId,
      ]),
    );
    assert.deepEqual(ownerView.rows, [{ status: "pending", moderation_note: null }]);

    const publicView = await actAs(database, "anon", null, () =>
      database.query("select id from public.boarding_houses"),
    );
    assert.deepEqual(publicView.rows, []);
  });

  await t.test("rejection and archival require reasons and valid transitions", async () => {
    await assert.rejects(
      actAs(database, "authenticated", userIds.admin, () =>
        database.query("select public.moderate_boarding_house($1, 'rejected')", [listingId]),
      ),
      /reason is required/i,
    );

    const rejected = await actAs(database, "authenticated", userIds.admin, () =>
      database.query(
        "select status from public.moderate_boarding_house($1, 'rejected', 'Clarify the address.')",
        [listingId],
      ),
    );
    assert.deepEqual(rejected.rows, [{ status: "rejected" }]);

    await actAs(database, "authenticated", userIds.owner, () =>
      database.query("select public.submit_boarding_house($1)", [listingId]),
    );
    await actAs(database, "authenticated", userIds.admin, () =>
      database.query("select public.moderate_boarding_house($1, 'approved')", [listingId]),
    );
    const archived = await actAs(database, "authenticated", userIds.admin, () =>
      database.query(
        "select status from public.moderate_boarding_house($1, 'archived', 'Listing closed.')",
        [listingId],
      ),
    );
    assert.deepEqual(archived.rows, [{ status: "archived" }]);

    const publicView = await actAs(database, "anon", null, () =>
      database.query("select id from public.boarding_houses"),
    );
    assert.deepEqual(publicView.rows, []);
  });
});
