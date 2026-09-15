import { NextResponse } from "next/server";

import { verifySession } from "@/lib/dal";
import { loadReportPdf } from "@/lib/reports/load-report-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorised." }, { status: 401 });
  }

  const { id } = await params;
  const result = await loadReportPdf({
    reportId: id,
    userId: session.userId,
    demoRole: session.demoRole,
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: result.status },
    );
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${result.fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
