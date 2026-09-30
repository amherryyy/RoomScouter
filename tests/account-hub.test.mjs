import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("account hub gives each verified role only its relevant destinations", async () => {
  const account = await readProjectFile("app/account/page.tsx");

  assert.match(account, /role === "student"/);
  assert.match(account, /href="\/favorites"/);
  assert.match(account, /href="\/reports"/);
  assert.match(account, /role === "owner"/);
  assert.match(account, /href="\/owner"/);
  assert.match(account, /href="\/owner\/listings\/new"/);
  assert.match(account, /role === "admin"/);
  assert.match(account, /href="\/admin"/);
  assert.match(account, /href="\/admin\/reviews"/);
  assert.match(account, /href="\/admin\/reports"/);
});

test("unfinished profile editing is honest and does not expose a fake control", async () => {
  const account = await readProjectFile("app/account/page.tsx");

  assert.match(account, /Under construction/);
  assert.match(account, /Profile editing/);
  assert.match(account, /identity and role changes remain protected/);
  assert.doesNotMatch(account, /Edit profile|Save profile/);
});

test("account hub remains responsive and motion safe", async () => {
  const styles = await readProjectFile("app/styles.css");

  assert.match(styles, /\.account-action-grid/);
  assert.match(styles, /prefers-reduced-motion[\s\S]*\.account-action-card/);
  assert.match(styles, /max-width: 40rem[\s\S]*\.account-summary[\s\S]*grid-template-columns: 1fr/);
});
