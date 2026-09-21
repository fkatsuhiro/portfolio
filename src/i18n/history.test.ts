import { describe, expect, it } from "vitest";
import { historyByLang } from "./history";
import { filterVisibleTimelineItems } from "../lib/timeline";

describe("historyByLang", () => {
  it.each(Object.keys(historyByLang) as (keyof typeof historyByLang)[])(
    "tags the Fast Retailing entry with id 'fast-retailing' for %s",
    (lang) => {
      const items = historyByLang[lang];
      const lastItem = items[items.length - 1];
      expect(lastItem.id).toBe("fast-retailing");
    },
  );

  it.each(Object.keys(historyByLang) as (keyof typeof historyByLang)[])(
    "hides the Fast Retailing entry for %s when the flag is off",
    (lang) => {
      const visible = filterVisibleTimelineItems(historyByLang[lang], {
        showFastRetailing: false,
      });
      expect(visible.some((item) => item.id === "fast-retailing")).toBe(false);
    },
  );

  it.each(Object.keys(historyByLang) as (keyof typeof historyByLang)[])(
    "shows the Fast Retailing entry for %s when the flag is on",
    (lang) => {
      const visible = filterVisibleTimelineItems(historyByLang[lang], {
        showFastRetailing: true,
      });
      expect(visible.some((item) => item.id === "fast-retailing")).toBe(true);
    },
  );
});
