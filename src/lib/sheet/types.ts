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
  banks: AmountRow[];
  bankTotal: number | null;
  cashTotal: number | null;
  amante: number | null;
  kei: number | null;
  /** Extra rows found under SEPARATE ACCOUNTS beyond AMANTE / KEI (e.g. 交通, 螞蟻). */
  extraAccounts: AmountRow[];
  allTotal: number | null;
  shopSales: AmountRow[];
  teamSales: TeamRow[];
  salesTotal: number | null;
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

/** Data after name mapping and business calculations, ready for the formatter. */
export interface ReportModel {
  banks: ReportLine[];
  companyCashInAccounts: number | null;
  cashInVault: number | null;
  companyCashTotal: number | null;
  separateAccountsTotal: number | null;
  extraAccounts: ReportLine[];
  shopSales: ReportLine[];
  teamSales: TeamReportLine[];
  cigarSalesTotal: number | null;
  monthSalesTotal: number | null;
  month: number;
  day: number;
}

export type GenerateResult =
  | { ok: true; message: string; rowCount: number }
  | { ok: false; errorCode: ParseErrorCode };
