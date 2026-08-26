import { describe, expect, it } from "vitest";
import { generateWhatsAppMessage } from "../index";

const EXAMPLE_INPUT = [
  "【銷售數據】",
  "25/8/2026\t\tInvoice amount",
  "",
  "HQ\t0.00\t0",
  "PP\t795,188.00\t1",
  "EMS\t1,506,527.00\t6",
  "OC\t1,961,779.00\t4",
  "K11\t2,110,545.00\t4",
  "SS\t739,820.00\t5",
  "HW\t438,526.00\t5",
  "HWH\t90,208.00\t1",
  "",
  "Total\t7,642,593.00",
  "_________",
  "SUPPLIER DETAILS\tTOTAL\tBox\tPack\tStick\tRefund (T/F)",
  "> PCC Wholesales \t42061\t4\t14",
  "> PCC Retails\t22391\t4",
  "> Other suppliers\t371213",
  "任和其他供應商\t\t17",
  "BHK\t\t3",
  "> 小伍哥 \t-20000",
  " BHK 52\t\t1\t\t\tT",
  "_________",
  "Non-Cuban cigars",
  "哥倫布 小雪茄 5支 \t\t\t6",
  "_________",
  "Free Gift",
  "奧拉西奧 經典 II \t\t\t\t2",
  "小伍哥 羅密歐 戀人 \t\t\t\t1",
  "Costa 咖啡杯 \t\t\t\t17",
].join("\n");

const EXPECTED_MESSAGE = [
  "【銷售數據】",
  "25/8/2026",
  "",
  "總部 $0 (0)",
  "太古廣場 $795,188 (1)",
  "圓方 $1,506,527 (6)",
  "海港城 $1,961,779 (4)",
  "K11M $2,110,545 (4)",
  "港島南岸 $739,820 (5)",
  "合和 $438,526 (5)",
  "合和酒店 $90,208 (1)",
  "",
  "💰 總計： $7,642,593 (26)",
  "_________",
  "【供應商詳情】",
  "",
  "> PCC批發 (總數：$42,061)",
  " 盒 x 4 | 散 x 14",
  "",
  "> PCC零售 (總數：$22,391)",
  " 盒 x 4",
  "",
  "> 其他供應商 (總數：$371,213)",
  "* [ 任和其他供應商 ]  盒 x 17",
  "* [ BHK ]  盒 x 3",
  "",
  "> 小伍哥 (總數：-$20,000)",
  "-退貨-  ( BHK 52 x 1 盒 )",
  "_________",
  "【非古雪茄】",
  "哥倫布 小雪茄 5支 x 6 包",
  "_________",
  "【贈品】",
  "奧拉西奧 經典 II x 2 支",
  "小伍哥 羅密歐 戀人 x 1 支",
  "Costa 咖啡杯 x 17",
].join("\n");

describe("generateWhatsAppMessage (sales report)", () => {
  it("produces the exact WhatsApp message for the documented example input", () => {
    const result = generateWhatsAppMessage(EXAMPLE_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toBe(EXPECTED_MESSAGE);
    expect(result.rowCount).toBe(8 + 7 + 1 + 3); // shops + (4 supplier groups + 3 items) + non-Cuban + free gifts
  });

  it("omits a section entirely when its underlying data is missing", () => {
    const input = ["【銷售數據】", "25/8/2026", "", "HQ\t100\t1", "", "Total\t100"].join("\n");
    const result = generateWhatsAppMessage(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toBe("【銷售數據】\n25/8/2026\n\n總部 $100 (1)\n\n💰 總計： $100 (1)");
  });

  it("returns NO_RECOGNIZABLE_DATA when the marker is present but nothing parses", () => {
    const result = generateWhatsAppMessage("【銷售數據】\n25/8/2026");
    expect(result).toEqual({ ok: false, errorCode: "NO_RECOGNIZABLE_DATA" });
  });

  it("treats a '> Non-Cuban cigars' row as the section marker, not a supplier group", () => {
    const input = [
      "【銷售數據】",
      "25/8/2026",
      "",
      "HQ\t100\t1",
      "",
      "Total\t100",
      "_________",
      "SUPPLIER DETAILS\tTOTAL\tBox\tPack\tStick\tRefund (T/F)",
      "> PCC Wholesales \t42061\t4\t14",
      "_________",
      "> Non-Cuban cigars",
      "哥倫布 小雪茄 5支 \t\t\t6",
    ].join("\n");
    const result = generateWhatsAppMessage(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toBe(
      [
        "【銷售數據】",
        "25/8/2026",
        "",
        "總部 $100 (1)",
        "",
        "💰 總計： $100 (1)",
        "_________",
        "【供應商詳情】",
        "",
        "> PCC批發 (總數：$42,061)",
        " 盒 x 4 | 散 x 14",
        "_________",
        "【非古雪茄】",
        "哥倫布 小雪茄 5支 x 6 包",
      ].join("\n"),
    );
  });

  it("treats a '> 配件' row as the section marker, not a supplier group", () => {
    const input = [
      "【銷售數據】",
      "25/8/2026",
      "",
      "HQ\t100\t1",
      "",
      "Total\t100",
      "_________",
      "SUPPLIER DETAILS\tTOTAL\tBox\tPack\tStick\tRefund (T/F)",
      "> PCC Wholesales \t42061\t4\t14",
      "_________",
      "> 配件",
      "雪茄剪 \t\t\t3",
    ].join("\n");
    const result = generateWhatsAppMessage(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toBe(
      [
        "【銷售數據】",
        "25/8/2026",
        "",
        "總部 $100 (1)",
        "",
        "💰 總計： $100 (1)",
        "_________",
        "【供應商詳情】",
        "",
        "> PCC批發 (總數：$42,061)",
        " 盒 x 4 | 散 x 14",
        "_________",
        "【配件】",
        "雪茄剪 x 3 包",
      ].join("\n"),
    );
  });
});
