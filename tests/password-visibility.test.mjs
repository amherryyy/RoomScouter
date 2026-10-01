import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("password fields offer an accessible show and hide control", async () => {
  const component = await readProjectFile("src/components/password-field.tsx");
  const pages = await Promise.all([
    readProjectFile("app/login/page.tsx"),
    readProjectFile("app/register/page.tsx"),
    readProjectFile("app/update-password/page.tsx"),
  ]);

  assert.match(component, /isVisible \? "text" : "password"/);
  assert.match(component, /aria-label=\{`\$\{isVisible \? "Hide" : "Show"\} password`\}/);
  assert.match(component, /aria-pressed=\{isVisible\}/);
  assert.match(component, /type="button"/);
  for (const page of pages) assert.match(page, /<PasswordField/);
});
