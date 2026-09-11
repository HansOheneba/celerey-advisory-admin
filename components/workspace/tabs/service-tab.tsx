import { ClientSessionsSection } from "@/components/sessions/client-sessions-section";
import { ClientAvailabilityCard } from "@/components/clients/client-availability-card";
import { ClientDocumentsCard } from "@/components/clients/client-documents-card";
import { ClientReportsPanel } from "@/components/reports/client-reports-panel";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  isNegotiationStatus,
  isScheduledStatus,
} from "@/lib/appointments/display";
import { APPOINTMENT_TYPE_LABELS } from "@/lib/appointments/types";
import type { Appointment } from "@/lib/appointments/types";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type { ClientAvailability } from "@/lib/availability/types";
import type { ClientDocument } from "@/lib/documents/types";
import { formatDate } from "@/lib/format";
import type { Task } from "@/lib/tasks/types";
import type { DemoReportRecord, DemoServiceRequest } from "@/lib/demo/types";

const REQUEST_STATUS_LABELS: Record<DemoServiceRequest["status"], string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

type ServiceTabProps = {
  clientId: string;
  documents: ClientDocument[];
  reports: DemoReportRecord[];
  serviceRequests: DemoServiceRequest[];
  tasks: Task[];
  appointments: Appointment[];
  availability: ClientAvailability;
  canManageDocuments: boolean;
  canGenerateReport: boolean;
  /** Advisory sub-tab: sessions + scheduling only */
  sessionsOnly?: boolean;
  /** Advisory sub-tab: tasks list only */
  tasksOnly?: boolean;
  /** Advisory sub-tab: documents only */
  documentsOnly?: boolean;
};

export function ServiceTab({
  clientId,
  documents,
  reports,
  serviceRequests,
  tasks,
  appointments,
  availability,
  canManageDocuments,
  canGenerateReport,
  sessionsOnly = false,
  tasksOnly = false,
  documentsOnly = false,
}: ServiceTabProps) {
  const openTasks = tasks.filter((task) => task.status === "open");
  const upcoming = appointments.filter(
    (appointment) =>
      isScheduledStatus(appointment.status) ||
      isNegotiationStatus(appointment.status),
  );

  if (documentsOnly) {
    return (
      <ClientDocumentsCard
        clientId={clientId}
        initialDocuments={documents}
        canEdit={canManageDocuments}
      />
    );
  }

  if (tasksOnly) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            {openTasks.length} open task{openTasks.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks on file.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{task.title}</p>
                  {task.description ? (
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {task.assignee} · {task.status}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {task.dueAt ? formatDate(task.dueAt) : "No date"}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  if (sessionsOnly) {
    return (
      <div className="space-y-4">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>
              {upcoming.length} upcoming · session logs and published notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientSessionsSection
              clientId={clientId}
              appointments={appointments}
            />
          </CardContent>
        </Card>

        <ClientReportsPanel
          clientId={clientId}
          reports={reports}
          canGenerate={canGenerateReport}
        />

        <ClientAvailabilityCard availability={availability} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Service requests</CardTitle>
            <CardDescription>
              {serviceRequests.filter((request) => request.status !== "resolved")
                .length}{" "}
              open.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {serviceRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing open.
              </p>
            ) : (
              serviceRequests.map((request) => (
                <div
                  key={request.id}
                  className="space-y-1 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {request.subject}
                    </span>
                    <Badge
                      variant={
                        request.status === "resolved"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {REQUEST_STATUS_LABELS[request.status]}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {request.detail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Raised {formatDate(request.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Tasks and meetings</CardTitle>
            <CardDescription>
              {openTasks.length} open task{openTasks.length === 1 ? "" : "s"},{" "}
              {upcoming.length} upcoming meeting
              {upcoming.length === 1 ? "" : "s"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {openTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{task.title}</p>
                  {task.description ? (
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {task.dueAt ? formatDate(task.dueAt) : "No date"}
                </span>
              </div>
            ))}

            {upcoming.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{appointment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {APPOINTMENT_TYPE_LABELS[appointment.type]} ·{" "}
                    {appointment.status}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {appointment.scheduledAt
                    ? formatDate(appointment.scheduledAt)
                    : "Awaiting date"}
                </span>
              </div>
            ))}

            {openTasks.length === 0 && upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing outstanding.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <p className={dashboardTheme.sectionLabel}>Compliance</p>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Session logs and published meeting notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientSessionsSection
            clientId={clientId}
            appointments={appointments}
          />
        </CardContent>
      </Card>

      <ClientReportsPanel
        clientId={clientId}
        reports={reports}
        canGenerate={canGenerateReport}
      />

      <ClientDocumentsCard
        clientId={clientId}
        initialDocuments={documents}
        canEdit={canManageDocuments}
      />

      <ClientAvailabilityCard availability={availability} />
    </div>
  );
}
