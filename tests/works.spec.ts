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

  test("should switch to OSS Contribution tab and show sub-tabs", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "OSS Contribution" }).click();

    await expect(page.getByRole("button", { name: /PRs/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Issues/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reviews/ })).toBeVisible();
  });
});
