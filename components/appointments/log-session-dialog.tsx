"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
  type SessionActionCategory,
  type SessionLogInput,
} from "@/lib/appointments/types";
import { TASK_PRIORITY_LABELS, type TaskPriority } from "@/lib/tasks/types";

const ACTION_CATEGORIES: Record<SessionActionCategory, string> = {
  financial: "Financial",
  documents: "Documents",
  goals: "Goals",
  other: "Other",
};

type LogSessionDialogProps = {
  appointment: Appointment | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (input: SessionLogInput) => void;
};

type ActionDraft = {
  title: string;
  dueAt: string;
  category: SessionActionCategory;
  priority: TaskPriority;
};

function emptyAction(): ActionDraft {
  return {
    title: "",
    dueAt: "",
    category: "financial",
    priority: "medium",
  };
}

export function LogSessionDialog({
  appointment,
  pending,
  onClose,
  onSubmit,
}: LogSessionDialogProps) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [advisorAssessment, setAdvisorAssessment] = useState("");
  const [discussionPoints, setDiscussionPoints] = useState<string[]>([""]);
  const [recommendations, setRecommendations] = useState<string[]>([""]);
  const [sessionNotes, setSessionNotes] = useState("");
  const [actions, setActions] = useState<ActionDraft[]>([emptyAction()]);
  const [seededFor, setSeededFor] = useState<string | null>(null);

  if (appointment && seededFor !== appointment.id) {
    setSeededFor(appointment.id);
    setTitle(
      appointment.title || APPOINTMENT_TYPE_LABELS[appointment.type],
    );
    setTags(appointment.log?.tags.join(", ") ?? "");
    setAdvisorAssessment(appointment.log?.advisorAssessment ?? "");
    setDiscussionPoints(
      appointment.log?.discussionPoints.length
        ? appointment.log.discussionPoints
        : [""],
    );
    setRecommendations(
      appointment.log?.recommendations.length
        ? appointment.log.recommendations.map((item) => item.title)
        : [""],
    );
    setSessionNotes(appointment.log?.sessionNotes ?? "");
    setActions([emptyAction()]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointment || !title.trim() || !advisorAssessment.trim()) {
      return;
    }

    onSubmit({
      appointmentId: appointment.id,
      title: title.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      advisorAssessment: advisorAssessment.trim(),
      discussionPoints: discussionPoints.map((item) => item.trim()).filter(Boolean),
      recommendations: recommendations
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => ({ title: item })),
      sessionNotes: sessionNotes.trim(),
      actions: actions
        .filter((action) => action.title.trim())
        .map((action) => ({
          title: action.title.trim(),
          dueAt: action.dueAt ? new Date(action.dueAt).toISOString() : null,
          category: action.category,
          priority: action.priority,
        })),
    });
  }

  return (
    <Dialog open={Boolean(appointment)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log session</DialogTitle>
          <DialogDescription>
            This is what the client sees on their Advisory page — assessment,
            discussion, recommendations, notes, and follow-up actions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logTitle">Session title</Label>
            <Input
              id="logTitle"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Annual Review"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logTags">Tags</Label>
            <Input
              id="logTags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Annual review, Goals progress, Net worth trajectory"
            />
            <p className="text-xs text-muted-foreground">Comma-separated.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logAssessment">Advisor assessment</Label>
            <Textarea
              id="logAssessment"
              value={advisorAssessment}
              onChange={(event) => setAdvisorAssessment(event.target.value)}
              placeholder="How their position changed, and the priority from here."
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Key discussion points</Label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setDiscussionPoints((current) => [...current, ""])}
              >
                <Plus />
                Add
              </Button>
            </div>
            {discussionPoints.map((point, index) => (
              <Input
                key={`point-${index}`}
                value={point}
                onChange={(event) =>
                  setDiscussionPoints((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  )
                }
                placeholder={`Point ${index + 1}`}
              />
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Recommendations</Label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setRecommendations((current) => [...current, ""])}
              >
                <Plus />
                Add
              </Button>
            </div>
            {recommendations.map((item, index) => (
              <Input
                key={`rec-${index}`}
                value={item}
                onChange={(event) =>
                  setRecommendations((current) =>
                    current.map((value, itemIndex) =>
                      itemIndex === index ? event.target.value : value,
                    ),
                  )
                }
                placeholder={`Recommendation ${index + 1}`}
              />
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="logNotes">Session notes</Label>
            <Textarea
              id="logNotes"
              value={sessionNotes}
              onChange={(event) => setSessionNotes(event.target.value)}
              placeholder="Follow-up materials, what the next session should cover."
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label>Recommended actions</Label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() =>
                  setActions((current) => [...current, emptyAction()])
                }
              >
                <Plus />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Assigned to the client. They see these on their plan.
            </p>
            {actions.map((action, index) => (
              <div
                key={`action-${index}`}
                className="space-y-2 rounded-lg border border-border p-3"
              >
                <Input
                  value={action.title}
                  onChange={(event) =>
                    setActions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, title: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Increase pension contribution to 12%"
                />
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    type="date"
                    value={action.dueAt}
                    onChange={(event) =>
                      setActions((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, dueAt: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Select
                    value={action.category}
                    onValueChange={(value) =>
                      setActions((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                category:
                                  (value as SessionActionCategory) ??
                                  "financial",
                              }
                            : item,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACTION_CATEGORIES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={action.priority}
                    onValueChange={(value) =>
                      setActions((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                priority: (value as TaskPriority) ?? "medium",
                              }
                            : item,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_PRIORITY_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !advisorAssessment.trim() || pending}
            >
              {pending ? "Saving…" : "Save session log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
