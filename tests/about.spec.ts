import { test, expect } from "@playwright/test";

test.describe("About Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/about", { waitUntil: "domcontentloaded" });
  });

  test("should display personal profile correctly", async ({ page }) => {
    await expect(page.getByText("Furuichi Katsuhiro")).toBeVisible();

    const techStack = page.locator("text=React, Astro, TypeScript");
    await expect(techStack).toBeVisible();

    await expect(
      page.getByText("趣味：コーヒー、テニス、寝ること"),
    ).toBeVisible();
  });

  test("should display maintainer and contributor role badges", async ({
    page,
  }) => {
    await expect(page.getByText("Yamada UI")).toBeVisible();
    await expect(page.getByText("WXT, Astro")).toBeVisible();
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
      const heading = page.getByRole("heading", { name: title, level: 3 });
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
    const dateItems = page.getByText(/^\d{4}\/\d{1,2} ~ \d{4}\/\d{1,2}$/);
    // Timeline is client:only="react", so wait for hydration before reading.
    await expect(dateItems.first()).toBeVisible();

    const dates = await dateItems.allTextContents();

    expect(dates.length).toBeGreaterThanOrEqual(2);
    expect(dates[0]).toContain("2017");
    expect(dates[dates.length - 1]).toContain("2024");
  });

  test("should maintain text visibility in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/portfolio/about");

    const profileHeading = page.getByText("Furuichi Katsuhiro");
    await expect(profileHeading).toBeVisible();
  });
});

test.describe("About Page — locale consistency", () => {
  const locales = [
    {
      path: "/portfolio/en/about",
      ariaLabel: "Select language",
      label: "English",
    },
    { path: "/portfolio/ko/about", ariaLabel: "언어 선택", label: "한국어" },
  ];

  for (const { path, ariaLabel, label } of locales) {
    test(`language selector reflects the active locale on ${path}`, async ({
      page,
    }) => {
      await page.goto(path);

      // Regression test for the bug where the language selector stayed on
      // 日本語 even though the page content was rendered in another locale
      // (Astro.currentLocale didn't recognize "ko" as a registered locale).
      await expect(page.getByRole("button", { name: ariaLabel })).toHaveText(
        label,
      );
    });
  }

  test("the Fast Retailing timeline entry is either shown or hidden the same way across all locales", async ({
    page,
  }) => {
    // Regression test for the bug where the Fast Retailing entry always
    // rendered on the English/Korean pages regardless of the remote feature
    // flag, because those pages dropped the `id` field that the flag filter
    // keys on. Rather than assert a specific boolean (the live remote flag
    // value isn't controlled by this test), assert the three locales agree.
    const checks: boolean[] = [];
    for (const path of [
      "/portfolio/about",
      "/portfolio/en/about",
      "/portfolio/ko/about",
    ]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle").catch(() => {});
      const entry = page.getByText(/2026\/3/);
      checks.push(
        await entry
          .first()
          .isVisible()
          .catch(() => false),
      );
    }

    expect(new Set(checks).size).toBe(1);
  });
});
