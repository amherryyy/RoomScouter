import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin overview derives every headline total from protected database counts", async () => {
  const dashboard = await readProjectFile("app/admin/page.tsx");

  assert.match(dashboard, /requireAdmin\(\)/);
  assert.match(dashboard, /Promise\.all/);
  assert.match(dashboard, /from\("profiles"\)\.select\("id", \{ count: "exact", head: true \}\)/);
  assert.match(dashboard, /from\("boarding_houses"\)\.select\("id", \{ count: "exact", head: true \}\)/);
  assert.match(dashboard, /\.eq\("status", "pending"\)/);
  assert.match(dashboard, /from\("reports"\)[\s\S]*?\.eq\("status", "open"\)/);
  for (const label of ["Registered accounts", "Total properties", "Awaiting review", "Open reports"]) {
    assert.match(dashboard, new RegExp(label));
  }
});

test("admin overview keeps all working moderation queues prominent", async () => {
  const dashboard = await readProjectFile("app/admin/page.tsx");
  const styles = await readProjectFile("app/styles.css");
  const handoff = await readProjectFile("docs/ui-handoff.md");

  assert.match(dashboard, /href="\/admin\?state=pending"/);
  assert.match(dashboard, /href="\/admin\/reviews"/);
  assert.match(dashboard, /href="\/admin\/reports"/);
  assert.match(styles, /\.admin-dashboard-hero/);
  assert.match(styles, /prefers-reduced-motion[\s\S]*?\.admin-queue-card/);
  assert.match(styles, /max-width: 40rem[\s\S]*?\.admin-summary-grid/);
  assert.match(handoff, /Visual direction from the team wireframes/);
});
