export interface A11yRoute {
  path: string;
  label: string;
}

// Every publicly linked page, across all three locales. Shared between the
// Playwright a11y test suite and the live /a11y dashboard so both audit the
// exact same set of pages.
export const a11yRoutes: A11yRoute[] = [
  { path: "/", label: "Home (ja)" },
  { path: "/about", label: "About (ja)" },
  { path: "/works", label: "Works (ja)" },
  { path: "/talks", label: "Talks (ja)" },
  { path: "/game", label: "Game (ja)" },
  { path: "/analytics", label: "Analytics (ja)" },
  { path: "/en", label: "Home (en)" },
  { path: "/en/about", label: "About (en)" },
  { path: "/en/works", label: "Works (en)" },
  { path: "/en/talks", label: "Talks (en)" },
  { path: "/en/game", label: "Game (en)" },
  { path: "/en/analytics", label: "Analytics (en)" },
  { path: "/ko", label: "Home (ko)" },
  { path: "/ko/about", label: "About (ko)" },
  { path: "/ko/works", label: "Works (ko)" },
  { path: "/ko/talks", label: "Talks (ko)" },
  { path: "/ko/game", label: "Game (ko)" },
  { path: "/ko/analytics", label: "Analytics (ko)" },
];
