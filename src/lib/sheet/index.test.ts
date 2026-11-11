import { describe, expect, it } from "vitest";
import { generateWhatsAppMessage } from "./index";

const EXAMPLE_INPUT = [
  "AMANTE BANK\t",
  "Dah Sing\t28,969.00",
  "HSBC\t1,376,304.36",
  "CASH \t90,738.40",
  "BANK TOTAL\t1,496,011.76",
  "PCC Cheque\t1,392,681.39",
  "\t",
  "SEPARATE ACCOUNTS\t",
  "Fubon\t2,000,000.00",
  "\t",
  "OTHER COMPANY ACCOUNTS\t",
  "Bank of Communication\t2,996.69",
  "Ant Bank\t615.30",
  "Shanghai Commercial Bank\t5,000.00",
  "\t",
  "SHOP SALES\t",
  "HQ\t109,440.00",
  "PP\t302,674.00",
  "EMS\t508,489.00",
  "OC\t536,063.00",
  "K11\t598,733.00",
  "SS\t180,091.00",
  "HW\t133,603.00",
  "HWH\t45,467.00",
  "\t",
  "HQ TEAM\t109,440.00",
  "OSCAR TEAM\t811,163.00",
  "VINCENT TEAM\t1,134,796.00",
  "JONATHAN TEAM\t359,161.00",
  "\t",
  "\t",
  "Friday Total Sales\t",
  "Saturday Total Sales\t",
  "Sunday Total Sales\t",
  "Previous Day Total Sales\t242,570.00",
  "\t",
  "SALES TOTAL\t2,414,560.00",
].join("\n");

// 2026-08-06 is a Thursday, so cigar sales fall back to a single "yesterday" line.
const THURSDAY = new Date(2026, 7, 6);

const ACCOUNTS_SECTION = [
  "2026.08.06",
  "*愛德集團*",
  "1) 大新 : $28,969",
  "2) 匯豐 : $1,376,304.36",
  "3) 保險庫 (現金) : $90,738.4",
  "*總港幣屬公司共 : $1,496,011.76*",
  "[太平洋雪茄尚未扣帳支票總共 : $1,392,681.39]",
  "____________________",
  "分隔戶口",
  "4) 富邦 : $2,000,000",
  "*總港幣屬分隔戶口共 : $2,000,000*",
  "____________________",
  "其他公司戶口",
  "5) 交通 : $2,996.69",
  "6) 螞蟻 : $615.3",
  "7) 上海商業 : $5,000",
].join("\n");

const EXPECTED_MESSAGE = [
  ACCOUNTS_SECTION,
  "____________________",
  [
    "*雪茄銷售業績*",
    "8月份",
    "總部 : $109,440",
    "太古廣場 : $302,674",
    "圓方 : $508,489",
    "海港城 : $536,063",
    "K11M : $598,733",
    "港島南岸 : $180,091",
    "合和 : $133,603",
    "合和酒店 : $45,467",
  ].join("\n"),
  "",
  [
    "總部 : $109,440 (4.53%)",
    "奧斯卡團隊 : $811,163 (33.59%)",
    "溫信團隊 : $1,134,796 (46.99%)",
    "港島南岸+合和中心+合和酒店 : $359,161 (14.87%)",
  ].join("\n"),
  "",
  "[8月5號雪茄總業績 : $242,570]\n*8月份所有銷售總數 : $2,414,560*",
].join("\n");

describe("generateWhatsAppMessage", () => {
  it("produces the exact WhatsApp message for the documented example input", () => {
    const result = generateWhatsAppMessage(EXAMPLE_INPUT, THURSDAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toBe(EXPECTED_MESSAGE);
    expect(result.rowCount).toBe(3 + 1 + 1 + 3 + 8 + 4); // banks (incl. cash) + PCC cheque + separate + other company + shop + team
  });

  it("changes the date header, month/day labels, and grand total when a different date is passed in", () => {
    // 2026-03-21 is a Saturday, so yesterday is 2026-03-20.
    const result = generateWhatsAppMessage(EXAMPLE_INPUT, new Date(2026, 2, 21));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toContain("2026.03.21\n*愛德集團*");
    expect(result.message).toContain("*雪茄銷售業績*\n3月份\n");
    expect(result.message).toContain("[3月20號雪茄總業績 : $242,570]");
  });

  it("lists last Friday, last Saturday, and yesterday's cigar sales when today is Monday", () => {
    // 2026-08-10 is a Monday.
    const result = generateWhatsAppMessage(EXAMPLE_INPUT, new Date(2026, 7, 10));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toContain(
      "[8月7號雪茄總業績 : ]\n[8月8號雪茄總業績 : ]\n[8月9號雪茄總業績 : ]\n*8月份所有銷售總數 : $2,414,560*",
    );
  });

  it("leaves an other-company account or the PCC cheque blank when the sheet has no value for it", () => {
    const input = EXAMPLE_INPUT.replace("PCC Cheque\t1,392,681.39", "PCC Cheque\t").replace("Ant Bank\t615.30", "Ant Bank\t");
    const result = generateWhatsAppMessage(input, THURSDAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toContain("[太平洋雪茄尚未扣帳支票總共 : ]");
    expect(result.message).toContain("其他公司戶口\n5) 交通 : $2,996.69\n6) 螞蟻 : \n7) 上海商業 : $5,000");
  });

  it("still picks out the known other-company accounts when the OTHER COMPANY ACCOUNTS heading is missing", () => {
    const input = EXAMPLE_INPUT.replace("OTHER COMPANY ACCOUNTS\t\n", "");
    const result = generateWhatsAppMessage(input, THURSDAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toContain("分隔戶口\n4) 富邦 : $2,000,000\n*總港幣屬分隔戶口共 : $2,000,000*");
    expect(result.message).toContain("其他公司戶口\n5) 交通 : $2,996.69\n6) 螞蟻 : $615.3\n7) 上海商業 : $5,000");
  });

  it("appends unknown rows under OTHER COMPANY ACCOUNTS after the fixed accounts", () => {
    const input = EXAMPLE_INPUT.replace(
      "Shanghai Commercial Bank\t5,000.00",
      "Shanghai Commercial Bank\t5,000.00\nNew Bank\t100.00",
    );
    const result = generateWhatsAppMessage(input, THURSDAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toContain("7) 上海商業 : $5,000\n8) New Bank : $100\n____________________");
    expect(result.message).toContain("*總港幣屬分隔戶口共 : $2,000,000*");
  });

  it("numbers separate and other accounts straight after the banks when a section is missing", () => {
    const input = ["AMANTE BANK", "Dah Sing\t30,059.00", "CASH\t4,073.00", "BANK TOTAL\t34,132.00"].join("\n");
    const result = generateWhatsAppMessage(input, THURSDAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toBe(
      [
        "2026.08.06",
        "*愛德集團*",
        "1) 大新 : $30,059",
        "2) 保險庫 (現金) : $4,073",
        "*總港幣屬公司共 : $34,132*",
        "[太平洋雪茄尚未扣帳支票總共 : ]",
        "____________________",
        "其他公司戶口",
        "3) 交通 : ",
        "4) 螞蟻 : ",
        "5) 上海商業 : ",
      ].join("\n"),
    );
  });

  it("omits the accounts sections entirely when there are no bank or separate-account rows", () => {
    const input = ["SHOP SALES", "HQ\t100"].join("\n");
    const result = generateWhatsAppMessage(input, THURSDAY);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message.startsWith("2026.08.06\n*愛德集團*\n____________________\n*雪茄銷售業績*\n8月份\n")).toBe(true);
    expect(result.message).not.toContain("交通");
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
