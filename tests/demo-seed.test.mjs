import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  demoListingIds,
  parseSupabaseEnvironment,
  requireLocalSupabaseUrl,
} from "../scripts/seed-local-demo.mjs";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("parses local Supabase status without accepting arbitrary text", () => {
  const environment = parseSupabaseEnvironment([
    'API_URL="http://127.0.0.1:54321"',
    'SERVICE_ROLE_KEY="local-secret"',
    "not an assignment",
  ].join("\n"));
  assert.deepEqual(environment, {
    API_URL: "http://127.0.0.1:54321",
    SERVICE_ROLE_KEY: "local-secret",
  });
});

test("refuses every non-local or unexpected Supabase endpoint", () => {
  assert.equal(requireLocalSupabaseUrl("http://127.0.0.1:54321"), "http://127.0.0.1:54321");
  assert.equal(requireLocalSupabaseUrl("http://localhost:54321"), "http://localhost:54321");
  for (const unsafeUrl of [
    "https://project.supabase.co",
    "http://127.0.0.1:54322",
    "https://localhost:54321",
  ]) {
    assert.throws(() => requireLocalSupabaseUrl(unsafeUrl), /restricted to the local Supabase API/);
  }
});

test("uses stable scoped records and never reads hosted project credentials", async () => {
  const seed = await readProjectFile("scripts/seed-local-demo.mjs");
  const config = await readProjectFile("supabase/config.toml");
  const packageJson = await readProjectFile("package.json");

  assert.equal(demoListingIds.length, 4);
  assert.equal(new Set(demoListingIds).size, 4);
  assert.match(seed, /supabaseCli, "status", "-o", "env"/);
  assert.match(seed, /Local Supabase is unavailable/);
  assert.doesNotMatch(seed, /process\.env\.(?:NEXT_PUBLIC_)?SUPABASE/);
  assert.match(seed, /deleteDemoRows/);
  assert.match(seed, /createStudentClient/);
  assert.match(seed, /signInWithPassword/);
  assert.match(seed, /student@roomscouter\.example\.test/);
  assert.match(seed, /owner@roomscouter\.example\.test/);
  assert.match(seed, /admin@roomscouter\.example\.test/);
  assert.match(config, /\[db\.seed\][\s\S]*?enabled = false/);
  assert.match(packageJson, /"demo:seed": "node scripts\/seed-local-demo\.mjs"/);
});
