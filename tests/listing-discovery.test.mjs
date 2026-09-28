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

async function approve(database, listingId) {
  await actAs(database, "authenticated", userIds.owner, () =>
    database.query("select public.submit_boarding_house($1)", [listingId]),
  );
  await actAs(database, "authenticated", userIds.admin, () =>
    database.query("select public.moderate_boarding_house($1, 'approved')", [listingId]),
  );
}

async function search(database, argumentsSql = "", parameters = []) {
  return actAs(database, "anon", null, () =>
    database.query(`select * from public.search_public_boarding_houses(${argumentsSql})`, parameters),
  );
}

test("public listing discovery is filtered, distance-aware, and paginated in PostgreSQL", async (t) => {
  const database = await createDatabase();
  t.after(() => database.close());

  await registerUser(database, {
    id: userIds.owner,
    displayName: "Owner account",
    requestedRole: "owner",
  });
  await provisionAdmin(database, { id: userIds.admin, displayName: "Admin account" });

  const firstId = (await createListing(database)).rows[0].id;
  const secondId = (await createListing(database)).rows[0].id;
  const hiddenId = (await createListing(database)).rows[0].id;
  await actAs(database, "authenticated", userIds.owner, () =>
    database.query(
      `update public.boarding_houses
       set title = case id
         when $1 then 'Maple Residence'
         when $2 then 'Riverside Dormitory'
         else 'Hidden Draft'
       end,
       address_line = case when id = $2 then '99 Riverside Road' else address_line end,
       monthly_rent = case when id = $2 then 7000 else 4500 end,
       room_type = case when id = $2 then 'shared_room'::public.room_type else room_type end,
       available_rooms = case when id = $2 then 4 else available_rooms end,
       latitude = case when id = $2 then 14.609512 else latitude end
       where id = any($3::uuid[])`,
      [firstId, secondId, [firstId, secondId, hiddenId]],
    ),
  );
  await actAs(database, "authenticated", userIds.owner, () =>
    database.query(
      `insert into public.boarding_house_facilities (boarding_house_id, facility_id)
       values ($1, 1), ($2, 2)`,
      [firstId, secondId],
    ),
  );
  await actAs(database, "authenticated", userIds.owner, () =>
    database.query(
      `insert into public.boarding_house_utilities (boarding_house_id, utility_id, is_included)
       values ($1, 1, true), ($2, 2, false)`,
      [firstId, secondId],
    ),
  );
  await approve(database, firstId);
  await approve(database, secondId);

  await t.test("visitors receive only approved and available listings", async () => {
    const result = await search(database);
    assert.equal(result.rows.length, 2);
    assert.deepEqual(new Set(result.rows.map((row) => row.id)), new Set([firstId, secondId]));

    await actAs(database, "authenticated", userIds.owner, () =>
      database.query("update public.boarding_houses set available_rooms = 0 where id = $1", [secondId]),
    );
    const available = await search(database);
    assert.deepEqual(available.rows.map((row) => row.id), [firstId]);
    await actAs(database, "authenticated", userIds.owner, () =>
      database.query("update public.boarding_houses set available_rooms = 4 where id = $1", [secondId]),
    );
  });

  await t.test("text, price, room, facility, and utility filters compose", async () => {
    const result = await search(
      database,
      `search_text => $1,
       maximum_monthly_rent => $2,
       selected_room_type => $3,
       selected_facility_id => $4,
       selected_utility_id => $5`,
      ["Maple university", 5000, "private_room", 1, 1],
    );
    assert.deepEqual(result.rows.map((row) => row.id), [firstId]);

    const noMatch = await search(database, "selected_facility_id => $1", [2]);
    assert.deepEqual(noMatch.rows.map((row) => row.id), [secondId]);
  });

  await t.test("distance is deterministic and supports a maximum", async () => {
    const result = await search(
      database,
      `university_latitude => $1,
       university_longitude => $2,
       maximum_distance_km => $3`,
      [14.599512, 120.984222, 0.5],
    );
    assert.deepEqual(result.rows.map((row) => row.id), [firstId]);
    assert.equal(Number(result.rows[0].approximate_distance_km), 0);
  });

  await t.test("pagination stays in the query and reports the total", async () => {
    const firstPage = await search(database, "page_size => $1, page_offset => $2", [1, 0]);
    const secondPage = await search(database, "page_size => $1, page_offset => $2", [1, 1]);
    assert.equal(firstPage.rows.length, 1);
    assert.equal(secondPage.rows.length, 1);
    assert.equal(Number(firstPage.rows[0].total_count), 2);
    assert.notEqual(firstPage.rows[0].id, secondPage.rows[0].id);
  });
});
