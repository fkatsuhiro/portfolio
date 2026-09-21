import { type Page, test } from "@playwright/test";

/**
 * Opens the OSS Contribution tab and drills into the first repo card.
 * Skips the calling test when no GitHub contribution data is available
 * (e.g. no GITHUB_TOKEN in this environment) instead of failing.
 */
export async function drillIntoFirstRepo(page: Page) {
  await page.getByRole("button", { name: "OSS Contribution" }).click();

  const firstCard = page
    .locator('[data-testid="contrib-repo-grid"]')
    .locator("button")
    .first();

  if (!(await firstCard.isVisible())) {
    test.skip(true, "no GitHub contribution data");
  }

  // The card is server-rendered and visible before the island (which pulls
  // in the Firebase remote-config bundle) finishes hydrating. Wait for the
  // network to settle so the click handler is actually attached before
  // interacting, otherwise the click can be lost to the hydration race.
  await page.waitForLoadState("networkidle");
  await firstCard.click();
  await page.locator('[data-testid="contrib-subtabs"]').waitFor();
}
