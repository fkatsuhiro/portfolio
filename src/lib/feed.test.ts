import { describe, expect, it } from "vitest";
import { buildRssXml, escapeXml } from "./feed";
import type { BlogPost } from "./blog";

const channel = {
  title: "Furuichi Katsuhiro | Blogs",
  link: "https://fkatsuhiro.github.io/portfolio/blogs",
  description: "Zenn articles by Furuichi Katsuhiro.",
};

describe("escapeXml", () => {
  it("escapes &, <, >, \", and ' in that order without double-escaping", () => {
    expect(escapeXml(`<a href="x">Tom & "Jerry" <b>'s</b></a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; &quot;Jerry&quot; &lt;b&gt;&apos;s&lt;/b&gt;&lt;/a&gt;",
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeXml("Just a normal title")).toBe("Just a normal title");
  });
});

describe("buildRssXml", () => {
  it("includes well-formed channel metadata and one <item> per post", () => {
    const posts: BlogPost[] = [
      {
        title: "First Post",
        description: "A short summary.",
        image: "https://example.com/a.png",
        url: "https://zenn.dev/kattu/articles/one",
      },
      {
        title: "Second Post",
        description: "Read the full article on Zenn.",
        image: null,
        url: "https://zenn.dev/kattu/articles/two",
      },
    ];

    const xml = buildRssXml(posts, channel);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
      true,
    );
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toContain(`<title>${channel.title}</title>`);
    expect(xml).toContain(`<link>${channel.link}</link>`);
    expect(xml).toContain(`<description>${channel.description}</description>`);

    const itemMatches = xml.match(/<item>/g);
    expect(itemMatches).toHaveLength(2);

    expect(xml).toContain("<title>First Post</title>");
    expect(xml).toContain(
      "<link>https://zenn.dev/kattu/articles/one</link>",
    );
    expect(xml).toContain(
      '<guid isPermaLink="true">https://zenn.dev/kattu/articles/one</guid>',
    );
    expect(xml).toContain("<title>Second Post</title>");
  });

  it("escapes special characters found in post titles and descriptions", () => {
    const posts: BlogPost[] = [
      {
        title: "A & B <Tags> \"Quoted\"",
        description: "Summary with <html> & 'quotes'",
        image: null,
        url: "https://zenn.dev/kattu/articles/escape",
      },
    ];

    const xml = buildRssXml(posts, channel);

    expect(xml).toContain(
      "<title>A &amp; B &lt;Tags&gt; &quot;Quoted&quot;</title>",
    );
    expect(xml).toContain(
      "<description>Summary with &lt;html&gt; &amp; &apos;quotes&apos;</description>",
    );
    expect(xml).not.toContain("<Tags>");
    expect(xml).not.toContain("<html>");
  });

  it("produces a valid channel with no <item> elements when there are no posts", () => {
    const xml = buildRssXml([], channel);

    expect(xml).not.toContain("<item>");
    expect(xml).toContain(`<title>${channel.title}</title>`);
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toContain("</channel>");
    expect(xml).toContain("</rss>");
  });
});
