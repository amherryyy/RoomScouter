import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("review mutations are validated and scoped to the current student", async () => {
  const actions = await readProjectFile("src/features/reviews/actions.ts");

  assert.match(actions, /requireStudent\(\)/);
  assert.match(actions, /rating >= 1 && rating <= 5/);
  assert.match(actions, /comment\.length >= 3 && comment\.length <= 2000/);
  assert.match(actions, /rpc\("get_current_student_review"/);
  assert.match(actions, /student_id: user\.id/);
  assert.match(actions, /\.eq\("student_id", user\.id\)/);
});

test("listing details show anonymous public reviews and student-owned controls", async () => {
  const page = await readProjectFile("app/listings/[id]/page.tsx");
  const section = await readProjectFile("src/features/reviews/review-section.tsx");
  const databaseTypes = await readProjectFile("src/lib/supabase/database.types.ts");

  assert.match(page, /from\("public_reviews"\)/);
  assert.match(page, /rpc\("get_public_review_summary"/);
  assert.match(page, /REVIEW_PAGE_SIZE = 10/);
  assert.match(page, /<ReviewSection/);
  assert.match(section, /Publish review/);
  assert.match(section, /Update review/);
  assert.match(section, /Delete review/);
  assert.match(section, /hidden from public view/);
  assert.match(section, /Verified RoomScouter student account/);
  assert.match(section, /aria-label={`\$\{value\} out of 5 stars`}/);
  assert.match(databaseTypes, /public_reviews:/);
  assert.match(databaseTypes, /get_current_student_review:/);
  assert.match(databaseTypes, /get_public_review_summary:/);
});
