import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("guards and paginates open and completed report queues", async () => {
  const page = await readProjectFile("app/admin/reports/page.tsx");
  const adminDashboard = await readProjectFile("app/admin/page.tsx");
  const reviewDashboard = await readProjectFile("app/admin/reviews/page.tsx");

  assert.match(page, /requireAdmin\(\)/);
  assert.match(page, /PAGE_SIZE = 20/);
  assert.match(page, /"open" \| "resolved" \| "dismissed"/);
  assert.match(page, /\.eq\("status", state\)/);
  assert.match(page, /Student concern/);
  assert.match(page, /Recorded outcome/);
  assert.match(adminDashboard, /href="\/admin\/reports"/);
  assert.match(reviewDashboard, /href="\/admin\/reports"/);
});

test("validates final outcomes before invoking the administrator-only command", async () => {
  const actions = await readProjectFile("src/features/moderation/report-actions.ts");
  const page = await readProjectFile("app/admin/reports/page.tsx");
  const migration = await readProjectFile("supabase/migrations/20260930020000_report_resolution.sql");

  assert.match(actions, /requireAdmin\(\)/);
  assert.match(actions, /note\.length < 3 \|\| note\.length > 1000/);
  assert.match(actions, /rpc\("resolve_report"/);
  assert.match(page, /Mark resolved/);
  assert.match(page, /Dismiss report/);
  assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
  assert.match(migration, /for update/i);
  assert.match(migration, /Only administrators can resolve reports/);
});
