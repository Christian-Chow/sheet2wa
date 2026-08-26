import { formatSalesReportMessage } from "./formatter";
import { parseSalesReport } from "./parser";
import type { ParsedSalesReportData } from "./types";
import type { GenerateResult } from "../types";

export { SALES_REPORT_MARKER } from "./parser";
export * from "./types";
export { parseSalesReport } from "./parser";
export { formatSalesReportMessage } from "./formatter";

function countRecognizedRows(data: ParsedSalesReportData): number {
  return (
    data.shops.length +
    data.supplierGroups.reduce((sum, g) => sum + 1 + g.items.length, 0) +
    data.nonCubanCigars.length +
    data.freeGifts.length +
    data.accessories.length
  );
}

export function generateSalesReportMessage(raw: string): GenerateResult {
  const data = parseSalesReport(raw);
  const rowCount = countRecognizedRows(data);

  if (rowCount === 0) {
    return { ok: false, errorCode: "NO_RECOGNIZABLE_DATA" };
  }

  return { ok: true, message: formatSalesReportMessage(data), rowCount };
}
