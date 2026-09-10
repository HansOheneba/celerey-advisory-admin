"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { publishAppointmentNotesAction } from "@/app/actions/appointments";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatLongDate,
  formatTimeRange,
  toDateInput,
} from "@/lib/appointments/display";
import type { Appointment, MeetingActionItem } from "@/lib/appointments/types";
import { dashboardTheme } from "@/lib/dashboard-theme";

type ActionItemDraft = {
  title: string;
  owner: string;
  dueAt: string;
};

type MeetingNotesReviewViewProps = {
  appointment: Appointment;
};

function emptyActionItem(owner: string): ActionItemDraft {
  return { title: "", owner, dueAt: "" };
}

function draftFromActionItem(item: MeetingActionItem): ActionItemDraft {
  return {
    title: item.title,
    owner: item.owner,
    dueAt: item.dueAt ? toDateInput(new Date(item.dueAt)) : "",
  };
}

function actionItemFromDraft(item: ActionItemDraft): MeetingActionItem {
  return {
    title: item.title.trim(),
    owner: item.owner.trim(),
    dueAt: item.dueAt
      ? new Date(`${item.dueAt}T12:00:00`).toISOString()
      : null,
  };
}

export function MeetingNotesReviewView({
  appointment,
}: MeetingNotesReviewViewProps) {
  const router = useRouter();
  const draft = appointment.aiNotesDraft;
  const [summary, setSummary] = useState("");
  const [discussionPoints, setDiscussionPoints] = useState<string[]>([""]);
  const [actionItems, setActionItems] = useState<ActionItemDraft[]>([
    emptyActionItem(appointment.advisorName),
  ]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!draft) {
      return;
    }

    setSummary(draft.summary);
    setDiscussionPoints(
      draft.discussionPoints.length > 0 ? draft.discussionPoints : [""],
    );
    setActionItems(
      draft.actionItems.length > 0
        ? draft.actionItems.map(draftFromActionItem)
        : [emptyActionItem(appointment.advisorName)],
    );
  }, [appointment.advisorName, draft]);

  if (!draft) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const points = discussionPoints.map((item) => item.trim()).filter(Boolean);
    const items = actionItems
      .map(actionItemFromDraft)
      .filter((item) => item.title);

    if (!summary.trim()) {
      toast.error("Add a summary before publishing.");
      return;
    }

    startTransition(async () => {
      const result = await publishAppointmentNotesAction({
        appointmentId: appointment.id,
        summary: summary.trim(),
        discussionPoints: points,
        actionItems: items,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Notes published to client");
      router.push("/sessions");
      router.refresh();
    });
  }

  return (
    <div className={dashboardTheme.pageContainerNarrow}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 px-2 text-muted-foreground"
            render={<Link href="/sessions" />}
          >
            <ArrowLeft />
            Back to sessions
          </Button>
          <div className="space-y-1">
            <p className={dashboardTheme.sectionLabel}>Meeting notes review</p>
            <h1 className={dashboardTheme.pageTitle}>{appointment.title}</h1>
            <p className={dashboardTheme.pageDescription}>
              {appointment.clientName} ·{" "}
              {appointment.scheduledAt
                ? `${formatLongDate(appointment.scheduledAt)} · ${formatTimeRange(appointment.scheduledAt, appointment.durationMinutes)}`
                : "Unscheduled"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AppointmentStatusBadge status={appointment.status} />
            <span className="text-xs text-muted-foreground">
              Draft from Celerey Notetaker (demo)
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className={`${dashboardTheme.elevatedSection} space-y-4`}>
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <h2 className={dashboardTheme.sectionTitle}>Summary</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Session summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={5}
              required
            />
          </div>
        </section>

        <section className={`${dashboardTheme.elevatedSection} space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={dashboardTheme.sectionTitle}>Discussion points</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setDiscussionPoints((current) => [...current, ""])
              }
            >
              <Plus />
              Add point
            </Button>
          </div>
          <div className="space-y-3">
            {discussionPoints.map((point, index) => (
              <div key={`point-${index}`} className="flex items-start gap-2">
                <Input
                  value={point}
                  onChange={(event) =>
                    setDiscussionPoints((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    )
                  }
                  placeholder={`Discussion point ${index + 1}`}
                  className="flex-1"
                />
                {discussionPoints.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove discussion point ${index + 1}`}
                    onClick={() =>
                      setDiscussionPoints((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className={`${dashboardTheme.elevatedSection} space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className={dashboardTheme.sectionTitle}>Action items</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add follow-ups for you or the client before publishing.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setActionItems((current) => [
                  ...current,
                  emptyActionItem(appointment.advisorName),
                ])
              }
            >
              <Plus />
              Add action
            </Button>
          </div>
          <div className="space-y-3">
            {actionItems.map((item, index) => (
              <div
                key={`action-${index}`}
                className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Action {index + 1}
                  </Label>
                  {actionItems.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove action item ${index + 1}`}
                      onClick={() =>
                        setActionItems((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`action-title-${index}`}>Title</Label>
                  <Input
                    id={`action-title-${index}`}
                    value={item.title}
                    onChange={(event) =>
                      setActionItems((current) =>
                        current.map((entry, itemIndex) =>
                          itemIndex === index
                            ? { ...entry, title: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    placeholder="Send staged deployment proposal"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`action-owner-${index}`}>Owner</Label>
                    <Input
                      id={`action-owner-${index}`}
                      value={item.owner}
                      onChange={(event) =>
                        setActionItems((current) =>
                          current.map((entry, itemIndex) =>
                            itemIndex === index
                              ? { ...entry, owner: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      placeholder={appointment.advisorName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`action-due-${index}`}>Due date</Label>
                    <Input
                      id={`action-due-${index}`}
                      type="date"
                      value={item.dueAt}
                      onChange={(event) =>
                        setActionItems((current) =>
                          current.map((entry, itemIndex) =>
                            itemIndex === index
                              ? { ...entry, dueAt: event.target.value }
                              : entry,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`${dashboardTheme.elevatedSection} space-y-3`}>
          <h2 className={dashboardTheme.sectionTitle}>Transcript excerpt</h2>
          <p className="rounded-lg border border-border bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground">
            {draft.transcriptExcerpt}
          </p>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            render={<Link href="/sessions" />}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            Publish to client
          </Button>
        </div>
      </form>
    </div>
  );
}
