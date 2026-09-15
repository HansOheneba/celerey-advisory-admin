import type { ClientDocument } from "@/lib/documents/types";
import { reportDownloadPath } from "@/lib/reports/release-to-client";

/** Ensures report-backed documents link to the generated PDF route. */
export function enrichDocumentDownloadUrl(
  document: ClientDocument,
): ClientDocument {
  if (!document.reportId) {
    return document;
  }

  return {
    ...document,
    downloadUrl: reportDownloadPath(document.reportId),
  };
}
