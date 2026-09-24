import { describe, expect, it } from "vitest";
import {
  SUDOKU_PUZZLES,
  cloneGrid,
  getConflicts,
  getPuzzle,
  isGridFilled,
  isSolved,
  type SudokuGrid,
} from "./sudoku";

function countSolutions(grid: SudokuGrid, limit = 2): number {
  const g = cloneGrid(grid);
  let count = 0;

  function isValid(row: number, col: number, value: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (g[row][i] === value || g[i][col] === value) return false;
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++) if (g[r][c] === value) return false;
    return true;
  }

  function findEmpty(): [number, number] | null {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) if (g[r][c] === 0) return [r, c];
    return null;
  }

  function solve() {
    if (count >= limit) return;
    const empty = findEmpty();
    if (!empty) {
      count++;
      return;
    }
    const [r, c] = empty;
    for (let value = 1; value <= 9; value++) {
      if (isValid(r, c, value)) {
        g[r][c] = value;
        solve();
        g[r][c] = 0;
        if (count >= limit) return;
      }
    }
  }

  solve();
  return count;
}

describe("SUDOKU_PUZZLES", () => {
  it.each(SUDOKU_PUZZLES.map((p) => p.id))(
    "%s puzzle has no initial conflicts and exactly one solution",
    (id) => {
      const puzzle = getPuzzle(id);
      const conflicts = getConflicts(puzzle.clues);
      expect(conflicts.flat().some(Boolean)).toBe(false);
      expect(countSolutions(puzzle.clues)).toBe(1);
    },
  );

  it("harder puzzles have fewer clues", () => {
    const clueCount = (id: (typeof SUDOKU_PUZZLES)[number]["id"]) =>
      getPuzzle(id)
        .clues.flat()
        .filter((v) => v !== 0).length;
    expect(clueCount("easy")).toBeGreaterThan(clueCount("medium"));
    expect(clueCount("medium")).toBeGreaterThan(clueCount("hard"));
  });
});

describe("getConflicts", () => {
  it("flags duplicate values in the same row", () => {
    const grid = cloneGrid(getPuzzle("easy").clues);
    grid[0] = [1, 1, 0, 0, 0, 0, 0, 0, 0];
    const conflicts = getConflicts(grid);
    expect(conflicts[0][0]).toBe(true);
    expect(conflicts[0][1]).toBe(true);
    expect(conflicts[0][2]).toBe(false);
  });

  it("flags duplicate values in the same column", () => {
    const grid: SudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][0] = 5;
    grid[3][0] = 5;
    const conflicts = getConflicts(grid);
    expect(conflicts[0][0]).toBe(true);
    expect(conflicts[3][0]).toBe(true);
  });

  it("flags duplicate values in the same 3x3 box", () => {
    const grid: SudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][0] = 7;
    grid[2][2] = 7;
    const conflicts = getConflicts(grid);
    expect(conflicts[0][0]).toBe(true);
    expect(conflicts[2][2]).toBe(true);
  });

  it("does not flag zeros (empty cells)", () => {
    const grid: SudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    const conflicts = getConflicts(grid);
    expect(conflicts.flat().some(Boolean)).toBe(false);
  });
});

describe("isGridFilled / isSolved", () => {
  it("is not filled/solved while zeros remain", () => {
    const grid = cloneGrid(getPuzzle("easy").clues);
    expect(isGridFilled(grid)).toBe(false);
    expect(isSolved(grid)).toBe(false);
  });

  it("is solved for a fully filled, conflict-free grid", () => {
    // A valid completed Sudoku grid (rows are cyclic shifts of 1-9).
    const solved: SudokuGrid = Array.from({ length: 9 }, (_, r) =>
      Array.from(
        { length: 9 },
        (_, c) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1,
      ),
    );
    expect(isGridFilled(solved)).toBe(true);
    expect(isSolved(solved)).toBe(true);
  });

  it("is filled but not solved when a filled grid has conflicts", () => {
    const grid: SudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(1));
    expect(isGridFilled(grid)).toBe(true);
    expect(isSolved(grid)).toBe(false);
  });
});
