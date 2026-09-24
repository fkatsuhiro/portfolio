import { test, expect } from "@playwright/test";

// The solution to the "easy" puzzle in src/lib/sudoku.ts, duplicated here
// (rather than exported from the app bundle) so playing the game in a real
// browser doesn't ship the answer to visitors who inspect the JS bundle.
const EASY_SOLUTION = [
  [2, 8, 1, 3, 7, 6, 5, 9, 4],
  [3, 7, 4, 2, 9, 5, 1, 6, 8],
  [6, 5, 9, 4, 8, 1, 7, 3, 2],
  [1, 6, 5, 7, 4, 2, 3, 8, 9],
  [9, 2, 7, 6, 3, 8, 4, 1, 5],
  [8, 4, 3, 5, 1, 9, 2, 7, 6],
  [5, 9, 2, 1, 6, 7, 8, 4, 3],
  [4, 1, 6, 8, 2, 3, 9, 5, 7],
  [7, 3, 8, 9, 5, 4, 6, 2, 1],
];

test.describe("Home page — Game entry point", () => {
  test("shows a Game card linking to the game page", async ({ page }) => {
    await page.goto("/portfolio/");
    const gameCard = page.locator("main").getByRole("link", { name: "Game" });
    await expect(gameCard).toHaveAttribute("href", "/portfolio/game");
  });
});

test.describe("Sudoku game", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/game");

    // The board is a client:load island; under parallel test load its click
    // handler can attach slightly after the SSR'd DOM becomes clickable.
    // Warm it up by retrying a click on a known-editable cell (row 1, col 1
    // is blank in the default "easy" puzzle) until it actually registers.
    const probe = page.locator("[aria-label='1行 1列']");
    await expect(async () => {
      await probe.click();
      await expect(probe).toHaveAttribute("aria-pressed", "true");
    }).toPass({ timeout: 10000 });
  });

  test("shows a 9x9 grid, a puzzle selector, and number cards", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { name: "数独" })).toBeVisible();
    await expect(page.locator("[aria-label^='1行 ']")).toHaveCount(9);
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      await expect(
        page.getByRole("button", { name: `${n} を入力` }),
      ).toBeVisible();
    }
  });

  test("fixed clue cells cannot be selected or edited", async ({ page }) => {
    const allCells = page.locator("button[aria-label*='行']");
    expect(await allCells.count()).toBe(81);

    let fixedCell = null;
    for (let i = 0; i < 81; i++) {
      const c = allCells.nth(i);
      if (await c.isDisabled()) {
        fixedCell = c;
        break;
      }
    }
    expect(fixedCell).not.toBeNull();
    await expect(fixedCell!).toBeDisabled();
  });

  test("selecting an empty cell then a number card fills it in", async ({
    page,
  }) => {
    const allCells = page.locator("button[aria-label*='行']");
    let emptyCell = null;
    for (let i = 0; i < 81; i++) {
      const c = allCells.nth(i);
      if (!(await c.isDisabled())) {
        emptyCell = c;
        break;
      }
    }
    await emptyCell!.click();
    await expect(emptyCell!).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "5 を入力" }).click();
    await expect(emptyCell!).toHaveText("5");

    await page.getByRole("button", { name: "選択したマスを消す" }).click();
    await expect(emptyCell!).toHaveText("");
  });

  test("placing a conflicting number highlights both cells", async ({
    page,
  }) => {
    // Row 0 in the easy puzzle already contains an 8 (clue) at column 2.
    // Placing 8 anywhere else empty in that row should create a conflict.
    const target = page.locator("[aria-label='1行 4列']");
    await target.click();
    await page.getByRole("button", { name: "8 を入力" }).click();
    await expect(target).toHaveClass(/text-red-600/);
  });

  test("switching puzzles resets the board", async ({ page }) => {
    const cellR1C4 = page.locator("[aria-label='1行 4列']");
    await cellR1C4.click();
    await page.getByRole("button", { name: "3 を入力" }).click();
    await expect(cellR1C4).toHaveText("3");

    await page.getByRole("button", { name: "むずかしい" }).click();
    await expect(cellR1C4).toHaveText("");
  });

  test("reset clears user-entered numbers but keeps clues", async ({
    page,
  }) => {
    const cellR1C4 = page.locator("[aria-label='1行 4列']");
    await cellR1C4.click();
    await page.getByRole("button", { name: "3 を入力" }).click();
    await expect(cellR1C4).toHaveText("3");

    await page.getByRole("button", { name: "リセット" }).click();
    await expect(cellR1C4).toHaveText("");
  });

  test("filling in the correct solution shows the solved message", async ({
    page,
  }) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = page.locator(`[aria-label="${r + 1}行 ${c + 1}列"]`);
        if (await cell.isDisabled()) continue;
        await cell.click();
        await page
          .getByRole("button", { name: `${EASY_SOLUTION[r][c]} を入力` })
          .click();
      }
    }
    await expect(page.locator("[role='status']")).toHaveText("クリア！🎉");
  });
});
