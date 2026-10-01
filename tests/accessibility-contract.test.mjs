import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const pageFiles = [
  "app/page.tsx",
  "app/login/page.tsx",
  "app/register/page.tsx",
  "app/forgot-password/page.tsx",
  "app/update-password/page.tsx",
  "app/account/page.tsx",
  "app/favorites/page.tsx",
  "app/reports/page.tsx",
  "app/listings/[id]/page.tsx",
  "app/owner/page.tsx",
  "app/owner/listings/new/page.tsx",
  "app/owner/listings/[id]/edit/page.tsx",
  "app/admin/page.tsx",
  "app/admin/listings/[id]/page.tsx",
  "app/admin/reviews/page.tsx",
  "app/admin/reports/page.tsx",
];

test("provides a consistent keyboard bypass to every page's main landmark", async () => {
  const layout = await readProjectFile("app/layout.tsx");
  const authPage = await readProjectFile("src/components/auth-page.tsx");
  assert.match(layout, /className="skip-link" href="#main-content"/);
  assert.match(layout, /<html lang="en">/);
  assert.match(authPage, /<main[^>]+id="main-content"[^>]+tabIndex=\{-1\}/);

  for (const pageFile of pageFiles) {
    const page = await readProjectFile(pageFile);
    assert.match(
      page,
      /<main[^>]+id="main-content"[^>]+tabIndex=\{-1\}|<AuthPage/,
      `${pageFile} must expose a focusable skip-link target`,
    );
  }
});

test("announces active moderation queues and asynchronous page feedback", async () => {
  for (const pageFile of ["app/admin/page.tsx", "app/admin/reviews/page.tsx", "app/admin/reports/page.tsx"]) {
    const page = await readProjectFile(pageFile);
    assert.match(page, /aria-current=/, `${pageFile} must announce the current queue`);
  }
  const detail = await readProjectFile("app/listings/[id]/page.tsx");
  const login = await readProjectFile("app/login/page.tsx");
  assert.match(detail, /role="alert"/);
  assert.match(detail, /role="status"/);
  assert.match(login, /role="alert"/);
  assert.match(login, /role="status"/);
});

test("associates important form guidance and identifies new-window navigation", async () => {
  const registration = await readProjectFile("app/register/page.tsx");
  const listingForm = await readProjectFile("src/features/listings/listing-form.tsx");
  const detail = await readProjectFile("app/listings/[id]/page.tsx");

  assert.match(registration, /aria-describedby="password-help"/);
  assert.match(listingForm, /aria-describedby="contact-help"/);
  assert.match(listingForm, /aria-describedby="map-help"/);
  assert.match(detail, /opens in a new tab/);
  const reportForm = await readProjectFile("src/features/reports/report-form.tsx");
  const reviewSection = await readProjectFile("src/features/reviews/review-section.tsx");
  assert.match(reportForm, /const reasonId = `report-reason-\$\{id\}`/);
  assert.match(reportForm, /aria-describedby=\{helpId\}/);
  assert.match(reviewSection, /id=\{`review-\$\{review\.id\}`\}/);
});

test("keeps focus, forced colors, and narrow layouts usable", async () => {
  const styles = await readProjectFile("app/styles.css");
  assert.match(styles, /\.skip-link:focus/);
  assert.match(styles, /outline: 3px solid #7a4f00/);
  assert.match(styles, /@media \(forced-colors: active\)/);
  assert.match(styles, /\.moderation-tabs \{[\s\S]*?flex-wrap: wrap/);
  assert.match(styles, /@media \(max-width: 40rem\)[\s\S]*?\.report-resolution-grid \{ grid-template-columns: 1fr/);
  assert.match(styles, /\.pagination \{ grid-template-columns: 1fr/);
});
