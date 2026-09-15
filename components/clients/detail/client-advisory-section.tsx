"use client";

import { Badge } from "@/components/ui/badge";
import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  APPOINTMENT_TYPE_LABELS,
  type AdvisoryEntitlement,
  type Appointment,
} from "@/lib/appointments/types";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { formatDate, formatProgressMetric } from "@/lib/format";

type ClientAdvisorySectionProps = {
  appointments: Appointment[];
  entitlement: AdvisoryEntitlement | null;
  currency?: "USD" | "GHS" | "GBP";
};

function sessionHeading(appointment: Appointment) {
  return (
    appointment.title ||
    appointment.log?.title ||
    APPOINTMENT_TYPE_LABELS[appointment.type]
  );
}

export function ClientAdvisorySection({
  appointments,
  entitlement,
  currency = "USD",
}: ClientAdvisorySectionProps) {
  const history = appointments
    .filter((item) => item.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.scheduledAt ?? 0).getTime() -
        new Date(a.scheduledAt ?? 0).getTime(),
    );

  const lastSession = history[0];
  const sessionCount = entitlement?.used ?? history.length;
  const log = lastSession?.log;

  return (
    <div className="space-y-3">
      <Card className={dashboardTheme.card}>
        <CardHeader>
          {entitlement ? (
            <SectionEyebrow>{`Plan year ${entitlement.planYear}`}</SectionEyebrow>
          ) : (
            <SectionEyebrow>Advisory</SectionEyebrow>
          )}
          <CardTitle className="text-base font-semibold">
            Advisory sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-medium tabular-nums tracking-tight">
            {sessionCount}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {history.length === 0
              ? "No logged sessions yet. After a meeting, log it from Appointments so the client Advisory page has notes, actions, and an assessment."
              : `Logged advisory sessions${entitlement ? ` in ${entitlement.planYear}` : ""}`}
          </p>
        </CardContent>
      </Card>
      {log && lastSession ? (
        <Card className={dashboardTheme.card}>
          <CardHeader>
            <SectionEyebrow>Last session</SectionEyebrow>
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
                      {formatProgressMetric(metric, currency)}
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
            <SectionEyebrow>History</SectionEyebrow>
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
