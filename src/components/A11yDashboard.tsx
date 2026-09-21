import { Fragment, useEffect, useState } from "react";
import axe from "axe-core";
import { a11yRoutes } from "../lib/a11yRoutes";

type Status = "pending" | "loading" | "scanning" | "done" | "error";

interface RouteResult {
  status: Status;
  violations: axe.Result[];
  error?: string;
}

const IMPACT_ORDER: NonNullable<axe.ImpactValue>[] = [
  "critical",
  "serious",
  "moderate",
  "minor",
];

const IMPACT_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  serious:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  moderate:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  minor: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function initialResults(): Record<string, RouteResult> {
  return Object.fromEntries(
    a11yRoutes.map((r) => [r.path, { status: "pending", violations: [] }]),
  );
}

function loadIframe(
  src: string,
  timeoutMs = 20000,
): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.width = "1280";
    iframe.height = "900";
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    iframe.style.position = "absolute";
    iframe.style.left = "-99999px";
    iframe.style.top = "0";

    const timeout = window.setTimeout(() => {
      reject(new Error("Timed out loading the page"));
    }, timeoutMs);

    iframe.onload = () => {
      window.clearTimeout(timeout);
      resolve(iframe);
    };
    iframe.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Failed to load the page"));
    };

    document.body.appendChild(iframe);
  });
}

export default function A11yDashboard() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const [results, setResults] =
    useState<Record<string, RouteResult>>(initialResults);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setResults(initialResults());
    setExpanded(null);

    async function scanAll() {
      for (const route of a11yRoutes) {
        if (cancelled) return;
        setResults((prev) => ({
          ...prev,
          [route.path]: { status: "loading", violations: [] },
        }));

        let iframe: HTMLIFrameElement | null = null;
        try {
          iframe = await loadIframe(`${basePath}${route.path}`);
          // Give client:* islands (Timeline, WorksTabs, etc.) time to hydrate.
          await new Promise((r) => setTimeout(r, 800));
          if (cancelled) break;

          setResults((prev) => ({
            ...prev,
            [route.path]: { status: "scanning", violations: [] },
          }));

          const doc = iframe.contentDocument;
          const win = iframe.contentWindow as
            | (Window & { axe?: typeof axe })
            | null;
          if (!doc || !win)
            throw new Error("Could not access the page's document");

          // axe can't scan a foreign Document from the parent realm directly
          // (cross-realm instanceof checks fail), so inject axe-core's own
          // source into the iframe and run it there instead.
          await new Promise<void>((resolve, reject) => {
            const script = doc.createElement("script");
            script.textContent = axe.source;
            script.onerror = () =>
              reject(new Error("Failed to inject axe-core"));
            doc.body.appendChild(script);
            resolve();
          });

          if (!win.axe)
            throw new Error("axe-core did not initialize in the page");

          const axeResults = await win.axe.run(doc, {
            resultTypes: ["violations"],
          });

          if (!cancelled) {
            setResults((prev) => ({
              ...prev,
              [route.path]: {
                status: "done",
                violations: axeResults.violations,
              },
            }));
          }
        } catch (err) {
          if (!cancelled) {
            setResults((prev) => ({
              ...prev,
              [route.path]: {
                status: "error",
                violations: [],
                error: err instanceof Error ? err.message : String(err),
              },
            }));
          }
        } finally {
          iframe?.remove();
        }
      }
    }

    scanAll();
    return () => {
      cancelled = true;
    };
  }, [basePath, runId]);

  const allDone = a11yRoutes.every(
    (r) =>
      results[r.path]?.status === "done" || results[r.path]?.status === "error",
  );

  const totalsByImpact: Record<string, number> = {};
  for (const impact of IMPACT_ORDER) totalsByImpact[impact] = 0;
  let pagesWithViolations = 0;
  for (const route of a11yRoutes) {
    const violations = results[route.path]?.violations ?? [];
    if (violations.length > 0) pagesWithViolations += 1;
    for (const v of violations) {
      const impact = v.impact ?? "minor";
      totalsByImpact[impact] = (totalsByImpact[impact] ?? 0) + 1;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Accessibility Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Runs axe-core against every page of the site (ja/en/ko), live, in your
          browser. This page is intentionally not linked from the site
          navigation and is excluded from the sitemap.
        </p>
        <button
          type="button"
          onClick={() => setRunId((n) => n + 1)}
          disabled={!allDone}
          className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {allDone ? "Re-run scan" : "Scanning…"}
        </button>
      </header>

      <section aria-label="Summary" className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {pagesWithViolations}/{a11yRoutes.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              pages with issues
            </div>
          </div>
          {IMPACT_ORDER.map((impact) => (
            <div
              key={impact}
              className="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
            >
              <div className="text-2xl font-black text-gray-900 dark:text-white">
                {totalsByImpact[impact]}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {impact}
              </div>
            </div>
          ))}
        </div>
      </section>

      <table className="w-full text-left border-collapse">
        <caption className="sr-only">
          Accessibility scan results per page
        </caption>
        <thead>
          <tr className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
            <th scope="col" className="py-2 pr-4">
              Page
            </th>
            <th scope="col" className="py-2 pr-4">
              Status
            </th>
            <th scope="col" className="py-2">
              Violations
            </th>
          </tr>
        </thead>
        <tbody>
          {a11yRoutes.map((route) => {
            const result = results[route.path] ?? {
              status: "pending" as Status,
              violations: [],
            };
            const isExpanded = expanded === route.path;
            return (
              <Fragment key={route.path}>
                <tr className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {route.label}
                    </div>
                    <a
                      href={`${basePath}${route.path}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {route.path}
                    </a>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-400">
                    {result.status === "error" ? (
                      <span title={result.error}>error</span>
                    ) : (
                      result.status
                    )}
                  </td>
                  <td className="py-3">
                    {result.violations.length === 0 ? (
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">
                        {result.status === "done" ? "No violations" : "—"}
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpanded(isExpanded ? null : route.path)
                        }
                        className="flex flex-wrap items-center gap-1.5 text-sm"
                      >
                        {result.violations.map((v) => (
                          <span
                            key={v.id}
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              IMPACT_STYLES[v.impact ?? "minor"]
                            }`}
                          >
                            {v.id} ({v.nodes.length})
                          </span>
                        ))}
                      </button>
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={3} className="pb-4">
                      <ul className="space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-800">
                        {result.violations.map((v) => (
                          <li key={v.id} className="text-sm">
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              [{v.impact}] {v.help}
                            </div>
                            <a
                              href={v.helpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {v.helpUrl}
                            </a>
                            <ul className="mt-1 space-y-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {v.nodes.map((node, i) => (
                                <li key={i}>{node.target.join(" ")}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
