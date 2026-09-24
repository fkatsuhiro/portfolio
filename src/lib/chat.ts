import type { ChatFaqEntry } from "../i18n/chatFaq";

/**
 * Finds the first FAQ entry whose keywords appear (case-insensitively) in
 * the given free-text query. Returns null for an empty query or no match.
 */
export function findFaqMatch(
  entries: ChatFaqEntry[],
  query: string,
): ChatFaqEntry | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  return (
    entries.find((entry) =>
      entry.keywords.some((keyword) =>
        normalized.includes(keyword.toLowerCase()),
      ),
    ) ?? null
  );
}

export function getFaqEntry(
  entries: ChatFaqEntry[],
  id: ChatFaqEntry["id"],
): ChatFaqEntry {
  const entry = entries.find((e) => e.id === id);
  if (!entry) throw new Error(`Unknown chat FAQ entry: ${id}`);
  return entry;
}
