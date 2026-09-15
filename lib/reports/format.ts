/**
 * The PDF renderer needs plain, deterministic strings — Intl grouping only,
 * no locale-dependent currency symbols beyond the dollar the report is
 * denominated in.
 */

export function formatUsd(value: number, signed = false): string {
  const rounded = Math.round(value);
  const sign = signed && rounded > 0 ? "+" : rounded < 0 ? "-" : "";
  const body = Math.abs(rounded).toLocaleString("en-US");

  return `${sign}$${body}`;
}

export function formatPct(value: number, signed = false): string {
  const sign = signed && value > 0 ? "+" : "";

  return `${sign}${value.toFixed(1)}%`;
}

export function formatCompactUsd(value: number): string {
  return formatUsd(value);
}

export function formatLongDate(iso: string): string {
  const parsed = new Date(iso);

  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
