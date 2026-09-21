import type { TimelineItem } from "../components/TimeLine";
import type { FeatureFlags } from "./remoteConfig";

export function filterVisibleTimelineItems(
  items: TimelineItem[],
  flags: Pick<FeatureFlags, "showFastRetailing">,
): TimelineItem[] {
  return items.filter((item) => {
    if (item.id === "fast-retailing" && !flags.showFastRetailing) return false;
    return true;
  });
}
