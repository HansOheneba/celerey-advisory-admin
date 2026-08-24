"use server";

import { revalidatePath } from "next/cache";
import {
  createMessageThreadApi,
  findMessageThreadsApi,
  getMessageThreadApi,
  markThreadReadApi,
  sendMessageApi,
} from "@/lib/api/messages";
import { requireSession } from "@/lib/dal";
import type {
  ConversationMessage,
  ConversationThread,
} from "@/lib/messages/types";

export async function listMessageThreadsAction(query?: string): Promise<
  | { ok: true; items: ConversationThread[] }
  | { ok: false; message: string }
> {
  const session = await requireSession();
  const result = await findMessageThreadsApi(session.accessToken, {
    query,
    page: 1,
    pageSize: 50,
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, items: result.data.items };
}

export async function getMessageThreadAction(
  threadId: string,
): Promise<
  | { ok: true; thread: ConversationThread }
  | { ok: false; message: string }
> {
  const session = await requireSession();
  const result = await getMessageThreadApi(session.accessToken, {
    threadId,
    page: 1,
    pageSize: 50,
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, thread: result.data.thread };
}

export async function createMessageThreadAction(
  clientId: string,
): Promise<
  | { ok: true; thread: ConversationThread }
  | { ok: false; message: string }
> {
  const session = await requireSession();
  const result = await createMessageThreadApi(session.accessToken, clientId);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/messages");

  return { ok: true, thread: result.data };
}

export async function sendMessageAction(input: {
  threadId: string;
  author: "advisor" | "note";
  body: string;
}): Promise<
  | { ok: true; message: ConversationMessage }
  | { ok: false; message: string }
> {
  const session = await requireSession();
  const result = await sendMessageApi(session.accessToken, input);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/messages");

  return { ok: true, message: result.data };
}

export async function markThreadReadAction(
  threadId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await requireSession();
  const result = await markThreadReadApi(session.accessToken, threadId);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  revalidatePath("/messages");

  return { ok: true };
}
