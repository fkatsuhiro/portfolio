#!/usr/bin/env node
// Reads the Playwright JSON reporter output produced by tests/a11y.spec.ts
// and writes a concise Markdown summary (page/locale -> violation count +
// rule ids) to $GITHUB_STEP_SUMMARY, so a reviewer sees axe-core results
// directly on the CI job page instead of having to dig through logs or
// download the HTML report.
//
// This script is purely additive reporting: it never changes the exit code
// of the test run, and it is safe to run with `if: always()` after the
// Playwright step so a summary is produced even when the suite fails.

import { readFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";

const RESULTS_PATH = resolve("test-results/results.json");

function loadJsonReport() {
  try {
    return JSON.parse(readFileSync(RESULTS_PATH, "utf8"));
  } catch (error) {
    console.error(`[a11y-report] Could not read ${RESULTS_PATH}: ${error}`);
    return null;
  }
}

// Playwright nests specs inside suites (one level per project / file /
// describe block), so walk the tree to flatten every spec out.
function collectSpecs(suite, acc) {
  for (const spec of suite.specs ?? []) {
    acc.push(spec);
  }
  for (const child of suite.suites ?? []) {
    collectSpecs(child, acc);
  }
  return acc;
}

function decodeAttachment(attachment) {
  if (!attachment?.body) return null;
  try {
    return JSON.parse(Buffer.from(attachment.body, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function buildRows(report) {
  const specs = (report.suites ?? []).flatMap((suite) =>
    collectSpecs(suite, []),
  );

  const rows = [];
  for (const spec of specs) {
    for (const test of spec.tests ?? []) {
      const lastResult = test.results?.at(-1);
      if (!lastResult) continue;

      const attachment = lastResult.attachments?.find(
        (a) => a.name === "axe-violations",
      );
      const data = decodeAttachment(attachment);
      if (!data) continue;

      rows.push({
        label: data.label,
        path: data.path,
        status: lastResult.status,
        violationCount: data.violationCount,
        ruleIds: data.violations.map((v) => v.id),
        violations: data.violations,
      });
    }
  }
  return rows;
}

function toMarkdown(rows) {
  if (rows.length === 0) {
    return [
      "## Accessibility (axe-core) report",
      "",
      "_No a11y results were found in `test-results/results.json` — check the job log above for details._",
      "",
    ].join("\n");
  }

  const totalViolations = rows.reduce((sum, r) => sum + r.violationCount, 0);
  const failing = rows.filter((r) => r.violationCount > 0);

  const lines = [
    "## Accessibility (axe-core) report",
    "",
    failing.length === 0
      ? `✅ No violations across ${rows.length} page/locale check(s).`
      : `❌ ${totalViolations} violation(s) across ${failing.length}/${rows.length} page/locale check(s).`,
    "",
    "| Page | Status | Violations | Rule IDs |",
    "| --- | --- | --- | --- |",
  ];

  for (const row of rows) {
    const statusIcon = row.violationCount === 0 ? "✅ pass" : "❌ fail";
    const ruleIds = row.ruleIds.length > 0 ? row.ruleIds.join(", ") : "—";
    lines.push(
      `| ${row.label} (\`${row.path}\`) | ${statusIcon} | ${row.violationCount} | ${ruleIds} |`,
    );
  }

  if (failing.length > 0) {
    lines.push("", "### Violation details", "");
    for (const row of failing) {
      lines.push(`**${row.label} (\`${row.path}\`)**`, "");
      for (const v of row.violations) {
        lines.push(
          `- \`${v.id}\` [${v.impact ?? "unknown"}] ${v.help} — ${v.nodes} node(s). [Learn more](${v.helpUrl})`,
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

const report = loadJsonReport();
const rows = report ? buildRows(report) : [];
const markdown = toMarkdown(rows);

const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) {
  appendFileSync(summaryFile, markdown + "\n");
  console.log("[a11y-report] Summary written to GITHUB_STEP_SUMMARY.");
} else {
  console.log(markdown);
}
