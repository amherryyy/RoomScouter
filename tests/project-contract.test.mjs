import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("documents the bounded pilot and all application roles", async () => {
  const context = await readProjectFile("PROJECT_CONTEXT.md");

  for (const role of ["Visitor", "Student", "Owner", "Admin"]) {
    assert.match(context, new RegExp(`### ${role}`));
  }

  assert.match(context, /one university/i);
  assert.match(context, /does not include payments/i);
  assert.match(context, /does not implement an internal messaging system/i);
});

test("makes database authorization and moderation explicit", async () => {
  const architecture = await readProjectFile("docs/architecture.md");
  const requirements = await readProjectFile("docs/requirements.md");

  assert.match(architecture, /row-level security remain the final authorization boundary/i);
  assert.match(architecture, /deny-by-default/i);
  assert.match(architecture, /never receives a service-role credential/i);
  assert.match(requirements, /Only admins can cause a listing to become publicly visible/i);
  assert.match(requirements, /one through five/i);
});
