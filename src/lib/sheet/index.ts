import { formatWhatsAppMessage } from "./formatter";
import { parseSheet } from "./parser";
import { buildReportModel } from "./rules";
import type { GenerateResult, ParsedSheetData } from "./types";

function countRecognizedRows(data: ParsedSheetData): number {
  return (
    data.banks.length +
    data.shopSales.length +
    data.teamSales.length +
    data.extraAccounts.length +
    (data.amante !== null ? 1 : 0) +
    (data.kei !== null ? 1 : 0)
  );
}

export function generateWhatsAppMessage(raw: string, today: Date = new Date()): GenerateResult {
  const parsed = parseSheet(raw);
  if (!parsed.ok) {
    return { ok: false, errorCode: parsed.errorCode };
  }

  const model = buildReportModel(parsed.data, today);
  const message = formatWhatsAppMessage(model);

  return { ok: true, message, rowCount: countRecognizedRows(parsed.data) };
}

export * from "./types";
export { parseSheet } from "./parser";
export { buildReportModel } from "./rules";
export { formatWhatsAppMessage } from "./formatter";
