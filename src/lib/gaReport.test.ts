import { describe, expect, it } from "vitest";
import {
  buildPeriodComparison,
  calculatePercentChange,
  parseDailySessions,
  parseSummaryComparisonRows,
  parseSummaryRow,
  parseTopPages,
} from "./gaReport";

describe("parseSummaryRow", () => {
  it("extracts activeUsers/sessions/pageViews in order from the first row", () => {
    const result = parseSummaryRow([
      {
        metricValues: [{ value: "42" }, { value: "58" }, { value: "120" }],
      },
    ]);
    expect(result).toEqual({ activeUsers: 42, sessions: 58, pageViews: 120 });
  });

  it("defaults to zeros when there are no rows", () => {
    expect(parseSummaryRow(undefined)).toEqual({
      activeUsers: 0,
      sessions: 0,
      pageViews: 0,
    });
    expect(parseSummaryRow([])).toEqual({
      activeUsers: 0,
      sessions: 0,
      pageViews: 0,
    });
  });

  it("defaults missing individual metric values to zero", () => {
    expect(parseSummaryRow([{ metricValues: [{ value: "10" }] }])).toEqual({
      activeUsers: 10,
      sessions: 0,
      pageViews: 0,
    });
  });
});

describe("parseTopPages", () => {
  it("maps each row to a path/views pair", () => {
    const result = parseTopPages([
      {
        dimensionValues: [{ value: "/about" }],
        metricValues: [{ value: "30" }],
      },
      {
        dimensionValues: [{ value: "/works" }],
        metricValues: [{ value: "12" }],
      },
    ]);
    expect(result).toEqual([
      { path: "/about", views: 30 },
      { path: "/works", views: 12 },
    ]);
  });

  it("returns an empty array for no rows", () => {
    expect(parseTopPages(undefined)).toEqual([]);
    expect(parseTopPages([])).toEqual([]);
  });
});

describe("parseDailySessions", () => {
  it("maps and sorts rows chronologically by date", () => {
    const result = parseDailySessions([
      {
        dimensionValues: [{ value: "20260215" }],
        metricValues: [{ value: "5" }],
      },
      {
        dimensionValues: [{ value: "20260210" }],
        metricValues: [{ value: "3" }],
      },
      {
        dimensionValues: [{ value: "20260220" }],
        metricValues: [{ value: "8" }],
      },
    ]);
    expect(result.map((r) => r.date)).toEqual([
      "20260210",
      "20260215",
      "20260220",
    ]);
    expect(result[0].sessions).toBe(3);
  });

  it("returns an empty array for no rows", () => {
    expect(parseDailySessions(undefined)).toEqual([]);
  });
});

describe("parseSummaryComparisonRows", () => {
  it("splits rows tagged with the current/previous dateRange dimension", () => {
    const result = parseSummaryComparisonRows([
      {
        dimensionValues: [{ value: "previous" }],
        metricValues: [{ value: "10" }, { value: "20" }, { value: "30" }],
      },
      {
        dimensionValues: [{ value: "current" }],
        metricValues: [{ value: "40" }, { value: "50" }, { value: "60" }],
      },
    ]);
    expect(result).toEqual({
      current: { activeUsers: 40, sessions: 50, pageViews: 60 },
      previous: { activeUsers: 10, sessions: 20, pageViews: 30 },
    });
  });

  it("defaults missing periods to zeros", () => {
    expect(parseSummaryComparisonRows(undefined)).toEqual({
      current: { activeUsers: 0, sessions: 0, pageViews: 0 },
      previous: { activeUsers: 0, sessions: 0, pageViews: 0 },
    });
    expect(
      parseSummaryComparisonRows([
        {
          dimensionValues: [{ value: "current" }],
          metricValues: [{ value: "5" }, { value: "6" }, { value: "7" }],
        },
      ]),
    ).toEqual({
      current: { activeUsers: 5, sessions: 6, pageViews: 7 },
      previous: { activeUsers: 0, sessions: 0, pageViews: 0 },
    });
  });
});

describe("calculatePercentChange", () => {
  it("returns a positive percentage when current exceeds previous", () => {
    expect(calculatePercentChange(150, 100)).toBe(50);
  });

  it("returns a negative percentage when current is below previous", () => {
    expect(calculatePercentChange(75, 100)).toBe(-25);
  });

  it("returns 0 when both periods are zero (no divide-by-zero)", () => {
    expect(calculatePercentChange(0, 0)).toBe(0);
  });

  it("returns null when previous is zero but current isn't (undefined change)", () => {
    expect(calculatePercentChange(10, 0)).toBeNull();
  });
});

describe("buildPeriodComparison", () => {
  it("computes a GaMetricComparison per metric", () => {
    const result = buildPeriodComparison(
      { activeUsers: 120, sessions: 80, pageViews: 0 },
      { activeUsers: 100, sessions: 100, pageViews: 0 },
    );
    expect(result).toEqual({
      activeUsers: { current: 120, previous: 100, changePercent: 20 },
      sessions: { current: 80, previous: 100, changePercent: -20 },
      pageViews: { current: 0, previous: 0, changePercent: 0 },
    });
  });
});
