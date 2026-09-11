function coerceFiniteNumber(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

export function formatCurrency(
  value: number,
  currency: "USD" | "GHS" | "GBP" = "USD",
) {
  const amount = coerceFiniteNumber(value);
  if (amount === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(value: number) {
  const amount = coerceFiniteNumber(value);
  if (amount === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

/** Trailing twelve-month return, written out instead of "TTM". */
export function formatPastTwelveMonthReturn(
  pct: number,
  subject: "managed" | "default" = "default",
): string {
  const sign = pct >= 0 ? "+" : "";
  const base = `${sign}${pct}% over the past 12 months`;

  if (subject === "managed") {
    return `${base} on managed assets`;
  }

  return base;
}

export function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function titleCase(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "—";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}
