"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAdvisoryEntitlementAction } from "@/app/actions/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  APPOINTMENT_TYPE_LABELS,
  type AdvisoryEntitlement,
  type Appointment,
} from "@/lib/appointments/types";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatDate } from "@/lib/format";

type ClientAdvisorySectionProps = {
  clientId: string;
  appointments: Appointment[];
  entitlement: AdvisoryEntitlement | null;
  canEditEntitlement: boolean;
};

function sessionHeading(appointment: Appointment) {
  return (
    appointment.title ||
    appointment.log?.title ||
    APPOINTMENT_TYPE_LABELS[appointment.type]
  );
}

export function ClientAdvisorySection({
  clientId,
  appointments,
  entitlement: initialEntitlement,
  canEditEntitlement,
}: ClientAdvisorySectionProps) {
  const [entitlement, setEntitlement] = useState(initialEntitlement);
  const [included, setIncluded] = useState(
    String(initialEntitlement?.included ?? 2),
  );
  const [pending, startTransition] = useTransition();

  const lastSession = [...appointments]
    .filter((item) => item.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.scheduledAt ?? 0).getTime() -
        new Date(a.scheduledAt ?? 0).getTime(),
    )[0];

  const history = appointments
    .filter((item) => item.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.scheduledAt ?? 0).getTime() -
        new Date(a.scheduledAt ?? 0).getTime(),
    );

  function saveEntitlement() {
    if (!entitlement) {
      return;
    }
    const nextIncluded = Number(included);
    if (!Number.isFinite(nextIncluded) || nextIncluded < 0) {
      toast.error("Included sessions must be a number.");
      return;
    }

    startTransition(async () => {
      const result = await updateAdvisoryEntitlementAction({
        clientId,
        planYear: entitlement.planYear,
        included: nextIncluded,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setEntitlement(result.entitlement);
      setIncluded(String(result.entitlement.included));
      toast.success("Entitlement updated");
    });
  }

  const log = lastSession?.log;

  return (
    <div className="space-y-3">
      {entitlement ? (
        <Card className={dashboardTheme.card}>
          <CardHeader>
            <p className={dashboardTheme.sectionLabel}>Plan year</p>
            <CardTitle className="text-base font-semibold">
              {entitlement.planYear} sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-border px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  Included
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {entitlement.included}
                </p>
              </div>
              <div className="rounded-lg border border-border px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  Used
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {entitlement.used}
                </p>
              </div>
              <div className="rounded-lg border border-border px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  Remaining
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {entitlement.remaining}
                </p>
              </div>
            </div>
            {canEditEntitlement ? (
              <div className="flex items-end gap-2">
                <div className="space-y-2">
                  <Label htmlFor="includedSessions">Included</Label>
                  <Input
                    id="includedSessions"
                    type="number"
                    min={0}
                    className="w-24"
                    value={included}
                    onChange={(event) => setIncluded(event.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  disabled={pending}
                  onClick={saveEntitlement}
                >
                  Save
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!lastSession && history.length === 0 ? (
        <Card className={dashboardTheme.card}>
          <CardHeader>
            <p className={dashboardTheme.sectionLabel}>Advisory</p>
            <CardTitle className="text-base font-semibold">
              Session history
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No logged sessions yet. After a meeting, log it from Appointments so
              the client Advisory page has notes, actions, and an assessment.
            </p>
          </CardContent>
        </Card>
      ) : null}
      {log && lastSession ? (
        <Card className={dashboardTheme.card}>
          <CardHeader>
            <p className={dashboardTheme.sectionLabel}>Last session</p>
            <CardTitle className="text-base font-semibold">
              {sessionHeading(lastSession)}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDate(lastSession.scheduledAt ?? "")} ·{" "}
              {lastSession.durationMinutes} min
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {log.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {log.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
            {log.advisorAssessment ? (
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Advisor assessment
                </p>
                <p className="text-sm leading-relaxed">
                  {log.advisorAssessment}
                </p>
              </div>
            ) : null}
            {log.discussionPoints.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Key discussion points
                </p>
                <ul className="list-disc space-y-1 pl-4 text-sm">
                  {log.discussionPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {log.recommendations.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Recommendations
                </p>
                <ul className="list-disc space-y-1 pl-4 text-sm">
                  {log.recommendations.map((item) => (
                    <li key={item.title}>{item.title}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {log.sessionNotes ? (
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Session notes
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {log.sessionNotes}
                </p>
              </div>
            ) : null}
            {lastSession.progress?.metrics.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {lastSession.progress.metrics.map((metric) => (
                  <div
                    key={metric.key}
                    className="rounded-lg border border-border px-3 py-2"
                  >
                    <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-sm font-semibold tabular-nums">
                      {metric.unit === "percent"
                        ? `${metric.value}%`
                        : metric.value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {history.length > 0 ? (
        <Card className={dashboardTheme.card}>
          <CardHeader>
            <p className={dashboardTheme.sectionLabel}>History</p>
            <CardTitle className="text-base font-semibold">
              Advisory sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/50 p-0">
            {history.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium">{sessionHeading(item)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.scheduledAt ?? "")} · {item.durationMinutes} min
                  {item.log?.tags.length
                    ? ` · ${item.log.tags.join(", ")}`
                    : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
