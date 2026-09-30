import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("guards and paginates both review moderation queues", async () => {
  const page = await readProjectFile("app/admin/reviews/page.tsx");
  const adminDashboard = await readProjectFile("app/admin/page.tsx");

  assert.match(page, /requireAdmin\(\)/);
  assert.match(page, /PAGE_SIZE = 20/);
  assert.match(page, /state === "hidden"/);
  assert.match(page, /\.eq\("status", state\)/);
  assert.match(page, /Published reviews/);
  assert.match(page, /Hidden reviews/);
  assert.match(adminDashboard, /href="\/admin\/reviews"/);
});

test("validates hide and restore reasons before invoking audited moderation", async () => {
  const actions = await readProjectFile("src/features/moderation/review-actions.ts");
  const page = await readProjectFile("app/admin/reviews/page.tsx");
  const migration = await readProjectFile("supabase/migrations/20260930010000_review_moderation.sql");

  assert.match(actions, /requireAdmin\(\)/);
  assert.match(actions, /reason\.length < 3 \|\| reason\.length > 1000/);
  assert.match(actions, /rpc\("moderate_review"/);
  assert.match(page, /Reason for hiding/);
  assert.match(page, /Reason for restoring/);
  assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
  assert.match(migration, /review_moderation_events/);
  assert.match(migration, /Only administrators can moderate reviews/);
});
