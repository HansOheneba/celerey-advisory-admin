import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";

import { InvestmentReportDocument } from "@/lib/reports/pdf/investment-report-document";
import type { InvestmentReportData } from "@/lib/reports/types";

export async function renderInvestmentReportPdf(
  data: InvestmentReportData,
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <InvestmentReportDocument data={data} />,
  );

  return Buffer.from(buffer);
}
