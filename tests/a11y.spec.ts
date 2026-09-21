import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { a11yRoutes } from "../src/lib/a11yRoutes";

test.describe("Accessibility (axe)", () => {
  for (const { path, label } of a11yRoutes) {
    test(`${label} has no accessibility violations`, async ({ page }) => {
      await page.goto(`/portfolio${path}`);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(
        results.violations,
        results.violations
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s)) — ${v.helpUrl}`,
          )
          .join("\n"),
      ).toEqual([]);
    });
  }
});
