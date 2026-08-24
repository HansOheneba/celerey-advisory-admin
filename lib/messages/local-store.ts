import type { ConversationMessage, ConversationThread } from "@/lib/messages/types";
import type { Client } from "@/types/client";

const STORAGE_KEY = "celerey.advisor.messages.v1";

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seedThreads(clients: Client[]): ConversationThread[] {
  const seeded = clients.slice(0, 4).map((client, index) => {
    const updatedAt = new Date(Date.now() - index * 36e5).toISOString();
    const messages: ConversationMessage[] = [
      {
        id: createId("msg"),
        author: "client",
        body: `Hi — quick note from ${client.firstName}. Could we review my goals before the next meeting?`,
        createdAt: new Date(Date.now() - (index + 2) * 36e5).toISOString(),
      },
      {
        id: createId("msg"),
        author: "note",
        body: "Internal note: client prefers morning calls.",
        createdAt: new Date(Date.now() - (index + 1) * 36e5).toISOString(),
      },
    ];

    if (index % 2 === 0) {
      messages.push({
        id: createId("msg"),
        author: "advisor",
        body: "Thanks — I've blocked time this week. Send any documents ahead of the call.",
        createdAt: updatedAt,
      });
    }

    return {
      id: `thread_${client.id}`,
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      clientEmail: client.email,
      advisorId: client.advisorId,
      updatedAt,
      unreadCount: 0,
      lastMessage: messages[messages.length - 1] ?? null,
      messages,
    };
  });

  return seeded.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function loadConversationThreads(clients: Client[]): ConversationThread[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ConversationThread[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      }
    }
  } catch {
    // Fall through to seed.
  }

  const seeded = seedThreads(clients);
  saveConversationThreads(seeded);
  return seeded;
}

export function saveConversationThreads(threads: ConversationThread[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export function appendThreadMessage(
  threads: ConversationThread[],
  threadId: string,
  input: { author: ConversationMessage["author"]; body: string },
): ConversationThread[] {
  const createdAt = nowIso();
  const next = threads.map((thread) => {
    if (thread.id !== threadId) {
      return thread;
    }

    return {
      ...thread,
      updatedAt: createdAt,
      messages: [
        ...thread.messages,
        {
          id: createId("msg"),
          author: input.author,
          body: input.body.trim(),
          createdAt,
        },
      ],
    };
  });

  const sorted = next.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  saveConversationThreads(sorted);
  return sorted;
}

export function ensureThreadForClient(
  threads: ConversationThread[],
  client: Client,
): ConversationThread[] {
  if (threads.some((thread) => thread.clientId === client.id)) {
    return threads;
  }

  const createdAt = nowIso();
  const next: ConversationThread[] = [
    {
      id: `thread_${client.id}`,
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      clientEmail: client.email,
      advisorId: client.advisorId,
      updatedAt: createdAt,
      unreadCount: 0,
      lastMessage: null,
      messages: [],
    },
    ...threads,
  ];
  saveConversationThreads(next);
  return next;
}
