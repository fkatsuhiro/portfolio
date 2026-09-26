import { describe, expect, it } from "vitest";
import { findFaqMatch, getFaqEntry } from "./chat";
import { chatFaqByLang, type ChatFaqEntry } from "../i18n/chatFaq";

const entries: ChatFaqEntry[] = [
  { id: "about", keywords: ["about", "who are you"], answer: "I'm me." },
  { id: "skills", keywords: ["skill", "tech stack"], answer: "React etc." },
  {
    id: "works",
    keywords: ["works", "oss"],
    answer: "See works.",
    link: { path: "/works" },
  },
];

describe("findFaqMatch", () => {
  it("matches a keyword contained anywhere in the query", () => {
    expect(findFaqMatch(entries, "tell me about yourself")?.id).toBe("about");
  });

  it("is case-insensitive", () => {
    expect(findFaqMatch(entries, "WHAT IS YOUR TECH STACK")?.id).toBe("skills");
  });

  it("returns the first matching entry when multiple could match", () => {
    // "about" also loosely overlaps in spirit, but only "works"/"oss" keywords
    // actually appear here, so it should resolve to the "works" entry.
    expect(findFaqMatch(entries, "what oss do you contribute to")?.id).toBe(
      "works",
    );
  });

  it("returns null for an empty or whitespace-only query", () => {
    expect(findFaqMatch(entries, "")).toBeNull();
    expect(findFaqMatch(entries, "   ")).toBeNull();
  });

  it("returns null when nothing matches", () => {
    expect(findFaqMatch(entries, "what's the weather today")).toBeNull();
  });
});

describe("getFaqEntry", () => {
  it("returns the entry with the given id", () => {
    expect(getFaqEntry(entries, "skills").answer).toBe("React etc.");
  });

  it("throws for an unknown id", () => {
    // @ts-expect-error deliberately invalid id for the throw-path test
    expect(() => getFaqEntry(entries, "nope")).toThrow();
  });
});

describe("chatFaqByLang", () => {
  it.each(Object.keys(chatFaqByLang) as (keyof typeof chatFaqByLang)[])(
    "%s has the same set of FAQ ids as the other locales, each with at least one keyword",
    (lang) => {
      const localeEntries = chatFaqByLang[lang];
      const expectedIds = [
        "about",
        "skills",
        "works",
        "talks",
        "hobbies",
        "contact",
      ];
      expect(localeEntries.map((e) => e.id).sort()).toEqual(
        [...expectedIds].sort(),
      );
      for (const entry of localeEntries) {
        expect(entry.keywords.length).toBeGreaterThan(0);
        expect(entry.answer.length).toBeGreaterThan(0);
      }
    },
  );
});
