# Astro Starter Kit: Basics

```sh
pnpm create astro@latest -- --template basics
```

## 🛠 Tech Stack

- **Framework**: [Astro](https://astro.build/) (v5.x)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Testing**: [Playwright](https://playwright.dev/)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   └── pages/
├── tests/
├── public/
├── playwright.config.ts
└── astro.config.mjs
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4323`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## 🧪 E2E Testing (Playwright)

To ensure high quality and reliability, I have integrated [Playwright](https://playwright.dev/) to automate regression testing for major user flows.

### Test Coverage

- **Page Integrity**: Verifies that all core pages (Index, About, Blogs, Talks) render correctly without errors.
- **Dynamic Logic**: Validates the accuracy of the blog list sorting functionality (Newest/Oldest).
- **External Data Integration**: Ensures OGP data for Zenn articles is successfully fetched and displayed.
- **Visual Quality**: Confirms text visibility in **Dark Mode** and validates responsiveness across Mobile and Desktop viewports.

### Commands

**Run all tests in headless mode:**

```sh
pnpm playwright test
```

**Run tests in UI mode:**

```
pnpm playwringht test --ui
```
