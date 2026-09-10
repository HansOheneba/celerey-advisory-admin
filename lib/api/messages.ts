import "server-only";

import { executeApi } from "@/lib/api/execute";
import { pickString } from "@/lib/api/portal-field-aliases";
import type {
  ConversationMessage,
  ConversationThread,
  MessageAuthor,
} from "@/lib/messages/types";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeAuthor(value: unknown): MessageAuthor {
  if (value === "advisor" || value === "client" || value === "note") {
    return value;
  }
  return "advisor";
}

function normalizeMessage(row: Record<string, unknown>): ConversationMessage {
  return {
    id: pickString(row, "id", "messageId", "message_id"),
    author: normalizeAuthor(row.author),
    body: asString(row.body),
    createdAt: asString(row.createdAt ?? row.created_at),
  };
}

function normalizeThread(row: Record<string, unknown>): ConversationThread {
  const messagesRaw = Array.isArray(row.messages) ? row.messages : [];
  const lastRaw = asRecord(row.lastMessage ?? row.last_message);
  const messages = messagesRaw
    .filter((message): message is Record<string, unknown> =>
      Boolean(message && typeof message === "object"),
    )
    .map(normalizeMessage);

  return {
    id: pickString(row, "id", "threadId", "thread_id"),
    clientId: asString(row.clientId ?? row.client_id),
    clientName: asString(row.clientName ?? row.client_name),
    clientEmail: asString(row.clientEmail ?? row.client_email),
    advisorId: asString(row.advisorId ?? row.advisor_id),
    updatedAt: asString(row.updatedAt ?? row.updated_at),
    unreadCount: asNumber(row.unreadCount ?? row.unread_count),
    lastMessage: lastRaw
      ? normalizeMessage(lastRaw)
      : (messages[messages.length - 1] ?? null),
    messages,
  };
}

export async function findMessageThreadsApi(
  accessToken: string,
  params: { query?: string; page?: number; pageSize?: number } = {},
) {
  const result = await executeApi<{
    items?: Array<Record<string, unknown>>;
    total?: number;
    page?: number;
    pageSize?: number;
    pageCount?: number;
  }>("admin.messages.threads.find", {
    method: "GET",
    accessToken,
    searchParams: {
      query: params.query,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
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
      items: items.map(normalizeThread),
      total:
        typeof result.data.total === "number"
          ? result.data.total
          : items.length,
      page: typeof result.data.page === "number" ? result.data.page : 1,
      pageSize:
        typeof result.data.pageSize === "number"
          ? result.data.pageSize
          : (params.pageSize ?? 50),
      pageCount:
        typeof result.data.pageCount === "number"
          ? result.data.pageCount
          : 1,
    },
  };
}

export async function getMessageThreadApi(
  accessToken: string,
  params: { threadId: string; page?: number; pageSize?: number },
) {
  const result = await executeApi<{
    thread?: Record<string, unknown>;
    items?: Array<Record<string, unknown>>;
    total?: number;
    page?: number;
    pageSize?: number;
    pageCount?: number;
  }>("admin.messages.threads.get", {
    method: "GET",
    accessToken,
    searchParams: {
      threadId: params.threadId,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
    },
  });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data.items) ? result.data.items : [];
  const thread = normalizeThread(result.data.thread ?? {});
  thread.messages = items
    .filter((message): message is Record<string, unknown> =>
      Boolean(message && typeof message === "object"),
    )
    .map(normalizeMessage);
  thread.lastMessage =
    thread.messages[thread.messages.length - 1] ?? thread.lastMessage;

  return {
    ok: true as const,
    status: result.status,
    data: {
      thread,
      total:
        typeof result.data.total === "number"
          ? result.data.total
          : thread.messages.length,
      page: typeof result.data.page === "number" ? result.data.page : 1,
      pageSize:
        typeof result.data.pageSize === "number"
          ? result.data.pageSize
          : (params.pageSize ?? 50),
      pageCount:
        typeof result.data.pageCount === "number" ? result.data.pageCount : 1,
    },
  };
}

export async function createMessageThreadApi(
  accessToken: string,
  clientId: string,
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.messages.threads.create",
    {
      method: "POST",
      accessToken,
      body: { clientId },
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeThread(result.data),
  };
}

export async function sendMessageApi(
  accessToken: string,
  input: {
    threadId: string;
    author: "advisor" | "note";
    body: string;
  },
) {
  const result = await executeApi<Record<string, unknown>>(
    "admin.messages.messages.send",
    {
      method: "POST",
      accessToken,
      body: {
        threadId: input.threadId,
        author: input.author,
        body: input.body,
      },
    },
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: normalizeMessage(result.data),
  };
}

export async function markThreadReadApi(accessToken: string, threadId: string) {
  const result = await executeApi<{
    threadId?: string;
    unreadCount?: number;
  }>("admin.messages.threads.mark-read", {
    method: "POST",
    accessToken,
    body: { threadId },
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    status: result.status,
    data: {
      threadId: asString(result.data.threadId, threadId),
      unreadCount: asNumber(result.data.unreadCount),
    },
  };
}
