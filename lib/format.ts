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

const HEADING_SMALL_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "but",
  "or",
  "for",
  "nor",
  "on",
  "at",
  "to",
  "from",
  "by",
  "vs",
  "in",
  "of",
  "yet",
]);

const HEADING_TOKEN_OVERRIDES: Record<string, string> = {
  aua: "AUA",
  aum: "AUM",
  qtd: "QTD",
  fx: "FX",
  celerey: "Celerey",
  copilot: "Copilot",
};

function capitalizeHeadingToken(token: string, forceCapitalize: boolean): string {
  const trimmed = token.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.includes("-")) {
    return trimmed
      .split("-")
      .map((part) => capitalizeHeadingToken(part, true))
      .join("-");
  }

  const lower = trimmed.toLowerCase();
  const override = HEADING_TOKEN_OVERRIDES[lower];
  if (override) {
    return override;
  }

  if (/^[A-Z0-9]{2,}$/.test(trimmed)) {
    return trimmed;
  }

  if (!forceCapitalize && HEADING_SMALL_WORDS.has(lower)) {
    return lower;
  }

  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Title-style capitalization for page titles, section headings, and stat labels. */
export function headingTitle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.includes("&")) {
    return trimmed
      .split(/\s*&\s*/)
      .map((segment) => headingTitle(segment))
      .join(" & ");
  }

  const words = trimmed.split(/\s+/);
  return words
    .map((word, index) =>
      capitalizeHeadingToken(
        word,
        index === 0 || index === words.length - 1,
      ),
    )
    .join(" ");
}
