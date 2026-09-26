export type TypingDifficulty = "easy" | "medium" | "hard";

export interface TypingPrompt {
  id: TypingDifficulty;
  text: string;
}

export type CharStatus = "correct" | "incorrect" | "pending";

export interface TypingStats {
  correctChars: number;
  totalTyped: number;
  accuracy: number; // 0-100, rounded
  wpm: number; // rounded, based on correctly-typed characters
}

// Real, hand-written passages (not lorem ipsum) that get progressively
// longer and more punctuation-heavy across difficulties. The passages are
// kept in plain English regardless of UI language: this is a keyboard
// typing-speed drill, so the target text is intentionally
// language-independent from the site's i18n (see Typing game section of
// the surrounding component/tests for the rationale).
export const TYPING_PROMPTS: TypingPrompt[] = [
  {
    id: "easy",
    text: "The quick brown fox jumps over the lazy dog.",
  },
  {
    id: "medium",
    text: "Good code is read far more often than it is written, so clarity today saves everyone time tomorrow.",
  },
  {
    id: "hard",
    text: "Programming is the art of telling another human being, eventually, what you want the computer to do; it rewards patience, precision, and a willingness to re-read your own mistakes twice before blaming the machine.",
  },
];

export function getPrompt(id: TypingDifficulty): TypingPrompt {
  const prompt = TYPING_PROMPTS.find((p) => p.id === id);
  if (!prompt) throw new Error(`Unknown typing prompt: ${id}`);
  return prompt;
}

/**
 * Per-character status of what's been typed so far against the target
 * passage: "correct"/"incorrect" for the typed prefix, "pending" for the
 * rest that hasn't been reached yet.
 */
export function getCharStatuses(target: string, typed: string): CharStatus[] {
  return target.split("").map((ch, i) => {
    if (i >= typed.length) return "pending";
    return typed[i] === ch ? "correct" : "incorrect";
  });
}

/** The passage is complete once the player has typed at least as many
 * characters as the target (matching or not — completion just ends the
 * round so a final score can be shown). */
export function isComplete(target: string, typed: string): boolean {
  return typed.length >= target.length && target.length > 0;
}

/**
 * Scores a typing attempt. WPM uses the classic "5 characters = 1 word"
 * convention, counting only correctly-typed characters (so mashing
 * incorrect keys doesn't inflate speed), divided by elapsed minutes.
 * Accuracy is the percentage of typed characters that were correct.
 */
export function computeStats(
  target: string,
  typed: string,
  elapsedMs: number,
): TypingStats {
  const len = Math.min(target.length, typed.length);
  let correct = 0;
  for (let i = 0; i < len; i++) {
    if (typed[i] === target[i]) correct++;
  }
  const totalTyped = typed.length;
  const accuracy = totalTyped === 0 ? 0 : Math.round((correct / totalTyped) * 100);
  const minutes = elapsedMs / 60000;
  const wpm = minutes > 0 ? Math.round(correct / 5 / minutes) : 0;
  return { correctChars: correct, totalTyped, accuracy, wpm };
}
