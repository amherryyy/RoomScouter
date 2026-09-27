import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("installs only the Flower auth capability", async () => {
  const project = JSON.parse(await readProjectFile(".flower/project.json"));
  assert.deepEqual(Object.keys(project.modules), ["auth"]);
  assert.equal(project.modules.auth, "1.0.0");
});

test("keeps admin assignment out of public registration", async () => {
  const model = await readProjectFile("src/features/auth/model.ts");
  const registerPage = await readProjectFile("app/register/page.tsx");
  const migration = await readProjectFile("supabase/migrations/20260926010000_identity_foundation.sql");

  assert.match(model, /\["student", "owner"\]/);
  assert.match(model, /value\.length >= 8/);
  assert.doesNotMatch(model, /function parsePassword[\s\S]*?\.trim\(\)/);
  assert.doesNotMatch(registerPage, /value="admin"/);
  assert.match(migration, /when 'owner' then 'owner'/i);
  assert.doesNotMatch(migration, /when 'admin' then 'admin'/i);
});

test("enforces profile ownership and immutable self-service roles in PostgreSQL", async () => {
  const migration = await readProjectFile("supabase/migrations/20260926010000_identity_foundation.sql");

  assert.match(migration, /enable row level security/i);
  assert.match(migration, /force row level security/i);
  assert.match(migration, /grant update \(display_name\)/i);
  assert.doesNotMatch(migration, /grant update \([^)]*role/i);
  assert.match(migration, /id = \(select auth\.uid\(\)\)/i);
  assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
});
