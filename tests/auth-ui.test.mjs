import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("authentication routes share one branded and accessible page frame", async () => {
  const component = await readProjectFile("src/components/auth-page.tsx");
  const pages = await Promise.all([
    readProjectFile("app/login/page.tsx"),
    readProjectFile("app/register/page.tsx"),
    readProjectFile("app/forgot-password/page.tsx"),
    readProjectFile("app/update-password/page.tsx"),
  ]);

  assert.match(component, /<main className="auth-shell" id="main-content" tabIndex=\{-1\}>/);
  assert.match(component, /aria-labelledby=\{titleId\}/);
  assert.match(component, /RoomScouter home/);
  assert.match(component, /Administrator-reviewed listings/);
  for (const page of pages) assert.match(page, /<AuthPage/);
});

test("auth redesign remains responsive without changing security boundaries", async () => {
  const register = await readProjectFile("app/register/page.tsx");
  const styles = await readProjectFile("app/styles.css");

  assert.match(register, /Student looking for a place/);
  assert.match(register, /Boarding-house owner/);
  assert.match(register, /Administrator access is provisioned separately/);
  assert.doesNotMatch(register, /value="admin"/);
  assert.match(styles, /\.auth-layout/);
  assert.match(styles, /max-width: 40rem[\s\S]*?\.auth-story \{ display: none/);
  assert.match(styles, /@media \(forced-colors: active\)[\s\S]*?\.auth-layout/);
});
