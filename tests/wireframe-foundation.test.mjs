import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public navigation exposes the approved wireframe destinations", async () => {
  const header = await readProjectFile("src/components/public-header.tsx");
  const home = await readProjectFile("app/page.tsx");
  const browse = await readProjectFile("app/browse/page.tsx");
  const detail = await readProjectFile("app/listings/[id]/page.tsx");

  for (const destination of ["/", "/browse", "/map", "/about", "/login", "/register"]) {
    assert.ok(header.includes(`href="${destination}"`), `missing public destination ${destination}`);
  }
  assert.match(home, /<PublicHeader current=\{browseMode \? "browse" : "home"\}/);
  assert.match(browse, /<Home searchParams=\{searchParams\} browseMode/);
  assert.match(detail, /<PublicHeader/);
});

test("public navigation shows an authenticated profile card with account actions", async () => {
  const header = await readProjectFile("src/components/public-header.tsx");

  assert.match(header, /supabase\.auth\.getUser\(\)/);
  assert.match(header, /from\("profiles"\)\.select\("display_name, role"\)/);
  assert.match(header, /className="profile-menu"/);
  assert.match(header, /href="\/account">My account/);
  assert.match(header, /action=\{logout\}/);
  assert.match(header, /href="\/login">Log in/);
  assert.match(header, /href="\/register">Create account/);
});

test("unfinished map behavior is presented honestly and without fake controls", async () => {
  const map = await readProjectFile("app/map/page.tsx");

  assert.match(map, /Under construction/);
  assert.match(map, /wireframe preview, not an interactive map/);
  assert.match(map, /approved,\s+available listings/);
  assert.doesNotMatch(map, /<button/);
  assert.doesNotMatch(map, /Message owner|Reserve now|Book now/);
});

test("the handoff distinguishes working routes from future product decisions", async () => {
  const handoff = await readProjectFile("docs/ui-handoff.md");

  assert.match(handoff, /\| Map view \| `\/map` \| Preview only/);
  assert.match(handoff, /in-application messaging/);
  assert.match(handoff, /Google or Facebook authentication/);
  assert.match(handoff, /does not process reservations, leases, or payments/);
});
