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

  test("should show repo selection screen on OSS Contribution tab", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();

    // sub-tab bar must not appear before a repo is selected
    await expect(
      page.locator('[data-testid="contrib-subtabs"]'),
    ).not.toBeAttached();
  });

  test("should drill into a repo and show sub-tabs", async ({ page }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();

    const firstCard = page
      .locator('[data-testid="contrib-repo-grid"]')
      .locator("button")
      .first();

    // GitHub API may be unavailable in this environment — skip gracefully
    if (!(await firstCard.isVisible())) {
      test.skip(true, "no GitHub contribution data");
      return;
    }

    await firstCard.click();

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

  test("should show repo activity graph in drill-down view", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();

    const firstCard = page
      .locator('[data-testid="contrib-repo-grid"]')
      .locator("button")
      .first();

    // GitHub API may be unavailable in this environment — skip gracefully
    if (!(await firstCard.isVisible())) {
      test.skip(true, "no GitHub contribution data");
      return;
    }

    await firstCard.click();

    await expect(
      page.locator('[data-testid="repo-activity-graph"]'),
    ).toBeVisible();
  });

  test("should go back to repo list from detail view", async ({ page }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();

    const firstCard = page
      .locator('[data-testid="contrib-repo-grid"]')
      .locator("button")
      .first();

    // GitHub API may be unavailable in this environment — skip gracefully
    if (!(await firstCard.isVisible())) {
      test.skip(true, "no GitHub contribution data");
      return;
    }

    await firstCard.click();
    await page.getByRole("button", { name: "← Repositories" }).click();

    // sub-tab bar gone, repo grid visible again
    await expect(
      page.locator('[data-testid="contrib-subtabs"]'),
    ).not.toBeAttached();
    await expect(
      page.locator('[data-testid="contrib-repo-grid"]'),
    ).toBeAttached();
  });
});
