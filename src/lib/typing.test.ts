import { describe, expect, it } from "vitest";
import {
  TYPING_PROMPTS,
  computeStats,
  getCharStatuses,
  getPrompt,
  isComplete,
} from "./typing";

describe("TYPING_PROMPTS", () => {
  it("has one real, non-empty passage per difficulty", () => {
    for (const id of ["easy", "medium", "hard"] as const) {
      const prompt = getPrompt(id);
      expect(prompt.text.length).toBeGreaterThan(0);
      expect(prompt.text.toLowerCase()).not.toContain("lorem ipsum");
    }
  });

  it("gets progressively longer from easy to hard", () => {
    const len = (id: (typeof TYPING_PROMPTS)[number]["id"]) =>
      getPrompt(id).text.length;
    expect(len("easy")).toBeLessThan(len("medium"));
    expect(len("medium")).toBeLessThan(len("hard"));
  });

  it("the medium and hard passages use more punctuation than easy", () => {
    const punctuationCount = (id: (typeof TYPING_PROMPTS)[number]["id"]) =>
      (getPrompt(id).text.match(/[,;:]/g) ?? []).length;
    expect(punctuationCount("medium")).toBeGreaterThan(
      punctuationCount("easy"),
    );
    expect(punctuationCount("hard")).toBeGreaterThan(punctuationCount("easy"));
  });

  it("throws for an unknown difficulty", () => {
    // @ts-expect-error deliberately invalid id
    expect(() => getPrompt("impossible")).toThrow();
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

describe("isComplete", () => {
  it("is false while typed text is shorter than the target", () => {
    expect(isComplete("hello", "hell")).toBe(false);
  });

  it("is true once typed length reaches the target length", () => {
    expect(isComplete("hello", "hello")).toBe(true);
  });

  it("is true even if the typed text has mistakes, as long as it's long enough", () => {
    expect(isComplete("hello", "hxllo")).toBe(true);
  });

  it("is false for an empty target", () => {
    expect(isComplete("", "")).toBe(false);
  });
});

describe("computeStats", () => {
  it("computes 100% accuracy and correct WPM for a perfect, one-minute run", () => {
    const target = "12345678901234567890123456789012345"; // 35 chars = 7 words
    const stats = computeStats(target, target, 60_000);
    expect(stats.correctChars).toBe(35);
    expect(stats.totalTyped).toBe(35);
    expect(stats.accuracy).toBe(100);
    expect(stats.wpm).toBe(7); // 35 chars / 5 = 7 words in 1 minute
  });

  it("halves WPM when it takes twice as long", () => {
    const target = "12345678901234567890123456789012345"; // 7 "words"
    const stats = computeStats(target, target, 120_000);
    expect(stats.wpm).toBe(4); // rounds 3.5 -> 4
  });

  it("counts only correct characters toward accuracy and WPM", () => {
    const target = "aaaaaaaaaa"; // 10 chars
    const typed = "aaaaaXXXXX"; // 5 correct, 5 wrong
    const stats = computeStats(target, typed, 60_000);
    expect(stats.correctChars).toBe(5);
    expect(stats.accuracy).toBe(50);
    expect(stats.wpm).toBe(1); // 5 correct / 5 = 1 word
  });

  it("returns zeroed stats for empty input", () => {
    const stats = computeStats("abc", "", 10_000);
    expect(stats).toEqual({
      correctChars: 0,
      totalTyped: 0,
      accuracy: 0,
      wpm: 0,
    });
  });

  it("does not divide by zero when elapsed time is zero", () => {
    const stats = computeStats("abc", "abc", 0);
    expect(stats.wpm).toBe(0);
    expect(stats.accuracy).toBe(100);
  });
});
