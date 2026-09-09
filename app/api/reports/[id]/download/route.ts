import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { verifySession } from "@/lib/dal";
import { readDemoDb, REPORTS_DIR } from "@/lib/demo/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorised." }, { status: 401 });
  }

  const { id } = await params;
  const db = await readDemoDb();
  const report = db.reports.find((candidate) => candidate.id === id);

  if (!report) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  try {
    const file = await readFile(path.join(REPORTS_DIR, report.fileName));

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${report.fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "The generated file is no longer available." },
      { status: 410 },
    );
  }
}
