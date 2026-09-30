import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public pages batch storage signing instead of issuing one request per photo", async () => {
  const discovery = await readProjectFile("src/features/discovery/queries.ts");
  const detail = await readProjectFile("app/listings/[id]/page.tsx");

  assert.match(discovery, /createSignedUrls\(/);
  assert.doesNotMatch(discovery, /\.createSignedUrl\(/);
  assert.match(detail, /createSignedUrls\(/);
  assert.doesNotMatch(detail, /\.createSignedUrl\(/);
});

test("listing detail starts independent public, session, and listing reads together", async () => {
  const detail = await readProjectFile("app/listings/[id]/page.tsx");

  assert.match(detail, /await Promise\.all\(\[\s*supabase\.from\("boarding_houses"\)/);
  assert.match(detail, /supabase\.auth\.getUser\(\)/);
  assert.doesNotMatch(detail, /count: "exact"/);
});
