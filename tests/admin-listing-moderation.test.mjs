import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("guards listing moderation with a verified administrator profile", async () => {
  const access = await readProjectFile("src/features/moderation/access.ts");
  const dashboard = await readProjectFile("app/admin/page.tsx");
  const detail = await readProjectFile("app/admin/listings/[id]/page.tsx");

  assert.match(access, /auth\.getUser\(\)/);
  assert.match(access, /profile\?\.role !== "admin"/);
  assert.match(dashboard, /requireAdmin\(\)/);
  assert.match(detail, /requireAdmin\(\)/);
});

test("shows paginated pending and published listing queues", async () => {
  const dashboard = await readProjectFile("app/admin/page.tsx");
  const account = await readProjectFile("app/account/page.tsx");

  assert.match(dashboard, /PAGE_SIZE = 20/);
  assert.match(dashboard, /state === "approved"/);
  assert.match(dashboard, /\.eq\("status", state\)/);
  assert.match(dashboard, /Pending review/);
  assert.match(dashboard, /Published listings/);
  assert.match(dashboard, /href="\/admin\?state=pending" scroll=\{false\}/);
  assert.match(dashboard, /href="\/admin\?state=approved" scroll=\{false\}/);
  assert.match(account, /href="\/admin"/);
});

test("reviews complete listing evidence before using the database moderation command", async () => {
  const detail = await readProjectFile("app/admin/listings/[id]/page.tsx");
  const controls = await readProjectFile("src/features/moderation/listing-controls.tsx");
  const actions = await readProjectFile("src/features/moderation/actions.ts");

  for (const evidence of ["Listing facts", "Description", "Contact details", "Facilities", "Utilities", "House rules", "Photos", "Decision history"]) {
    assert.match(detail, new RegExp(evidence));
  }
  assert.match(controls, /Approve and publish/);
  assert.match(controls, /Reason for rejection/);
  assert.match(controls, /Reason for archival/);
  assert.match(actions, /requireAdmin\(\)/);
  assert.match(actions, /rpc\("moderate_boarding_house"/);
  assert.match(actions, /reason\.length >= 5 && reason\.length <= 1000/);
  assert.match(actions, /revalidatePath\("\/"\)/);
});
