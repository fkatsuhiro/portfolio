import { type Page, expect, test } from "@playwright/test";

/**
 * Selects a game from the /game hub's selection screen by its accessible
 * name (e.g. "数独", "シカク", "タイピング"). The hub is itself a
 * client:load island, so on a fresh page load the very first click can
 * land before React finishes hydrating and attaching the click handler.
 * Retry the click until the resulting game's heading actually shows up.
 */
export async function selectGameFromHub(page: Page, name: string) {
  await expect(async () => {
    await page.getByRole("button", { name }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible({
      timeout: 1000,
    });
  }).toPass({ timeout: 10000 });
}

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
