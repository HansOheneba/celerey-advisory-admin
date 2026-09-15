import "server-only";

import { assembleInvestmentReportData } from "@/lib/reports/assemble-report-data";
import { renderInvestmentReportPdf } from "@/lib/reports/generate-pdf";
import { reportPdfFileName } from "@/lib/reports/report-reference";
import type { ReportTemplateKey } from "@/lib/reports/types";
import { demoUserById } from "@/lib/demo/seed/users";
import type { DemoClientRecord } from "@/lib/demo/types";

export type RenderedClientReport = {
  buffer: Buffer;
  fileName: string;
  reference: string;
  clientName: string;
  reportKindTitle: string;
  statementPeriodLabel: string;
};

export async function renderClientReportPdf(
  record: DemoClientRecord,
  templateKey: ReportTemplateKey,
): Promise<RenderedClientReport> {
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
          email: "advisory@example.com",
          title: "Relationship Manager",
        },
  );

  const buffer = await renderInvestmentReportPdf(data);

  return {
    buffer,
    fileName: reportPdfFileName(data.reference),
    reference: data.reference,
    clientName: data.clientName,
    reportKindTitle: data.reportKindTitle,
    statementPeriodLabel: data.statementPeriodLabel,
  };
}
