import { test, expect } from "@playwright/test";

test.describe("Works Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/works");
  });

  test("should display the main heading and description", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Works", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText("My products and contributions."),
    ).toBeVisible();
  });

  test("should show Product and OSS Contribution tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Product" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "OSS Contribution" }),
    ).toBeVisible();
  });

  test("should display product cards by default", async ({ page }) => {
    await expect(page.getByText("View Project →").first()).toBeVisible();
  });

  test("should show repo cards on OSS Contribution tab", async ({ page }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();

    // repo selection screen: sub-tabs are not yet visible
    await expect(page.getByRole("button", { name: /PRs/ })).not.toBeVisible();

    // at least one repo card with "total" count should be present
    const repoCard = page
      .locator("button")
      .filter({ hasText: /total/ })
      .first();
    await expect(repoCard).toBeVisible();
  });

  test("should drill into a repo and show sub-tabs", async ({ page }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();

    const repoCard = page
      .locator("button")
      .filter({ hasText: /total/ })
      .first();
    await repoCard.click();

    await expect(page.getByRole("button", { name: /PRs/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Issues/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reviews/ })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /← Repositories/ }),
    ).toBeVisible();
  });

  test("should go back to repo list from detail view", async ({ page }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();
    await page.locator("button").filter({ hasText: /total/ }).first().click();
    await page.getByRole("button", { name: /← Repositories/ }).click();

    // back to repo selection: sub-tabs gone, repo cards visible again
    await expect(page.getByRole("button", { name: /PRs/ })).not.toBeVisible();
    await expect(
      page.locator("button").filter({ hasText: /total/ }).first(),
    ).toBeVisible();
  });
});
