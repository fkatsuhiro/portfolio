import { test, expect } from "@playwright/test";

test.describe("Chat widget", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/");

    // client:idle island; under parallel test load its handler can attach
    // slightly after the button becomes clickable. Warm it up by retrying
    // the open click until the dialog actually appears.
    const toggle = page.getByRole("button", { name: "チャットを開く" });
    await expect(async () => {
      await toggle.click();
      await expect(page.getByRole("dialog")).toBeVisible();
    }).toPass({ timeout: 10000 });
  });

  test("shows a greeting and the topic tags when opened", async ({ page }) => {
    const dialog = page.getByRole("dialog", { name: "質問してみる" });
    await expect(dialog).toBeVisible();
    await expect(page.locator("[role='log']")).toContainText("こんにちは！");
    for (const tag of [
      "自己紹介",
      "スキル",
      "作品",
      "登壇",
      "趣味",
      "連絡先",
    ]) {
      await expect(page.getByRole("button", { name: tag })).toBeVisible();
    }
  });

  test("clicking a tag adds a user message and a matching bot reply", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "趣味" }).click();
    const log = page.locator("[role='log']");
    await expect(log).toContainText("趣味");
    await expect(log).toContainText("コーヒー、テニス、寝ることが趣味です。");
  });

  test("a tag with a related page links to it", async ({ page }) => {
    await page.getByRole("button", { name: "作品" }).click();
    const link = page
      .getByRole("dialog")
      .getByRole("link", { name: "Works →" });
    await expect(link).toHaveAttribute("href", "/portfolio/works");
  });

  test("typing a matching question returns the right answer", async ({
    page,
  }) => {
    await page.getByLabel("メッセージを入力").fill("スキルは何ですか");
    await page.getByRole("button", { name: "送信" }).click();
    await expect(page.locator("[role='log']")).toContainText(
      "React, Astro, TypeScript",
    );
  });

  test("typing an unrelated question falls back gracefully", async ({
    page,
  }) => {
    await page.getByLabel("メッセージを入力").fill("今日の天気は？");
    await page.getByRole("button", { name: "送信" }).click();
    await expect(page.locator("[role='log']")).toContainText(
      "うまく答えを見つけられませんでした",
    );
  });

  test("Escape closes the panel", async ({ page }) => {
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("the close button closes the panel", async ({ page }) => {
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "チャットを閉じる" })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

test.describe("Chat widget — available on every page", () => {
  for (const path of [
    "/portfolio/about",
    "/portfolio/works",
    "/portfolio/talks",
  ]) {
    test(`shows the chat toggle on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(
        page.getByRole("button", { name: "チャットを開く" }),
      ).toBeVisible();
    });
  }
});
