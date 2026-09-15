import type { ReportTemplateKey } from "@/lib/reports/types";

const TEMPLATE_PREFIX: Record<ReportTemplateKey, string> = {
  quarterly_review: "QR",
  annual_review: "AR",
  portfolio_statement: "PS",
};

const PREFIX_TO_TEMPLATE = Object.fromEntries(
  Object.entries(TEMPLATE_PREFIX).map(([key, prefix]) => [
    prefix,
    key as ReportTemplateKey,
  ]),
) as Record<string, ReportTemplateKey>;

/** Stable id and PDF file stem for a generated report. */
export function reportReference(
  clientId: string,
  template: ReportTemplateKey,
  asOf: Date = new Date(),
): string {
  const stamp = asOf.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = TEMPLATE_PREFIX[template];

  return `${prefix}-${clientId.toUpperCase()}-${stamp}`;
}

export function reportPdfFileName(referenceId: string): string {
  return `${referenceId}.pdf`;
}

/**
 * Recovers client and template from ids like `QR-OSEI-BONSU-20260915`.
 * Client ids may contain hyphens.
 */
export function parseReportReference(referenceId: string): {
  clientId: string;
  templateKey: ReportTemplateKey;
  stamp: string;
} | null {
  const match = referenceId.match(/^([A-Z]+)-(.+)-(\d{8})$/);

  if (!match) {
    return null;
  }

  const [, prefix, clientSlug, stamp] = match;
  const templateKey = PREFIX_TO_TEMPLATE[prefix ?? ""];

  if (!templateKey || !clientSlug || !stamp) {
    return null;
  }

  return {
    clientId: clientSlug.toLowerCase(),
    templateKey,
    stamp,
  };
}
