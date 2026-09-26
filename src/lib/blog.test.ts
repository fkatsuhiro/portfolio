import { describe, expect, it, vi } from "vitest";
import { fetchBlogPosts, shapeBlogPost } from "./blog";

vi.mock("open-graph-scraper", () => ({
  default: vi.fn(),
}));

describe("shapeBlogPost", () => {
  it("maps a successful scrape result to a BlogPost", () => {
    const post = shapeBlogPost("https://zenn.dev/kattu/articles/abc", {
      ogTitle: "  My Article  ",
      ogDescription: "  A short summary.  ",
      ogImage: [{ url: "https://example.com/cover.png" }],
      ogUrl: "https://zenn.dev/kattu/articles/abc",
    });

    expect(post).toEqual({
      title: "My Article",
      description: "A short summary.",
      image: "https://example.com/cover.png",
      url: "https://zenn.dev/kattu/articles/abc",
    });
  });

  it("returns null when there is no title (nothing meaningful to render)", () => {
    expect(
      shapeBlogPost("https://zenn.dev/x", { ogDescription: "desc" }),
    ).toBeNull();
    expect(shapeBlogPost("https://zenn.dev/x", undefined)).toBeNull();
    expect(shapeBlogPost("https://zenn.dev/x", null)).toBeNull();
  });

  it("falls back to a neutral description when Zenn has no og:description", () => {
    const post = shapeBlogPost("https://zenn.dev/x", { ogTitle: "Title" });
    expect(post?.description).toBe("Read the full article on Zenn.");
  });

  it("falls back to the request URL, then the given URL, when ogUrl is missing", () => {
    const withRequestUrl = shapeBlogPost("https://fallback.example/x", {
      ogTitle: "Title",
      requestUrl: "https://zenn.dev/kattu/articles/from-request",
    });
    expect(withRequestUrl?.url).toBe(
      "https://zenn.dev/kattu/articles/from-request",
    );

    const withNeither = shapeBlogPost("https://fallback.example/x", {
      ogTitle: "Title",
    });
    expect(withNeither?.url).toBe("https://fallback.example/x");
  });

  it("returns a null image when ogImage is missing or empty", () => {
    expect(
      shapeBlogPost("https://zenn.dev/x", { ogTitle: "T" })?.image,
    ).toBeNull();
    expect(
      shapeBlogPost("https://zenn.dev/x", { ogTitle: "T", ogImage: [] })?.image,
    ).toBeNull();
  });
});

describe("fetchBlogPosts", () => {
  it("filters out URLs that fail to scrape without failing the whole batch", async () => {
    const ogs = (await import("open-graph-scraper")).default as ReturnType<
      typeof vi.fn
    >;
    ogs
      .mockResolvedValueOnce({
        error: false,
        result: {
          ogTitle: "First Post",
          ogImage: [{ url: "https://a/img.png" }],
        },
      })
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({
        error: false,
        result: {},
      });

    const posts = await fetchBlogPosts([
      "https://zenn.dev/kattu/articles/one",
      "https://zenn.dev/kattu/articles/two",
      "https://zenn.dev/kattu/articles/three",
    ]);

    expect(posts).toEqual([
      {
        title: "First Post",
        description: "Read the full article on Zenn.",
        image: "https://a/img.png",
        url: "https://zenn.dev/kattu/articles/one",
      },
    ]);
  });
});
