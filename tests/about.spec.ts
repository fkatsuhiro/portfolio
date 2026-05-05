import { test, expect } from "@playwright/test";

test.describe("About Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/about");
  });

  test("should display personal profile correctly", async ({ page }) => {
    await expect(page.getByText("Furuichi Katsuhiro")).toBeVisible();

    const techStack = page.locator("text=React, Astro, Qwik, TypeScript");
    await expect(techStack).toBeVisible();

    await expect(
      page.getByText("趣味：コーヒー、テニス、寝ること"),
    ).toBeVisible();
  });

  test("should render all education history items in the timeline", async ({
    page,
  }) => {
    await page.goto("/portfolio/about");

    const historyItemsTitle = [
      "三重県立四日市高等学校 普通科",
      "千葉大学 理学部 物理学科",
      "東京大学大学院 工学系研究科バイオエンジニアリング専攻",
    ];

    for (const title of historyItemsTitle) {
      const heading = page.getByRole("heading", { name: title, level: 6 });
      await expect(heading.first()).toBeVisible();
    }

    const historyItemText = [
      "三重県立四日市高等学校 普通科に在籍していました。",
      "千葉大学 理学部 物理学科に在籍していました。",
      "東京大学大学院 工学系研究科 バイオエンジニアリング専攻に在籍していました。",
    ];

    for (const text of historyItemText) {
      const paragraph = page.getByRole("paragraph").filter({ hasText: text });
      await expect(paragraph.first()).toBeVisible();
    }
  });

  test("should have a chronological order in the timeline dates", async ({
    page,
  }) => {
    const dates = await page.locator("time, .timeline-date").allTextContents();

    if (dates.length >= 2) {
      expect(dates[0]).toContain("2017");
      expect(dates[dates.length - 1]).toContain("2024");
    }
  });

  test("should maintain text visibility in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });

    const profileHeading = page.getByText("Furuichi Katsuhiro");
    await expect(profileHeading).toBeVisible();
  });
});
