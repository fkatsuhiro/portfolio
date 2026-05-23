import { test, expect } from "@playwright/test";

test.describe("Blogs Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/blogs");
  });

  test("should display the blog list with fetched OGP data", async ({
    page,
  }) => {
    await page.goto("/portfolio/blogs");

    const ogpTitle = page
      .getByText("SessionStorage を活用してトースト表示を制御する")
      .first();

    await expect(ogpTitle).toBeVisible({ timeout: 10000 });
  });

  test("should have working links to Zenn articles", async ({ page }) => {
    const firstBlogLink = page
      .locator('a[href^="https://zenn.dev/kattu/articles/"]')
      .first();

    await expect(firstBlogLink).toHaveAttribute("target", "_blank");
    await expect(firstBlogLink).toHaveAttribute("rel", /noopener/);
  });

  test("should show sidebar navigation on desktop and hide on mobile", async ({
    page,
    isMobile,
  }) => {
    const sidebar = page.locator("aside, .sidebar");

    if (isMobile) {
      await expect(sidebar).not.toBeVisible();
    } else {
      await expect(sidebar).toBeVisible();
      await expect(sidebar).toContainText("PyCon Jp 2025 参加レポート");
    }
  });

  test("should toggle sorting order when the button is clicked", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Sort button is only available on Desktop");

    // Wait for feature-flags fetch to complete so React is fully hydrated
    await page.waitForLoadState("networkidle");

    const sortButton = page.getByRole("button", { name: /順/ });

    await expect(sortButton).toBeVisible();
    await expect(sortButton).toContainText("新しい順");

    await sortButton.evaluate((el) => (el as HTMLButtonElement).click());

    // Verify sort toggled: button label must change
    await expect(sortButton).toContainText("古い順", { timeout: 5000 });
  });
});
