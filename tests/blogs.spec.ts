import { test, expect } from "@playwright/test";

test.describe("Home page — Blogs entry point", () => {
  test("shows a Blogs card linking to the blogs page", async ({ page }) => {
    await page.goto("/portfolio/");
    const card = page.locator("main").getByRole("link", { name: "Blogs" });
    await expect(card).toHaveAttribute("href", "/portfolio/blogs");
  });
});

test.describe("Blogs page", () => {
  test("renders at least one article card with a title, image, and working external link", async ({
    page,
  }) => {
    await page.goto("/portfolio/blogs");
    await expect(
      page.getByRole("heading", { name: "Blogs", level: 1 }),
    ).toBeVisible();

    const cards = page.locator("main a[target=_blank]");
    await expect(cards.first()).toBeVisible();

    const firstCard = cards.first();
    await expect(firstCard).toHaveAttribute("href", /^https:\/\/zenn\.dev\//);
    await expect(firstCard.locator("img").first()).toBeVisible();
    await expect(firstCard.locator("h2").first()).not.toBeEmpty();
  });

  test("is reachable in all three locales", async ({ page }) => {
    for (const path of [
      "/portfolio/blogs",
      "/portfolio/en/blogs",
      "/portfolio/ko/blogs",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});
