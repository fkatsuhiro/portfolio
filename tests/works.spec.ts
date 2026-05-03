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

    // repo selection screen: sub-tab bar is not yet rendered
    await expect(
      page.locator('[data-testid="contrib-subtabs"]'),
    ).not.toBeVisible();

    // at least one repo card should be present in the grid
    const repoGrid = page.locator('[data-testid="contrib-repo-grid"]');
    await expect(repoGrid).toBeVisible();
    await expect(repoGrid.locator("button").first()).toBeVisible();
  });

  test("should drill into a repo and show sub-tabs", async ({ page }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();

    const repoGrid = page.locator('[data-testid="contrib-repo-grid"]');
    await repoGrid.locator("button").first().click();

    const subTabs = page.locator('[data-testid="contrib-subtabs"]');
    await expect(subTabs).toBeVisible();
    await expect(subTabs.getByRole("button", { name: /PRs/ })).toBeVisible();
    await expect(subTabs.getByRole("button", { name: /Issues/ })).toBeVisible();
    await expect(
      subTabs.getByRole("button", { name: /Reviews/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "← Repositories" }),
    ).toBeVisible();
  });

  test("should go back to repo list from detail view", async ({ page }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();
    await page
      .locator('[data-testid="contrib-repo-grid"]')
      .locator("button")
      .first()
      .click();
    await page.getByRole("button", { name: "← Repositories" }).click();

    // back to repo selection: sub-tab bar gone, repo grid visible again
    await expect(
      page.locator('[data-testid="contrib-subtabs"]'),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid="contrib-repo-grid"]'),
    ).toBeVisible();
  });
});
