export type TypingDifficulty = "easy" | "medium" | "hard";

export interface TypingRound {
  id: TypingDifficulty;
  /** How long the player has to clear all 10 prompts. */
  timeLimitSec: number;
  /** Exactly 10 short words/phrases to type, in order, to win the round. */
  prompts: string[];
}

export type CharStatus = "correct" | "incorrect" | "pending";

export type RoundOutcome = "playing" | "win" | "timeup";

export interface KeystrokeTally {
  totalTyped: number;
  correctChars: number;
}

export interface TypingStats {
  accuracy: number; // 0-100, rounded
  wpm: number; // rounded, based on correctly-typed characters
}

// Real, hand-written words/phrases (not lorem ipsum), 10 per difficulty,
// each difficulty its own time limit: harder rounds pack more characters
// (and trickier punctuation/apostrophes/digits) into less time. These
// numbers are a judgment call for a casual portfolio game, not a tuned
// competitive benchmark — see typing.test.ts for the invariants that
// actually matter (10 prompts, non-empty, time limit shrinks as
// difficulty rises).
export const TYPING_ROUNDS: TypingRound[] = [
  {
    id: "easy",
    timeLimitSec: 45,
    prompts: [
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
    ],
  },
  {
    id: "medium",
    timeLimitSec: 30,
    prompts: [
      "coffee break",
      "quick review",
      "final answer",
      "morning walk",
      "clear skies",
      "steady pace",
      "bright idea",
      "quiet focus",
      "team effort",
      "next step",
    ],
  },
  {
    id: "hard",
    timeLimitSec: 25,
    prompts: [
      "Don't panic!",
      "Well-known fact",
      "Ph.D. thesis",
      "23rd century",
      "Quick, precise!",
      "Re-evaluate now",
      "It's now or never!",
      "10/10 would rate",
      "co-worker's desk",
      "Can't stop now!",
    ],
  },
];

export function getRound(id: TypingDifficulty): TypingRound {
  const round = TYPING_ROUNDS.find((r) => r.id === id);
  if (!round) throw new Error(`Unknown typing round: ${id}`);
  return round;
}

/**
 * Per-character status of what's been typed so far against the current
 * prompt: "correct"/"incorrect" for the typed prefix, "pending" for the
 * rest that hasn't been reached yet.
 */
export function getCharStatuses(target: string, typed: string): CharStatus[] {
  return target.split("").map((ch, i) => {
    if (i >= typed.length) return "pending";
    return typed[i] === ch ? "correct" : "incorrect";
  });
}

/** A prompt only advances on an exact match (not just matching length),
 * so a lingering mistake has to be corrected before moving on. */
export function isPromptCleared(target: string, typed: string): boolean {
  return typed === target;
}

/**
 * Folds one input change into a running keystroke tally for the whole
 * round. Only counts *added* characters (typing forward), each scored
 * against the target at the moment it was typed — so backspacing and
 * retyping a mistake still counts the original wrong keystroke against
 * accuracy, the way real typing-test tools do. Deletions are ignored
 * (nothing new was "typed").
 */
export function recordKeystroke(
  prevTyped: string,
  nextTyped: string,
  target: string,
  tally: KeystrokeTally,
): KeystrokeTally {
  if (nextTyped.length <= prevTyped.length) return tally;
  let { totalTyped, correctChars } = tally;
  for (let i = prevTyped.length; i < nextTyped.length; i++) {
    totalTyped++;
    if (nextTyped[i] === target[i]) correctChars++;
  }
  return { totalTyped, correctChars };
}

/**
 * The round is won once every prompt has been cleared, lost once time
 * runs out first, and otherwise still in progress. `completedCount` is
 * how many of the round's prompts have been fully matched so far.
 */
export function getRoundOutcome(
  completedCount: number,
  promptCount: number,
  timeRemainingMs: number,
): RoundOutcome {
  if (completedCount >= promptCount) return "win";
  if (timeRemainingMs <= 0) return "timeup";
  return "playing";
}

/**
 * Scores a round. WPM uses the classic "5 characters = 1 word"
 * convention, counting only correctly-typed characters (so mashing
 * incorrect keys doesn't inflate speed), divided by elapsed minutes.
 * Accuracy is the percentage of all typed keystrokes that were correct.
 */
export function computeStats(
  correctChars: number,
  totalTyped: number,
  elapsedMs: number,
): TypingStats {
  const accuracy =
    totalTyped === 0 ? 0 : Math.round((correctChars / totalTyped) * 100);
  const minutes = elapsedMs / 60000;
  const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
  return { accuracy, wpm };
}
