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

async function submitReport(database, actorId, values) {
  return actAs(database, "authenticated", actorId, () =>
    database.query(
      `insert into public.reports (
        reporter_id, target_type, boarding_house_id, review_id, reason
      ) values ($1, $2, $3, $4, $5)
      returning id`,
      [actorId, values.targetType, values.listingId ?? null, values.reviewId ?? null, values.reason],
    ),
  );
}

test("reports are private, student-owned, and target only public content", async (t) => {
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
  const reviewId = (await actAs(database, "authenticated", userIds.student, () =>
    database.query(
      `insert into public.reviews (student_id, boarding_house_id, rating, comment)
       values ($1, $2, 4, 'A useful and honest review.') returning id`,
      [userIds.student, approvedId],
    ),
  )).rows[0].id;

  await t.test("anonymous users and owners cannot submit reports", async () => {
    await assert.rejects(
      actAs(database, "anon", null, () =>
        database.query(
          `insert into public.reports (reporter_id, target_type, boarding_house_id, reason)
           values ($1, 'listing', $2, 'This listing has an incorrect address.')`,
          [userIds.student, approvedId],
        ),
      ),
      /permission denied/i,
    );
    await assert.rejects(
      submitReport(database, userIds.owner, {
        targetType: "listing",
        listingId: approvedId,
        reason: "This listing has an incorrect address.",
      }),
      /row-level security|only students/i,
    );
  });

  await t.test("students report only public listings and published reviews", async () => {
    await assert.rejects(
      submitReport(database, userIds.student, {
        targetType: "listing",
        listingId: draftId,
        reason: "This draft should not be reportable yet.",
      }),
      /only public listings/i,
    );
    const listingReport = await submitReport(database, userIds.student, {
      targetType: "listing",
      listingId: approvedId,
      reason: "  This listing has an incorrect address.  ",
    });
    const reviewReport = await submitReport(database, userIds.forgedAdmin, {
      targetType: "review",
      reviewId,
      reason: "This review contains misleading information.",
    });
    assert.equal(listingReport.rows.length, 1);
    assert.equal(reviewReport.rows.length, 1);

    await database.query(
      `update public.reviews
       set status = 'hidden', moderated_by = $1, moderated_at = now(), moderation_note = 'Under review.'
       where id = $2`,
      [userIds.admin, reviewId],
    );
    await assert.rejects(
      submitReport(database, userIds.student, {
        targetType: "review",
        reviewId,
        reason: "This hidden review should not be reportable.",
      }),
      /only published reviews/i,
    );
  });

  await t.test("duplicate open reports are rejected", async () => {
    await assert.rejects(
      submitReport(database, userIds.student, {
        targetType: "listing",
        listingId: approvedId,
        reason: "A second report for the same listing.",
      }),
      /unique|duplicate/i,
    );
  });

  await t.test("students see only their own reports and cannot mutate them", async () => {
    const firstStudent = await actAs(database, "authenticated", userIds.student, () =>
      database.query("select target_type, reason, status from public.reports"),
    );
    const secondStudent = await actAs(database, "authenticated", userIds.forgedAdmin, () =>
      database.query("select target_type, reason, status from public.reports"),
    );
    assert.deepEqual(firstStudent.rows, [{
      target_type: "listing",
      reason: "This listing has an incorrect address.",
      status: "open",
    }]);
    assert.deepEqual(secondStudent.rows, [{
      target_type: "review",
      reason: "This review contains misleading information.",
      status: "open",
    }]);
    await assert.rejects(
      actAs(database, "authenticated", userIds.student, () =>
        database.query("update public.reports set reason = 'Changed reason text.' returning id"),
      ),
      /permission denied/i,
    );
    await assert.rejects(
      actAs(database, "authenticated", userIds.student, () =>
        database.query("delete from public.reports returning id"),
      ),
      /permission denied/i,
    );
  });

  await t.test("administrators can read the report queue", async () => {
    const reports = await actAs(database, "authenticated", userIds.admin, () =>
      database.query("select target_type, status from public.reports order by target_type"),
    );
    assert.deepEqual(reports.rows, [
      { target_type: "listing", status: "open" },
      { target_type: "review", status: "open" },
    ]);
  });
});
