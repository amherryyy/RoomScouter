import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("guards every owner listing route with a verified owner profile", async () => {
  const access = await readProjectFile("src/features/listings/access.ts");
  const dashboard = await readProjectFile("app/owner/page.tsx");
  const createPage = await readProjectFile("app/owner/listings/new/page.tsx");
  const editPage = await readProjectFile("app/owner/listings/[id]/edit/page.tsx");

  assert.match(access, /auth\.getUser\(\)/);
  assert.match(access, /profile\?\.role !== "owner"/);
  for (const page of [dashboard, createPage, editPage]) {
    assert.match(page, /requireOwner\(\)/);
  }
});

test("validates listing input before ownership-scoped writes", async () => {
  const model = await readProjectFile("src/features/listings/model.ts");
  const actions = await readProjectFile("src/features/listings/actions.ts");

  for (const field of [
    "title",
    "description",
    "addressLine",
    "monthlyRent",
    "roomType",
    "availableRooms",
    "contactName",
    "latitude",
    "longitude",
  ]) {
    assert.match(model, new RegExp(`formData\\.get\\("${field}"\\)`));
  }
  assert.match(model, /at least one valid contact method/i);
  assert.match(actions, /owner_id: user\.id/);
  assert.match(actions, /\.eq\("owner_id", user\.id\)/);
  assert.match(actions, /rpc\("submit_boarding_house"/);
});

test("shows lifecycle state, moderation feedback, and explicit submission", async () => {
  const dashboard = await readProjectFile("app/owner/page.tsx");
  const editPage = await readProjectFile("app/owner/listings/[id]/edit/page.tsx");

  assert.match(dashboard, /listing\.status/);
  assert.match(editPage, /listing\.moderation_note/);
  assert.match(editPage, /Changing listing details will return this listing to pending review/);
  assert.match(editPage, /Submit for review/);
  assert.match(editPage, /listing\.status === "draft" \|\| listing\.status === "rejected"/);
});
