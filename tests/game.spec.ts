import { test, expect } from "@playwright/test";
import { selectGameFromHub } from "./helpers";

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

test.describe("Game hub", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/game");
  });

  test("shows 3 game options", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "ゲームを選ぶ" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "数独" })).toBeVisible();
    await expect(page.getByRole("button", { name: "シカク" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "タイピング" }),
    ).toBeVisible();
  });

  test("can select a game and navigate back to the selector", async ({
    page,
  }) => {
    await selectGameFromHub(page, "シカク");

    await page.getByRole("button", { name: "ゲーム一覧に戻る" }).click();
    await expect(
      page.getByRole("heading", { name: "ゲームを選ぶ" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "数独" })).toBeVisible();
  });
});

test.describe("Sudoku game", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/game");
    await selectGameFromHub(page, "数独");

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

test.describe("Shikaku game", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/game");
    await selectGameFromHub(page, "シカク");

    // Same client:load warm-up strategy as the Sudoku suite above.
    const probe = page.locator("[aria-label='1行 1列']");
    await expect(async () => {
      await probe.click();
      await expect(probe).toHaveAttribute("aria-pressed", "true");
    }).toPass({ timeout: 10000 });
    // Deselect the anchor cell we just clicked as a probe so it doesn't
    // interfere with the actual test steps below.
    await probe.click();
    await expect(probe).toHaveAttribute("aria-pressed", "false");
  });

  test("renders a grid and a difficulty selector", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "シカク" })).toBeVisible();
    await expect(page.locator("button[aria-label*='行']")).toHaveCount(25);
    for (const name of ["かんたん", "ふつう", "むずかしい"]) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }
  });

  test("placing a correct rectangle covers all of its cells", async ({
    page,
  }) => {
    // The easy puzzle's clue at (row 2, col 1 in 1-indexed terms) = 4 is
    // solved by the 2x2 rectangle from (1,1) to (2,2).
    await page.locator("[aria-label='1行 1列']").click();
    await page.locator("[aria-label='2行 2列']").click();

    // Every cell in that rectangle should now offer a "remove" affordance,
    // proving the whole 2x2 area was covered, not just the two clicks.
    await expect(
      page.locator("[aria-label='1行 2列の長方形を削除']"),
    ).toBeVisible();
    await expect(
      page.locator("[aria-label='2行 1列の長方形を削除']"),
    ).toBeVisible();
  });

  test("switching difficulty resets placed rectangles", async ({ page }) => {
    await page.locator("[aria-label='1行 1列']").click();
    await page.locator("[aria-label='2行 2列']").click();
    await expect(
      page.locator("[aria-label='1行 2列の長方形を削除']"),
    ).toBeVisible();

    await page.getByRole("button", { name: "ふつう" }).click();
    await expect(page.locator("button[aria-label*='行']")).toHaveCount(36);
    await expect(page.locator("[aria-label='1行 1列']")).toBeVisible();
  });

  test("filling in the full correct solution shows the solved message and locks the board", async ({
    page,
  }) => {
    // The unique solution to the "easy" puzzle in src/lib/shikaku.ts,
    // expressed as (anchor, opposite corner) 1-indexed cell clicks.
    const rects: [string, string][] = [
      ["1行 1列", "2行 2列"],
      ["1行 3列", "5行 3列"],
      ["1行 4列", "5行 4列"],
      ["1行 5列", "5行 5列"],
      ["3行 1列", "4行 2列"],
      ["5行 1列", "5行 2列"],
    ];
    for (const [a, b] of rects) {
      await page.locator(`[aria-label='${a}']`).click();
      await page.locator(`[aria-label='${b}']`).click();
    }

    await expect(page.locator("[role='status']")).toHaveText("クリア！🎉");

    // The board should no longer be editable once solved: every cell is a
    // disabled button now, so even a forced click can't fire its handler.
    await expect(
      page.locator("[aria-label='1行 1列の長方形を削除']"),
    ).toBeDisabled();
    await page
      .locator("[aria-label='1行 1列の長方形を削除']")
      .click({ force: true });
    await expect(page.locator("[role='status']")).toHaveText("クリア！🎉");
  });
});

test.describe("Typing game", () => {
  // The "easy" round's 10 prompts, in order, duplicated from
  // src/lib/typing.ts. These are the on-screen prompts the player is
  // meant to type (not a hidden solution), so hardcoding them here is
  // just a fixture, unlike the Sudoku/Shikaku solutions above.
  const EASY_PROMPTS = [
    "cat",
    "sun",
    "tree",
    "book",
    "chair",
    "green",
    "happy",
    "river",
    "cloud",
    "smile",
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio/game");
    await selectGameFromHub(page, "タイピング");
    await expect(page.getByLabel("入力欄")).toBeVisible();
  });

  test("renders the progress, countdown, and difficulty selector before starting", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "タイピング" }),
    ).toBeVisible();
    await expect(page.getByText("1 / 10")).toBeVisible();
    for (const name of ["かんたん", "ふつう", "むずかしい"]) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "スタート" })).toBeVisible();
    await expect(page.getByLabel("入力欄")).toBeDisabled();
  });

  test("starting enables typing, highlights characters, and advances on an exact match", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "スタート" }).click();
    const input = page.getByLabel("入力欄");
    await expect(input).toBeEnabled();

    // First prompt is "cat"; typing "ca" leaves the 3rd char pending.
    await input.pressSequentially("ca", { delay: 20 });
    const chars = page.locator("p[aria-hidden='true'] span");
    await expect(chars.nth(0)).toHaveClass(/text-emerald-600/);
    await expect(chars.nth(2)).toHaveClass(/text-gray-400/);

    // Completing the exact match auto-advances to prompt 2/10 ("sun").
    await input.pressSequentially("t");
    await expect(page.getByText("2 / 10")).toBeVisible();
    await expect(input).toHaveValue("");
  });

  test("clearing all 10 prompts before time runs out shows a win result", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "スタート" }).click();
    const input = page.getByLabel("入力欄");
    for (const word of EASY_PROMPTS) {
      await input.fill(word);
    }
    await expect(page.locator("[role='status']")).toContainText("WPM");
    await expect(input).toBeDisabled();
  });

  test("switching difficulty mid-round resets to the not-started state", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "スタート" }).click();
    const input = page.getByLabel("入力欄");
    await input.pressSequentially("c");

    await page.getByRole("button", { name: "ふつう" }).click();
    await expect(page.getByText("1 / 10")).toBeVisible();
    await expect(page.getByRole("button", { name: "スタート" })).toBeVisible();
    await expect(input).toBeDisabled();
  });
});
