import { describe, expect, it } from "vitest";
import {
  SHIKAKU_PUZZLES,
  cluesInRect,
  getPuzzle,
  getRectStatuses,
  isRectValid,
  isSolved,
  makeRect,
  rectArea,
  rectContainsCell,
  rectsOverlap,
  type ShikakuClue,
  type ShikakuPuzzle,
  type ShikakuRect,
} from "./shikaku";

/**
 * Standard Shikaku solution counter: the top-left-most uncovered cell
 * (in reading order) must be the top-left corner of whatever rectangle
 * covers it, since every cell before it is already covered. Enumerate
 * every rectangle anchored there that contains exactly one clue whose
 * value matches its area, recurse, and count complete tilings.
 */
function countSolutions(
  rows: number,
  cols: number,
  clues: ShikakuClue[],
  limit = 2,
): number {
  const covered = Array.from({ length: rows }, () => Array(cols).fill(false));
  let count = 0;

  function findFirstUncovered(): [number, number] | null {
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) if (!covered[r][c]) return [r, c];
    return null;
  }

  function solve() {
    if (count >= limit) return;
    const spot = findFirstUncovered();
    if (!spot) {
      count++;
      return;
    }
    const [r, c] = spot;
    for (let h = 1; r + h <= rows; h++) {
      for (let w = 1; c + w <= cols; w++) {
        const r2 = r + h - 1;
        const c2 = c + w - 1;

        let blocked = false;
        for (let rr = r; rr <= r2; rr++) {
          if (covered[rr][c2]) {
            blocked = true;
            break;
          }
        }
        if (blocked) break; // widening further only hits the same cell

        let rowBlocked = false;
        for (let cc = c; cc <= c2; cc++) {
          if (covered[r2][cc]) {
            rowBlocked = true;
            break;
          }
        }
        if (rowBlocked) continue;

        const rect: ShikakuRect = { r1: r, c1: c, r2, c2 };
        const area = h * w;
        const inside = clues.filter((cl) =>
          rectContainsCell(rect, cl.row, cl.col),
        );
        if (inside.length !== 1 || inside[0].value !== area) continue;

        for (let rr = r; rr <= r2; rr++)
          for (let cc = c; cc <= c2; cc++) covered[rr][cc] = true;
        solve();
        for (let rr = r; rr <= r2; rr++)
          for (let cc = c; cc <= c2; cc++) covered[rr][cc] = false;
        if (count >= limit) return;
      }
    }
  }

  solve();
  return count;
}

// The unique solution for each puzzle above, hand-derived from the same
// tiling the clues were generated from. Used to test isSolved/getRectStatuses
// against a genuinely correct answer.
const SOLUTIONS: Record<ShikakuPuzzle["id"], ShikakuRect[]> = {
  easy: [
    { r1: 0, c1: 0, r2: 1, c2: 1 },
    { r1: 0, c1: 2, r2: 4, c2: 2 },
    { r1: 0, c1: 3, r2: 4, c2: 3 },
    { r1: 0, c1: 4, r2: 4, c2: 4 },
    { r1: 2, c1: 0, r2: 3, c2: 1 },
    { r1: 4, c1: 0, r2: 4, c2: 1 },
  ],
  medium: [
    { r1: 0, c1: 0, r2: 5, c2: 0 },
    { r1: 0, c1: 1, r2: 1, c2: 2 },
    { r1: 0, c1: 3, r2: 1, c2: 5 },
    { r1: 2, c1: 1, r2: 2, c2: 5 },
    { r1: 3, c1: 1, r2: 3, c2: 5 },
    { r1: 4, c1: 1, r2: 4, c2: 5 },
    { r1: 5, c1: 1, r2: 5, c2: 5 },
  ],
  hard: [
    { r1: 0, c1: 0, r2: 4, c2: 0 },
    { r1: 0, c1: 1, r2: 4, c2: 1 },
    { r1: 0, c1: 2, r2: 0, c2: 3 },
    { r1: 0, c1: 4, r2: 4, c2: 4 },
    { r1: 0, c1: 5, r2: 7, c2: 5 },
    { r1: 0, c1: 6, r2: 7, c2: 6 },
    { r1: 1, c1: 2, r2: 4, c2: 2 },
    { r1: 1, c1: 3, r2: 4, c2: 3 },
    { r1: 5, c1: 0, r2: 7, c2: 0 },
    { r1: 5, c1: 1, r2: 7, c2: 1 },
    { r1: 5, c1: 2, r2: 7, c2: 2 },
    { r1: 5, c1: 3, r2: 7, c2: 3 },
    { r1: 5, c1: 4, r2: 7, c2: 4 },
  ],
};

describe("SHIKAKU_PUZZLES", () => {
  it.each(SHIKAKU_PUZZLES.map((p) => p.id))(
    "%s puzzle has exactly one solution",
    (id) => {
      const puzzle = getPuzzle(id);
      expect(countSolutions(puzzle.rows, puzzle.cols, puzzle.clues)).toBe(1);
    },
  );

  it("clue areas sum to the grid area for every puzzle", () => {
    for (const puzzle of SHIKAKU_PUZZLES) {
      const total = puzzle.clues.reduce((sum, c) => sum + c.value, 0);
      expect(total).toBe(puzzle.rows * puzzle.cols);
    }
  });

  it("harder puzzles use a larger grid", () => {
    const area = (id: ShikakuPuzzle["id"]) => {
      const p = getPuzzle(id);
      return p.rows * p.cols;
    };
    expect(area("easy")).toBeLessThan(area("medium"));
    expect(area("medium")).toBeLessThan(area("hard"));
  });

  it("harder puzzles have more clues", () => {
    const clueCount = (id: ShikakuPuzzle["id"]) => getPuzzle(id).clues.length;
    expect(clueCount("hard")).toBeGreaterThan(clueCount("medium"));
    expect(clueCount("medium")).toBeGreaterThanOrEqual(clueCount("easy"));
  });

  it("the hand-derived SOLUTIONS fixture actually solves each puzzle", () => {
    for (const puzzle of SHIKAKU_PUZZLES) {
      expect(isSolved(puzzle, SOLUTIONS[puzzle.id])).toBe(true);
    }
  });
});

describe("makeRect", () => {
  it("normalizes corners regardless of click order", () => {
    expect(makeRect([2, 3], [0, 1])).toEqual({ r1: 0, c1: 1, r2: 2, c2: 3 });
    expect(makeRect([0, 1], [2, 3])).toEqual({ r1: 0, c1: 1, r2: 2, c2: 3 });
    expect(makeRect([2, 1], [0, 3])).toEqual({ r1: 0, c1: 1, r2: 2, c2: 3 });
  });

  it("supports a single-cell rectangle", () => {
    expect(makeRect([1, 1], [1, 1])).toEqual({ r1: 1, c1: 1, r2: 1, c2: 1 });
  });
});

describe("rectArea / rectContainsCell / rectsOverlap", () => {
  it("computes area from inclusive bounds", () => {
    expect(rectArea({ r1: 0, c1: 0, r2: 0, c2: 0 })).toBe(1);
    expect(rectArea({ r1: 0, c1: 0, r2: 1, c2: 2 })).toBe(6);
  });

  it("checks whether a cell falls inside a rectangle", () => {
    const rect = { r1: 1, c1: 1, r2: 2, c2: 3 };
    expect(rectContainsCell(rect, 1, 1)).toBe(true);
    expect(rectContainsCell(rect, 2, 3)).toBe(true);
    expect(rectContainsCell(rect, 0, 1)).toBe(false);
    expect(rectContainsCell(rect, 1, 4)).toBe(false);
  });

  it("detects overlap between two rectangles", () => {
    const a = { r1: 0, c1: 0, r2: 1, c2: 1 };
    const b = { r1: 1, c1: 1, r2: 2, c2: 2 };
    const c = { r1: 2, c1: 2, r2: 3, c2: 3 };
    expect(rectsOverlap(a, b)).toBe(true);
    expect(rectsOverlap(a, c)).toBe(false);
  });
});

describe("cluesInRect / isRectValid", () => {
  const puzzle = getPuzzle("easy");

  it("finds the clue(s) inside a rectangle", () => {
    // The easy puzzle's first solution rect covers the (1,0)=4 clue.
    const rect = { r1: 0, c1: 0, r2: 1, c2: 1 };
    expect(cluesInRect(puzzle, rect)).toEqual([{ row: 1, col: 0, value: 4 }]);
  });

  it("is valid when area matches the single contained clue", () => {
    expect(isRectValid(puzzle, { r1: 0, c1: 0, r2: 1, c2: 1 })).toBe(true);
  });

  it("is invalid when area does not match the clue", () => {
    expect(isRectValid(puzzle, { r1: 0, c1: 0, r2: 0, c2: 1 })).toBe(false);
  });

  it("is invalid when it contains zero clues", () => {
    expect(isRectValid(puzzle, { r1: 0, c1: 0, r2: 0, c2: 0 })).toBe(false);
  });

  it("is invalid when it contains more than one clue", () => {
    // The whole grid contains every clue at once.
    expect(isRectValid(puzzle, { r1: 0, c1: 0, r2: 4, c2: 4 })).toBe(false);
  });

  it("is invalid when out of bounds", () => {
    expect(isRectValid(puzzle, { r1: 0, c1: 0, r2: 5, c2: 1 })).toBe(false);
  });
});

describe("getRectStatuses / isSolved", () => {
  const puzzle = getPuzzle("easy");
  const solution = SOLUTIONS.easy;

  it("marks every rectangle valid for a correct, non-overlapping solution", () => {
    expect(getRectStatuses(puzzle, solution)).toEqual(solution.map(() => true));
  });

  it("is solved for the full correct solution", () => {
    expect(isSolved(puzzle, solution)).toBe(true);
  });

  it("is not solved with a rectangle missing", () => {
    expect(isSolved(puzzle, solution.slice(0, -1))).toBe(false);
  });

  it("flags overlapping rectangles as invalid on both sides", () => {
    const overlapping: ShikakuRect = { r1: 0, c1: 0, r2: 1, c2: 2 };
    const rects = [...solution, overlapping];
    const statuses = getRectStatuses(puzzle, rects);
    // The first solution rect (0,0)-(1,1) overlaps the newly added one.
    expect(statuses[0]).toBe(false);
    expect(statuses[statuses.length - 1]).toBe(false);
    expect(isSolved(puzzle, rects)).toBe(false);
  });

  it("is not solved when empty", () => {
    expect(isSolved(puzzle, [])).toBe(false);
  });
});
