import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatElapsedSeconds,
  getBestScore,
  higherIsBetter,
  lowerIsBetter,
  setBestScoreIfBetter,
} from "./highScore";

/** Minimal in-memory stand-in for the Web Storage API. */
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
  vi.stubGlobal("window", { localStorage: storage });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getBestScore", () => {
  it("returns null when nothing has been stored yet", () => {
    expect(getBestScore("sudoku", "easy")).toBeNull();
  });

  it("returns null without throwing when window is unavailable (SSR)", () => {
    vi.unstubAllGlobals();
    expect(() => getBestScore("sudoku", "easy")).not.toThrow();
    expect(getBestScore("sudoku", "easy")).toBeNull();
  });

  it("returns null without throwing when the stored value is corrupt JSON", () => {
    storage.setItem("portfolio:highscore:sudoku:easy", "{not valid json");
    expect(() => getBestScore("sudoku", "easy")).not.toThrow();
    expect(getBestScore("sudoku", "easy")).toBeNull();
  });

  it("returns null when the stored value isn't a finite number", () => {
    storage.setItem("portfolio:highscore:sudoku:easy", JSON.stringify("fast"));
    expect(getBestScore("sudoku", "easy")).toBeNull();
    storage.setItem("portfolio:highscore:sudoku:easy", JSON.stringify(null));
    expect(getBestScore("sudoku", "easy")).toBeNull();
  });

  it("returns null without throwing when localStorage access throws", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem() {
          throw new Error("blocked");
        },
      },
    });
    expect(() => getBestScore("sudoku", "easy")).not.toThrow();
    expect(getBestScore("sudoku", "easy")).toBeNull();
  });
});

describe("setBestScoreIfBetter", () => {
  it("persists the first score ever recorded for a game/difficulty", () => {
    const result = setBestScoreIfBetter(
      "sudoku",
      "easy",
      120_000,
      lowerIsBetter,
    );
    expect(result).toEqual({ best: 120_000, isNewBest: true });
    expect(getBestScore("sudoku", "easy")).toBe(120_000);
  });

  it("overwrites the stored best when the new value is an improvement", () => {
    setBestScoreIfBetter("sudoku", "easy", 120_000, lowerIsBetter);
    const result = setBestScoreIfBetter(
      "sudoku",
      "easy",
      90_000,
      lowerIsBetter,
    );
    expect(result).toEqual({ best: 90_000, isNewBest: true });
    expect(getBestScore("sudoku", "easy")).toBe(90_000);
  });

  it("does not overwrite the stored best when the new value is worse", () => {
    setBestScoreIfBetter("sudoku", "easy", 90_000, lowerIsBetter);
    const result = setBestScoreIfBetter(
      "sudoku",
      "easy",
      120_000,
      lowerIsBetter,
    );
    expect(result).toEqual({ best: 90_000, isNewBest: false });
    expect(getBestScore("sudoku", "easy")).toBe(90_000);
  });

  it("supports higher-is-better metrics like typing WPM", () => {
    setBestScoreIfBetter("typing", "easy", 40, higherIsBetter);
    const worse = setBestScoreIfBetter("typing", "easy", 30, higherIsBetter);
    expect(worse).toEqual({ best: 40, isNewBest: false });

    const better = setBestScoreIfBetter("typing", "easy", 55, higherIsBetter);
    expect(better).toEqual({ best: 55, isNewBest: true });
    expect(getBestScore("typing", "easy")).toBe(55);
  });

  it("keeps scores isolated per difficulty", () => {
    setBestScoreIfBetter("sudoku", "easy", 100, lowerIsBetter);
    setBestScoreIfBetter("sudoku", "hard", 500, lowerIsBetter);

    expect(getBestScore("sudoku", "easy")).toBe(100);
    expect(getBestScore("sudoku", "hard")).toBe(500);
    expect(getBestScore("sudoku", "medium")).toBeNull();
  });

  it("keeps scores isolated per game", () => {
    setBestScoreIfBetter("sudoku", "easy", 100, lowerIsBetter);
    setBestScoreIfBetter("shikaku", "easy", 200, lowerIsBetter);

    expect(getBestScore("sudoku", "easy")).toBe(100);
    expect(getBestScore("shikaku", "easy")).toBe(200);
  });

  it("reports the improvement even if persisting it throws", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem() {
          return null;
        },
        setItem() {
          throw new Error("quota exceeded");
        },
      },
    });
    expect(() =>
      setBestScoreIfBetter("sudoku", "easy", 100, lowerIsBetter),
    ).not.toThrow();
    const result = setBestScoreIfBetter("sudoku", "easy", 100, lowerIsBetter);
    expect(result).toEqual({ best: 100, isNewBest: true });
  });
});

describe("formatElapsedSeconds", () => {
  it("formats milliseconds as seconds with one decimal place", () => {
    expect(formatElapsedSeconds(12_345)).toBe("12.3");
    expect(formatElapsedSeconds(500)).toBe("0.5");
    expect(formatElapsedSeconds(0)).toBe("0.0");
  });
});
