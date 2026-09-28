import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("student favorite actions are authenticated, scoped, and idempotent", async () => {
  const access = await readProjectFile("src/features/students/access.ts");
  const actions = await readProjectFile("src/features/favorites/actions.ts");

  assert.match(access, /auth\.getUser\(\)/);
  assert.match(access, /profile\?\.role !== "student"/);
  assert.match(actions, /requireStudent\(\)/);
  assert.match(actions, /student_id: user\.id/);
  assert.match(actions, /error\.code !== "23505"/);
  assert.match(actions, /\.eq\("student_id", user\.id\)/);
  assert.match(actions, /revalidatePath\("\/favorites"\)/);
});

test("students can save from details and manage a private paginated shortlist", async () => {
  const detailPage = await readProjectFile("app/listings/[id]/page.tsx");
  const favoritesPage = await readProjectFile("app/favorites/page.tsx");
  const accountPage = await readProjectFile("app/account/page.tsx");

  assert.match(detailPage, /Save listing/);
  assert.match(detailPage, /Remove from saved listings/);
  assert.match(detailPage, /profile\?\.role === "student"/);
  assert.match(favoritesPage, /requireStudent\(\)/);
  assert.match(favoritesPage, /boarding_houses!inner/);
  assert.match(favoritesPage, /PAGE_SIZE = 12/);
  assert.match(favoritesPage, /Saved listings/);
  assert.match(accountPage, /href="\/favorites"/);
});
