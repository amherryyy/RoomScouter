import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public discovery gives search and real filters a clear responsive hierarchy", async () => {
  const page = await readProjectFile("app/page.tsx");
  const styles = await readProjectFile("app/styles.css");

  assert.match(page, /Search listings near the university/);
  assert.match(page, /Up to ₱5,000/);
  assert.match(page, /roomType=private_room/);
  assert.match(page, /maximumDistance=1/);
  assert.match(page, /Every public result has passed administrator review/);
  assert.match(styles, /\.discovery-hero \{/);
  assert.match(styles, /max-width: 40rem[\s\S]*?\.hero-search \{ grid-template-columns: 1fr/);
  assert.match(styles, /min-width: 40\.01rem[\s\S]*?\.discovery-grid \{ grid-template-columns: repeat\(2/);
});

test("listing cards communicate only database-backed public facts", async () => {
  const page = await readProjectFile("app/page.tsx");

  assert.match(page, /listing\.monthly_rent/);
  assert.match(page, /listing\.available_rooms/);
  assert.match(page, /listing\.approximate_distance_km/);
  assert.match(page, /ROOM_TYPE_LABELS\[listing\.room_type\]/);
  assert.match(page, /listing\.cover\.signedUrl/);
  assert.match(page, /View listing details/);
  assert.doesNotMatch(page, /Featured|Most popular|Recommended for you/);
});
