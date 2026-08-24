import { type Page, test } from "@playwright/test";

/**
 * Opens the OSS Contribution tab and drills into the first repo card.
 * Skips the calling test when no GitHub contribution data is available
 * (e.g. no GITHUB_TOKEN in this environment) instead of failing.
 */
export async function drillIntoFirstRepo(page: Page) {
  await page.getByRole("button", { name: "OSS Contribution" }).click();

  const firstCard = page.locator('[data-testid="contrib-repo-grid"]').locator("button").first();

  if (!(await firstCard.isVisible())) {
    test.skip(true, "no GitHub contribution data");
  }

  await firstCard.click();
}
