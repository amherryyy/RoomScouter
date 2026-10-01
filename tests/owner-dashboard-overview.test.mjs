import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("owner dashboard derives truthful lifecycle totals from the secured listing result", async () => {
  const dashboard = await readProjectFile("app/owner/page.tsx");

  assert.match(dashboard, /requireOwner\(\)/);
  assert.match(dashboard, /total: ownerListings\.length/);
  for (const status of ["draft", "pending", "approved", "rejected"]) {
    assert.match(dashboard, new RegExp(`listing\\.status === "${status}"`));
  }
  for (const label of ["Total properties", "Private drafts", "Pending review", "Published", "Needs changes"]) {
    assert.match(dashboard, new RegExp(label));
  }
});

test("unsupported owner analytics are labeled instead of fabricated", async () => {
  const dashboard = await readProjectFile("app/owner/page.tsx");

  assert.match(dashboard, /Under construction/);
  assert.match(dashboard, /does not currently track property views/);
  assert.match(dashboard, /does not currently[\s\S]*store student-owner conversations/);
  assert.doesNotMatch(dashboard, /Total views|New inquiries/);
});
