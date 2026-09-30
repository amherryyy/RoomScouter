import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("report actions validate private student submissions", async () => {
  const actions = await readProjectFile("src/features/reports/actions.ts");

  assert.match(actions, /requireStudent\(\)/);
  assert.match(actions, /reason\.length >= 10 && reason\.length <= 1000/);
  assert.match(actions, /target_type: "listing"/);
  assert.match(actions, /target_type: "review"/);
  assert.match(actions, /error\?\.code === "23505"/);
  assert.match(actions, /Report submitted privately/);
});

test("students can report public content and inspect only their report history", async () => {
  const detailPage = await readProjectFile("app/listings/[id]/page.tsx");
  const reviewSection = await readProjectFile("src/features/reviews/review-section.tsx");
  const reportForm = await readProjectFile("src/features/reports/report-form.tsx");
  const reportHistory = await readProjectFile("app/reports/page.tsx");
  const accountPage = await readProjectFile("app/account/page.tsx");

  assert.match(detailPage, /Report this listing/);
  assert.match(reviewSection, /Report this review/);
  assert.match(reviewSection, /review\.id !== ownReview\?\.id/);
  assert.match(reportForm, /cannot be changed after submission/);
  assert.match(reportHistory, /requireStudent\(\)/);
  assert.match(reportHistory, /PAGE_SIZE = 20/);
  assert.match(reportHistory, /Administrator response/);
  assert.match(accountPage, /href="\/reports"/);
});
