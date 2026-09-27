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

const photoIds = Array.from({ length: 11 }, (_, index) =>
  `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
);

const photoPath = (listingId, index) => `${userIds.owner}/${listingId}/${photoIds[index]}.jpg`;

async function uploadObject(database, actorId, path, metadata = { mimetype: "image/jpeg", size: 1024 }) {
  return actAs(database, "authenticated", actorId, () =>
    database.query(
      `insert into storage.objects (bucket_id, name, metadata)
       values ('listing-photos', $1, $2::jsonb)
       returning id`,
      [path, JSON.stringify(metadata)],
    ),
  );
}

async function addPhoto(database, actorId, listingId, path, position, overrides = {}) {
  return actAs(database, "authenticated", actorId, () =>
    database.query(
      `insert into public.listing_photos (
        boarding_house_id, object_path, media_type, byte_size, alt_text, position, created_by
      ) values ($1, $2, $3, $4, $5, $6, $7)
      returning id`,
      [
        listingId,
        path,
        overrides.mediaType ?? "image/jpeg",
        overrides.byteSize ?? 1024,
        overrides.altText ?? `Front view ${position}`,
        position,
        actorId,
      ],
    ),
  );
}

test("listing photos enforce private storage ownership and publication", async (t) => {
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
  const firstPath = photoPath(listingId, 0);

  await t.test("the bucket is private and matches Flower's upload ceiling", async () => {
    const bucket = await database.query(
      `select public, file_size_limit, allowed_mime_types
       from storage.buckets where id = 'listing-photos'`,
    );
    assert.deepEqual(bucket.rows, [
      {
        public: false,
        file_size_limit: 10485760,
        allowed_mime_types: ["image/jpeg", "image/png"],
      },
    ]);
  });

  await t.test("owners upload only valid image objects under their listing path", async () => {
    await uploadObject(database, userIds.owner, firstPath);

    const immutableObject = await actAs(database, "authenticated", userIds.owner, () =>
      database.query(
        `update storage.objects
         set metadata = jsonb_build_object('mimetype', 'image/jpeg', 'size', 2048)
         where name = $1
         returning id`,
        [firstPath],
      ),
    );
    assert.deepEqual(immutableObject.rows, []);

    await assert.rejects(
      uploadObject(database, userIds.student, firstPath.replace(photoIds[0], photoIds[1])),
      /row-level security/i,
    );
    await assert.rejects(
      uploadObject(database, userIds.owner, firstPath.replace(/\.jpg$/, ".pdf"), {
        mimetype: "application/pdf",
        size: 1024,
      }),
      /row-level security/i,
    );
    await assert.rejects(
      uploadObject(database, userIds.owner, firstPath.replace(photoIds[0], photoIds[2]), {
        mimetype: "image/jpeg",
        size: 10485761,
      }),
      /row-level security/i,
    );
  });

  await t.test("metadata must match a stored object and its owner path", async () => {
    await addPhoto(database, userIds.owner, listingId, firstPath, 1);

    await assert.rejects(
      addPhoto(database, userIds.owner, listingId, photoPath(listingId, 1), 2),
      /object does not exist/i,
    );
    await assert.rejects(
      addPhoto(database, userIds.owner, listingId, firstPath, 2, { byteSize: 2048 }),
      /metadata does not match/i,
    );
  });

  await t.test("draft photos are private and approved photos are publicly readable", async () => {
    const privateMetadata = await actAs(database, "anon", null, () =>
      database.query("select id from public.listing_photos"),
    );
    const privateObject = await actAs(database, "anon", null, () =>
      database.query("select id from storage.objects where name = $1", [firstPath]),
    );
    assert.deepEqual(privateMetadata.rows, []);
    assert.deepEqual(privateObject.rows, []);

    await actAs(database, "authenticated", userIds.owner, () =>
      database.query("select public.submit_boarding_house($1)", [listingId]),
    );
    await actAs(database, "authenticated", userIds.admin, () =>
      database.query("select public.moderate_boarding_house($1, 'approved')", [listingId]),
    );

    const publicMetadata = await actAs(database, "anon", null, () =>
      database.query("select object_path, position from public.listing_photos"),
    );
    const publicObject = await actAs(database, "anon", null, () =>
      database.query("select name from storage.objects where name = $1", [firstPath]),
    );
    assert.deepEqual(publicMetadata.rows, [{ object_path: firstPath, position: 1 }]);
    assert.deepEqual(publicObject.rows, [{ name: firstPath }]);
  });

  await t.test("owner photo changes queue approved listings for review", async () => {
    await actAs(database, "authenticated", userIds.owner, () =>
      database.query("update public.listing_photos set alt_text = 'Updated front entrance' where object_path = $1", [
        firstPath,
      ]),
    );
    const listing = await actAs(database, "authenticated", userIds.owner, () =>
      database.query("select status from public.boarding_houses where id = $1", [listingId]),
    );
    assert.deepEqual(listing.rows, [{ status: "pending" }]);
  });

  await t.test("cross-owner deletion is denied and photo count is capped at ten", async () => {
    const crossOwnerDelete = await actAs(database, "authenticated", userIds.secondOwner, () =>
      database.query("delete from storage.objects where name = $1 returning id", [firstPath]),
    );
    assert.deepEqual(crossOwnerDelete.rows, []);

    for (let index = 1; index < 10; index += 1) {
      const path = photoPath(listingId, index);
      await uploadObject(database, userIds.owner, path);
      await addPhoto(database, userIds.owner, listingId, path, index + 1);
    }

    const eleventhPath = photoPath(listingId, 10);
    await uploadObject(database, userIds.owner, eleventhPath);
    await assert.rejects(
      addPhoto(database, userIds.owner, listingId, eleventhPath, 10),
      /at most 10 photos/i,
    );
  });
});
