// Parses pasted Google Sheets content into structured data, detecting sections by
// their labels (not fixed row numbers) so it keeps working if rows are inserted,
// reordered, or a section is missing entirely.

import { parseNumber } from "./utils";
import type { AmountRow, ParsedSheetData, ParseResult } from "./types";

type Section = "NONE" | "BANK" | "SEPARATE_ACCOUNTS" | "SHOP_SALES" | "TEAM_SALES";

function splitRow(line: string): string[] {
  if (line.includes("\t")) return line.split("\t");
  const multiSpace = line.split(/ {2,}/);
  if (multiSpace.length > 1) return multiSpace;
  return [line];
}

function normalizeLabel(s: string): string {
  return s.replace(/\s+/g, " ").trim().toUpperCase();
}

/** Team rows (e.g. "OSCAR TEAM") are recognized by label rather than a required heading,
 * since real sheets don't always include an explicit "TEAM SALES" section row. */
function looksLikeTeamLabel(label: string): boolean {
  return /\bTEAM$/i.test(label.trim());
}

export function parseSheet(raw: string): ParseResult {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(splitRow)
    .filter((cells) => cells.some((cell) => cell.trim() !== ""));

  if (lines.length === 0) {
    return { ok: false, errorCode: "EMPTY_INPUT" };
  }

  const data: ParsedSheetData = {
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
  };

  let section: Section = "NONE";

  for (const cells of lines) {
    const label = (cells[0] ?? "").trim();
    const key = normalizeLabel(label);
    if (!key) continue;

    if (key === "BANK") {
      section = "BANK";
      continue;
    }
    if (key === "BANK TOTAL") {
      data.bankTotal = parseNumber(cells[1]);
      section = "NONE";
      continue;
    }
    if (key === "CASH TOTAL") {
      data.cashTotal = parseNumber(cells[1]);
      continue;
    }
    if (key === "SEPARATE ACCOUNTS") {
      section = "SEPARATE_ACCOUNTS";
      continue;
    }
    if (key === "ALL TOTAL") {
      data.allTotal = parseNumber(cells[1]);
      section = "NONE";
      continue;
    }
    if (key === "SHOP SALES") {
      section = "SHOP_SALES";
      continue;
    }
    if (key === "TEAM SALES") {
      section = "TEAM_SALES";
      continue;
    }
    if (key === "SALES TOTAL") {
      data.salesTotal = parseNumber(cells[1]);
      section = "NONE";
      continue;
    }

    if (looksLikeTeamLabel(label)) {
      const amount = parseNumber(cells[1]);
      if (amount === null) continue;
      data.teamSales.push({ label, amount, percent: parseNumber(cells[2]) });
      continue;
    }

    const amount = parseNumber(cells[1]);
    if (amount === null) continue;
    const row: AmountRow = { label, amount };

    switch (section) {
      case "BANK":
        data.banks.push(row);
        break;
      case "SEPARATE_ACCOUNTS": {
        if (key === "AMANTE") data.amante = amount;
        else if (key === "KEI") data.kei = amount;
        else data.extraAccounts.push(row);
        break;
      }
      case "SHOP_SALES":
        data.shopSales.push(row);
        break;
      case "TEAM_SALES":
        data.teamSales.push({ label, amount, percent: parseNumber(cells[2]) });
        break;
      case "NONE":
        break;
    }
  }

  if (data.banks.length === 0 && data.shopSales.length === 0 && data.teamSales.length === 0) {
    return { ok: false, errorCode: "NO_RECOGNIZABLE_DATA" };
  }

  return { ok: true, data };
}
