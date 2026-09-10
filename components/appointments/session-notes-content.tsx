import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { Appointment } from "@/lib/appointments/types";

type SessionNotesContentProps = {
  appointment: Appointment;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </p>
  );
}

function DiscussionList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed">
      {items.map((point) => (
        <li key={point}>{point}</li>
      ))}
    </ul>
  );
}

export function SessionNotesContent({ appointment }: SessionNotesContentProps) {
  const log = appointment.log;
  const published = appointment.aiNotesPublished;

  if (!log && !published) {
    return (
      <p className="text-sm text-muted-foreground">
        No session notes recorded for this meeting.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {log ? (
        <section className="space-y-4">
          <div>
            <SectionLabel>Advisor session log</SectionLabel>
            {log.title ? (
              <p className="mt-1 text-sm font-medium">{log.title}</p>
            ) : null}
          </div>

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
              <SectionLabel>Advisor assessment</SectionLabel>
              <p className="text-sm leading-relaxed">{log.advisorAssessment}</p>
            </div>
          ) : null}

          {log.discussionPoints.length > 0 ? (
            <div className="space-y-1.5">
              <SectionLabel>Key discussion points</SectionLabel>
              <DiscussionList items={log.discussionPoints} />
            </div>
          ) : null}

          {log.recommendations.length > 0 ? (
            <div className="space-y-1.5">
              <SectionLabel>Recommendations</SectionLabel>
              <ul className="list-disc space-y-1 pl-4 text-sm">
                {log.recommendations.map((item) => (
                  <li key={item.title}>{item.title}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {log.sessionNotes ? (
            <div className="space-y-1">
              <SectionLabel>Session notes</SectionLabel>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {log.sessionNotes}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {published ? (
        <section className="space-y-4">
          <SectionLabel>
            {log ? "Published meeting notes" : "Meeting notes"}
          </SectionLabel>

          {published.summary ? (
            <div className="space-y-1">
              <SectionLabel>Summary</SectionLabel>
              <p className="text-sm leading-relaxed">{published.summary}</p>
            </div>
          ) : null}

          {published.discussionPoints.length > 0 ? (
            <div className="space-y-1.5">
              <SectionLabel>Discussion points</SectionLabel>
              <DiscussionList items={published.discussionPoints} />
            </div>
          ) : null}

          {published.actionItems.length > 0 ? (
            <div className="space-y-2">
              <SectionLabel>Action items</SectionLabel>
              <ul className="space-y-2 text-sm">
                {published.actionItems.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
                  >
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground">
                      {item.owner}
                      {item.dueAt
                        ? ` · due ${new Date(item.dueAt).toLocaleDateString()}`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {published.participants.length > 0 ? (
            <div className="space-y-1.5">
              <SectionLabel>Participants</SectionLabel>
              <p className="text-sm text-muted-foreground">
                {published.participants.join(" · ")}
              </p>
            </div>
          ) : null}

          {published.transcriptExcerpt ? (
            <div className="space-y-1.5">
              <SectionLabel>Transcript excerpt</SectionLabel>
              <p className="rounded-lg border border-border/50 bg-muted/20 p-3 text-sm leading-relaxed text-muted-foreground">
                {published.transcriptExcerpt}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {appointment.progress?.metrics.length ? (
        <section className="space-y-2">
          <SectionLabel>Progress snapshot</SectionLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {appointment.progress.metrics.map((metric) => (
              <div
                key={metric.key}
                className="rounded-lg border border-border/50 px-3 py-2"
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
        </section>
      ) : null}
    </div>
  );
}
