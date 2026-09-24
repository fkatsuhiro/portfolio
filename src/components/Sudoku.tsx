import { useMemo, useState } from "react";
import { useTranslations, type Lang } from "../i18n/ui";
import {
  cloneGrid,
  getConflicts,
  getPuzzle,
  isSolved,
  SUDOKU_PUZZLES,
  type SudokuDifficulty,
  type SudokuGrid,
} from "../lib/sudoku";

interface SudokuProps {
  lang?: Lang;
}

const DIFFICULTY_KEYS: Record<
  SudokuDifficulty,
  "game.difficulty.easy" | "game.difficulty.medium" | "game.difficulty.hard"
> = {
  easy: "game.difficulty.easy",
  medium: "game.difficulty.medium",
  hard: "game.difficulty.hard",
};

function boardFromPuzzle(id: SudokuDifficulty): SudokuGrid {
  return cloneGrid(getPuzzle(id).clues);
}

export default function Sudoku({ lang = "ja" }: SudokuProps) {
  const t = useTranslations(lang);
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>("easy");
  const [board, setBoard] = useState<SudokuGrid>(() => boardFromPuzzle("easy"));
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const fixedMask = useMemo(() => {
    const clues = getPuzzle(difficulty).clues;
    return clues.map((row) => row.map((cell) => cell !== 0));
  }, [difficulty]);

  const conflicts = useMemo(() => getConflicts(board), [board]);
  const solved = useMemo(() => isSolved(board), [board]);

  function selectPuzzle(id: SudokuDifficulty) {
    setDifficulty(id);
    setBoard(boardFromPuzzle(id));
    setSelected(null);
  }

  function resetBoard() {
    setBoard(boardFromPuzzle(difficulty));
    setSelected(null);
  }

  function placeNumber(value: number) {
    if (!selected) return;
    const [row, col] = selected;
    if (fixedMask[row][col]) return;
    setBoard((prev) => {
      const next = cloneGrid(prev);
      next[row][col] = value;
      return next;
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label={t("game.selectPuzzle")}
          className="flex gap-2"
        >
          {SUDOKU_PUZZLES.map((puzzle) => (
            <button
              key={puzzle.id}
              type="button"
              onClick={() => selectPuzzle(puzzle.id)}
              aria-pressed={difficulty === puzzle.id}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${
                difficulty === puzzle.id
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {t(DIFFICULTY_KEYS[puzzle.id])}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={resetBoard}
          className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {t("game.reset")}
        </button>
      </div>

      <div
        role="group"
        aria-label={t("game.heading")}
        className="grid grid-cols-9 gap-0 w-fit mx-auto border-2 border-gray-800 dark:border-gray-200 rounded-md overflow-hidden"
      >
        {board.map((row, r) =>
          row.map((value, c) => {
            const isFixed = fixedMask[r][c];
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const hasConflict = conflicts[r][c];
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                disabled={isFixed}
                onClick={() => setSelected([r, c])}
                aria-label={t("game.cellAria")
                  .replace("{row}", String(r + 1))
                  .replace("{col}", String(c + 1))}
                aria-pressed={isSelected}
                className={[
                  "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-mono border border-gray-200 dark:border-gray-700",
                  c % 3 === 0
                    ? "border-l-2 border-l-gray-800 dark:border-l-gray-200"
                    : "",
                  c === 8
                    ? "border-r-2 border-r-gray-800 dark:border-r-gray-200"
                    : "",
                  r % 3 === 0
                    ? "border-t-2 border-t-gray-800 dark:border-t-gray-200"
                    : "",
                  r === 8
                    ? "border-b-2 border-b-gray-800 dark:border-b-gray-200"
                    : "",
                  isFixed
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold cursor-default"
                    : "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 cursor-pointer",
                  isSelected
                    ? "outline outline-2 outline-blue-500 -outline-offset-2 z-10 relative"
                    : "",
                  hasConflict
                    ? "!text-red-600 dark:!text-red-400 !bg-red-50 dark:!bg-red-950/40"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {value !== 0 ? value : ""}
              </button>
            );
          }),
        )}
      </div>

      <div
        role="group"
        aria-label={t("game.subheading")}
        className="mt-6 flex flex-wrap justify-center gap-2"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => placeNumber(n)}
            disabled={!selected || fixedMask[selected[0]][selected[1]]}
            aria-label={t("game.numberCardAria").replace("{n}", String(n))}
            className="w-10 h-12 sm:w-11 sm:h-14 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-lg font-bold text-gray-800 dark:text-gray-100 shadow-sm hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => placeNumber(0)}
          disabled={!selected || fixedMask[selected[0]][selected[1]]}
          aria-label={t("game.eraseAria")}
          className="w-14 h-12 sm:h-14 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-500 dark:text-gray-400 shadow-sm hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t("game.erase")}
        </button>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-6 text-center text-lg font-bold text-emerald-600 dark:text-emerald-400 h-7"
      >
        {solved ? t("game.solved") : ""}
      </p>
    </div>
  );
}
