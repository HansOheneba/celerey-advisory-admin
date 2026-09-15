import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { can } from "@/lib/auth/capabilities";
import { scopedClientRecords } from "@/lib/demo/book-scope";
import { readDemoDb, REPORTS_DIR } from "@/lib/demo/store";
import { parseReportReference } from "@/lib/reports/report-reference";
import { renderClientReportPdf } from "@/lib/reports/render-client-report";
import type { DemoReportRecord } from "@/lib/demo/types";
import type { DemoRole } from "@/lib/auth/capabilities";

type LoadReportPdfInput = {
  reportId: string;
  userId: string;
  demoRole: DemoRole;
};

export type LoadReportPdfResult =
  | {
      ok: true;
      buffer: Buffer;
      fileName: string;
      report: DemoReportRecord | null;
    }
  | { ok: false; status: 401 | 403 | 404 | 410; message: string };

async function readStoredPdf(fileName: string): Promise<Buffer | null> {
  try {
    return await readFile(path.join(REPORTS_DIR, fileName));
  } catch {
    return null;
  }
}

/**
 * Loads a report PDF from disk when available. On serverless, metadata and
 * files may not survive across requests, so the PDF is regenerated from the
 * encoded report id when the client is still in the advisor's book.
 */
export async function loadReportPdf(
  input: LoadReportPdfInput,
): Promise<LoadReportPdfResult> {
  if (!can(input.demoRole, "generate_report")) {
    return {
      ok: false,
      status: 403,
      message: "Your role cannot download reports.",
    };
  }

  const db = await readDemoDb();
  const records = scopedClientRecords(db, {
    userId: input.userId,
    demoRole: input.demoRole,
  });
  const stored = db.reports.find((candidate) => candidate.id === input.reportId);

  if (stored) {
    const visible = records.some(
      (record) => record.client.id === stored.clientId,
    );

    if (!visible) {
      return { ok: false, status: 404, message: "Not found." };
    }

    const buffer = await readStoredPdf(stored.fileName);

    if (buffer) {
      return {
        ok: true,
        buffer,
        fileName: stored.fileName,
        report: stored,
      };
    }
  }

  const parsed = parseReportReference(input.reportId);

  if (!parsed) {
    return { ok: false, status: 404, message: "Not found." };
  }

  const record = records.find(
    (candidate) => candidate.client.id === parsed.clientId,
  );

  if (!record) {
    return { ok: false, status: 404, message: "Not found." };
  }

  try {
    const rendered = await renderClientReportPdf(record, parsed.templateKey);

    if (rendered.reference !== input.reportId) {
      return {
        ok: false,
        status: 410,
        message:
          "This report was generated on a previous day. Generate a new copy from the client workspace.",
      };
    }

    return {
      ok: true,
      buffer: rendered.buffer,
      fileName: rendered.fileName,
      report: stored ?? null,
    };
  } catch {
    return {
      ok: false,
      status: 410,
      message: "The report could not be rendered. Please try again.",
    };
  }
}
