import { useMemo, useState } from "react";
import { useTranslations, type Lang } from "../i18n/ui";
import {
  SHIKAKU_PUZZLES,
  getPuzzle,
  getRectStatuses,
  isSolved,
  makeRect,
  rectContainsCell,
  type ShikakuDifficulty,
  type ShikakuRect,
} from "../lib/shikaku";

interface ShikakuProps {
  lang?: Lang;
}

const DIFFICULTY_KEYS: Record<
  ShikakuDifficulty,
  "game.difficulty.easy" | "game.difficulty.medium" | "game.difficulty.hard"
> = {
  easy: "game.difficulty.easy",
  medium: "game.difficulty.medium",
  hard: "game.difficulty.hard",
};

// Cycled through by rectangle placement order so each drawn rectangle is
// visually distinct from its neighbors.
const RECT_STYLES = [
  "bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-500",
  "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-500",
  "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-500",
  "bg-purple-100 dark:bg-purple-900/40 border-purple-400 dark:border-purple-500",
  "bg-pink-100 dark:bg-pink-900/40 border-pink-400 dark:border-pink-500",
  "bg-cyan-100 dark:bg-cyan-900/40 border-cyan-400 dark:border-cyan-500",
  "bg-lime-100 dark:bg-lime-900/40 border-lime-400 dark:border-lime-500",
  "bg-orange-100 dark:bg-orange-900/40 border-orange-400 dark:border-orange-500",
];

export default function Shikaku({ lang = "ja" }: ShikakuProps) {
  const t = useTranslations(lang);
  const [difficulty, setDifficulty] = useState<ShikakuDifficulty>("easy");
  const [rects, setRects] = useState<ShikakuRect[]>([]);
  const [anchor, setAnchor] = useState<[number, number] | null>(null);

  const puzzle = useMemo(() => getPuzzle(difficulty), [difficulty]);
  const statuses = useMemo(
    () => getRectStatuses(puzzle, rects),
    [puzzle, rects],
  );
  const solved = useMemo(() => isSolved(puzzle, rects), [puzzle, rects]);

  const clueGrid = useMemo(() => {
    const grid: (number | null)[][] = Array.from({ length: puzzle.rows }, () =>
      Array(puzzle.cols).fill(null),
    );
    for (const clue of puzzle.clues) grid[clue.row][clue.col] = clue.value;
    return grid;
  }, [puzzle]);

  const cellRectIndex = useMemo(() => {
    const map: number[][] = Array.from({ length: puzzle.rows }, () =>
      Array(puzzle.cols).fill(-1),
    );
    rects.forEach((rect, i) => {
      for (let r = rect.r1; r <= rect.r2; r++) {
        for (let c = rect.c1; c <= rect.c2; c++) map[r][c] = i;
      }
    });
    return map;
  }, [rects, puzzle]);

  function selectPuzzle(id: ShikakuDifficulty) {
    setDifficulty(id);
    setRects([]);
    setAnchor(null);
  }

  function resetBoard() {
    setRects([]);
    setAnchor(null);
  }

  function handleCellClick(row: number, col: number) {
    if (solved) return;
    const existingIndex = rects.findIndex((rect) =>
      rectContainsCell(rect, row, col),
    );
    if (existingIndex !== -1) {
      setRects((prev) => prev.filter((_, i) => i !== existingIndex));
      setAnchor(null);
      return;
    }
    if (!anchor) {
      setAnchor([row, col]);
      return;
    }
    if (anchor[0] === row && anchor[1] === col) {
      setAnchor(null);
      return;
    }
    const rect = makeRect(anchor, [row, col]);
    setRects((prev) => [...prev, rect]);
    setAnchor(null);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label={t("game.selectDifficulty")}
          className="flex gap-2"
        >
          {SHIKAKU_PUZZLES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPuzzle(p.id)}
              aria-pressed={difficulty === p.id}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${
                difficulty === p.id
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {t(DIFFICULTY_KEYS[p.id])}
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

      {/* Kept right under the controls (not just below the grid) so a win
          on a tall/hard puzzle is never scrolled out of view. */}
      <p
        role="status"
        aria-live="polite"
        className={`mb-4 text-center text-lg font-bold h-7 transition-colors ${
          solved ? "text-emerald-600 dark:text-emerald-400" : "text-transparent"
        }`}
      >
        {solved ? t("game.solved") : ""}
      </p>

      <div
        role="group"
        aria-label={t("game.shikaku.heading")}
        className={`mx-auto w-fit border-2 rounded-md overflow-hidden transition-colors ${
          solved
            ? "border-emerald-500 dark:border-emerald-400"
            : "border-gray-800 dark:border-gray-200"
        }`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
        }}
      >
        {clueGrid.map((rowValues, r) =>
          rowValues.map((clueValue, c) => {
            const rectIndex = cellRectIndex[r][c];
            const isAnchor = anchor?.[0] === r && anchor?.[1] === c;
            const isValidRect = rectIndex !== -1 && statuses[rectIndex];
            const isInvalidRect = rectIndex !== -1 && !statuses[rectIndex];

            const ariaLabel =
              rectIndex !== -1
                ? t("game.shikaku.removeAria")
                    .replace("{row}", String(r + 1))
                    .replace("{col}", String(c + 1))
                : t("game.cellAria")
                    .replace("{row}", String(r + 1))
                    .replace("{col}", String(c + 1));

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => handleCellClick(r, c)}
                disabled={solved}
                aria-label={ariaLabel}
                aria-pressed={isAnchor}
                className={[
                  "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-mono border border-gray-200 dark:border-gray-700",
                  solved ? "cursor-default" : "cursor-pointer",
                  clueValue !== null
                    ? "font-bold text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-600",
                  solved
                    ? "!bg-emerald-100 dark:!bg-emerald-900/40 !border-emerald-400 dark:!border-emerald-500 border-2"
                    : rectIndex !== -1
                      ? RECT_STYLES[rectIndex % RECT_STYLES.length]
                      : "bg-white dark:bg-gray-900",
                  isAnchor
                    ? "outline outline-2 outline-blue-500 -outline-offset-2 z-10 relative"
                    : "",
                  !solved && isInvalidRect
                    ? "!bg-red-50 dark:!bg-red-950/40 !border-red-500 dark:!border-red-400 !text-red-600 dark:!text-red-400"
                    : "",
                  !solved && isValidRect ? "border-2" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {clueValue !== null ? clueValue : ""}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
