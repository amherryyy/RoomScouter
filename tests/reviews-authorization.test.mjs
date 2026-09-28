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

async function addReview(database, actorId, listingId, rating = 5, comment = "Safe, clean, and quiet.") {
  return actAs(database, "authenticated", actorId, () =>
    database.query(
      `insert into public.reviews (student_id, boarding_house_id, rating, comment)
       values ($1, $2, $3, $4)
       returning id`,
      [actorId, listingId, rating, comment],
    ),
  );
}

test("reviews are student-owned, public when published, and moderation-ready", async (t) => {
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

  await t.test("only students review approved available listings", async () => {
    await assert.rejects(addReview(database, userIds.owner, approvedId), /row-level security/i);
    await assert.rejects(addReview(database, userIds.student, draftId), /row-level security/i);
    await assert.rejects(addReview(database, userIds.student, approvedId, 6), /check constraint/i);
    await assert.rejects(addReview(database, userIds.student, approvedId, 5, "no"), /check constraint/i);
  });

  let reviewId;
  await t.test("a student creates at most one review per listing", async () => {
    reviewId = (await addReview(database, userIds.student, approvedId)).rows[0].id;
    await assert.rejects(addReview(database, userIds.student, approvedId), /unique|duplicate/i);
  });

  await t.test("published reviews are public without exposing private profiles", async () => {
    const publicReviews = await actAs(database, "anon", null, () =>
      database.query("select rating, comment from public.public_reviews"),
    );
    assert.deepEqual(publicReviews.rows, [{ rating: 5, comment: "Safe, clean, and quiet." }]);
    await assert.rejects(
      actAs(database, "anon", null, () => database.query("select student_id from public.reviews")),
      /permission denied/i,
    );
    await assert.rejects(
      actAs(database, "anon", null, () => database.query("select display_name from public.profiles")),
      /permission denied|row-level security/i,
    );
  });

  await t.test("students edit and remove only their own review", async () => {
    const crossUpdate = await actAs(database, "authenticated", userIds.forgedAdmin, () =>
      database.query("update public.reviews set rating = 1 where id = $1 returning id", [reviewId]),
    );
    const crossDelete = await actAs(database, "authenticated", userIds.forgedAdmin, () =>
      database.query("delete from public.reviews where id = $1 returning id", [reviewId]),
    );
    assert.deepEqual(crossUpdate.rows, []);
    assert.deepEqual(crossDelete.rows, []);

    await actAs(database, "authenticated", userIds.student, () =>
      database.query("update public.reviews set rating = 4, comment = '  Updated honest review.  ' where id = $1", [reviewId]),
    );
    const updated = await actAs(database, "authenticated", userIds.student, () =>
      database.query("select rating, comment from public.reviews where id = $1", [reviewId]),
    );
    assert.deepEqual(updated.rows, [{ rating: 4, comment: "Updated honest review." }]);
  });

  await t.test("hidden reviews leave public results but remain visible to their author and admins", async () => {
    await database.query(
      `update public.reviews
       set status = 'hidden', moderated_by = $1, moderated_at = now(), moderation_note = 'Contains private information.'
       where id = $2`,
      [userIds.admin, reviewId],
    );
    const publicReviews = await actAs(database, "anon", null, () => database.query("select id from public.public_reviews"));
    const ownReviews = await actAs(database, "authenticated", userIds.student, () =>
      database.query("select id, status from public.get_current_student_review($1)", [approvedId]),
    );
    const adminReviews = await actAs(database, "authenticated", userIds.admin, () =>
      database.query("select id, status from public.reviews"),
    );
    const summary = await actAs(database, "anon", null, () =>
      database.query("select * from public.get_public_review_summary($1)", [approvedId]),
    );
    assert.deepEqual(publicReviews.rows, []);
    assert.deepEqual(ownReviews.rows, [{ id: reviewId, status: "hidden" }]);
    assert.deepEqual(adminReviews.rows, [{ id: reviewId, status: "hidden" }]);
    assert.deepEqual(summary.rows, [{ review_count: 0, average_rating: null }]);
  });
});
