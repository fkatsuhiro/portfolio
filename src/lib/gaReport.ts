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

export interface GaReportData {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  topPages: GaTopPage[];
  dailySessions: GaDailySessions[];
}

interface ReportRow {
  dimensionValues?: ({ value?: string | null } | null)[] | null;
  metricValues?: ({ value?: string | null } | null)[] | null;
}

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
    const dateRanges = [{ startDate: "28daysAgo", endDate: "today" }];

    const [[summary], [topPagesReport], [dailyReport]] = await Promise.all([
      client.runReport({
        property,
        dateRanges,
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

    return {
      ...parseSummaryRow(summary.rows as ReportRow[] | undefined),
      topPages: parseTopPages(topPagesReport.rows as ReportRow[] | undefined),
      dailySessions: parseDailySessions(
        dailyReport.rows as ReportRow[] | undefined,
      ),
    };
  } catch (error) {
    console.error("Failed to fetch GA4 report:", error);
    return null;
  }
}
