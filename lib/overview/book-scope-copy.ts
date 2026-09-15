import type { BookScope } from "@/lib/auth/capabilities";
import { formatCompactCurrency } from "@/lib/format";

export function insightsPageDescription(scope: BookScope): string {
  switch (scope) {
    case "own_book":
      return "Your assigned clients only.";
    case "team":
      return "Your team's book.";
    case "firm":
      return "The full firm book.";
  }
}

/** Short scope line shown above book asset totals. */
export function bookScopeEyebrow(scope: BookScope): string {
  switch (scope) {
    case "own_book":
      return "Your clients";
    case "team":
      return "Your team";
    case "firm":
      return "Firm-wide";
  }
}

export function bookScopeLabel(scope: BookScope): string {
  switch (scope) {
    case "own_book":
      return "Your assigned clients";
    case "team":
      return "Team book";
    case "firm":
      return "Firm book";
  }
}

/** Subline under total AUA: how much of the visible book Fidelity manages. */
export function formatBookAssetsManagedSubline(
  totalAua: number,
  totalAum: number,
  scope: BookScope,
): string {
  if (totalAum <= 0) {
    switch (scope) {
      case "own_book":
        return "None of your clients' assets are managed by us yet.";
      case "team":
        return "None of your team's assets are managed by us yet.";
      case "firm":
        return "None of this is managed by us yet.";
    }
  }

  const pct = totalAua > 0 ? Math.round((totalAum / totalAua) * 100) : 0;

  switch (scope) {
    case "own_book":
      return `Of which ${formatCompactCurrency(totalAum)} of your book is managed by us (${pct}%).`;
    case "team":
      return `Of which ${formatCompactCurrency(totalAum)} of your team's book is managed by us (${pct}%).`;
    case "firm":
      return `Of which ${formatCompactCurrency(totalAum)} is managed by us (${pct}%).`;
  }
}

/** @deprecated Use bookScopeLabel or formatBookAssetsManagedSubline instead. */
export function auaMetricHint(scope: BookScope): string {
  return bookScopeLabel(scope);
}

/** @deprecated Use formatBookAssetsManagedSubline instead. */
export function aumMetricHint(_scope: BookScope, auaSharePct: number): string {
  return auaSharePct > 0
    ? `${auaSharePct}% of AUA`
    : "Nothing under management yet";
}
