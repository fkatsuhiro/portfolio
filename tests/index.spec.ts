import { test, expect } from "@playwright/test";

test.describe("Index Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/");
  });

  test("should display the main visual and portrait", async ({ page }) => {
    const portraitImg = page.getByAltText("Portrait");
    await expect(portraitImg).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Furuichi Katsuhiro" }),
    ).toBeVisible();
  });

  test("should display main navigation blocks correctly", async ({ page }) => {
    const navLinks = [
      { name: "About", href: "/portfolio/about" },
      { name: "Works", href: "/portfolio/works" },
      { name: "Talks", href: "/portfolio/talks" },
      { name: "Blogs", href: "/portfolio/blogs" },
    ];

    for (const link of navLinks) {
      const navItem = page
        .locator("main")
        .getByRole("heading", { name: link.name, level: 3 });

      await expect(navItem).toBeVisible();

      const linkContainer = page
        .locator("main")
        .getByRole("link", { name: link.name });
      await expect(linkContainer).toHaveAttribute("href", link.href);
    }
  });

  test("should have a theme toggle component", async ({ page }) => {
    const toggle = page.locator("button").filter({ has: page.locator("svg") });
    await expect(toggle.first()).toBeVisible();
  });

  test('should show "Scroll Down" indicator', async ({ page }) => {
    await expect(page.getByText("Scroll Down")).toBeVisible();
  });
});
