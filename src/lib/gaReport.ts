import { BetaAnalyticsDataClient } from "@google-analytics/data";

// This module is only ever imported from .astro frontmatter (server-side,
// build-time execution), never from a client:* component — the service
// account credentials it reads must never reach the browser bundle.

export interface GaTopPage {
  path: string;
  views: number;
}

export interface GaDailySessions {
  date: string; // YYYYMMDD, as returned by the GA4 API
  sessions: number;
}

export interface GaSummaryMetrics {
  activeUsers: number;
  sessions: number;
  pageViews: number;
}

/**
 * A single metric's current vs. previous period values, plus the
 * percentage change between them (see `calculatePercentChange`).
 */
export interface GaMetricComparison {
  current: number;
  previous: number;
  changePercent: number | null;
}

export interface GaPeriodComparison {
  activeUsers: GaMetricComparison;
  sessions: GaMetricComparison;
  pageViews: GaMetricComparison;
}

export interface GaReportData {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  topPages: GaTopPage[];
  dailySessions: GaDailySessions[];
  /** Current period vs. the immediately preceding period of equal length. */
  comparison: GaPeriodComparison;
}

interface ReportRow {
  dimensionValues?: ({ value?: string | null } | null)[] | null;
  metricValues?: ({ value?: string | null } | null)[] | null;
}

/** The `dateRange.name` values used when requesting two date ranges in a single `runReport` call. */
const CURRENT_RANGE_NAME = "current";
const PREVIOUS_RANGE_NAME = "previous";

export function parseSummaryRow(rows: ReportRow[] | null | undefined): {
  activeUsers: number;
  sessions: number;
  pageViews: number;
} {
  const values = rows?.[0]?.metricValues ?? [];
  return {
    activeUsers: Number(values[0]?.value ?? 0),
    sessions: Number(values[1]?.value ?? 0),
    pageViews: Number(values[2]?.value ?? 0),
  };
}

/**
 * Splits summary rows that mix two date ranges (tagged via the implicit
 * `dateRange` dimension GA4 appends when a request has multiple
 * `dateRanges`) into their current-period and previous-period metrics.
 */
export function parseSummaryComparisonRows(
  rows: ReportRow[] | null | undefined,
): { current: GaSummaryMetrics; previous: GaSummaryMetrics } {
  const list = rows ?? [];
  const currentRow = list.find(
    (row) => row.dimensionValues?.[0]?.value === CURRENT_RANGE_NAME,
  );
  const previousRow = list.find(
    (row) => row.dimensionValues?.[0]?.value === PREVIOUS_RANGE_NAME,
  );

  return {
    current: parseSummaryRow(currentRow ? [currentRow] : []),
    previous: parseSummaryRow(previousRow ? [previousRow] : []),
  };
}

/**
 * Percentage change from `previous` to `current`, e.g. 25 means +25%.
 * Returns `null` when `previous` is 0 and `current` isn't (an undefined /
 * infinite percentage), and 0 when both are 0 (no change).
 */
export function calculatePercentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / previous) * 100;
}

export function buildPeriodComparison(
  current: GaSummaryMetrics,
  previous: GaSummaryMetrics,
): GaPeriodComparison {
  return {
    activeUsers: {
      current: current.activeUsers,
      previous: previous.activeUsers,
      changePercent: calculatePercentChange(
        current.activeUsers,
        previous.activeUsers,
      ),
    },
    sessions: {
      current: current.sessions,
      previous: previous.sessions,
      changePercent: calculatePercentChange(
        current.sessions,
        previous.sessions,
      ),
    },
    pageViews: {
      current: current.pageViews,
      previous: previous.pageViews,
      changePercent: calculatePercentChange(
        current.pageViews,
        previous.pageViews,
      ),
    },
  };
}

export function parseTopPages(
  rows: ReportRow[] | null | undefined,
): GaTopPage[] {
  return (rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "/",
    views: Number(row.metricValues?.[0]?.value ?? 0),
  }));
}

export function parseDailySessions(
  rows: ReportRow[] | null | undefined,
): GaDailySessions[] {
  return (rows ?? [])
    .map((row) => ({
      date: row.dimensionValues?.[0]?.value ?? "",
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetches a small GA4 report (last 28 days) using a service account.
 * Returns null when credentials aren't configured, or when the request
 * fails for any reason — callers should render a "not connected" state
 * rather than treat this as fatal.
 */
export async function fetchGaReport(): Promise<GaReportData | null> {
  const propertyId = import.meta.env.GA_PROPERTY_ID;
  const clientEmail = import.meta.env.GA_CLIENT_EMAIL;
  const privateKey = import.meta.env.GA_PRIVATE_KEY;

  if (!propertyId || !clientEmail || !privateKey) {
    return null;
  }

  try {
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
    });

    const property = `properties/${propertyId}`;
    // "Current period" keeps its existing meaning (last 28 days). The
    // comparison period is the immediately preceding 29-day window, i.e.
    // the 29 days ending the day before the current period starts.
    const dateRanges = [{ startDate: "28daysAgo", endDate: "today" }];
    const comparisonDateRanges = [
      { startDate: "28daysAgo", endDate: "today", name: CURRENT_RANGE_NAME },
      {
        startDate: "57daysAgo",
        endDate: "29daysAgo",
        name: PREVIOUS_RANGE_NAME,
      },
    ];

    const [[summary], [topPagesReport], [dailyReport]] = await Promise.all([
      client.runReport({
        property,
        dateRanges: comparisonDateRanges,
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 8,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }],
      }),
    ]);

    const { current, previous } = parseSummaryComparisonRows(
      summary.rows as ReportRow[] | undefined,
    );

    return {
      ...current,
      topPages: parseTopPages(topPagesReport.rows as ReportRow[] | undefined),
      dailySessions: parseDailySessions(
        dailyReport.rows as ReportRow[] | undefined,
      ),
      comparison: buildPeriodComparison(current, previous),
    };
  } catch (error) {
    console.error("Failed to fetch GA4 report:", error);
    return null;
  }
}
