import { describe, expect, it } from "vitest";
import {
  computeStats,
  getCharStatuses,
  getRound,
  getRoundOutcome,
  isPromptCleared,
  recordKeystroke,
  type KeystrokeTally,
} from "./typing";

describe("TYPING_ROUNDS", () => {
  it("has exactly 10 non-empty prompts per difficulty", () => {
    for (const id of ["easy", "medium", "hard"] as const) {
      const round = getRound(id);
      expect(round.prompts).toHaveLength(10);
      for (const prompt of round.prompts) {
        expect(prompt.length).toBeGreaterThan(0);
        expect(prompt.toLowerCase()).not.toContain("lorem ipsum");
      }
    }
  });

  it("gives harder rounds less time", () => {
    expect(getRound("medium").timeLimitSec).toBeLessThan(
      getRound("easy").timeLimitSec,
    );
    expect(getRound("hard").timeLimitSec).toBeLessThan(
      getRound("medium").timeLimitSec,
    );
  });

  it("throws for an unknown difficulty", () => {
    // @ts-expect-error deliberately invalid id
    expect(() => getRound("impossible")).toThrow();
  });
});

describe("getCharStatuses", () => {
  it("marks untouched characters as pending", () => {
    expect(getCharStatuses("abc", "")).toEqual([
      "pending",
      "pending",
      "pending",
    ]);
  });

  it("marks matching typed characters as correct", () => {
    expect(getCharStatuses("abc", "ab")).toEqual([
      "correct",
      "correct",
      "pending",
    ]);
  });

  it("marks mismatched typed characters as incorrect", () => {
    expect(getCharStatuses("abc", "axc")).toEqual([
      "correct",
      "incorrect",
      "correct",
    ]);
  });

  it("ignores extra typed characters beyond the target length", () => {
    expect(getCharStatuses("ab", "abcd")).toEqual(["correct", "correct"]);
  });
});

describe("isPromptCleared", () => {
  it("is false until the typed text exactly matches the target", () => {
    expect(isPromptCleared("cat", "ca")).toBe(false);
    expect(isPromptCleared("cat", "cad")).toBe(false);
  });

  it("is true only on an exact match", () => {
    expect(isPromptCleared("cat", "cat")).toBe(true);
  });
});

describe("recordKeystroke", () => {
  const empty: KeystrokeTally = { totalTyped: 0, correctChars: 0 };

  it("scores newly typed characters against the target", () => {
    const tally = recordKeystroke("", "c", "cat", empty);
    expect(tally).toEqual({ totalTyped: 1, correctChars: 1 });
  });

  it("counts a wrong keystroke against accuracy", () => {
    const tally = recordKeystroke("", "x", "cat", empty);
    expect(tally).toEqual({ totalTyped: 1, correctChars: 0 });
  });

  it("accumulates across multiple keystrokes", () => {
    let tally = empty;
    tally = recordKeystroke("", "c", "cat", tally);
    tally = recordKeystroke("c", "ca", "cat", tally);
    tally = recordKeystroke("ca", "cat", "cat", tally);
    expect(tally).toEqual({ totalTyped: 3, correctChars: 3 });
  });

  it("ignores deletions (does not un-count a mistake)", () => {
    let tally = empty;
    tally = recordKeystroke("", "x", "cat", tally); // wrong keystroke, counted
    tally = recordKeystroke("x", "", "cat", tally); // backspace: not a new keystroke
    expect(tally).toEqual({ totalTyped: 1, correctChars: 0 });
  });

  it("keeps counting correctly after a correction", () => {
    let tally = empty;
    tally = recordKeystroke("", "x", "cat", tally); // wrong
    tally = recordKeystroke("x", "", "cat", tally); // backspace
    tally = recordKeystroke("", "c", "cat", tally); // retyped correctly
    expect(tally).toEqual({ totalTyped: 2, correctChars: 1 });
  });
});

describe("getRoundOutcome", () => {
  it("is playing before time runs out and before all prompts are done", () => {
    expect(getRoundOutcome(3, 10, 5000)).toBe("playing");
  });

  it("is a win once every prompt is completed, even with time left", () => {
    expect(getRoundOutcome(10, 10, 5000)).toBe("win");
  });

  it("is a win exactly at time zero if the last prompt just landed", () => {
    expect(getRoundOutcome(10, 10, 0)).toBe("win");
  });

  it("is timeup once time runs out before all prompts are done", () => {
    expect(getRoundOutcome(7, 10, 0)).toBe("timeup");
    expect(getRoundOutcome(7, 10, -50)).toBe("timeup");
  });
});

describe("computeStats", () => {
  it("computes 100% accuracy and correct WPM for a perfect, one-minute run", () => {
    const stats = computeStats(35, 35, 60_000); // 35 chars = 7 "words"
    expect(stats.accuracy).toBe(100);
    expect(stats.wpm).toBe(7);
  });

  it("halves WPM when it takes twice as long", () => {
    expect(computeStats(35, 35, 120_000).wpm).toBe(4); // rounds 3.5 -> 4
  });

  it("counts only correct characters toward WPM but all toward accuracy", () => {
    const stats = computeStats(5, 10, 60_000); // 5 correct of 10 typed
    expect(stats.accuracy).toBe(50);
    expect(stats.wpm).toBe(1); // 5 correct / 5 = 1 word
  });

  it("returns zeroed stats for no keystrokes", () => {
    expect(computeStats(0, 0, 10_000)).toEqual({ accuracy: 0, wpm: 0 });
  });

  it("does not divide by zero when elapsed time is zero", () => {
    const stats = computeStats(3, 3, 0);
    expect(stats.wpm).toBe(0);
    expect(stats.accuracy).toBe(100);
  });
});
