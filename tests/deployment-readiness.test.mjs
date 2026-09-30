import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateDeploymentEnvironment } from "../scripts/check-deployment-readiness.mjs";

const validEnvironment = {
  ROOMSCOUTER_SITE_URL: "https://roomscouter.example",
  NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnop.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(32)}`,
  ROOMSCOUTER_UNIVERSITY_NAME: "Nueva Vizcaya State University Bayombong Campus",
  ROOMSCOUTER_UNIVERSITY_LATITUDE: "16.479791986946516",
  ROOMSCOUTER_UNIVERSITY_LONGITUDE: "121.1432206694793",
};
const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("accepts a complete hosted deployment without exposing the key", () => {
  assert.deepEqual(validateDeploymentEnvironment(validEnvironment), {
    siteUrl: "https://roomscouter.example",
    supabaseUrl: "https://abcdefghijklmnop.supabase.co",
    keyKind: "publishable",
    university: {
      name: "Nueva Vizcaya State University Bayombong Campus",
      latitude: 16.479791986946516,
      longitude: 121.1432206694793,
    },
  });
});

test("rejects missing, local, malformed, and secret deployment values", () => {
  for (const override of [
    { ROOMSCOUTER_SITE_URL: "" },
    { ROOMSCOUTER_SITE_URL: "http://roomscouter.example" },
    { ROOMSCOUTER_SITE_URL: "https://roomscouter.example/path" },
    { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321" },
    { NEXT_PUBLIC_SUPABASE_URL: "https://example.com" },
    { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_secret_${"a".repeat(32)}` },
    { ROOMSCOUTER_UNIVERSITY_LATITUDE: "91" },
    { ROOMSCOUTER_UNIVERSITY_LONGITUDE: "west" },
  ]) assert.throws(() => validateDeploymentEnvironment({ ...validEnvironment, ...override }));
});

test("documents every checked value and preserves strict production script policy", async () => {
  const example = await readProjectFile(".env.example");
  const config = await readProjectFile("next.config.ts");
  const packageJson = JSON.parse(await readProjectFile("package.json"));

  for (const name of Object.keys(validEnvironment)) assert.match(example, new RegExp(`^${name}=`, "m"));
  assert.match(config, /NODE_ENV === "development"/);
  assert.match(config, /" 'unsafe-eval'" : ""/);
  assert.equal(packageJson.scripts["deployment:check"], "node --env-file-if-exists=.env.local scripts/check-deployment-readiness.mjs");
  assert.match(packageJson.scripts["release:check"], /^npm run deployment:check/);
});
