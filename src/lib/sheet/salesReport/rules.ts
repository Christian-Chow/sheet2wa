// Name mappings for the sales report. Reuses the shop map/order already
// established in ../rules.ts, since these are the same shops as the bank report.

import { mapName, reorderByCanonical, SHOP_DISPLAY_ORDER, SHOP_NAME_MAP } from "../rules";
import type { SalesReportShopRow } from "./types";

export const SUPPLIER_NAME_MAP: Record<string, string> = {
  "PCC Wholesales": "PCC批發",
  "PCC Retails": "PCC零售",
  "Other suppliers": "其他供應商",
};

export interface UnitWords {
  box: string;
  pack: string;
  stick: string;
}

export const SUPPLIER_UNITS: UnitWords = { box: "盒", pack: "散", stick: "支" };
export const NON_CUBAN_UNITS: UnitWords = { box: "盒", pack: "包", stick: "支" };
export const FREE_GIFT_UNITS: UnitWords = { box: "盒", pack: "包", stick: "支" };
export const NO_UNITS: UnitWords = { box: "", pack: "", stick: "" };

/** Coffee cups are counted as loose items, not cigars — they don't take a unit word. */
export function isCoffeeCupItem(label: string): boolean {
  return label.includes("咖啡杯");
}

export function mapShopName(code: string): string {
  return mapName(SHOP_NAME_MAP, code);
}

export function mapSupplierName(label: string): string {
  return mapName(SUPPLIER_NAME_MAP, label);
}

export function orderShops(shops: SalesReportShopRow[]): SalesReportShopRow[] {
  const withLabel = reorderByCanonical(
    shops.map((s) => ({ label: s.code, row: s })),
    SHOP_DISPLAY_ORDER,
  );
  return withLabel.map((item) => item.row);
}
