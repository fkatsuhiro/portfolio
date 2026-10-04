import type { APIRoute } from "astro";
import { fetchBlogPosts } from "../lib/blog";
import { buildRssXml } from "../lib/feed";

// The site builds with static output (see astro.config.mjs), so every route
// is prerendered by default — this flag just makes that explicit for a
// route that previously didn't exist, so it never accidentally needs a
// server runtime on GitHub Pages.
export const prerender = true;

const SITE_URL = "https://fkatsuhiro.github.io/portfolio";

export const GET: APIRoute = async () => {
  const posts = await fetchBlogPosts();

  const xml = buildRssXml(posts, {
    title: "Furuichi Katsuhiro | Blogs",
    link: `${SITE_URL}/blogs`,
    description:
      "A selection of Furuichi Katsuhiro's articles on Zenn about frontend engineering.",
    language: "ja",
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
