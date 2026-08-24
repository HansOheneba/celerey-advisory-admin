import "server-only";

import { executeApi, executeMultipartApi } from "@/lib/api/execute";
import type { ClientDocument, DocumentCategory } from "@/lib/documents/types";

const CATEGORIES = new Set<DocumentCategory>([
  "identity",
  "statement",
  "tax",
  "contract",
  "report",
  "plan",
  "review",
  "other",
]);

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeDocument(row: Record<string, unknown>): ClientDocument {
  const category = asString(row.category, "other");
  const uploadedBy = asString(row.uploadedBy ?? row.uploaded_by, "advisor");
  const sessionId = row.sessionId ?? row.session_id;

  return {
    id: asString(row.id),
    clientId: asString(row.clientId ?? row.client_id),
    sessionId: typeof sessionId === "string" && sessionId ? sessionId : null,
    title: asString(row.title),
    category: CATEGORIES.has(category as DocumentCategory)
      ? (category as DocumentCategory)
      : "other",
    fileName: asString(row.fileName ?? row.file_name),
    contentType: asString(row.contentType ?? row.content_type),
    sizeBytes: asNumber(row.sizeBytes ?? row.size_bytes),
    uploadedBy: uploadedBy === "client" ? "client" : "advisor",
    uploadedByName: asString(row.uploadedByName ?? row.uploaded_by_name),
    createdAt: asString(row.createdAt ?? row.created_at),
    downloadUrl: asString(row.downloadUrl ?? row.download_url),
    downloadUrlExpiresAt: asString(
      row.downloadUrlExpiresAt ?? row.download_url_expires_at,
    ),
  };
}

export async function findDocumentsApi(
  accessToken: string,
  params: { clientId: string; category?: DocumentCategory | "all" },
) {
  const result = await executeApi<{
    items?: Array<Record<string, unknown>>;
  }>("admin.documents.find", {
    method: "GET",
    accessToken,
    searchParams: {
      clientId: params.clientId,
      category: params.category ?? "all",
    },
  });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data.items) ? result.data.items : [];

  return {
    ok: true as const,
    status: result.status,
    data: {
      items: items.map(normalizeDocument),
    },
  };
}

export async function uploadDocumentApi(accessToken: string, formData: FormData) {
  const result = await executeMultipartApi<Record<string, unknown>>(
    "admin.documents.upload",
    {
      formData,
      accessToken,
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeDocument(result.data),
  };
}

export async function deleteDocumentApi(
  accessToken: string,
  documentId: string,
) {
  return executeApi<{ deleted?: boolean }>("admin.documents.delete", {
    method: "DELETE",
    accessToken,
    searchParams: { documentId },
  });
}
