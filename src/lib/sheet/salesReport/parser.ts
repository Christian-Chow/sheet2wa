// Parses the pasted "【銷售數據】" sales report into structured data. Like the
// other parser, sections are detected by label rather than fixed row numbers.
//
// Column layout is consistent across the SUPPLIER DETAILS / Non-Cuban cigars /
// Free Gift sections: [label, total, box, pack, stick, refund(T/F)] — even
// though only SUPPLIER DETAILS repeats the header row, the same columns carry
// through beneath the other two section titles.

import { normalizeLabel, parseNumber, splitRow } from "../utils";
import type { ParsedSalesReportData, QuantityRow, SalesReportSupplierGroup } from "./types";

export const SALES_REPORT_MARKER = "【銷售數據】";

type Section = "NONE" | "AWAITING_DATE" | "SHOPS" | "SUPPLIER" | "NON_CUBAN" | "FREE_GIFT";

function isDivider(label: string): boolean {
  return /^_+$/.test(label.trim());
}

function parseQuantityRow(cells: string[]): QuantityRow {
  return {
    label: (cells[0] ?? "").trim(),
    box: parseNumber(cells[2]),
    pack: parseNumber(cells[3]),
    stick: parseNumber(cells[4]),
  };
}

export function parseSalesReport(raw: string): ParsedSalesReportData {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(splitRow)
    .filter((cells) => cells.some((cell) => cell.trim() !== ""));

  const data: ParsedSalesReportData = {
    date: "",
    shops: [],
    supplierGroups: [],
    nonCubanCigars: [],
    freeGifts: [],
  };

  let section: Section = "NONE";
  let currentGroup: SalesReportSupplierGroup | null = null;

  for (const cells of lines) {
    const label = (cells[0] ?? "").trim();
    if (!label) continue;
    const key = normalizeLabel(label);

    if (key === SALES_REPORT_MARKER) {
      section = "AWAITING_DATE";
      continue;
    }
    if (section === "AWAITING_DATE") {
      data.date = label;
      section = "SHOPS";
      continue;
    }
    if (key === "SUPPLIER DETAILS") {
      section = "SUPPLIER";
      currentGroup = null;
      continue;
    }
    if (key === "NON-CUBAN CIGARS") {
      section = "NON_CUBAN";
      continue;
    }
    if (key === "FREE GIFT") {
      section = "FREE_GIFT";
      continue;
    }
    if (isDivider(label)) {
      section = "NONE";
      continue;
    }

    switch (section) {
      case "SHOPS": {
        if (key === "TOTAL") {
          section = "NONE";
          break;
        }
        data.shops.push({
          code: label,
          amount: parseNumber(cells[1]) ?? 0,
          count: parseNumber(cells[2]) ?? 0,
        });
        break;
      }
      case "SUPPLIER": {
        if (label.startsWith(">")) {
          const group: SalesReportSupplierGroup = {
            label: label.replace(/^>\s*/, "").trim(),
            total: parseNumber(cells[1]) ?? 0,
            box: parseNumber(cells[2]),
            pack: parseNumber(cells[3]),
            stick: parseNumber(cells[4]),
            items: [],
          };
          data.supplierGroups.push(group);
          currentGroup = group;
        } else if (currentGroup) {
          currentGroup.items.push({
            ...parseQuantityRow(cells),
            isRefund: normalizeLabel(cells[5] ?? "") === "T",
          });
        }
        break;
      }
      case "NON_CUBAN":
        data.nonCubanCigars.push(parseQuantityRow(cells));
        break;
      case "FREE_GIFT":
        data.freeGifts.push(parseQuantityRow(cells));
        break;
      case "NONE":
        break;
    }
  }

  return data;
}
