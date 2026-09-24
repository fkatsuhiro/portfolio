import { describe, expect, it } from "vitest";
import { parseDailySessions, parseSummaryRow, parseTopPages } from "./gaReport";

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
