"use server";

import { writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import { can } from "@/lib/auth/capabilities";
import { requireSession } from "@/lib/dal";
import { getClientRecord } from "@/lib/demo/repositories";
import { demoUserById } from "@/lib/demo/seed/users";
import { ensureReportsDir, mutateDemoDb, REPORTS_DIR } from "@/lib/demo/store";
import { assembleInvestmentReportData } from "@/lib/reports/assemble-report-data";
import { renderInvestmentReportPdf } from "@/lib/reports/generate-pdf";
import {
  REPORT_TEMPLATES,
  type ReportTemplateKey,
} from "@/lib/reports/types";
import type { DemoReportRecord } from "@/lib/demo/types";

export type GenerateReportResult =
  | { ok: true; report: DemoReportRecord }
  | { ok: false; message: string };

function isTemplateKey(value: string): value is ReportTemplateKey {
  return REPORT_TEMPLATES.some((template) => template.key === value);
}

export async function generateClientReport(
  clientId: string,
  templateKey: string,
): Promise<GenerateReportResult> {
  const session = await requireSession();

  if (!can(session.demoRole, "generate_report")) {
    return { ok: false, message: "Your role cannot generate reports." };
  }

  if (!isTemplateKey(templateKey)) {
    return { ok: false, message: "Unknown report template." };
  }

  const record = await getClientRecord(clientId);

  if (!record) {
    return { ok: false, message: "That client is not in your book." };
  }

  const advisorUser = demoUserById(record.client.advisorId);
  const data = assembleInvestmentReportData(
    record,
    templateKey,
    advisorUser
      ? {
          name: advisorUser.name,
          email: advisorUser.email,
          title: advisorUser.title,
        }
      : {
          name: record.client.advisorName,
          email: "advisory@celerey.app",
          title: "Relationship Manager",
        },
  );

  let buffer: Buffer;

  try {
    buffer = await renderInvestmentReportPdf(data);
  } catch {
    return {
      ok: false,
      message: "The report could not be rendered. Please try again.",
    };
  }

  const fileName = `${data.reference}.pdf`;

  await ensureReportsDir();
  await writeFile(path.join(REPORTS_DIR, fileName), buffer);

  const report: DemoReportRecord = {
    id: data.reference,
    clientId,
    clientName: data.clientName,
    reference: data.reference,
    title: `${data.reportKindTitle} — ${data.clientName}`,
    templateKey,
    periodLabel: data.statementPeriodLabel,
    fileName,
    sizeBytes: buffer.byteLength,
    generatedBy: session.userId,
    generatedByName: session.name,
    createdAt: new Date().toISOString(),
    sentAt: null,
  };

  await mutateDemoDb((db) => {
    db.reports = [
      report,
      ...db.reports.filter((existing) => existing.id !== report.id),
    ];

    db.auditLogs.unshift({
      id: `audit-${report.id}`,
      actorId: session.userId,
      actorName: session.name,
      action: "report.generated",
      targetType: "client",
      targetId: clientId,
      targetLabel: report.title,
      occurredAt: report.createdAt,
    });
  });

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/insights");

  return { ok: true, report };
}

export async function sendReportToClient(
  reportId: string,
): Promise<{ ok: boolean; message?: string }> {
  const session = await requireSession();

  if (!can(session.demoRole, "generate_report")) {
    return { ok: false, message: "Your role cannot send reports." };
  }

  const sentAt = new Date().toISOString();
  let clientId: string | null = null;

  const found = await mutateDemoDb((db) => {
    const report = db.reports.find((candidate) => candidate.id === reportId);

    if (!report) {
      return false;
    }

    report.sentAt = sentAt;
    clientId = report.clientId;

    db.alerts.unshift({
      id: `alert-report-${report.id}`,
      kind: "report_ready",
      severity: "info",
      title: `${report.title} sent`,
      detail: `${session.name} released the ${report.periodLabel} report to the client.`,
      clientId: report.clientId,
      clientName: report.clientName,
      advisorId: session.userId,
      workspaceTab: "service",
      createdAt: sentAt,
      read: false,
    });

    return true;
  });

  if (!found) {
    return { ok: false, message: "Report not found." };
  }

  if (clientId) {
    revalidatePath(`/clients/${clientId}`);
  }
  revalidatePath("/", "layout");

  return { ok: true };
}
