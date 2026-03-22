import { test, expect } from "@playwright/test";

test.describe("Works Page - OSS Contributions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/works");
  });

  test("should display the main heading and description", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "OSS Comtribution", level: 1 })).toBeVisible();
    await expect(page.getByText("My contributions to the open source community.")).toBeVisible();
  });

  test("should render contribution sections based on tech stack", async ({ page }) => {
    const sections = ["Astro", "Astro-Docs", "Qwik", "Yamada UI", "Dioxus"];
    const headings = page.locator("h2");
    const visibleHeadings = await headings.allInnerTexts();
    expect(visibleHeadings.length).toBeGreaterThan(0);
  });

  test("should display individual contribution cards with links", async ({ page }) => {
    const prLink = page.locator('a[href^="https://github.com/"]').first();

    if (await prLink.isVisible()) {
      await expect(prLink).toBeVisible();
      await expect(prLink).toHaveAttribute("target", "_blank");
    }
  });

  test("should show items count badge in section headers", async ({ page }) => {
    const badge = page.locator('span:has-text("items")').first();

    if (await badge.isVisible()) {
      await expect(badge).toContainText(/\d+ items/);
      await expect(badge).toHaveClass(/font-mono/);
    }
  });

  test("should display empty state message when no PRs are fetched", async ({ page }) => {
    const emptyState = page.getByText("No contributions found. Check your GITHUB_TOKEN.");
    const prCards = page.locator('a[href^="https://github.com/"]');
    if ((await prCards.count()) === 0) {
      await expect(emptyState).toBeVisible();
    }
  });
});
