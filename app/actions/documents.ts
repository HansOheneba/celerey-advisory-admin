"use server";

import { revalidatePath } from "next/cache";
import {
  deleteDocumentApi,
  findDocumentsApi,
  uploadDocumentApi,
} from "@/lib/api/documents";
import { requireSession } from "@/lib/dal";
import type { ClientDocument } from "@/lib/documents/types";
import { getClientById } from "@/lib/repositories/clients";

export async function listDocumentsAction(
  clientId: string,
): Promise<
  { ok: true; items: ClientDocument[] } | { ok: false; message: string }
> {
  const session = await requireSession();
  const result = await findDocumentsApi(session.accessToken, { clientId });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, items: result.data.items };
}

export async function uploadDocumentAction(
  formData: FormData,
): Promise<
  { ok: true; document: ClientDocument } | { ok: false; message: string }
> {
  const session = await requireSession();
  const clientId = String(formData.get("clientId") ?? "");
  const file = formData.get("file");

  if (!clientId) {
    return { ok: false, message: "A client is required to upload a file." };
  }

  if (!(file instanceof Blob) || file.size === 0) {
    return { ok: false, message: "Choose a file to upload." };
  }

  if (file.size > 15 * 1024 * 1024) {
    return { ok: false, message: "File exceeds the 15MB limit." };
  }

  const client = await getClientById(clientId);

  if (!client || client.advisorId !== session.userId) {
    return {
      ok: false,
      message: "You can only upload files for clients assigned to you.",
    };
  }

  const result = await uploadDocumentApi(session.accessToken, formData);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath(`/clients/${clientId}`);

  return { ok: true, document: result.data };
}

export async function deleteDocumentAction(input: {
  documentId: string;
  clientId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await requireSession();
  const client = await getClientById(input.clientId);

  if (!client || client.advisorId !== session.userId) {
    return {
      ok: false,
      message: "You can only delete files for clients assigned to you.",
    };
  }

  const result = await deleteDocumentApi(
    session.accessToken,
    input.documentId,
  );

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath(`/clients/${input.clientId}`);

  return { ok: true };
}
