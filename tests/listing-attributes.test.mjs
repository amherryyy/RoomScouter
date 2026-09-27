import assert from "node:assert/strict";
import test from "node:test";

import {
  actAs,
  createDatabase,
  createListing,
  provisionAdmin,
  registerUser,
  userIds,
} from "./support/database.mjs";

test("listing attributes inherit ownership and publication boundaries", async (t) => {
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

  const listingId = (await createListing(database)).rows[0].id;

  await t.test("catalogs are controlled, unique, and publicly readable", async () => {
    const facilities = await actAs(database, "anon", null, () =>
      database.query("select name from public.facilities order by id"),
    );
    const utilities = await actAs(database, "anon", null, () =>
      database.query("select name from public.utilities order by id"),
    );

    assert.equal(facilities.rows.length, 8);
    assert.deepEqual(utilities.rows, [
      { name: "Electricity" },
      { name: "Water" },
      { name: "Internet" },
      { name: "Cooking Gas" },
    ]);
    await assert.rejects(
      actAs(database, "authenticated", userIds.owner, () =>
        database.query("insert into public.facilities (name) values ('Pool')"),
      ),
      /permission denied/i,
    );
  });

  await t.test("owners manage attributes only on their own listings", async () => {
    await actAs(database, "authenticated", userIds.owner, async () => {
      await database.query(
        "insert into public.boarding_house_facilities (boarding_house_id, facility_id) values ($1, 1)",
        [listingId],
      );
      await database.query(
        `insert into public.boarding_house_utilities
          (boarding_house_id, utility_id, is_included, details)
         values ($1, 1, false, 'Metered separately')`,
        [listingId],
      );
      await database.query(
        `insert into public.house_rules (boarding_house_id, rule_text, position)
         values ($1, 'Quiet hours begin at 10 PM.', 1)`,
        [listingId],
      );
    });

    const crossOwnerWrite = await actAs(database, "authenticated", userIds.secondOwner, () =>
      database.query(
        "delete from public.boarding_house_facilities where boarding_house_id = $1 returning facility_id",
        [listingId],
      ),
    );
    assert.deepEqual(crossOwnerWrite.rows, []);

    await assert.rejects(
      actAs(database, "authenticated", userIds.student, () =>
        database.query(
          "insert into public.boarding_house_facilities (boarding_house_id, facility_id) values ($1, 2)",
          [listingId],
        ),
      ),
      /row-level security/i,
    );
  });

  await t.test("attributes stay private until their listing is approved", async () => {
    const before = await actAs(database, "anon", null, () =>
      database.query("select * from public.house_rules"),
    );
    assert.deepEqual(before.rows, []);

    await actAs(database, "authenticated", userIds.owner, () =>
      database.query("select public.submit_boarding_house($1)", [listingId]),
    );
    await actAs(database, "authenticated", userIds.admin, () =>
      database.query("select public.moderate_boarding_house($1, 'approved')", [listingId]),
    );

    const after = await actAs(database, "anon", null, async () => ({
      facilities: await database.query(
        "select facility_id from public.boarding_house_facilities where boarding_house_id = $1",
        [listingId],
      ),
      utilities: await database.query(
        "select utility_id, is_included from public.boarding_house_utilities where boarding_house_id = $1",
        [listingId],
      ),
      rules: await database.query(
        "select rule_text, position from public.house_rules where boarding_house_id = $1",
        [listingId],
      ),
    }));

    assert.deepEqual(after.facilities.rows, [{ facility_id: 1 }]);
    assert.deepEqual(after.utilities.rows, [{ utility_id: 1, is_included: false }]);
    assert.deepEqual(after.rules.rows, [
      { rule_text: "Quiet hours begin at 10 PM.", position: 1 },
    ]);
  });

  await t.test("owner attribute changes return approved listings to review", async () => {
    await actAs(database, "authenticated", userIds.owner, () =>
      database.query(
        `update public.boarding_house_utilities
         set is_included = true, details = 'Included in monthly rent'
         where boarding_house_id = $1 and utility_id = 1`,
        [listingId],
      ),
    );

    const listing = await actAs(database, "authenticated", userIds.owner, () =>
      database.query("select status from public.boarding_houses where id = $1", [listingId]),
    );
    assert.deepEqual(listing.rows, [{ status: "pending" }]);

    const publicRules = await actAs(database, "anon", null, () =>
      database.query("select id from public.house_rules"),
    );
    assert.deepEqual(publicRules.rows, []);
  });

  await t.test("attribute relationships and rule positions reject duplicates", async () => {
    await assert.rejects(
      actAs(database, "authenticated", userIds.owner, () =>
        database.query(
          "insert into public.boarding_house_facilities (boarding_house_id, facility_id) values ($1, 1)",
          [listingId],
        ),
      ),
      /unique|duplicate/i,
    );
    await assert.rejects(
      actAs(database, "authenticated", userIds.owner, () =>
        database.query(
          `insert into public.house_rules (boarding_house_id, rule_text, position)
           values ($1, 'Another rule in the same position.', 1)`,
          [listingId],
        ),
      ),
      /unique|duplicate/i,
    );
  });
});
