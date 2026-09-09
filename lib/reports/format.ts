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
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1000)}k`;
  }

  return `$${Math.round(value)}`;
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
