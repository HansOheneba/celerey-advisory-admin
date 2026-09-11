import type { ClientInternalNote } from "@/types/client-internal-note";

export function appendInternalNote(
  notes: ClientInternalNote[],
  note: Omit<ClientInternalNote, "id"> & { id?: string },
): ClientInternalNote[] {
  const entry: ClientInternalNote = {
    id: note.id ?? `note-${Date.now().toString(36)}`,
    body: note.body.trim(),
    authorId: note.authorId,
    authorName: note.authorName,
    createdAt: note.createdAt,
  };

  if (!entry.body) {
    return notes;
  }

  return sortInternalNotesNewestFirst([entry, ...notes]);
}

export function sortInternalNotesNewestFirst(
  notes: ClientInternalNote[],
): ClientInternalNote[] {
  return [...notes].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export function latestInternalNote(
  notes: ClientInternalNote[],
): ClientInternalNote | null {
  const sorted = sortInternalNotesNewestFirst(notes);
  return sorted[0] ?? null;
}

export function normalizeInternalNotes(raw: unknown): ClientInternalNote[] {
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }
        const note = entry as Record<string, unknown>;
        const body = String(note.body ?? "").trim();
        if (!body) {
          return null;
        }
        return {
          id: String(note.id ?? `note-${body.slice(0, 8)}`),
          body,
          authorId: String(note.authorId ?? note.author_id ?? ""),
          authorName: String(note.authorName ?? note.author_name ?? "Advisor"),
          createdAt: String(note.createdAt ?? note.created_at ?? ""),
        };
      })
      .filter((note): note is ClientInternalNote => note !== null);
  }

  if (typeof raw === "string" && raw.trim()) {
    return [
      {
        id: "legacy-note",
        body: raw.trim(),
        authorId: "legacy",
        authorName: "Advisor",
        createdAt: new Date().toISOString(),
      },
    ];
  }

  return [];
}
