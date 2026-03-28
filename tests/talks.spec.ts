import { test, expect } from "@playwright/test";

test.describe("Talks Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/talks");
  });

  test("should display all talk cards with correct information", async ({
    page,
  }) => {
    const talkCards = page.locator("section, article");
    await expect(talkCards).toHaveCount(2);
    const tsKaigiHeading = page.getByRole("heading", {
      name: "TSKaigi Hokuriku 2025",
    });
    await expect(tsKaigiHeading).toBeVisible();

    const description = page.getByText(
      "Zod × Web Worker を用いた型安全かつUIファーストなIPアドレス一括登録",
    );
    await expect(description).toBeVisible();
  });

  test("should embed Google Slides iframes correctly", async ({ page }) => {
    const iframes = page.locator("iframe");
    await expect(iframes).toHaveCount(2);
    const firstIframe = iframes.first();
    await expect(firstIframe).toHaveAttribute(
      "src",
      /docs\.google\.com\/presentation/,
    );
  });

  test("should show sidebar on desktop and hide on mobile", async ({
    page,
    isMobile,
  }) => {
    const sidebar = page.locator("aside, .sidebar");

    if (isMobile) {
      await expect(sidebar).not.toBeVisible();
    } else {
      await expect(sidebar).toBeVisible();
      await expect(sidebar).toContainText("TALKS");
      await expect(sidebar).toContainText("React Tokyo Fes 2026");
    }
  });

  test("should have a link to the external event page", async ({ page }) => {
    const card = page.locator("#tskaigi-hokuriku-2025");
    const externalLink = card.locator('a[target="_blank"]').first();

    await expect(externalLink).toHaveAttribute(
      "href",
      "https://hokuriku.tskaigi.org/talks/27",
    );
  });
});
