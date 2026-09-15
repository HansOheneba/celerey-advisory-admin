import type { ClientDocument } from "@/lib/documents/types";
import { daysFromNow } from "@/lib/demo/seed/client-builder";
import type { DemoDatabase, DemoReportRecord } from "@/lib/demo/types";

function reportDocumentId(reportId: string): string {
  return `doc-report-${reportId}`;
}

export function reportDownloadPath(reportId: string): string {
  return `/api/reports/${encodeURIComponent(reportId)}/download`;
}

/** Client-visible document row for a released PDF report. */
export function attachReleasedReportDocument(
  db: DemoDatabase,
  report: DemoReportRecord,
  releasedByName: string,
  releasedAt: string,
): ClientDocument {
  const id = reportDocumentId(report.id);
  const existing = db.documents.find((document) => document.id === id);

  if (existing) {
    return existing;
  }

  const record = db.clients.find(
    (candidate) => candidate.client.id === report.clientId,
  );

  const document: ClientDocument = {
    id,
    clientId: report.clientId,
    sessionId: null,
    reportId: report.id,
    title: report.title,
    category: "report",
    fileName: report.fileName,
    contentType: "application/pdf",
    sizeBytes: report.sizeBytes,
    uploadedBy: "advisor",
    uploadedByName: releasedByName,
    createdAt: releasedAt,
    downloadUrl: reportDownloadPath(report.id),
    downloadUrlExpiresAt: daysFromNow(1),
  };

  db.documents.unshift(document);

  if (record) {
    db.activity.unshift({
      id: `activity-${document.id}`,
      clientId: report.clientId,
      clientName: `${record.client.firstName} ${record.client.lastName}`,
      type: "document",
      summary: `Report shared: ${report.title}`,
      occurredAt: releasedAt,
    });
  }

  return document;
}

export type ReleaseReportInput = {
  reportId: string;
  releasedBy: { userId: string; name: string };
};

/** Marks a report sent and adds it to the client's document list for the portal. */
export function releaseReportToClient(
  db: DemoDatabase,
  input: ReleaseReportInput,
): DemoReportRecord | null {
  const report = db.reports.find((candidate) => candidate.id === input.reportId);

  if (!report) {
    return null;
  }

  const sentAt = report.sentAt ?? new Date().toISOString();
  const firstRelease = !report.sentAt;

  report.sentAt = sentAt;

  attachReleasedReportDocument(db, report, input.releasedBy.name, sentAt);

  if (firstRelease) {
    db.alerts.unshift({
      id: `alert-report-${report.id}`,
      kind: "report_ready",
      severity: "info",
      title: `${report.title} sent`,
      detail: `${input.releasedBy.name} released the ${report.periodLabel} report to the client.`,
      clientId: report.clientId,
      clientName: report.clientName,
      advisorId: input.releasedBy.userId,
      workspaceTab: "advisory",
      createdAt: sentAt,
      read: false,
    });
  }

  return report;
}
