// Renders the parsed sales report into the final WhatsApp message text.

import { formatCurrency } from "../utils";
import {
  isCoffeeCupItem,
  mapShopName,
  mapSupplierName,
  NON_CUBAN_UNITS,
  NO_UNITS,
  orderShops,
  SUPPLIER_UNITS,
  FREE_GIFT_UNITS,
  ACCESSORY_UNITS,
} from "./rules";
import type {
  ParsedSalesReportData,
  QuantityRow,
  SalesReportSupplierGroup,
  SalesReportSupplierItem,
} from "./types";
import type { UnitWords } from "./rules";

const SEPARATOR = "_________";

type QuantityKind = "box" | "pack" | "stick";

function collectParts(row: { box: number | null; pack: number | null; stick: number | null }): {
  kind: QuantityKind;
  value: number;
}[] {
  const parts: { kind: QuantityKind; value: number }[] = [];
  if (row.box) parts.push({ kind: "box", value: row.box });
  if (row.pack) parts.push({ kind: "pack", value: row.pack });
  if (row.stick) parts.push({ kind: "stick", value: row.stick });
  return parts;
}

/** e.g. "盒 x 4 | 散 x 14" — used when the label was already stated separately. */
function formatUnitFirst(row: { box: number | null; pack: number | null; stick: number | null }, units: UnitWords): string {
  return collectParts(row)
    .map((p) => `${units[p.kind]} x ${p.value}`)
    .join(" | ");
}

/** e.g. "哥倫布 小雪茄 5支 x 6 包" — used for flat item lines. */
function formatValueFirst(label: string, row: { box: number | null; pack: number | null; stick: number | null }, units: UnitWords): string {
  const suffix = collectParts(row)
    .map((p) => (units[p.kind] ? `x ${p.value} ${units[p.kind]}` : `x ${p.value}`))
    .join(" | ");
  return suffix ? `${label} ${suffix}` : label;
}

function formatShopBlock(data: ParsedSalesReportData): string[] {
  const shops = orderShops(data.shops);
  const lines = shops.map((shop) => `${mapShopName(shop.code)} ${formatCurrency(shop.amount)} (${shop.count})`);
  const total = shops.reduce((sum, s) => sum + s.amount, 0);
  const totalCount = shops.reduce((sum, s) => sum + s.count, 0);
  return [...lines, "", `💰 總計： ${formatCurrency(total)} (${totalCount})`];
}

function formatSupplierItem(item: SalesReportSupplierItem): string {
  if (item.isRefund) {
    return `-退貨-  ( ${formatValueFirst(item.label, item, SUPPLIER_UNITS)} )`;
  }
  return `* [ ${item.label} ]  ${formatUnitFirst(item, SUPPLIER_UNITS)}`;
}

function formatSupplierGroup(group: SalesReportSupplierGroup): string[] {
  const lines = [`> ${mapSupplierName(group.label)} (總數：${formatCurrency(group.total)})`];
  if (group.items.length > 0) {
    lines.push(...group.items.map(formatSupplierItem));
  } else {
    const own = formatUnitFirst(group, SUPPLIER_UNITS);
    if (own) lines.push(` ${own}`);
  }
  return lines;
}

function formatQuantityRow(row: QuantityRow, units: UnitWords): string {
  return formatValueFirst(row.label, row, units);
}

export function formatSalesReportMessage(data: ParsedSalesReportData): string {
  const lines: string[] = ["【銷售數據】", data.date];

  if (data.shops.length > 0) {
    lines.push("", ...formatShopBlock(data));
  }

  if (data.supplierGroups.length > 0) {
    lines.push(
      SEPARATOR,
      "【供應商詳情】",
      ...data.supplierGroups.flatMap((group) => ["", ...formatSupplierGroup(group)]),
    );
  }

  if (data.nonCubanCigars.length > 0) {
    lines.push(
      SEPARATOR,
      "【非古雪茄】",
      ...data.nonCubanCigars.map((row) => formatQuantityRow(row, NON_CUBAN_UNITS)),
    );
  }

  if (data.freeGifts.length > 0) {
    lines.push(
      SEPARATOR,
      "【贈品】",
      ...data.freeGifts.map((row) =>
        formatQuantityRow(row, isCoffeeCupItem(row.label) ? NO_UNITS : FREE_GIFT_UNITS),
      ),
    );
  }

  if (data.accessories.length > 0) {
    lines.push(
      SEPARATOR,
      "【配件】",
      ...data.accessories.map((row) => formatQuantityRow(row, ACCESSORY_UNITS)),
    );
  }

  return lines.join("\n");
}
