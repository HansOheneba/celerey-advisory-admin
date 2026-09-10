import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { MeetingNotesReviewView } from "@/components/sessions/meeting-notes-review-view";
import { Button } from "@/components/ui/button";
import { findAppointmentsApi } from "@/lib/api/appointments";
import { requireSession } from "@/lib/dal";
import { listClients } from "@/lib/repositories/clients";
import { dashboardTheme } from "@/lib/dashboard-theme";

type ReviewPageProps = {
  params: Promise<{ appointmentId: string }>;
};

export default async function MeetingNotesReviewPage({ params }: ReviewPageProps) {
  const { appointmentId } = await params;
  const session = await requireSession();

  const [clientsResult, appointmentsResult] = await Promise.all([
    listClients({
      page: 1,
      pageSize: 100,
      sortBy: "name",
      sortDir: "asc",
      ownBookOnly: true,
    }),
    findAppointmentsApi(session.accessToken, { status: "all" }),
  ]);

  const assignedClientIds = new Set(
    clientsResult.items.map((client) => client.id),
  );

  const appointment = appointmentsResult.ok
    ? appointmentsResult.data.items.find(
        (item) =>
          item.id === appointmentId && assignedClientIds.has(item.clientId),
      )
    : undefined;

  if (!appointment) {
    notFound();
  }

  if (appointment.status !== "pending_review") {
    redirect("/sessions");
  }

  if (!appointment.aiNotesDraft) {
    return (
      <div className={dashboardTheme.pageContainerNarrow}>
        <div className={dashboardTheme.emptyState}>
          <p className="text-sm font-medium">No draft notes available</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This session does not have AI notes ready for review yet.
          </p>
          <Button className="mt-4" render={<Link href="/sessions" />}>
            Back to sessions
          </Button>
        </div>
      </div>
    );
  }

  return <MeetingNotesReviewView appointment={appointment} />;
}
