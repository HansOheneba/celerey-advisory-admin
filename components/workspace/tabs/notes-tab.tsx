import { InternalNotesPanel } from "@/components/workspace/internal-notes-panel";
import type { DemoClientRecord } from "@/lib/demo/types";

type NotesTabProps = {
  record: DemoClientRecord;
  canEdit: boolean;
};

export function NotesTab({ record, canEdit }: NotesTabProps) {
  const { client } = record;

  return (
    <InternalNotesPanel
      clientId={client.id}
      notes={record.internalNotes}
      canEdit={canEdit}
      variant="full"
    />
  );
}
