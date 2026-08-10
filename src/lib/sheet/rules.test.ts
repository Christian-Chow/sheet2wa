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
      new Date(2026, 7, 6),
    );
    expect(model.banks).toEqual([
      { label: "大新", amount: 100 },
      { label: "匯豐", amount: 200 },
    ]);
  });

  it("computes company cash as AMANTE + CASH TOTAL", () => {
    const model = buildReportModel(baseData({ amante: 845580.28, cashTotal: 4073 }), new Date(2026, 7, 6));
    expect(model.companyCashTotal).toBeCloseTo(849653.28, 5);
  });

  it("leaves the company cash total null when either input is missing", () => {
    const model = buildReportModel(baseData({ amante: 845580.28, cashTotal: null }), new Date(2026, 7, 6));
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
      new Date(2026, 7, 6),
    );
    expect(model.shopSales.map((s) => s.label)).toEqual(["總部", "合和酒店"]);
  });

  it("prefers the sheet's own percentage for team sales", () => {
    const model = buildReportModel(
      baseData({
        teamSales: [{ label: "OSCAR TEAM", amount: 533975, percent: 30.7845 }],
      }),
      new Date(2026, 7, 6),
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
      new Date(2026, 7, 6),
    );
    expect(model.teamSales[0].percent).toBeCloseTo(75, 5);
    expect(model.teamSales[1].percent).toBeCloseTo(25, 5);
  });

  it("falls back to summing shop sales for the month total when SALES TOTAL is absent", () => {
    const model = buildReportModel(
      baseData({ shopSales: [{ label: "HQ", amount: 10 }, { label: "PP", amount: 20 }] }),
      new Date(2026, 7, 6),
    );
    expect(model.monthSalesTotal).toBe(30);
  });

  it("formats today's date header, independent of the ALL TOTAL value", () => {
    const model = buildReportModel(baseData({ allTotal: 999999 }), new Date(2026, 7, 10));
    expect(model.dateHeader).toBe("2026.08.10");
  });

  it("computes the grand total as separateAccountsTotal (KEI) + companyCashTotal, ignoring ALL TOTAL", () => {
    const model = buildReportModel(
      baseData({ kei: 2926052.12, amante: 372165.25, cashTotal: 47943, allTotal: 1 }),
      new Date(2026, 7, 10),
    );
    expect(model.companyCashTotal).toBeCloseTo(420108.25, 5);
    expect(model.grandTotal).toBeCloseTo(3346160.37, 5);
  });

  it("leaves the grand total null when either input is missing", () => {
    const model = buildReportModel(baseData({ kei: null, amante: 1, cashTotal: 1 }), new Date(2026, 7, 10));
    expect(model.grandTotal).toBeNull();
  });

  it("uses only yesterday's date for cigar sales on a non-Monday", () => {
    const model = buildReportModel(baseData(), new Date(2026, 7, 6)); // Thursday
    expect(model.cigarSalesDates).toEqual([{ month: 8, day: 5 }]);
  });

  it("uses last Friday, last Saturday, and yesterday (Sunday) when today is Monday", () => {
    const model = buildReportModel(baseData(), new Date(2026, 7, 10)); // Monday
    expect(model.cigarSalesDates).toEqual([
      { month: 8, day: 7 },
      { month: 8, day: 8 },
      { month: 8, day: 9 },
    ]);
  });

  it("spans a month boundary correctly when Monday falls early in the month", () => {
    const model = buildReportModel(baseData(), new Date(2026, 7, 3)); // Monday Aug 3, 2026
    expect(model.cigarSalesDates).toEqual([
      { month: 7, day: 31 },
      { month: 8, day: 1 },
      { month: 8, day: 2 },
    ]);
  });
});
