import { describe, expect, it } from "vitest";
import { filterVisibleTimelineItems } from "./timeline";
import type { TimelineItem } from "../components/TimeLine";

const items: TimelineItem[] = [
  { date: "2020", title: "A", description: "a" },
  { id: "fast-retailing", date: "2026", title: "B", description: "b" },
];

describe("filterVisibleTimelineItems", () => {
  it("keeps every item when the flag is enabled", () => {
    expect(
      filterVisibleTimelineItems(items, { showFastRetailing: true }),
    ).toHaveLength(2);
  });

  it("drops only the fast-retailing item when the flag is disabled", () => {
    const result = filterVisibleTimelineItems(items, {
      showFastRetailing: false,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBeUndefined();
  });

  it("leaves items without an id untouched regardless of the flag", () => {
    const noIdItems: TimelineItem[] = [
      { date: "2020", title: "A", description: "a" },
    ];
    expect(
      filterVisibleTimelineItems(noIdItems, { showFastRetailing: false }),
    ).toEqual(noIdItems);
  });
});
