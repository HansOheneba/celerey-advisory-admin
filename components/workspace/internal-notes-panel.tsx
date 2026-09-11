"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";

import { addClientInternalNoteAction } from "@/app/actions/client-internal-notes";
import { SectionPanel } from "@/components/shared/section-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { latestInternalNote, sortInternalNotesNewestFirst } from "@/lib/clients/internal-notes";
import { formatDate } from "@/lib/format";
import type { ClientInternalNote } from "@/types/client-internal-note";

const PREVIEW_LENGTH = 220;

type InternalNotesPanelProps = {
  clientId: string;
  notes?: ClientInternalNote[];
  canEdit: boolean;
  variant?: "full" | "preview";
};

function NotesEditor({
  clientId,
  canEdit,
  triggerLabel,
}: {
  clientId: string;
  canEdit: boolean;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await addClientInternalNoteAction(formData);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Note added");
      setOpen(false);
    });
  }

  if (!canEdit) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add note</DialogTitle>
          <DialogDescription>
            For your team. The client does not see this.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          <Textarea
            name="body"
            rows={6}
            placeholder="Prefers WhatsApp before 5pm. Spouse signs off on tax moves."
            className="min-h-[140px] resize-y"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Add note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function previewText(body: string) {
  if (body.length <= PREVIEW_LENGTH) {
    return body;
  }

  return `${body.slice(0, PREVIEW_LENGTH).trim()}…`;
}

function NoteMeta({ note }: { note: ClientInternalNote }) {
  return (
    <p className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground/80">{note.authorName}</span>
      <span aria-hidden> · </span>
      <time dateTime={note.createdAt}>{formatDate(note.createdAt)}</time>
    </p>
  );
}

function NoteList({ notes }: { notes: ClientInternalNote[] }) {
  const sorted = sortInternalNotesNewestFirst(notes);

  return (
    <ul className="space-y-4">
      {sorted.map((note) => (
        <li
          key={note.id}
          className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3"
        >
          <NoteMeta note={note} />
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {note.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function InternalNotesPanel({
  clientId,
  notes = [],
  canEdit,
  variant = "full",
}: InternalNotesPanelProps) {
  const isPreview = variant === "preview";
  const notesHref = `/clients/${clientId}?tab=notes`;
  const latest = latestInternalNote(notes);
  const hasNotes = notes.length > 0;

  if (isPreview) {
    return (
      <SectionPanel
        title="Notes"
        description="Team file only."
        variant="info"
        actions={
          <div className="flex items-center gap-2">
            {canEdit ? (
              <NotesEditor
                clientId={clientId}
                canEdit={canEdit}
                triggerLabel="Add"
              />
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              render={<Link href={notesHref} />}
            >
              Open tab
            </Button>
          </div>
        }
      >
        {latest ? (
          <div className="space-y-2">
            <NoteMeta note={latest} />
            <p className="text-sm leading-relaxed text-foreground">
              {previewText(latest.body)}
            </p>
            {notes.length > 1 ? (
              <p className="text-xs text-muted-foreground">
                {notes.length - 1} earlier{" "}
                {notes.length - 1 === 1 ? "note" : "notes"} in the Notes tab.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing filed yet.{" "}
            {canEdit ? "Add a line your team should know." : "See the Notes tab."}
          </p>
        )}
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title="Notes"
      description="For your team only. The client does not see this."
      variant="info"
      actions={
        canEdit ? (
          <NotesEditor
            clientId={clientId}
            canEdit={canEdit}
            triggerLabel="Add note"
          />
        ) : null
      }
    >
      <div className="flex gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Lock className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          {hasNotes ? (
            <NoteList notes={notes} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing here yet. Jot down preferences, sensitivities, or what you
              owe them on follow-up.
            </p>
          )}
        </div>
      </div>
    </SectionPanel>
  );
}
