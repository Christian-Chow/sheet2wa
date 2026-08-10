import { generateWhatsAppMessage, type GenerateResult } from "@/lib/sheet";

export type { GenerateResult } from "@/lib/sheet";

export function buildWhatsAppMessage(raw: string): GenerateResult {
  return generateWhatsAppMessage(raw);
}
