// Renders a ReportModel into the final WhatsApp message text. Section wording/order
// lives here as small constants/blocks so the template is easy to tweak later.

import { COMPANY_NAME } from "./rules";
import type { ReportModel } from "./types";
import { formatCurrency, formatPercent } from "./utils";

const SEPARATOR = "---";
const CIGAR_SECTION_DIVIDER = "-----------雪茄銷售---------";

/** Recurring misc accounts that always need a human to check and fill in by hand
 * before sending, regardless of what the sheet contains. */
const FIXED_EXTRA_ACCOUNT_LABELS = ["交通", "螞蟻", "上海商業"];

function formatBankBlock(model: ReportModel): string[] {
  return model.banks.map((bank, i) => `${i + 1}) ${bank.label} : ${formatCurrency(bank.amount)}`);
}

function formatCompanyCashBlock(model: ReportModel): string[] | null {
  if (model.companyCashTotal === null) return null;
  return [
    `總港幣現金在戶口屬公司 : ${formatCurrency(model.companyCashInAccounts as number)}`,
    `總港幣現金在保險庫共 : ${formatCurrency(model.cashInVault as number)}`,
    `總港幣屬公司共 : ${formatCurrency(model.companyCashTotal)}`,
  ];
}

function formatSeparateAccountsBlock(model: ReportModel): string[] | null {
  if (model.separateAccountsTotal === null) return null;
  return [`分隔戶口 : ${formatCurrency(model.separateAccountsTotal)}`];
}

function formatGrandTotalBlock(model: ReportModel): string[] | null {
  if (model.grandTotal === null) return null;
  return [`總港幣共 : ${formatCurrency(model.grandTotal)}`];
}

function formatFixedExtraAccountsBlock(model: ReportModel): string[] | null {
  if (model.grandTotal === null) return null;
  const startIndex = model.banks.length + 1;
  return FIXED_EXTRA_ACCOUNT_LABELS.map((label, i) => `${startIndex + i})${label} : `);
}

function formatShopSalesBlock(model: ReportModel): string[] | null {
  if (model.shopSales.length === 0) return null;
  return [
    `${model.month}月份業績`,
    CIGAR_SECTION_DIVIDER,
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
    lines.push(`${model.month}月份所有銷售總數 : ${formatCurrency(model.monthSalesTotal)}`);
  }
  return lines.length > 0 ? lines : null;
}

export function formatWhatsAppMessage(model: ReportModel): string {
  const blocks: string[][] = [[model.dateHeader, COMPANY_NAME]];

  for (const block of [
    formatBankBlock(model),
    formatCompanyCashBlock(model),
    formatSeparateAccountsBlock(model),
    formatGrandTotalBlock(model),
    formatFixedExtraAccountsBlock(model),
  ]) {
    if (block && block.length > 0) blocks.push(block);
  }

  const salesBlocks = [formatShopSalesBlock(model), formatTeamSalesBlock(model), formatTotalsBlock(model)].filter(
    (block): block is string[] => block !== null && block.length > 0,
  );

  if (salesBlocks.length > 0) {
    blocks.push([SEPARATOR], ...salesBlocks);
  }

  return blocks.map((block) => block.join("\n")).join("\n\n");
}
