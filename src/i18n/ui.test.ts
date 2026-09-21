import { describe, expect, it } from "vitest";
import {
  defaultLang,
  getLangFromUrl,
  languages,
  ui,
  useTranslations,
} from "./ui";

describe("getLangFromUrl", () => {
  it("detects a registered locale from the path prefix", () => {
    expect(getLangFromUrl(new URL("https://example.com/en/about"))).toBe("en");
    expect(getLangFromUrl(new URL("https://example.com/ko/works"))).toBe("ko");
  });

  it("falls back to the default language for the root path", () => {
    expect(getLangFromUrl(new URL("https://example.com/"))).toBe(defaultLang);
  });

  it("falls back to the default language for an unknown prefix", () => {
    expect(getLangFromUrl(new URL("https://example.com/fr/about"))).toBe(
      defaultLang,
    );
  });
});

describe("useTranslations", () => {
  it.each(Object.keys(languages) as (keyof typeof languages)[])(
    "resolves nav.about for %s",
    (lang) => {
      const t = useTranslations(lang);
      expect(t("nav.about")).toBe(ui[lang]["nav.about"]);
    },
  );

  it("every locale defines the same set of keys as the default locale", () => {
    const defaultKeys = Object.keys(ui[defaultLang]).sort();
    for (const lang of Object.keys(languages) as (keyof typeof languages)[]) {
      expect(Object.keys(ui[lang]).sort()).toEqual(defaultKeys);
    }
  });
});
