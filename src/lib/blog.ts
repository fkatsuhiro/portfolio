import ogs from "open-graph-scraper";

// This module is only ever imported from .astro frontmatter (server-side,
// build-time execution), never from a client:* component — it makes live
// network requests to scrape OGP metadata, which must never run in the browser.

export interface BlogPost {
  title: string;
  description: string;
  image: string | null;
  url: string;
}

export const ZENN_ARTICLE_URLS = [
  "https://zenn.dev/kattu/articles/469528b9bd5150",
  "https://zenn.dev/kattu/articles/37e76909dc555e",
  "https://zenn.dev/kattu/articles/29be5bfc452e53",
  "https://zenn.dev/kattu/articles/e977ff28185cbf",
];

// Zenn doesn't publish an og:description on any article we've checked, so a
// missing description is expected rather than a scrape failure — fall back to
// a neutral label instead of leaving the card without any body text.
const FALLBACK_DESCRIPTION = "Read the full article on Zenn.";

// Minimal shape of what we read off the scraper's result — matches (a subset
// of) open-graph-scraper's OgObject without depending on its exact type name.
interface OgResultLike {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: ({ url?: string } | null)[] | null;
  ogUrl?: string;
  requestUrl?: string;
}

/**
 * Shapes a raw scraper result into a BlogPost, or null when there isn't
 * enough data to render a meaningful card (no title).
 */
export function shapeBlogPost(
  fallbackUrl: string,
  result: OgResultLike | null | undefined,
): BlogPost | null {
  const title = result?.ogTitle?.trim();
  if (!title) return null;

  return {
    title,
    description: result?.ogDescription?.trim() || FALLBACK_DESCRIPTION,
    image: result?.ogImage?.[0]?.url ?? null,
    url: result?.ogUrl || result?.requestUrl || fallbackUrl,
  };
}

/**
 * Scrapes OGP metadata for each Zenn article URL at build time. Each URL is
 * fetched independently (not Promise.all-then-fail) so one bad or slow
 * article can't take down the whole page build — failures are logged and the
 * article is simply left out of the result.
 */
export async function fetchBlogPosts(
  urls: string[] = ZENN_ARTICLE_URLS,
): Promise<BlogPost[]> {
  const posts = await Promise.all(
    urls.map(async (url) => {
      try {
        const { result } = await ogs({ url, timeout: 10 });
        return shapeBlogPost(url, result as OgResultLike);
      } catch (error) {
        console.error(`Failed to scrape OGP data for ${url}:`, error);
        return null;
      }
    }),
  );
  return posts.filter((post): post is BlogPost => post !== null);
}
