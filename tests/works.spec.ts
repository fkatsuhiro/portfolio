import { test, expect } from "@playwright/test";
import { drillIntoFirstRepo } from "./helpers";

test.describe("Works Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/works");
  });

  test("should display the main heading and description", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Works", level: 1 })).toBeVisible();
    await expect(page.getByText("My products and contributions.")).toBeVisible();
  });

  test("should show OSS Contribution tab and hide Product tab by default", async ({ page }) => {
    // Product tab is hidden by default via Remote Config (showWorksProduct: false)
    await expect(page.getByRole("button", { name: "OSS Contribution" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Product" })).not.toBeAttached();
  });

  test("should show OSS Contribution content by default", async ({ page }) => {
    // Product section is hidden by default, so contribution repo grid is the default view
    await expect(page.locator('[data-testid="contrib-repo-grid"]')).toBeAttached();
  });

  test("should show repo selection screen on OSS Contribution tab", async ({ page }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();

    // sub-tab bar must not appear before a repo is selected
    await expect(page.locator('[data-testid="contrib-subtabs"]')).not.toBeAttached();
  });

  test("should drill into a repo and show sub-tabs", async ({ page }) => {
    await drillIntoFirstRepo(page);

    const subTabs = page.locator('[data-testid="contrib-subtabs"]');
    await expect(subTabs).toBeVisible();
    await expect(subTabs.getByRole("button", { name: /PRs/ })).toBeVisible();
    await expect(subTabs.getByRole("button", { name: /Issues/ })).toBeVisible();
    await expect(subTabs.getByRole("button", { name: /Reviews/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "← Repositories" })).toBeVisible();
  });

  test("should show repo activity graph in drill-down view", async ({ page }) => {
    await drillIntoFirstRepo(page);

    await expect(page.locator('[data-testid="repo-activity-graph"]')).toBeVisible();
  });

  test("should display a PR status badge (Open/Draft/Merged/Closed) in the PRs tab", async ({
    page,
  }) => {
    await drillIntoFirstRepo(page);

    // PRs sub-tab is selected by default after drilling in.
    const prCards = page.locator('[data-testid="contrib-subtabs"]').locator("..").getByRole("link");

    if ((await prCards.count()) === 0) {
      test.skip(true, "repo has no PRs to show a status badge on");
      return;
    }

    const statusBadge = page.getByText(/^(Open|Draft|Merged|Closed)$/).first();
    await expect(statusBadge).toBeVisible();
  });

  test("should go back to repo list from detail view", async ({ page }) => {
    await drillIntoFirstRepo(page);
    await page.getByRole("button", { name: "← Repositories" }).click();

    // sub-tab bar gone, repo grid visible again
    await expect(page.locator('[data-testid="contrib-subtabs"]')).not.toBeAttached();
    await expect(page.locator('[data-testid="contrib-repo-grid"]')).toBeAttached();
  });
});
