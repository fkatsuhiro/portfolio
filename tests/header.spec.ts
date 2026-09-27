import { test, expect } from "@playwright/test";

test.describe("Header Language Selector", () => {
  test.beforeEach(async ({ page }) => {
    // The header stays off-screen until scrolled past the hero on the home
    // page, so use a page where it's visible immediately.
    await page.goto("/portfolio/about");
  });

  test("should open the language menu and list all three languages", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: "言語を選択" });
    await trigger.click();

    const listbox = page.getByRole("listbox", { name: "言語を選択" });
    await expect(listbox).toBeVisible();

    const options = listbox.getByRole("option");
    await expect(options).toHaveCount(3);
    await expect(listbox.getByText("日本語")).toBeVisible();
    await expect(listbox.getByText("English")).toBeVisible();
    await expect(listbox.getByText("한국어")).toBeVisible();

    // Current language (Japanese) is marked selected.
    await expect(
      listbox.getByRole("option", { name: "日本語" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  test("should navigate to the English site when English is selected", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "言語を選択" }).click();
    await page.getByRole("option", { name: "English" }).click();

    await expect(page).toHaveURL(/\/portfolio\/en\/about\/?$/);
  });

  test("should close the language menu when Escape is pressed", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: "言語を選択" });
    await trigger.click();
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("should close the language menu when clicking outside", async ({
    page,
  }) => {
    const trigger = page.getByRole("button", { name: "言語を選択" });
    await trigger.click();
    await expect(page.getByRole("listbox")).toBeVisible();

    await page.mouse.click(10, 10);
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });
});

test.describe("Header — mobile nav", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/about");
  });

  test("does not cause horizontal overflow at phone width", async ({
    page,
  }) => {
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test("hides the inline nav links and shows a menu toggle instead", async ({
    page,
  }) => {
    await expect(page.getByRole("link", { name: "Works" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "メニュー" })).toBeVisible();
  });

  test("opening the menu toggle reveals every nav link, and it closes again on selection", async ({
    page,
  }) => {
    const toggle = page.getByRole("button", { name: "メニュー" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    const mobileNav = page.locator("#mobile-nav");
    for (const name of [
      "About",
      "Works",
      "Talks",
      "Blogs",
      "Analytics",
      "Game",
    ]) {
      await expect(mobileNav.getByRole("link", { name })).toBeVisible();
    }

    await mobileNav.getByRole("link", { name: "Works" }).click();
    await expect(page).toHaveURL(/\/portfolio\/works\/?$/);
  });

  test("closes the menu when Escape is pressed", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "メニュー" });
    await toggle.click();
    await expect(page.locator("#mobile-nav")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("#mobile-nav")).not.toBeVisible();
  });
});
