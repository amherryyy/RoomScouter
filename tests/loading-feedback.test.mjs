import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("route transitions expose accessible, motion-safe skeletons", async () => {
  const component = await readProjectFile("src/components/page-skeleton.tsx");
  const styles = await readProjectFile("app/styles.css");
  for (const path of [
    "app/loading.tsx",
    "app/browse/loading.tsx",
    "app/account/loading.tsx",
    "app/admin/loading.tsx",
    "app/admin/listings/[id]/loading.tsx",
    "app/admin/reviews/loading.tsx",
    "app/admin/reports/loading.tsx",
    "app/owner/loading.tsx",
    "app/owner/listings/new/loading.tsx",
    "app/owner/listings/[id]/edit/loading.tsx",
    "app/listings/[id]/loading.tsx",
    "app/favorites/loading.tsx",
    "app/reports/loading.tsx",
  ]) {
    const loading = await readProjectFile(path);
    assert.match(loading, /PageSkeleton/);
    assert.match(loading, /label="Loading/);
  }

  assert.match(component, /aria-busy="true"/);
  assert.match(component, /role="status"/);
  assert.match(component, /aria-live="polite"/);
  assert.match(component, /aria-hidden="true"/);
  assert.match(styles, /@keyframes skeleton-shimmer/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(forced-colors: active\)[\s\S]*?\.skeleton-panel/);
});

test("server-action forms prevent duplicate submissions and announce progress", async () => {
  const button = await readProjectFile("src/components/submit-button.tsx");
  assert.match(button, /useFormStatus\(\)/);
  assert.match(button, /disabled=\{disabled \|\| pending\}/);
  assert.match(button, /aria-busy=\{pending \|\| undefined\}/);
  assert.match(button, /aria-live="polite"/);

  for (const path of [
    "app/login/page.tsx",
    "app/register/page.tsx",
    "app/forgot-password/page.tsx",
    "app/update-password/page.tsx",
    "app/account/page.tsx",
    "app/page.tsx",
    "app/listings/[id]/page.tsx",
    "src/features/listings/submit-listing-form.tsx",
    "app/admin/reviews/page.tsx",
    "app/admin/reports/page.tsx",
    "src/features/listings/listing-form.tsx",
    "src/features/listings/attribute-forms.tsx",
    "src/features/listings/photo-editor.tsx",
    "src/features/moderation/listing-controls.tsx",
    "src/features/reports/report-form.tsx",
    "src/features/reviews/review-section.tsx",
  ]) {
    const source = await readProjectFile(path);
    assert.match(source, /SubmitButton/);
    assert.match(source, /pendingLabel=/);
  }
});
