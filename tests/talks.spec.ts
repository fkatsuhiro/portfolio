import { test, expect } from "@playwright/test";

test.describe("Talks Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/talks");
  });

  test("should display all talk cards with correct information", async ({ page }) => {
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
    await expect(firstIframe).toHaveAttribute("src", /docs\.google\.com\/presentation/);
  });

  test("should show sidebar on desktop and hide on mobile", async ({ page, isMobile }) => {
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

    await expect(externalLink).toHaveAttribute("href", "https://hokuriku.tskaigi.org/talks/27");
  });

  test("should open slide modal on expand button click", async ({ page }) => {
    const expandBtn = page.locator('[data-testid="slide-expand-btn"]').first();
    await expandBtn.click();
    await expect(page.locator('[data-testid="slide-modal"]')).toBeVisible();
  });

  test("should close slide modal with close button", async ({ page }) => {
    await page.locator('[data-testid="slide-expand-btn"]').first().click();
    await page.locator('[data-testid="slide-modal"]').waitFor({
      state: "visible",
    });
    await page.locator('[data-testid="slide-modal-close"]').click();
    await expect(page.locator('[data-testid="slide-modal"]')).not.toBeVisible();
  });

  test("should close slide modal with Escape key", async ({ page }) => {
    await page.locator('[data-testid="slide-expand-btn"]').first().click();
    await page.locator('[data-testid="slide-modal"]').waitFor({
      state: "visible",
    });
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="slide-modal"]')).not.toBeVisible();
  });

  test("should show modal iframe for full-screen slide view", async ({ page }) => {
    await page.locator('[data-testid="slide-expand-btn"]').first().click();
    await page.locator('[data-testid="slide-modal"]').waitFor({
      state: "visible",
    });
    // modal iframe is rendered inside the portal
    const modalIframe = page.locator('[data-testid="slide-modal"]').locator("iframe");
    await expect(modalIframe).toBeVisible();
    await expect(modalIframe).toHaveAttribute("src", /docs\.google\.com\/presentation/);
  });
});
