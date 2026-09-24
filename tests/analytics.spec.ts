import { test, expect } from "@playwright/test";

test.describe("Home page — Analytics entry point", () => {
  test("shows an Analytics card linking to the analytics page", async ({
    page,
  }) => {
    await page.goto("/portfolio/");
    const card = page.locator("main").getByRole("link", { name: "Analytics" });
    await expect(card).toHaveAttribute("href", "/portfolio/analytics");
  });
});

test.describe("Analytics page", () => {
  test("shows the heading and a not-connected message when GA isn't configured", async ({
    page,
  }) => {
    await page.goto("/portfolio/analytics");
    await expect(
      page.getByRole("heading", { name: "Analytics", level: 1 }),
    ).toBeVisible();
    // CI has no GA credentials configured, so this is the expected state.
    await expect(
      page.getByText("Google Analyticsとまだ連携していません"),
    ).toBeVisible();
  });

  test("is reachable in all three locales", async ({ page }) => {
    for (const path of [
      "/portfolio/analytics",
      "/portfolio/en/analytics",
      "/portfolio/ko/analytics",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});
