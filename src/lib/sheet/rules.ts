// Name mappings and business rules. Edit the maps/order arrays below to change
// how labels are translated or which order sections appear in — no other module
// needs to change.

import type { AmountRow, ParsedSheetData, ReportDate, ReportLine, ReportModel, TeamReportLine, TeamRow } from "./types";
import { addDays, formatDateHeader, isMonday } from "./utils";

export const COMPANY_NAME = "愛德集團";

export const BANK_NAME_MAP: Record<string, string> = {
  "Dah Sing": "大新",
  HSBC: "匯豐",
  Fubon: "富邦",
};

export const SHOP_NAME_MAP: Record<string, string> = {
  HQ: "總部",
  PP: "太古廣場",
  EMS: "圓方",
  OC: "海港城",
  K11: "K11M",
  SS: "港島南岸",
  HW: "合和",
  HWH: "合和酒店",
};

export const TEAM_NAME_MAP: Record<string, string> = {
  "HQ TEAM": "總部",
  "OSCAR TEAM": "奧斯卡團隊",
  "VINCENT TEAM": "溫信團隊",
  "JONATHAN TEAM": "港島南岸+合和中心",
  "NIKI TEAM": "合和酒店",
};

/** Canonical display order for shops/teams. Anything in the data but not listed here
 * is appended at the end, in the order it appeared in the sheet. */
export const SHOP_DISPLAY_ORDER = ["HQ", "PP", "EMS", "OC", "K11", "SS", "HW", "HWH"];
export const TEAM_DISPLAY_ORDER = [
  "HQ TEAM",
  "OSCAR TEAM",
  "VINCENT TEAM",
  "JONATHAN TEAM",
  "NIKI TEAM",
];

function mapName(map: Record<string, string>, rawLabel: string): string {
  const trimmed = rawLabel.trim();
  const entry = Object.entries(map).find(([key]) => key.toUpperCase() === trimmed.toUpperCase());
  return entry ? entry[1] : trimmed;
}

function reorderByCanonical<T extends { label: string }>(items: T[], canonicalOrder: string[]): T[] {
  const byKey = new Map(items.map((item) => [item.label.trim().toUpperCase(), item] as const));
  const used = new Set<string>();
  const ordered: T[] = [];

  for (const key of canonicalOrder) {
    const found = byKey.get(key.toUpperCase());
    if (found) {
      ordered.push(found);
      used.add(key.toUpperCase());
    }
  }
  for (const item of items) {
    const key = item.label.trim().toUpperCase();
    if (!used.has(key)) ordered.push(item);
  }
  return ordered;
}

function sum(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

/** Company cash = the AMANTE separate account + the cash-in-vault total. */
function computeCompanyCashTotal(amante: number | null, cashTotal: number | null): number | null {
  if (amante === null || cashTotal === null) return null;
  return amante + cashTotal;
}

/** 總港幣共 = 分隔戶口 (KEI) + 總港幣屬公司共. Computed from our own parts, never from
 * the sheet's ALL TOTAL — that value is only useful as an optional external check. */
function computeGrandTotal(separateAccountsTotal: number | null, companyCashTotal: number | null): number | null {
  if (separateAccountsTotal === null || companyCashTotal === null) return null;
  return separateAccountsTotal + companyCashTotal;
}

function toReportDate(date: Date): ReportDate {
  return { month: date.getMonth() + 1, day: date.getDate() };
}

/** Yesterday, unless today is Monday — then last Friday, last Saturday, and yesterday (Sunday). */
function computeCigarSalesDates(today: Date): ReportDate[] {
  const yesterday = addDays(today, -1);
  if (isMonday(today)) {
    return [addDays(today, -3), addDays(today, -2), yesterday].map(toReportDate);
  }
  return [toReportDate(yesterday)];
}

/** Totals aligned with computeCigarSalesDates: [Friday, Saturday, Sunday] on Monday, else [previous day]. */
function computeCigarSalesDayTotals(data: ParsedSheetData, today: Date): (number | null)[] {
  if (isMonday(today)) {
    return [data.fridayTotalSales, data.saturdayTotalSales, data.sundayTotalSales];
  }
  return [data.previousDayTotalSales];
}

function buildTeamReportLines(teamSales: TeamRow[]): TeamReportLine[] {
  const ordered = reorderByCanonical(teamSales, TEAM_DISPLAY_ORDER);
  const total = sum(ordered);
  return ordered.map((team) => ({
    label: mapName(TEAM_NAME_MAP, team.label),
    amount: team.amount,
    // Prefer the sheet's own percentage column; fall back to computing it from
    // the team totals if that column wasn't pasted in.
    percent: team.percent ?? (total > 0 ? (team.amount / total) * 100 : 0),
  }));
}

function buildReportLines(rows: AmountRow[], map: Record<string, string>): ReportLine[] {
  return rows.map((row) => ({ label: mapName(map, row.label), amount: row.amount }));
}

export function buildReportModel(data: ParsedSheetData, today: Date): ReportModel {
  const banks = buildReportLines(data.banks, BANK_NAME_MAP);
  const shopSales = buildReportLines(reorderByCanonical(data.shopSales, SHOP_DISPLAY_ORDER), SHOP_NAME_MAP);
  const teamSales = buildTeamReportLines(data.teamSales);

  const cigarSalesTotal = shopSales.length > 0 ? sum(shopSales) : null;
  const monthSalesTotal =
    data.salesTotal ?? (teamSales.length > 0 ? sum(teamSales) : cigarSalesTotal);

  const companyCashTotal = computeCompanyCashTotal(data.amante, data.cashTotal);

  return {
    dateHeader: formatDateHeader(today),
    banks,
    companyCashInAccounts: data.amante,
    cashInVault: data.cashTotal,
    companyCashTotal,
    separateAccountsTotal: data.kei,
    grandTotal: computeGrandTotal(data.kei, companyCashTotal),
    shopSales,
    teamSales,
    cigarSalesTotal,
    monthSalesTotal,
    month: today.getMonth() + 1,
    cigarSalesDates: computeCigarSalesDates(today),
    cigarSalesDayTotals: computeCigarSalesDayTotals(data, today),
  };
}
