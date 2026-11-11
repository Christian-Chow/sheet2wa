// Structured data types shared across the parser, business rules, and formatter.

export interface AmountRow {
  label: string;
  amount: number;
}

export interface TeamRow {
  label: string;
  amount: number;
  /** Percentage as parsed from the sheet (e.g. 30.7845 for "30.78450%"), if present. */
  percent: number | null;
}

/** Structured data straight out of the parser, before name mapping or business rules are applied. */
export interface ParsedSheetData {
  /** Rows under the AMANTE BANK heading, in sheet order — includes the CASH (vault) row. */
  banks: AmountRow[];
  bankTotal: number | null;
  /** Rows under SEPARATE ACCOUNTS (e.g. Fubon). */
  separateAccounts: AmountRow[];
  /** Bank of Communication / Ant Bank / Shanghai Commercial Bank rows, picked out by label. */
  otherCompanyAccounts: AmountRow[];
  /** "PCC Cheque" row: 太平洋雪茄尚未扣帳支票總共. */
  pccCheque: number | null;
  allTotal: number | null;
  shopSales: AmountRow[];
  teamSales: TeamRow[];
  salesTotal: number | null;
  fridayTotalSales: number | null;
  saturdayTotalSales: number | null;
  sundayTotalSales: number | null;
  previousDayTotalSales: number | null;
}

export type ParseErrorCode = "EMPTY_INPUT" | "NO_RECOGNIZABLE_DATA";

export type ParseResult =
  | { ok: true; data: ParsedSheetData }
  | { ok: false; errorCode: ParseErrorCode };

export interface ReportLine {
  label: string;
  amount: number;
}

export interface TeamReportLine extends ReportLine {
  percent: number;
}

/** A calendar date reduced to the fields the report needs to print (e.g. "8月9號"). */
export interface ReportDate {
  month: number;
  day: number;
}

/** Data after name mapping and business calculations, ready for the formatter. */
export interface ReportModel {
  /** e.g. "2026.08.10" */
  dateHeader: string;
  banks: ReportLine[];
  /** 總港幣屬公司共 = sum of the bank rows (incl. vault cash); null when there are none. */
  companyCashTotal: number | null;
  separateAccounts: ReportLine[];
  /** 總港幣屬分隔戶口共 = sum of the separate accounts; null when there are none. */
  separateAccountsTotal: number | null;
  /** Always the fixed accounts in fixed order; amount is null when the sheet has no value for it. */
  otherCompanyAccounts: { label: string; amount: number | null }[];
  pccCheque: number | null;
  shopSales: ReportLine[];
  teamSales: TeamReportLine[];
  cigarSalesTotal: number | null;
  monthSalesTotal: number | null;
  month: number;
  /** Yesterday, or [last Friday, last Saturday, yesterday] when today is Monday. */
  cigarSalesDates: ReportDate[];
  /** Totals aligned index-for-index with cigarSalesDates; null where the sheet didn't carry a value. */
  cigarSalesDayTotals: (number | null)[];
}

export type GenerateResult =
  | { ok: true; message: string; rowCount: number }
  | { ok: false; errorCode: ParseErrorCode };
