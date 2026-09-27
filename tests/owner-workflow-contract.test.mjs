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

test("saves complete attribute collections through typed transactional commands", async () => {
  const actions = await readProjectFile("src/features/listings/actions.ts");
  const forms = await readProjectFile("src/features/listings/attribute-forms.tsx");
  const editPage = await readProjectFile("app/owner/listings/[id]/edit/page.tsx");
  const databaseTypes = await readProjectFile("src/lib/supabase/database.types.ts");

  for (const command of [
    "replace_boarding_house_facilities",
    "replace_boarding_house_utilities",
    "replace_house_rules",
  ]) {
    assert.match(actions, new RegExp(`rpc\\("${command}"`));
    assert.match(databaseTypes, new RegExp(`${command}:`));
  }
  assert.match(actions, /\.getAll\("facilityIds"\)/);
  assert.match(actions, /\.getAll\("utilityIds"\)/);
  assert.match(actions, /\.getAll\("rules"\)/);
  assert.match(forms, /Included in rent/);
  assert.match(forms, /Clear a field to remove that rule/);
  assert.match(editPage, /<AttributeForms/);
});

test("manages private listing photos through guarded server actions", async () => {
  const actions = await readProjectFile("src/features/listings/actions.ts");
  const editor = await readProjectFile("src/features/listings/photo-editor.tsx");
  const editPage = await readProjectFile("app/owner/listings/[id]/edit/page.tsx");
  const config = await readProjectFile("next.config.ts");
  const databaseTypes = await readProjectFile("src/lib/supabase/database.types.ts");

  assert.match(actions, /MAX_PHOTO_BYTES = 10 \* 1024 \* 1024/);
  assert.match(actions, /PHOTO_EXTENSIONS/);
  assert.match(actions, /\.upload\(objectPath, file/);
  assert.match(actions, /\.remove\(\[objectPath\]\)/);
  assert.match(actions, /occupiedPositions/);
  assert.match(actions, /rpc\("replace_listing_photo_details"/);
  assert.match(databaseTypes, /replace_listing_photo_details:/);
  assert.match(editor, /URL\.createObjectURL/);
  assert.match(editor, /Alternative text/);
  assert.match(editor, /Save photo order and descriptions/);
  assert.match(editor, /Remove photo/);
  assert.match(editPage, /createSignedUrl/);
  assert.match(editPage, /<PhotoEditor/);
  assert.match(config, /bodySizeLimit: "12mb"/);
  assert.match(config, /img-src 'self' data: blob: https:\/\/\*\.supabase\.co/);
});
