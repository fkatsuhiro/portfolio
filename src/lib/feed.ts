import type { BlogPost } from "./blog";

// Pure XML-building logic lives here (separate from the feed.xml.ts endpoint)
// so it can be unit tested without touching Astro's request/response layer.

export interface RssChannelMeta {
  title: string;
  link: string;
  description: string;
  language?: string;
}

/**
 * Escapes the five characters that are unsafe inside XML text content and
 * attribute values. Order matters: `&` must be escaped first so the
 * entities we introduce for the other characters aren't double-escaped.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Builds a hand-written RSS 2.0 document for the given posts. BlogPost has
 * no publish date (the OGP scrape doesn't provide one), so items are listed
 * in the order given and no <pubDate> is fabricated for individual items —
 * only the channel-level <lastBuildDate>, set at build time, is included.
 */
export function buildRssXml(
  posts: BlogPost[],
  channel: RssChannelMeta,
): string {
  const language = channel.language ?? "ja";
  const lastBuildDate = new Date().toUTCString();

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.url)}</link>
      <guid isPermaLink="true">${escapeXml(post.url)}</guid>
      <description>${escapeXml(post.description)}</description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <description>${escapeXml(channel.description)}</description>
    <language>${escapeXml(language)}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
