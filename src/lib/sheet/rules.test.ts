import { describe, expect, it } from "vitest";
import { buildReportModel } from "./rules";
import type { ParsedSheetData } from "./types";

function baseData(overrides: Partial<ParsedSheetData> = {}): ParsedSheetData {
  return {
    banks: [],
    bankTotal: null,
    separateAccounts: [],
    otherCompanyAccounts: [],
    pccCheque: null,
    allTotal: null,
    shopSales: [],
    teamSales: [],
    salesTotal: null,
    fridayTotalSales: null,
    saturdayTotalSales: null,
    sundayTotalSales: null,
    previousDayTotalSales: null,
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

  it("maps the CASH row to the vault label", () => {
    const model = buildReportModel(baseData({ banks: [{ label: "CASH", amount: 1 }] }), new Date(2026, 7, 6));
    expect(model.banks).toEqual([{ label: "保險庫 (現金)", amount: 1 }]);
  });

  it("computes company cash as the sum of the bank rows (incl. vault cash), ignoring BANK TOTAL", () => {
    const model = buildReportModel(
      baseData({
        banks: [
          { label: "Dah Sing", amount: 28969 },
          { label: "HSBC", amount: 1376304.36 },
          { label: "CASH", amount: 90738.4 },
        ],
        bankTotal: 1,
      }),
      new Date(2026, 7, 6),
    );
    expect(model.companyCashTotal).toBeCloseTo(1496011.76, 5);
  });

  it("maps and totals separate accounts", () => {
    const model = buildReportModel(
      baseData({ separateAccounts: [{ label: "Fubon", amount: 2000000 }] }),
      new Date(2026, 7, 6),
    );
    expect(model.separateAccounts).toEqual([{ label: "富邦", amount: 2000000 }]);
    expect(model.separateAccountsTotal).toBe(2000000);
  });

  it("lists every other-company account in fixed order, null where the sheet has no value", () => {
    const model = buildReportModel(
      baseData({
        otherCompanyAccounts: [
          { label: "Shanghai Commercial Bank", amount: 5000 },
          { label: "Bank of Communication", amount: 2996.69 },
        ],
      }),
      new Date(2026, 7, 6),
    );
    expect(model.otherCompanyAccounts).toEqual([
      { label: "交通", amount: 2996.69 },
      { label: "螞蟻", amount: null },
      { label: "上海商業", amount: 5000 },
    ]);
  });

  it("leaves totals null when their section has no rows", () => {
    const model = buildReportModel(baseData(), new Date(2026, 7, 6));
    expect(model.companyCashTotal).toBeNull();
    expect(model.separateAccountsTotal).toBeNull();
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

  it("merges a legacy NIKI TEAM row (合和酒店) into JONATHAN TEAM", () => {
    const model = buildReportModel(
      baseData({
        teamSales: [
          { label: "OSCAR TEAM", amount: 533975, percent: 30.7845 },
          { label: "JONATHAN TEAM", amount: 252334, percent: 14.54745 },
          { label: "NIKI TEAM", amount: 15695, percent: 0.90484 },
        ],
      }),
      new Date(2026, 7, 6),
    );
    expect(model.teamSales.map((t) => t.label)).toEqual(["奧斯卡團隊", "港島南岸+合和中心+合和酒店"]);
    expect(model.teamSales[1].amount).toBe(268029);
    expect(model.teamSales[1].percent).toBeCloseTo(15.45229, 5);
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
