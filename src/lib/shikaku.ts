export type ShikakuDifficulty = "easy" | "medium" | "hard";

export interface ShikakuClue {
  row: number;
  col: number;
  value: number;
}

export interface ShikakuPuzzle {
  id: ShikakuDifficulty;
  rows: number;
  cols: number;
  clues: ShikakuClue[];
}

// A rectangle the player has drawn, in inclusive cell coordinates with
// r1 <= r2 and c1 <= c2 (see makeRect, which normalizes two clicked
// corners into this shape).
export interface ShikakuRect {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

// Each puzzle below was generated from a random rectangle tiling of the
// grid (one clue placed per rectangle, at a random cell inside it, with
// the clue's value equal to the rectangle's area), then verified to have
// exactly one valid tiling using a backtracking solution counter — see
// the "solution count" tests in shikaku.test.ts, which re-derive that
// solver independently and check it against these puzzles at runtime.
export const SHIKAKU_PUZZLES: ShikakuPuzzle[] = [
  {
    id: "easy",
    rows: 5,
    cols: 5,
    clues: [
      { row: 1, col: 0, value: 4 },
      { row: 3, col: 0, value: 4 },
      { row: 4, col: 0, value: 2 },
      { row: 2, col: 2, value: 5 },
      { row: 1, col: 3, value: 5 },
      { row: 2, col: 4, value: 5 },
    ],
  },
  {
    id: "medium",
    rows: 6,
    cols: 6,
    clues: [
      { row: 2, col: 0, value: 6 },
      { row: 0, col: 2, value: 4 },
      { row: 1, col: 5, value: 6 },
      { row: 2, col: 4, value: 5 },
      { row: 3, col: 4, value: 5 },
      { row: 4, col: 3, value: 5 },
      { row: 5, col: 2, value: 5 },
    ],
  },
  {
    id: "hard",
    rows: 8,
    cols: 7,
    clues: [
      { row: 2, col: 0, value: 5 },
      { row: 0, col: 1, value: 5 },
      { row: 0, col: 3, value: 2 },
      { row: 4, col: 2, value: 4 },
      { row: 4, col: 3, value: 4 },
      { row: 4, col: 4, value: 5 },
      { row: 7, col: 0, value: 3 },
      { row: 7, col: 1, value: 3 },
      { row: 6, col: 2, value: 3 },
      { row: 6, col: 3, value: 3 },
      { row: 5, col: 4, value: 3 },
      { row: 2, col: 5, value: 8 },
      { row: 1, col: 6, value: 8 },
    ],
  },
];

export function getPuzzle(id: ShikakuDifficulty): ShikakuPuzzle {
  const puzzle = SHIKAKU_PUZZLES.find((p) => p.id === id);
  if (!puzzle) throw new Error(`Unknown shikaku puzzle: ${id}`);
  return puzzle;
}

/** Normalizes two clicked corners into a rectangle with r1<=r2, c1<=c2. */
export function makeRect(
  a: readonly [number, number],
  b: readonly [number, number],
): ShikakuRect {
  const [ra, ca] = a;
  const [rb, cb] = b;
  return {
    r1: Math.min(ra, rb),
    c1: Math.min(ca, cb),
    r2: Math.max(ra, rb),
    c2: Math.max(ca, cb),
  };
}

export function rectArea(rect: ShikakuRect): number {
  return (rect.r2 - rect.r1 + 1) * (rect.c2 - rect.c1 + 1);
}

export function rectContainsCell(
  rect: ShikakuRect,
  row: number,
  col: number,
): boolean {
  return row >= rect.r1 && row <= rect.r2 && col >= rect.c1 && col <= rect.c2;
}

export function isRectInBounds(
  puzzle: Pick<ShikakuPuzzle, "rows" | "cols">,
  rect: ShikakuRect,
): boolean {
  return (
    rect.r1 >= 0 &&
    rect.c1 >= 0 &&
    rect.r2 < puzzle.rows &&
    rect.c2 < puzzle.cols
  );
}

export function rectsOverlap(a: ShikakuRect, b: ShikakuRect): boolean {
  return a.r1 <= b.r2 && b.r1 <= a.r2 && a.c1 <= b.c2 && b.c1 <= a.c2;
}

export function cluesInRect(
  puzzle: ShikakuPuzzle,
  rect: ShikakuRect,
): ShikakuClue[] {
  return puzzle.clues.filter((clue) =>
    rectContainsCell(rect, clue.row, clue.col),
  );
}

/**
 * A rectangle is valid on its own (ignoring other placed rectangles) when
 * it sits inside the grid and covers exactly one clue whose value equals
 * the rectangle's area.
 */
export function isRectValid(puzzle: ShikakuPuzzle, rect: ShikakuRect): boolean {
  if (!isRectInBounds(puzzle, rect)) return false;
  const clues = cluesInRect(puzzle, rect);
  return clues.length === 1 && clues[0].value === rectArea(rect);
}

/**
 * Per-rectangle validity, given the *other* placed rectangles too: a
 * rectangle is only "good" when it is valid on its own AND doesn't
 * overlap any other placed rectangle.
 */
export function getRectStatuses(
  puzzle: ShikakuPuzzle,
  rects: ShikakuRect[],
): boolean[] {
  return rects.map((rect, i) => {
    if (!isRectValid(puzzle, rect)) return false;
    return !rects.some((other, j) => j !== i && rectsOverlap(rect, other));
  });
}

/**
 * The puzzle is solved once every placed rectangle is valid (single
 * matching clue, no overlaps) and together they cover the whole grid.
 * Non-overlapping rectangles whose areas sum to the full grid area must,
 * by construction, tile it exactly with no gaps.
 */
export function isSolved(puzzle: ShikakuPuzzle, rects: ShikakuRect[]): boolean {
  if (rects.length === 0) return false;
  const statuses = getRectStatuses(puzzle, rects);
  if (!statuses.every(Boolean)) return false;
  const totalArea = rects.reduce((sum, rect) => sum + rectArea(rect), 0);
  return totalArea === puzzle.rows * puzzle.cols;
}
