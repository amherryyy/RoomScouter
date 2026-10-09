import { expect, test, type Page } from "@playwright/test";

const password = "RoomScouterDemo!2026";
const studentReview = "The quiet study setup and clear details made this option easy to compare.";
const studentReport = "Please verify that this listing's availability and contact details are still current.";
const ownerListing = "E2E Riverside Study House";

async function logIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/account(?:\?|$)/);
}

test.describe.serial("RoomScouter pilot journeys", () => {
  test("student searches, saves, reviews, and reports", async ({ page }) => {
    await logIn(page, "student2@roomscouter.example.test");
    await page.goto("/");
    await page.getByRole("textbox", { name: "Search listings near the university" }).fill("Bayombong Study Suites");
    await page.getByRole("button", { name: "Find a room" }).click();
    await page.getByRole("link", { name: "Bayombong Study Suites", exact: true }).click();

    await page.getByRole("button", { name: "Save listing" }).click();
    await expect(page.getByRole("button", { name: "Remove from saved listings" })).toBeVisible();

    await page.getByLabel("Rating").selectOption("5");
    await page.getByLabel("Review", { exact: true }).fill(studentReview);
    await page.getByRole("button", { name: "Publish review" }).click();
    await expect(
      page.locator("article.review-card").getByText(studentReview, { exact: true }),
    ).toBeVisible();

    const listingReport = page.locator("details.report-form").filter({ hasText: "Report this listing" });
    await listingReport.locator("summary").click();
    await listingReport.getByLabel("Reason").fill(studentReport);
    await listingReport.getByRole("button", { name: "Submit report" }).click();
    await expect(page.getByRole("status")).toContainText("Report submitted");
  });

  test("owner creates and submits a listing", async ({ page }) => {
    await logIn(page, "owner@roomscouter.example.test");
    await page.getByRole("link", { name: "Open owner dashboard" }).click();
    await page.getByRole("link", { name: "Create listing" }).click();

    await page.getByLabel("Listing title").fill(ownerListing);
    await page.getByLabel("Description").fill("A quiet student boarding house created by the automated pilot journey for moderation testing.");
    await page.getByLabel("Address").fill("Riverside Road, Bayombong, Nueva Vizcaya");
    await page.getByLabel("Monthly rent (PHP)").fill("4800");
    await page.getByLabel("Room type").selectOption("private_room");
    await page.getByLabel("Available rooms").fill("2");
    await page.getByLabel("Contact name").fill("Lina Santos");
    await page.getByLabel("Phone").fill("+63 917 555 0199");
    await page.getByLabel("Latitude").fill("16.481000");
    await page.getByLabel("Longitude").fill("121.145000");
    await page.getByRole("button", { name: "Create draft" }).click();

    await expect(page.getByRole("heading", { name: "Edit listing" })).toBeVisible();
    await page.getByLabel("Photo", { exact: true }).setInputFiles({
      name: "room.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    await page.getByLabel("Photo description").fill("Bright private room prepared for student viewing");
    await page.getByRole("button", { name: "Upload photo" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Photo uploaded" })).toBeVisible();
    await expect(page.getByAltText("Bright private room prepared for student viewing")).toBeVisible();
    await page.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText("pending", { exact: true })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "submitted for review" })).toBeVisible();
  });

  test("administrator moderates the listing, review, and report", async ({ page }) => {
    await logIn(page, "admin@roomscouter.example.test");
    await page.getByRole("link", { name: "Open moderation dashboard" }).click();

    const pendingListing = page.locator("article.listing-card").filter({ hasText: ownerListing });
    await pendingListing.getByRole("link", { name: "Review listing" }).click();
    await page.getByRole("button", { name: "Approve and publish" }).click();
    await expect(page.locator("header .status-approved")).toHaveText("approved");

    await page.goto("/admin/reviews?state=published");
    const review = page.locator("article.review-card").filter({ hasText: studentReview });
    await review.getByLabel("Reason for hiding").fill("Hidden by the end-to-end moderation scenario.");
    await review.getByRole("button", { name: "Hide review" }).click();
    await expect(page.getByRole("status")).toContainText("Review hidden");

    await page.goto("/admin/reports?state=open");
    const report = page.locator("article.report-card").filter({ hasText: studentReport });
    await report.getByLabel("Resolution note").fill("Reviewed during the end-to-end scenario and resolved.");
    await report.getByRole("button", { name: "Mark resolved" }).click();
    await expect(page.getByRole("status")).toContainText("Report resolved");

    await page.goto("/");
    await page.getByRole("textbox", { name: "Search listings near the university" }).fill(ownerListing);
    await page.getByRole("button", { name: "Find a room" }).click();
    await expect(page.getByRole("link", { name: ownerListing, exact: true })).toBeVisible();
  });
});
