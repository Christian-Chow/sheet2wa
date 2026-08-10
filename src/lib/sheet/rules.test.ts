import { describe, expect, it } from "vitest";
import { buildReportModel } from "./rules";
import type { ParsedSheetData } from "./types";

function baseData(overrides: Partial<ParsedSheetData> = {}): ParsedSheetData {
  return {
    banks: [],
    bankTotal: null,
    cashTotal: null,
    amante: null,
    kei: null,
    extraAccounts: [],
    allTotal: null,
    shopSales: [],
    teamSales: [],
    salesTotal: null,
    ...overrides,
  };
}

describe("buildReportModel", () => {
  it("maps bank names using the configured mapping", () => {
    const model = buildReportModel(
      baseData({ banks: [{ label: "Dah Sing", amount: 100 }, { label: "HSBC", amount: 200 }] }),
      { month: 8, day: 6 },
    );
    expect(model.banks).toEqual([
      { label: "大新", amount: 100 },
      { label: "匯豐", amount: 200 },
    ]);
  });

  it("computes company cash as AMANTE + CASH TOTAL", () => {
    const model = buildReportModel(baseData({ amante: 845580.28, cashTotal: 4073 }), { month: 8, day: 6 });
    expect(model.companyCashTotal).toBeCloseTo(849653.28, 5);
  });

  it("leaves the company cash total null when either input is missing", () => {
    const model = buildReportModel(baseData({ amante: 845580.28, cashTotal: null }), { month: 8, day: 6 });
    expect(model.companyCashTotal).toBeNull();
  });

  it("reorders shop sales into the canonical display order regardless of input order", () => {
    const model = buildReportModel(
      baseData({
        shopSales: [
          { label: "HWH", amount: 1 },
          { label: "HQ", amount: 2 },
        ],
      }),
      { month: 8, day: 6 },
    );
    expect(model.shopSales.map((s) => s.label)).toEqual(["總部", "合和酒店"]);
  });

  it("prefers the sheet's own percentage for team sales", () => {
    const model = buildReportModel(
      baseData({
        teamSales: [{ label: "OSCAR TEAM", amount: 533975, percent: 30.7845 }],
      }),
      { month: 8, day: 6 },
    );
    expect(model.teamSales[0].percent).toBeCloseTo(30.7845, 5);
  });

  it("computes team percentage from totals when the sheet has no percentage column", () => {
    const model = buildReportModel(
      baseData({
        teamSales: [
          { label: "OSCAR TEAM", amount: 75, percent: null },
          { label: "VINCENT TEAM", amount: 25, percent: null },
        ],
      }),
      { month: 8, day: 6 },
    );
    expect(model.teamSales[0].percent).toBeCloseTo(75, 5);
    expect(model.teamSales[1].percent).toBeCloseTo(25, 5);
  });

  it("falls back to summing shop sales for the month total when SALES TOTAL is absent", () => {
    const model = buildReportModel(
      baseData({ shopSales: [{ label: "HQ", amount: 10 }, { label: "PP", amount: 20 }] }),
      { month: 8, day: 6 },
    );
    expect(model.monthSalesTotal).toBe(30);
  });
});
