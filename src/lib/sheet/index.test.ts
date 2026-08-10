import { describe, expect, it } from "vitest";
import { generateWhatsAppMessage } from "./index";

const EXAMPLE_INPUT = [
  "BANK",
  "Dah Sing\t30,059.00",
  "HSBC\t3,717,224.72",
  "Fubon\t24,348.68",
  "BANK TOTAL\t3,771,632.40",
  "",
  "CASH TOTAL\t4,073.00",
  "",
  "SEPARATE ACCOUNTS",
  "AMANTE\t845,580.28",
  "KEI\t2,926,052.12",
  "",
  "ALL TOTAL\t3,775,705.40",
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

// 2026-08-06 is a Thursday, so cigar sales fall back to a single "yesterday" line.
const THURSDAY = new Date(2026, 7, 6);

const EXPECTED_MESSAGE = [
  "2026.08.06\n愛德集團",
  "",
  "1) 大新 : $30,059\n2) 匯豐 : $3,717,224.72\n3) 富邦 : $24,348.68",
  "",
  "總港幣現金在戶口屬公司 : $845,580.28\n總港幣現金在保險庫共 : $4,073\n總港幣屬公司共 : $849,653.28",
  "",
  "分隔戶口 : $2,926,052.12",
  "",
  "總港幣共 : $3,775,705.4",
  "",
  "4)交通 : \n5)螞蟻 : \n6)上海商業 : ",
  "",
  "---",
  "",
  [
    "8月份業績",
    "-----------雪茄銷售---------",
    "總部 : $0",
    "太古廣場 : $242,379",
    "圓方 : $291,596",
    "海港城 : $454,738",
    "K11M : $477,816",
    "港島南岸 : $154,720",
    "合和 : $97,614",
    "合和酒店 : $15,695",
  ].join("\n"),
  "",
  [
    "總部 : $0 (0%)",
    "奧斯卡團隊 : $533,975 (30.78%)",
    "溫信團隊 : $932,554 (53.76%)",
    "港島南岸+合和中心 : $252,334 (14.54%)",
    "合和酒店 : $15,695 (0.90%)",
  ].join("\n"),
  "",
  "[8月5號雪茄總業績 : ]\n8月份所有銷售總數 : $1,734,558",
].join("\n");

describe("generateWhatsAppMessage", () => {
  it("produces the exact WhatsApp message for the documented example input", () => {
    const result = generateWhatsAppMessage(EXAMPLE_INPUT, THURSDAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toBe(EXPECTED_MESSAGE);
    expect(result.rowCount).toBe(3 + 8 + 5 + 1 + 1); // banks + shop + team + amante + kei
  });

  it("changes the date header, month/day labels, and grand total when a different date is passed in", () => {
    // 2026-03-21 is a Saturday, so yesterday is 2026-03-20.
    const result = generateWhatsAppMessage(EXAMPLE_INPUT, new Date(2026, 2, 21));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toContain("2026.03.21\n愛德集團");
    expect(result.message).toContain("3月份業績");
    expect(result.message).toContain("[3月20號雪茄總業績 : ]");
    expect(result.message).toContain("總港幣共 : $3,775,705.4");
  });

  it("lists last Friday, last Saturday, and yesterday's cigar sales when today is Monday", () => {
    // 2026-08-10 is a Monday.
    const result = generateWhatsAppMessage(EXAMPLE_INPUT, new Date(2026, 7, 10));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toContain(
      "[8月7號雪茄總業績 : ]\n[8月8號雪茄總業績 : ]\n[8月9號雪茄總業績 : ]\n8月份所有銷售總數 : $1,734,558",
    );
  });

  it("always lists the fixed misc accounts below 總港幣共, blank for manual filling, regardless of sheet content", () => {
    const result = generateWhatsAppMessage(EXAMPLE_INPUT, THURSDAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toContain("總港幣共 : $3,775,705.4\n\n4)交通 : \n5)螞蟻 : \n6)上海商業 : ");

    // Even if the sheet happens to carry rows with these exact labels, the fixed
    // block still wins: their amounts are never parsed into it.
    const input = EXAMPLE_INPUT.replace(
      "KEI\t2,926,052.12",
      ["KEI\t2,926,052.12", "交通\t2,996.69", "螞蟻\t615.3", "上海商業\t5,000"].join("\n"),
    );
    const result2 = generateWhatsAppMessage(input, THURSDAY);
    expect(result2.ok).toBe(true);
    if (!result2.ok) return;
    expect(result2.message).toContain("4)交通 : \n5)螞蟻 : \n6)上海商業 : ");
  });

  it("omits the fixed misc-accounts block when there's no grand total to anchor it to", () => {
    const input = ["BANK", "Dah Sing\t30,059.00"].join("\n");
    const result = generateWhatsAppMessage(input, THURSDAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).not.toContain("交通");
  });

  it("omits blocks whose underlying data is missing instead of crashing", () => {
    const input = ["BANK", "Dah Sing\t30,059.00"].join("\n");
    const result = generateWhatsAppMessage(input, THURSDAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toBe("2026.08.06\n愛德集團\n\n1) 大新 : $30,059");
  });

  it("returns a validation error for empty input", () => {
    const result = generateWhatsAppMessage("");
    expect(result).toEqual({ ok: false, errorCode: "EMPTY_INPUT" });
  });

  it("returns a validation error when no known section is found", () => {
    const result = generateWhatsAppMessage("hello\tworld\nfoo\tbar");
    expect(result).toEqual({ ok: false, errorCode: "NO_RECOGNIZABLE_DATA" });
  });
});
