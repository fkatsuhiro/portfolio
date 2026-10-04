/**
 * Small typed localStorage helper for per-game, per-difficulty "self best"
 * scores (e.g. fastest Sudoku/Shikaku solve time, highest typing WPM).
 *
 * Mirrors the defensive style of src/lib/remoteConfig.ts: every access is
 * guarded by a `typeof window !== "undefined"` check plus a try/catch,
 * since localStorage can throw (private browsing, disabled storage, quota
 * exceeded, etc.) or simply not exist (SSR).
 */

export type HighScoreGameId = "sudoku" | "shikaku" | "typing";
export type HighScoreDifficulty = "easy" | "medium" | "hard";

/** Returns true when `candidate` is a better score than `current`. */
export type HighScoreComparator = (
  candidate: number,
  current: number,
) => boolean;

/** For metrics where a smaller number is better (e.g. solve time in ms). */
export const lowerIsBetter: HighScoreComparator = (candidate, current) =>
  candidate < current;

/** For metrics where a bigger number is better (e.g. typing WPM). */
export const higherIsBetter: HighScoreComparator = (candidate, current) =>
  candidate > current;

export interface HighScoreUpdate {
  /** The best score now stored for this game/difficulty (after this call). */
  best: number;
  /** Whether `value` improved on (or established) the stored best. */
  isNewBest: boolean;
}

function storageKey(
  gameId: HighScoreGameId,
  difficulty: HighScoreDifficulty,
): string {
  return `portfolio:highscore:${gameId}:${difficulty}`;
}

/**
 * Reads the stored best score for a game/difficulty, or null when nothing
 * is stored yet, storage is unavailable, or the stored value is corrupt.
 */
export function getBestScore(
  gameId: HighScoreGameId,
  difficulty: HighScoreDifficulty,
): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(gameId, difficulty));
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "number" && Number.isFinite(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

/**
 * Saves `value` as the new best for a game/difficulty when it's better
 * than (or there is no) existing stored score, per `isBetter`. Returns the
 * resulting best and whether this call just set a new one. If storage is
 * unavailable or throws, the improvement is still reported back (so the UI
 * can celebrate the run) but nothing persists across reloads.
 */
export function setBestScoreIfBetter(
  gameId: HighScoreGameId,
  difficulty: HighScoreDifficulty,
  value: number,
  isBetter: HighScoreComparator,
): HighScoreUpdate {
  const current = getBestScore(gameId, difficulty);
  const improved = current === null || isBetter(value, current);
  if (!improved) {
    return { best: current, isNewBest: false };
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        storageKey(gameId, difficulty),
        JSON.stringify(value),
      );
    } catch {
      // localStorage disabled/full/private-mode — nothing we can do.
    }
  }
  return { best: value, isNewBest: true };
}

/** Formats an elapsed-time score (milliseconds) as seconds with one decimal. */
export function formatElapsedSeconds(ms: number): string {
  return (ms / 1000).toFixed(1);
}
