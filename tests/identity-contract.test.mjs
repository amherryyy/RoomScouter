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

test("restricts repeatable administrator provisioning to privileged database operators", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260927010000_admin_provisioning.sql",
  );
  const decision = await readProjectFile(
    "docs/decisions/0005-privileged-admin-provisioning.md",
  );

  assert.match(migration, /security definer/i);
  assert.match(migration, /set search_path = ''/i);
  assert.match(migration, /lower\(trim\(target_email\)\)/i);
  assert.match(migration, /revoke all[^;]+public, anon, authenticated/i);
  assert.match(migration, /grant execute[^;]+to postgres/i);
  assert.doesNotMatch(migration, /service_role/i);
  assert.match(decision, /browser and Next\.js application receive neither access/i);
});

test("completes email confirmation through a guarded PKCE callback", async () => {
  const actions = await readProjectFile("src/features/auth/actions.ts");
  const callback = await readProjectFile("app/auth/callback/route.ts");

  assert.match(actions, /emailRedirectTo/);
  assert.match(actions, /\/auth\/callback\?next=\/account/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /value\.startsWith\("\/\/"\)/);
  assert.match(callback, /The confirmation link is invalid or has expired\./);
});

test("turns actionable Supabase Auth failures into safe user guidance", async () => {
  const actions = await readProjectFile("src/features/auth/actions.ts");

  assert.match(actions, /over_email_send_rate_limit/);
  assert.match(actions, /email_address_not_authorized/);
  assert.match(actions, /email_not_confirmed/);
  assert.match(actions, /The email or password is incorrect\./);
});

test("types every Supabase client from the linked database schema", async () => {
  const databaseTypes = await readProjectFile("src/lib/supabase/database.types.ts");
  const packageJson = await readProjectFile("package.json");
  const generator = await readProjectFile("scripts/generate-database-types.mjs");
  const browserClient = await readProjectFile("src/lib/supabase/browser.ts");
  const serverClient = await readProjectFile("src/lib/supabase/server.ts");
  const proxy = await readProjectFile("proxy.ts");

  assert.match(databaseTypes, /profiles:/);
  assert.match(databaseTypes, /boarding_houses:/);
  for (const table of [
    "facilities",
    "utilities",
    "boarding_house_facilities",
    "boarding_house_utilities",
    "house_rules",
    "listing_photos",
  ]) {
    assert.match(databaseTypes, new RegExp(`${table}:`));
  }
  assert.match(databaseTypes, /app_role: "student" \| "owner" \| "admin"/);
  assert.match(
    databaseTypes,
    /listing_status: "draft" \| "pending" \| "approved" \| "rejected" \| "archived"/,
  );
  assert.match(databaseTypes, /room_type: "bedspace" \| "shared_room" \| "private_room" \| "studio"/);
  assert.match(databaseTypes, /moderate_boarding_house:/);
  assert.match(databaseTypes, /submit_boarding_house:/);
  assert.match(databaseTypes, /current_user_can_manage_listing_photo:/);
  assert.match(databaseTypes, /provision_admin: \{ Args: \{ target_email: string \}; Returns: string \}/);
  assert.match(packageJson, /"types:database": "node scripts\/generate-database-types\.mjs"/);
  assert.match(generator, /encoding: "utf8"/);
  assert.match(browserClient, /createBrowserClient<Database>/);
  assert.match(serverClient, /createServerClient<Database>/);
  assert.match(proxy, /createServerClient<Database>/);
});
