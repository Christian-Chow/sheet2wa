import { describe, expect, it } from "vitest";
import { parseSheet } from "./parser";

const EXAMPLE_INPUT = [
  "AMANTE BANK",
  "Dah Sing\t28,969.00",
  "HSBC\t1,376,304.36",
  "CASH \t90,738.40",
  "BANK TOTAL\t1,496,011.76",
  "",
  "SEPARATE ACCOUNTS",
  "Fubon\t2,000,000.00",
  "",
  "ALL TOTAL\t3,496,011.76",
  "",
  "SHOP SALES",
  "HQ\t0.00",
  "PP\t242,379.00",
  "EMS\t291,596.00",
  "OC\t454,738.00",
  "K11\t477,816.00",
  "SS\t154,720.00",
  "HW\t97,614.00",
  "HWH\t15,695.00",
  "",
  "HQ TEAM\t0.00\t0.00000%",
  "OSCAR TEAM\t533,975.00\t30.78450%",
  "VINCENT TEAM\t932,554.00\t53.76321%",
  "JONATHAN TEAM\t252,334.00\t14.54745%",
  "NIKI TEAM\t15,695.00\t0.90484%",
  "",
  "SALES TOTAL\t1,734,558.00",
].join("\n");

describe("parseSheet", () => {
  it("returns EMPTY_INPUT for blank input", () => {
    const result = parseSheet("   \n\n  ");
    expect(result).toEqual({ ok: false, errorCode: "EMPTY_INPUT" });
  });

  it("returns NO_RECOGNIZABLE_DATA when nothing matches known sections", () => {
    const result = parseSheet("just\tsome\trandom\ttext\nwith no known headings\t1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errorCode).toBe("NO_RECOGNIZABLE_DATA");
  });

  it("parses the full example sheet by section labels", () => {
    const result = parseSheet(EXAMPLE_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.banks).toEqual([
      { label: "Dah Sing", amount: 28969 },
      { label: "HSBC", amount: 1376304.36 },
      { label: "CASH", amount: 90738.4 },
    ]);
    expect(result.data.bankTotal).toBe(1496011.76);
    expect(result.data.separateAccounts).toEqual([{ label: "Fubon", amount: 2000000 }]);
    expect(result.data.allTotal).toBe(3496011.76);
    expect(result.data.shopSales).toHaveLength(8);
    expect(result.data.shopSales[0]).toEqual({ label: "HQ", amount: 0 });
    expect(result.data.teamSales).toHaveLength(5);
    expect(result.data.teamSales[3]).toEqual({
      label: "JONATHAN TEAM",
      amount: 252334,
      percent: expect.closeTo(14.54745, 5),
    });
    expect(result.data.salesTotal).toBe(1734558);
  });

  it("still accepts a plain BANK heading", () => {
    const result = parseSheet(["BANK", "HSBC\t100"].join("\n"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.banks).toEqual([{ label: "HSBC", amount: 100 }]);
  });

  it("detects team rows by their TEAM suffix even without an explicit TEAM SALES heading", () => {
    const input = [
      "SHOP SALES",
      "HQ\t100",
      "OSCAR TEAM\t533,975.00\t30.78%",
    ].join("\n");

    const result = parseSheet(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.shopSales).toEqual([{ label: "HQ", amount: 100 }]);
    expect(result.data.teamSales).toEqual([
      { label: "OSCAR TEAM", amount: 533975, percent: expect.closeTo(30.78, 5) },
    ]);
  });

  it("ignores blank rows and tolerates extra whitespace around cells", () => {
    const input = ["BANK", "  Dah Sing  \t  30,059.00  ", "", "   ", "HSBC\t3,717,224.72"].join("\n");
    const result = parseSheet(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.banks).toEqual([
      { label: "Dah Sing", amount: 30059 },
      { label: "HSBC", amount: 3717224.72 },
    ]);
  });
});
