import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { a11yRoutes } from "../src/lib/a11yRoutes";

test.describe("Accessibility (axe)", () => {
  for (const { path, label } of a11yRoutes) {
    test(`${label} has no accessibility violations`, async ({
      page,
    }, testInfo) => {
      await page.goto(`/portfolio${path}`);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Attach the violation detail as test metadata *before* asserting, so
      // it's captured by the Playwright JSON reporter (and available to the
      // CI job-summary step) even when the assertion below fails. This is
      // additive reporting only — it does not change the pass/fail gate.
      await testInfo.attach("axe-violations", {
        body: JSON.stringify({
          path,
          label,
          violationCount: results.violations.length,
          violations: results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            helpUrl: v.helpUrl,
            nodes: v.nodes.length,
          })),
        }),
        contentType: "application/json",
      });

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
