"use server";

import { writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import { can } from "@/lib/auth/capabilities";
import { requireSession } from "@/lib/dal";
import { getClientRecord } from "@/lib/demo/repositories";
import { ensureReportsDir, mutateDemoDb, REPORTS_DIR } from "@/lib/demo/store";
import { releaseReportToClient } from "@/lib/reports/release-to-client";
import { renderClientReportPdf } from "@/lib/reports/render-client-report";
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
  sendToClient = false,
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

  let rendered;

  try {
    rendered = await renderClientReportPdf(record, templateKey);
  } catch {
    return {
      ok: false,
      message: "The report could not be rendered. Please try again.",
    };
  }

  const {
    buffer,
    fileName,
    reference,
    clientName,
    reportKindTitle,
    statementPeriodLabel,
  } = rendered;

  await ensureReportsDir();
  await writeFile(path.join(REPORTS_DIR, fileName), buffer);

  const report: DemoReportRecord = {
    id: reference,
    clientId,
    clientName,
    reference,
    title: `${reportKindTitle} — ${clientName}`,
    templateKey,
    periodLabel: statementPeriodLabel,
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

    if (sendToClient) {
      releaseReportToClient(db, {
        reportId: report.id,
        releasedBy: { userId: session.userId, name: session.name },
      });
    }
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

  let clientId: string | null = null;

  const found = await mutateDemoDb((db) => {
    const report = releaseReportToClient(db, {
      reportId,
      releasedBy: { userId: session.userId, name: session.name },
    });

    if (!report) {
      return false;
    }

    clientId = report.clientId;
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
