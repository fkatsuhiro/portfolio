# Furuichi Katsuhiro — Portfolio

Personal portfolio site, built with [Astro](https://astro.build/) and deployed to GitHub Pages. Live at **https://fkatsuhiro.github.io/portfolio**.

## Tech Stack

Astro 5 + React 19 islands, TypeScript, Tailwind CSS, Firebase Remote Config (feature flags). Testing: Vitest (unit), Playwright + axe-core (e2e / a11y). Lint/format: oxlint, oxfmt, Prettier. CI: GitHub Actions + Dependabot + CodeQL.

## Features

- **i18n** — ja (default, `/`), en (`/en`), ko (`/ko`), via Astro's built-in i18n routing. Each locale has its own page files under `src/pages/`; strings live in `src/i18n/locales/*.ts`.
- **Dark mode**, persisted in `localStorage`.
- **Home / About / Works / Talks** — About has a GitHub contribution heatmap and a history timeline; Works pulls PR/issue/review activity live from the GitHub GraphQL API; Talks embeds Google Slides decks.
- **Remote feature flags** (`src/lib/remoteConfig.ts`) via Firebase Remote Config, with hard-coded fallback defaults.
- **`/a11y` dashboard** — hidden (unlinked, `noindex`, excluded from sitemap) internal tool that runs axe-core live against every page/locale.

## Getting Started

```sh
pnpm install
pnpm dev   # http://localhost:4323/portfolio
```

Optional `.env`:

```sh
GITHUB_TOKEN=                        # for Works/About GitHub data; pages work without it
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=              # for Remote Config; falls back to defaults without it
```

## Commands

| Command          | Action                         |
| :--------------- | :----------------------------- |
| `pnpm dev`       | Dev server at `localhost:4323` |
| `pnpm build`     | Build to `./dist/`             |
| `pnpm preview`   | Preview the production build   |
| `pnpm lint`      | `oxlint` + `astro check`       |
| `pnpm fmt`       | Format with `oxfmt`            |
| `pnpm test`      | Playwright e2e + a11y suite    |
| `pnpm test:unit` | Vitest unit suite              |

## Testing

- **Unit** (`src/**/*.test.ts`) — pure logic in `src/lib/` and `src/i18n/`.
- **E2E** (`tests/*.spec.ts`) — every page, language switcher, dark mode, Works drill-down (skips gracefully without `GITHUB_TOKEN`).
- **Accessibility** (`tests/a11y.spec.ts`) — axe-core against all 12 pages, fails on any violation.

## Known limitations

- `open-graph-scraper` dependency is unused — candidate for removal.
- Works page's "Product" tab (flagged off) still has placeholder data.
- `showPersonalBlog` flag exists with no blog UI behind it.
- `SkillBadges.tsx` has an `as any` cast working around a type mismatch.
