import { describe, expect, it } from "vitest";
import { formatCurrency, formatPercent, parseNumber } from "./utils";

describe("parseNumber", () => {
  it("parses plain numbers", () => {
    expect(parseNumber("4073")).toBe(4073);
  });

  it("strips commas", () => {
    expect(parseNumber("3,717,224.72")).toBe(3717224.72);
  });

  it("strips a leading dollar sign", () => {
    expect(parseNumber("$30,059")).toBe(30059);
  });

  it("strips a trailing percent sign", () => {
    expect(parseNumber("30.78450%")).toBeCloseTo(30.7845, 5);
  });

  it("trims surrounding whitespace", () => {
    expect(parseNumber("  1,234.50  ")).toBe(1234.5);
  });

  it("returns null for blank or unparseable input", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("   ")).toBeNull();
    expect(parseNumber(undefined)).toBeNull();
    expect(parseNumber("N/A")).toBeNull();
  });
});

describe("formatCurrency", () => {
  it("adds thousands separators", () => {
    expect(formatCurrency(30059)).toBe("$30,059");
    expect(formatCurrency(3717224.72)).toBe("$3,717,224.72");
  });

  it("drops decimals for whole numbers", () => {
    expect(formatCurrency(0)).toBe("$0");
    expect(formatCurrency(4073)).toBe("$4,073");
  });

  it("trims a single trailing zero but keeps real cents", () => {
    expect(formatCurrency(615.3)).toBe("$615.3");
    expect(formatCurrency(24348.68)).toBe("$24,348.68");
  });
});

describe("formatPercent", () => {
  it("collapses an exact zero to a bare 0%", () => {
    expect(formatPercent(0)).toBe("0%");
  });

  it("truncates rather than rounds to 2 decimal places", () => {
    // 14.54745 rounds to 14.55 but the business rule here is truncation.
    expect(formatPercent(14.54745)).toBe("14.54%");
    expect(formatPercent(30.7845)).toBe("30.78%");
    expect(formatPercent(53.76321)).toBe("53.76%");
    expect(formatPercent(0.90484)).toBe("0.90%");
  });
});
