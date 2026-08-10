// Number, currency, percentage, and date formatting helpers.

/** Parses a cell value that may contain "$", commas, "%", or stray whitespace. */
export function parseNumber(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const cleaned = raw.replace(/[$,\s]/g, "").replace(/%$/, "");
  if (cleaned === "" || cleaned === "-") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function addThousandsSeparators(intStr: string): string {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Rounds to 2dp and trims unnecessary trailing zeros, e.g. 615.30 -> "615.3", 30059.00 -> "30,059". */
function formatTrimmedNumber(value: number): string {
  const [intPart, decPart] = value.toFixed(2).split(".");
  const trimmedDec = decPart.replace(/0+$/, "");
  const withCommas = addThousandsSeparators(intPart);
  return trimmedDec ? `${withCommas}.${trimmedDec}` : withCommas;
}

export function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${formatTrimmedNumber(Math.abs(value))}`;
}

/** Truncates (does not round) to the given number of decimal places. */
function truncateDecimals(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  const scaled = Number((value * factor).toFixed(6));
  return Math.trunc(scaled) / factor;
}

/** Formats a percentage, truncated to 2dp, collapsing an exact zero to "0%". */
export function formatPercent(value: number, decimals = 2): string {
  const truncated = truncateDecimals(value, decimals);
  if (truncated === 0) return "0%";
  return `${truncated.toFixed(decimals)}%`;
}

export function getTodayMonthDay(date: Date = new Date()): { month: number; day: number } {
  return { month: date.getMonth() + 1, day: date.getDate() };
}
