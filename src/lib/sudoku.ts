export type SudokuGrid = number[][]; // 9x9, 0 = empty
export type SudokuDifficulty = "easy" | "medium" | "hard";

export interface SudokuPuzzle {
  id: SudokuDifficulty;
  clues: SudokuGrid;
}

// Each puzzle below was generated from a randomly filled valid solution with
// cells removed one at a time, only keeping a removal when the remaining
// puzzle still has exactly one solution (verified by a solution-counting
// backtracking solver). See sudoku.test.ts for a runtime uniqueness check.
export const SUDOKU_PUZZLES: SudokuPuzzle[] = [
  {
    id: "easy",
    clues: [
      [0, 8, 0, 0, 7, 6, 0, 9, 4],
      [3, 0, 4, 2, 0, 5, 0, 6, 8],
      [0, 5, 9, 0, 0, 1, 0, 0, 0],
      [1, 6, 0, 7, 0, 2, 0, 8, 0],
      [0, 0, 7, 0, 3, 0, 0, 1, 5],
      [8, 0, 0, 0, 1, 9, 2, 0, 6],
      [0, 9, 2, 0, 0, 7, 8, 4, 0],
      [4, 1, 6, 8, 2, 0, 0, 0, 0],
      [7, 0, 0, 9, 0, 0, 0, 0, 1],
    ],
  },
  {
    id: "medium",
    clues: [
      [0, 0, 0, 0, 0, 4, 6, 0, 0],
      [3, 0, 0, 8, 0, 0, 0, 4, 0],
      [0, 0, 0, 0, 3, 2, 0, 0, 0],
      [0, 0, 1, 9, 0, 0, 0, 2, 0],
      [0, 3, 6, 0, 0, 8, 1, 7, 5],
      [0, 0, 0, 0, 7, 3, 0, 0, 6],
      [1, 0, 7, 0, 0, 0, 0, 6, 3],
      [2, 0, 8, 3, 0, 9, 0, 0, 7],
      [0, 5, 3, 6, 0, 0, 8, 0, 9],
    ],
  },
  {
    id: "hard",
    clues: [
      [0, 7, 0, 0, 0, 3, 4, 0, 0],
      [8, 0, 0, 4, 0, 0, 2, 9, 0],
      [0, 0, 0, 2, 0, 0, 0, 7, 0],
      [9, 0, 0, 0, 0, 1, 0, 3, 0],
      [0, 3, 0, 0, 5, 0, 0, 6, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 8],
      [0, 0, 0, 0, 0, 0, 0, 2, 4],
      [0, 2, 6, 0, 0, 0, 7, 0, 0],
      [0, 8, 4, 0, 0, 7, 3, 5, 6],
    ],
  },
];

export function getPuzzle(id: SudokuDifficulty): SudokuPuzzle {
  const puzzle = SUDOKU_PUZZLES.find((p) => p.id === id);
  if (!puzzle) throw new Error(`Unknown sudoku puzzle: ${id}`);
  return puzzle;
}

export function cloneGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map((row) => [...row]);
}

export function isGridFilled(grid: SudokuGrid): boolean {
  return grid.every((row) => row.every((cell) => cell !== 0));
}

/**
 * Returns a 9x9 boolean grid marking every cell that shares a row, column,
 * or 3x3 box with another cell holding the same non-zero value.
 */
export function getConflicts(grid: SudokuGrid): boolean[][] {
  const conflicts = Array.from({ length: 9 }, () => Array(9).fill(false));

  const markIfDuplicate = (cells: [number, number][]) => {
    const seen = new Map<number, [number, number][]>();
    for (const [r, c] of cells) {
      const value = grid[r][c];
      if (value === 0) continue;
      const list = seen.get(value) ?? [];
      list.push([r, c]);
      seen.set(value, list);
    }
    for (const list of seen.values()) {
      if (list.length > 1) {
        for (const [r, c] of list) conflicts[r][c] = true;
      }
    }
  };

  for (let i = 0; i < 9; i++) {
    markIfDuplicate(Array.from({ length: 9 }, (_, c) => [i, c]));
    markIfDuplicate(Array.from({ length: 9 }, (_, r) => [r, i]));
  }

  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      const box: [number, number][] = [];
      for (let r = br; r < br + 3; r++)
        for (let c = bc; c < bc + 3; c++) box.push([r, c]);
      markIfDuplicate(box);
    }
  }

  return conflicts;
}

export function isSolved(grid: SudokuGrid): boolean {
  if (!isGridFilled(grid)) return false;
  const conflicts = getConflicts(grid);
  return conflicts.every((row) => row.every((cell) => !cell));
}
