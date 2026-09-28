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

test("favorites belong only to students and public available listings", async (t) => {
  const database = await createDatabase();
  t.after(() => database.close());

  await registerUser(database, { id: userIds.student, displayName: "Student", requestedRole: "student" });
  await registerUser(database, { id: userIds.forgedAdmin, displayName: "Second student", requestedRole: "student" });
  await registerUser(database, { id: userIds.owner, displayName: "Owner", requestedRole: "owner" });
  await provisionAdmin(database, { id: userIds.admin, displayName: "Admin" });

  const approvedId = (await createListing(database)).rows[0].id;
  const draftId = (await createListing(database)).rows[0].id;
  await actAs(database, "authenticated", userIds.owner, () =>
    database.query("select public.submit_boarding_house($1)", [approvedId]),
  );
  await actAs(database, "authenticated", userIds.admin, () =>
    database.query("select public.moderate_boarding_house($1, 'approved')", [approvedId]),
  );

  await t.test("anonymous users and owners cannot create favorites", async () => {
    await assert.rejects(
      actAs(database, "anon", null, () =>
        database.query("insert into public.favorites (student_id, boarding_house_id) values ($1, $2)", [
          userIds.student,
          approvedId,
        ]),
      ),
      /permission denied/i,
    );
    await assert.rejects(
      actAs(database, "authenticated", userIds.owner, () =>
        database.query("insert into public.favorites (student_id, boarding_house_id) values ($1, $2)", [
          userIds.owner,
          approvedId,
        ]),
      ),
      /row-level security/i,
    );
  });

  await t.test("students cannot save unpublished or unavailable listings", async () => {
    await assert.rejects(
      actAs(database, "authenticated", userIds.student, () =>
        database.query("insert into public.favorites (student_id, boarding_house_id) values ($1, $2)", [
          userIds.student,
          draftId,
        ]),
      ),
      /row-level security/i,
    );
    await actAs(database, "authenticated", userIds.owner, () =>
      database.query("update public.boarding_houses set available_rooms = 0 where id = $1", [approvedId]),
    );
    await assert.rejects(
      actAs(database, "authenticated", userIds.student, () =>
        database.query("insert into public.favorites (student_id, boarding_house_id) values ($1, $2)", [
          userIds.student,
          approvedId,
        ]),
      ),
      /row-level security/i,
    );
    await actAs(database, "authenticated", userIds.owner, () =>
      database.query("update public.boarding_houses set available_rooms = 2 where id = $1", [approvedId]),
    );
  });

  await t.test("students add each listing once and see only their own favorites", async () => {
    await actAs(database, "authenticated", userIds.student, () =>
      database.query("insert into public.favorites (student_id, boarding_house_id) values ($1, $2)", [
        userIds.student,
        approvedId,
      ]),
    );
    await assert.rejects(
      actAs(database, "authenticated", userIds.student, () =>
        database.query("insert into public.favorites (student_id, boarding_house_id) values ($1, $2)", [
          userIds.student,
          approvedId,
        ]),
      ),
      /unique|duplicate/i,
    );
    const ownerView = await actAs(database, "authenticated", userIds.owner, () =>
      database.query("select boarding_house_id from public.favorites"),
    );
    const otherStudentView = await actAs(database, "authenticated", userIds.forgedAdmin, () =>
      database.query("select boarding_house_id from public.favorites"),
    );
    assert.deepEqual(ownerView.rows, []);
    assert.deepEqual(otherStudentView.rows, []);
  });

  await t.test("another student cannot delete a favorite", async () => {
    const crossDelete = await actAs(database, "authenticated", userIds.forgedAdmin, () =>
      database.query("delete from public.favorites where boarding_house_id = $1 returning student_id", [approvedId]),
    );
    assert.deepEqual(crossDelete.rows, []);
    const ownDelete = await actAs(database, "authenticated", userIds.student, () =>
      database.query("delete from public.favorites where boarding_house_id = $1 returning student_id", [approvedId]),
    );
    assert.deepEqual(ownDelete.rows, [{ student_id: userIds.student }]);
  });
});
