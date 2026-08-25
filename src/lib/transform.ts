import { generateWhatsAppMessage, type GenerateResult, type ReportType } from "@/lib/sheet";

export type { GenerateResult, ReportType } from "@/lib/sheet";

export function buildWhatsAppMessage(raw: string, reportType: ReportType): GenerateResult {
  return generateWhatsAppMessage(raw, new Date(), reportType);
}
