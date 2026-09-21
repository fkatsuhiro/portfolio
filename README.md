# Furuichi Katsuhiro — Portfolio

Personal portfolio site for Furuichi Katsuhiro, built with [Astro](https://astro.build/) and deployed as a static site to GitHub Pages. Live at **https://fkatsuhiro.github.io/portfolio**.

## Tech Stack

- **Framework**: [Astro](https://astro.build/) 5 (static output)
- **UI islands**: [React](https://react.dev/) 19 via `@astrojs/react`
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [lucide-react](https://lucide.dev/)
- **Remote config**: [Firebase Remote Config](https://firebase.google.com/docs/remote-config) (feature flags)
- **Unit testing**: [Vitest](https://vitest.dev/)
- **E2E / accessibility testing**: [Playwright](https://playwright.dev/) + [axe-core](https://github.com/dequelabs/axe-core) (via `@axe-core/playwright`)
- **Lint / format**: [oxlint](https://oxc.rs/docs/guide/usage/linter.html), [oxfmt](https://oxc.rs/), [Prettier](https://prettier.io/) (with `prettier-plugin-astro`)
- **CI/CD**: GitHub Actions (lint, unit tests, e2e tests, CodeQL, GitHub Pages deploy) + Dependabot

## Features

- **Trilingual i18n** — Japanese (default, unprefixed `/`), English (`/en`), and Korean (`/ko`), driven by Astro's built-in i18n routing plus a small custom translation dictionary (see [i18n](#i18n) below).
- **Dark mode** — toggled by the user and persisted in `localStorage`, falling back to the OS's `prefers-color-scheme`.
- **Home** — hero section with a scroll-aware header, links into About / Works / Talks.
- **About** — bio, tech stack badges, a GitHub contribution calendar heatmap, and an education/work history timeline (see [Feature flags](#feature-flags) for how the latest entry is gated).
- **Works** — OSS contribution activity (PRs, issues, and reviews) pulled live from the GitHub GraphQL API and grouped per repository, with a drill-down view and a per-repo activity graph. An optional "Product" tab for self-built projects exists behind a feature flag (currently disabled — see [Known limitations](#known-limitations)).
- **Talks** — conference talks with embedded Google Slides decks and a fullscreen modal viewer.
- **Remote feature flags** — `showPersonalBlog`, `showWorksProduct`, `showFastRetailing` are fetched from Firebase Remote Config at runtime (`src/lib/remoteConfig.ts`), with safe in-code defaults if the fetch fails or is unavailable (e.g. no `.env`).
- **Accessibility dashboard** — a hidden internal tool at `/a11y` (not linked from navigation, excluded from the sitemap, `noindex`) that runs axe-core live, in the browser, against every page/locale and reports violations with severity and details. See [Accessibility](#accessibility).

## Project Structure

```text
/
├── src/
│   ├── assets/                 # images used across pages/components
│   ├── components/             # React islands (Header, WorksTabs, TimeLine, A11yDashboard, ...)
│   ├── i18n/                   # translation dictionaries + shared locale-keyed content
│   │   ├── locales/{ja,en,ko}.ts
│   │   ├── ui.ts                # useTranslations(), getLangFromUrl()
│   │   └── history.ts           # About page timeline data, keyed by locale
│   ├── layouts/Layout.astro    # shared <head>/<Header> shell for all real pages
│   ├── lib/                    # framework-agnostic logic, unit-tested (works.ts, timeline.ts, a11yRoutes.ts, remoteConfig.ts)
│   ├── pages/                  # ja pages at the root, en/ko under their own folders
│   │   ├── {index,about,works,talks}.astro   # ja (default locale, no prefix)
│   │   ├── en/{index,about,works,talks}.astro
│   │   ├── ko/{index,about,works,talks}.astro
│   │   └── a11y.astro           # hidden accessibility dashboard (see above)
│   └── styles/global.css
├── tests/                      # Playwright e2e + accessibility specs
├── public/                     # static assets, robots.txt
├── .github/
│   ├── workflows/               # lint, unit-tests, playwright, codeql, deploy
│   └── dependabot.yml
├── astro.config.mjs             # site/base URL, i18n locales, sitemap filter
├── playwright.config.ts
└── vitest.config.ts
```

## Getting Started

```sh
pnpm install
pnpm dev        # http://localhost:4323/portfolio
```

### Environment Variables

Create a `.env` file at the project root:

```sh
# GitHub PAT (no special scopes needed for public data) used to fetch the
# viewer's PRs/issues/reviews and contribution calendar via the GraphQL API.
# Without it, the About/Works pages still render, just without GitHub data.
GITHUB_TOKEN=

# Firebase project config, used only for Remote Config (feature flags).
# Without valid values, remote config fetches fail silently and the
# in-code defaults in src/lib/remoteConfig.ts are used instead.
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

## Commands

All commands run from the project root:

| Command          | Action                                                      |
| :--------------- | :---------------------------------------------------------- |
| `pnpm install`   | Install dependencies                                        |
| `pnpm dev`       | Start the dev server at `localhost:4323`                    |
| `pnpm build`     | Build the production site to `./dist/`                      |
| `pnpm preview`   | Preview the production build locally                        |
| `pnpm lint`      | Run `oxlint` + `astro check` (type checking)                |
| `pnpm lint:fix`  | Run `oxlint --fix`                                          |
| `pnpm fmt`       | Format the codebase with `oxfmt`                            |
| `pnpm fmt:check` | Check formatting without writing                            |
| `pnpm test`      | Run the Playwright e2e (+ accessibility) suite              |
| `pnpm test:unit` | Run the Vitest unit test suite                              |
| `pnpm astro ...` | Run any Astro CLI command (e.g. `astro add`, `astro check`) |

## i18n

- Locales are declared in `astro.config.mjs` (`i18n.locales`) and routed by Astro's built-in i18n support with `prefixDefaultLocale: false` — Japanese pages live at the root (`/about`), English/Korean are prefixed (`/en/about`, `/ko/about`).
- Each locale has its own set of `.astro` page files (no dynamic `[lang]` routing), so adding a new locale means adding a new folder under `src/pages/` plus a new dictionary in `src/i18n/locales/`.
- String content lives in `src/i18n/locales/{ja,en,ko}.ts`, accessed via `useTranslations(lang)` from `src/i18n/ui.ts`. All three dictionaries are typed against the same key set (`UIKey = keyof typeof ja`), so a missing translation key is a compile error, not a silent runtime fallback.
- Non-string, locale-specific content that doesn't fit the string-dictionary model (the About page's history timeline) lives in `src/i18n/history.ts`, keyed by `Lang`, and is shared by all three `about.astro` variants to avoid drift between locales.

## Feature Flags

`src/lib/remoteConfig.ts` fetches three boolean flags from Firebase Remote Config on the client (`showPersonalBlog`, `showWorksProduct`, `showFastRetailing`), caching the result and falling back to safe defaults (`public/feature-flags.json` documents the current default values, though it is not itself read by the app — the defaults are hard-coded in `remoteConfig.ts`). `showFastRetailing` gates the most recent entry in the About page's history timeline; `showWorksProduct` gates the (currently unused) "Product" tab on the Works page.

## Testing

- **Unit tests** (`src/**/*.test.ts`, run via `pnpm test:unit`) cover pure logic extracted into `src/lib/` and `src/i18n/` — repo/PR filtering, timeline visibility filtering, translation lookups, and locale-content consistency (e.g. every locale's history data carries the same `id`s).
- **E2E tests** (`tests/*.spec.ts`, run via `pnpm test`) drive a real browser against the built (or dev) site, covering each page, the language switcher, dark mode, and the OSS contribution drill-down flow (skipped gracefully when `GITHUB_TOKEN` isn't set).
- **Accessibility tests** (`tests/a11y.spec.ts`) run axe-core against all 12 pages (4 pages × 3 locales) and fail on any violation, at any severity.

## Accessibility

Besides the automated `tests/a11y.spec.ts` suite, visiting `/a11y` directly opens a live dashboard that scans the same 12 pages in-browser and shows violations grouped by page, with severity badges and expandable rule details. It's intentionally not linked from the site navigation, excluded from the sitemap, and marked `noindex` — it's a maintenance tool, not a public page. Because it needs to load and hydrate every page in an iframe, a full scan takes ~15–20 seconds.

## CI/CD

| Workflow         | Trigger                        | What it does                                                    |
| :--------------- | :----------------------------- | :-------------------------------------------------------------- |
| `lint.yml`       | PR to `main`                   | `oxlint` + `astro check` + `prettier --check`                   |
| `unit-tests.yml` | push/PR to `main`              | `pnpm test:unit`                                                |
| `playwright.yml` | push/PR to `main`              | Installs Chromium, builds, and runs the full e2e (+ a11y) suite |
| `codeql.yml`     | push/PR to `main`, weekly      | CodeQL static analysis (JavaScript/TypeScript)                  |
| `deploy.yml`     | push to `main`, weekly, manual | Builds via `withastro/action` and deploys to GitHub Pages       |
| `dependabot.yml` | weekly                         | Opens PRs for npm and GitHub Actions dependency updates         |

## Known limitations

A few things that are known but intentionally left as-is for now:

- `open-graph-scraper` is listed as a dependency but isn't used anywhere in `src/` — a candidate for removal.
- The Works page's "Product" section (`showWorksProduct` flag, currently `false`) still contains placeholder data (`github.com/yourname/...`); it needs either real project data or removal before ever being enabled.
- `showPersonalBlog` is fetched as a feature flag but no blog UI exists in the codebase — either build it out or drop the flag.
- `SkillBadges.tsx` has a `CATEGORIES` array cast with `as any` to work around a type mismatch with `UIKey`.
