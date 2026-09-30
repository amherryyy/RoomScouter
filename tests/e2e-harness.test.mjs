import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the browser-test runner is local-only and reseeds deterministic data", async () => {
  const runner = await readProjectFile("scripts/run-local-e2e.mjs");
  const packageJson = JSON.parse(await readProjectFile("package.json"));

  assert.match(runner, /readLocalSupabaseEnvironment/);
  assert.match(runner, /await seedLocalDemo\(\)/);
  assert.match(runner, /NEXT_PUBLIC_SUPABASE_URL: apiUrl/);
  assert.match(runner, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey/);
  assert.doesNotMatch(runner, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.equal(packageJson.scripts["test:e2e:local"], "node scripts/run-local-e2e.mjs");
});

test("Playwright runs serially against a dedicated loopback development server", async () => {
  const config = await readProjectFile("playwright.config.ts");
  const ignores = await readProjectFile(".gitignore");

  assert.match(config, /workers: 1/);
  assert.match(config, /baseURL: "http:\/\/127\.0\.0\.1:3100"/);
  assert.match(config, /reuseExistingServer: false/);
  assert.match(config, /name: "chromium"/);
  assert.match(ignores, /\.playwright-browsers\//);
  assert.match(ignores, /playwright-report\//);
  assert.match(ignores, /test-results\//);
});

test("pilot journeys cover student, owner, and administrator behavior", async () => {
  const journeys = await readProjectFile("e2e/pilot-journeys.spec.ts");

  assert.match(journeys, /student2@roomscouter\.example\.test/);
  assert.match(journeys, /owner@roomscouter\.example\.test/);
  assert.match(journeys, /admin@roomscouter\.example\.test/);
  for (const action of [
    "Save listing",
    "Publish review",
    "Submit report",
    "Create draft",
    "Submit for review",
    "Approve and publish",
    "Hide review",
    "Mark resolved",
  ]) assert.match(journeys, new RegExp(action));
});
