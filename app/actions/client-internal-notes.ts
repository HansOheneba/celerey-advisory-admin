"use server";

import { revalidatePath } from "next/cache";

import { appendInternalNote } from "@/lib/clients/internal-notes";
import { can } from "@/lib/auth/capabilities";
import { requireSession } from "@/lib/dal";
import { getClientRecord } from "@/lib/demo/repositories";
import { nextProfileId } from "@/lib/demo/profile";
import type { ProfileWriteResult } from "@/lib/demo/profile-types";
import { mutateDemoDb } from "@/lib/demo/store";

export async function addClientInternalNoteAction(
  formData: FormData,
): Promise<ProfileWriteResult> {
  const session = await requireSession();

  if (!can(session.demoRole, "edit_client_data")) {
    return {
      ok: false,
      message: "Your role cannot edit notes.",
    };
  }

  const clientId = String(formData.get("clientId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!clientId) {
    return { ok: false, message: "Missing client." };
  }

  if (!body) {
    return { ok: false, message: "Write something before saving." };
  }

  const visible = await getClientRecord(clientId);

  if (!visible) {
    return { ok: false, message: "That client is not in your book." };
  }

  const found = await mutateDemoDb((db) => {
    const record = db.clients.find(
      (candidate) => candidate.client.id === clientId,
    );

    if (!record) {
      return false;
    }

    record.internalNotes = appendInternalNote(record.internalNotes ?? [], {
      id: nextProfileId("note"),
      body,
      authorId: session.userId,
      authorName: session.name,
      createdAt: new Date().toISOString(),
    });

    db.auditLogs.unshift({
      id: nextProfileId("audit"),
      actorId: session.userId,
      actorName: session.name,
      action: "client.internal_notes.updated",
      targetType: "client",
      targetId: clientId,
      targetLabel: `${record.client.firstName} ${record.client.lastName}`,
      occurredAt: new Date().toISOString(),
    });

    return true;
  });

  if (!found) {
    return { ok: false, message: "That client is not in your book." };
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");

  return { ok: true };
}
