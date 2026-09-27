import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("uses RoomScouter for product-owned branding", async () => {
  const readme = await readProjectFile("README.md");
  const layout = await readProjectFile("app/layout.tsx");
  const packageManifest = JSON.parse(await readProjectFile("package.json"));

  assert.match(readme, /^# RoomScouter$/m);
  assert.match(layout, /title: "RoomScouter"/);
  assert.equal(packageManifest.name, "roomscouter");
});

test("preserves the stable Flower project identifier", async () => {
  const manifest = JSON.parse(await readProjectFile(".flower/project.json"));
  assert.equal(manifest.project.id, "boarding-house-finder");
});
