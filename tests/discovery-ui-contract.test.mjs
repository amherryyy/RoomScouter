import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public discovery remains database-filtered and paginated", async () => {
  const page = await readProjectFile("app/page.tsx");
  const queries = await readProjectFile("src/features/discovery/queries.ts");
  const model = await readProjectFile("src/features/discovery/model.ts");
  const filterForm = await readProjectFile("src/components/discovery-filters.tsx");

  assert.match(queries, /rpc\("search_public_boarding_houses"/);
  assert.match(queries, /page_size: pageSize/);
  assert.match(queries, /pageSize = DISCOVERY_PAGE_SIZE/);
  assert.match(queries, /page_offset:/);
  assert.match(model, /DISCOVERY_PAGE_SIZE = 12/);
  assert.match(page, /<DiscoveryFiltersForm/);
  for (const field of ["q", "maximumRent", "minimumRooms", "roomType", "facility", "utility"]) {
    assert.match(filterForm, new RegExp(`name="${field}"`));
  }
  assert.match(filterForm, /name="maximumDistance"/);
  assert.match(page, /discoveryQuery\(filters, filters\.page \+ 1\)/);
});

test("public listing details expose complete approved comparison facts", async () => {
  const page = await readProjectFile("app/listings/[id]/page.tsx");

  assert.match(page, /listing\.status !== "approved"/);
  assert.match(page, /createSignedUrl/);
  assert.match(page, /ROOM_TYPE_LABELS/);
  assert.match(page, /Facilities/);
  assert.match(page, /Utilities/);
  assert.match(page, /House rules/);
  assert.match(page, /approximateDistanceKm/);
  assert.match(page, /OpenStreetMap/);
  assert.match(page, /tel:/);
  assert.match(page, /mailto:/);
});

test("university coordinates are validated deployment configuration", async () => {
  const university = await readProjectFile("src/features/discovery/university.ts");
  const environment = await readProjectFile(".env.example");

  assert.match(university, /ROOMSCOUTER_UNIVERSITY_NAME/);
  assert.match(university, /latitude < -90/);
  assert.match(university, /longitude > 180/);
  assert.match(environment, /ROOMSCOUTER_UNIVERSITY_LATITUDE=/);
  assert.match(environment, /ROOMSCOUTER_UNIVERSITY_LONGITUDE=/);
});
