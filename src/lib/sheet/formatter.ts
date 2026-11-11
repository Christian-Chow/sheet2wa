// Renders a ReportModel into the final WhatsApp message text. Section wording/order
// lives here as small constants/blocks so the template is easy to tweak later.

import { COMPANY_NAME } from "./rules";
import type { ReportModel } from "./types";
import { formatCurrency, formatPercent } from "./utils";

const SEPARATOR = "____________________";

/** WhatsApp renders *text* as bold. */
function bold(text: string): string {
  return `*${text}*`;
}

/** Formats an amount, or leaves it blank for manual entry when the sheet has no value. */
function amountOrBlank(amount: number | null): string {
  return amount !== null ? formatCurrency(amount) : "";
}

function numberedLines(lines: { label: string; amount: number | null }[], startIndex: number): string[] {
  return lines.map(
    ({ label, amount }, i) => `${startIndex + i}) ${label} : ${amountOrBlank(amount)}`,
  );
}

function formatCompanyBlock(model: ReportModel): string[] | null {
  if (model.banks.length === 0) return null;
  return [
    ...numberedLines(model.banks, 1),
    bold(`總港幣屬公司共 : ${formatCurrency(model.companyCashTotal as number)}`),
    `[太平洋雪茄尚未扣帳支票總共 : ${amountOrBlank(model.pccCheque)}]`,
  ];
}

function formatSeparateAccountsBlock(model: ReportModel): string[] | null {
  if (model.separateAccounts.length === 0) return null;
  return [
    "分隔戶口",
    ...numberedLines(model.separateAccounts, model.banks.length + 1),
    bold(`總港幣屬分隔戶口共 : ${formatCurrency(model.separateAccountsTotal as number)}`),
  ];
}

function formatOtherCompanyAccountsBlock(model: ReportModel): string[] | null {
  const hasAnyAmount = model.otherCompanyAccounts.some((a) => a.amount !== null);
  if (model.banks.length === 0 && model.separateAccounts.length === 0 && !hasAnyAmount) return null;
  return [
    "其他公司戶口",
    ...numberedLines(
      model.otherCompanyAccounts,
      model.banks.length + model.separateAccounts.length + 1,
    ),
  ];
}

/** Header + accounts, printed as one run of lines with SEPARATOR between sections. */
function formatAccountsSection(model: ReportModel): string {
  const sections = [
    formatCompanyBlock(model),
    formatSeparateAccountsBlock(model),
    formatOtherCompanyAccountsBlock(model),
  ].filter((block): block is string[] => block !== null);

  const lines = [model.dateHeader, bold(COMPANY_NAME)];
  sections.forEach((block, i) => {
    if (i > 0) lines.push(SEPARATOR);
    lines.push(...block);
  });
  return lines.join("\n");
}

function formatShopSalesBlock(model: ReportModel): string[] | null {
  if (model.shopSales.length === 0) return null;
  return [
    bold("雪茄銷售業績"),
    `${model.month}月份`,
    ...model.shopSales.map((shop) => `${shop.label} : ${formatCurrency(shop.amount)}`),
  ];
}

function formatTeamSalesBlock(model: ReportModel): string[] | null {
  if (model.teamSales.length === 0) return null;
  return model.teamSales.map(
    (team) => `${team.label} : ${formatCurrency(team.amount)} (${formatPercent(team.percent)})`,
  );
}

function formatTotalsBlock(model: ReportModel): string[] | null {
  const lines: string[] = [];
  if (model.shopSales.length > 0) {
    model.cigarSalesDates.forEach(({ month, day }, i) => {
      const total = model.cigarSalesDayTotals[i] ?? null;
      // Left blank for manual entry when the sheet doesn't carry this day's total.
      const value = total !== null ? formatCurrency(total) : "";
      lines.push(`[${month}月${day}號雪茄總業績 : ${value}]`);
    });
  }
  if (model.monthSalesTotal !== null) {
    lines.push(bold(`${model.month}月份所有銷售總數 : ${formatCurrency(model.monthSalesTotal)}`));
  }
  return lines.length > 0 ? lines : null;
}

export function formatWhatsAppMessage(model: ReportModel): string {
  const salesBlocks = [formatShopSalesBlock(model), formatTeamSalesBlock(model), formatTotalsBlock(model)].filter(
    (block): block is string[] => block !== null && block.length > 0,
  );

  // The separator sits tight between the accounts and the first sales block (no blank lines);
  // the remaining sales blocks are spaced apart by blank lines.
  const [firstSales, ...restSales] = salesBlocks;
  const blocks: string[][] = firstSales
    ? [[formatAccountsSection(model), SEPARATOR, ...firstSales], ...restSales]
    : [[formatAccountsSection(model)]];

  return blocks.map((block) => block.join("\n")).join("\n\n");
}
