// Structured data types for the invoice-based "【銷售數據】" sales report — a
// different pasted shape from the bank/shop report in ../types.ts (shop invoice
// totals, supplier breakdowns, non-Cuban cigars, free gifts).

/** Box/Pack/Stick quantity columns shared by supplier rows, non-Cuban cigar rows,
 * and free gift rows. null means the cell was blank on the sheet. */
export interface QuantityRow {
  label: string;
  box: number | null;
  pack: number | null;
  stick: number | null;
}

export interface SalesReportShopRow {
  code: string;
  amount: number;
  count: number;
}

export interface SalesReportSupplierItem extends QuantityRow {
  isRefund: boolean;
}

/** A "> Label" supplier row. Either carries its own Box/Pack/Stick totals directly,
 * or (when those are blank) breaks down into per-item sub-rows listed under it. */
export interface SalesReportSupplierGroup {
  label: string;
  total: number;
  box: number | null;
  pack: number | null;
  stick: number | null;
  items: SalesReportSupplierItem[];
}

export interface ParsedSalesReportData {
  /** The date cell, passed through as pasted (e.g. "25/8/2026"). */
  date: string;
  shops: SalesReportShopRow[];
  supplierGroups: SalesReportSupplierGroup[];
  nonCubanCigars: QuantityRow[];
  freeGifts: QuantityRow[];
}
