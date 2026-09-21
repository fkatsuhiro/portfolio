import { describe, expect, it } from "vitest";
import {
  filterByRepo,
  getActivityLevel,
  getPrStatusKey,
  type GitHubItem,
} from "./works";

function item(overrides: Partial<GitHubItem> = {}): GitHubItem {
  return {
    title: "t",
    url: "https://example.com",
    createdAt: "2026-01-01",
    repository: { name: "astro" },
    ...overrides,
  };
}

describe("filterByRepo", () => {
  it("matches case-insensitively by repository name", () => {
    const items = [
      item({ repository: { name: "Astro" } }),
      item({ repository: { name: "qwik" } }),
    ];
    expect(filterByRepo(items, "astro")).toHaveLength(1);
    expect(filterByRepo(items, "ASTRO")).toHaveLength(1);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterByRepo([item()], "dioxus")).toEqual([]);
  });
});

describe("getPrStatusKey", () => {
  it("returns null for non-PR items (no state)", () => {
    expect(getPrStatusKey(item({ state: undefined }))).toBeNull();
  });

  it("returns 'draft' for draft PRs regardless of state", () => {
    expect(getPrStatusKey(item({ state: "OPEN", isDraft: true }))).toBe(
      "draft",
    );
  });

  it("returns 'merged', 'closed', or 'open' based on state", () => {
    expect(getPrStatusKey(item({ state: "MERGED" }))).toBe("merged");
    expect(getPrStatusKey(item({ state: "CLOSED" }))).toBe("closed");
    expect(getPrStatusKey(item({ state: "OPEN" }))).toBe("open");
  });
});

describe("getActivityLevel", () => {
  it("maps contribution counts to the expected bucket", () => {
    expect(getActivityLevel(0)).toBe(0);
    expect(getActivityLevel(1)).toBe(1);
    expect(getActivityLevel(2)).toBe(2);
    expect(getActivityLevel(3)).toBe(3);
    expect(getActivityLevel(10)).toBe(4);
  });
});
