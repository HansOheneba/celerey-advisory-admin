import type { ConversationMessage, ConversationThread } from "@/lib/messages/types";
import type { Client } from "@/types/client";

const STORAGE_KEY = "fidelity.advisor.messages.v2";
const LEGACY_STORAGE_KEY = "celerey.advisor.messages.v1";
const PREVIOUS_STORAGE_KEY = "fidelity.advisor.messages.v1";

function readStoredJson(): string | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    return raw;
  }
  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy) {
    window.localStorage.setItem(STORAGE_KEY, legacy);
    return legacy;
  }
  const previous = window.localStorage.getItem(PREVIOUS_STORAGE_KEY);
  if (previous) {
    window.localStorage.removeItem(PREVIOUS_STORAGE_KEY);
  }
  return null;
}

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const FALLBACK_THREAD_SNIPPETS: Array<
  Array<{ author: ConversationMessage["author"]; body: string }>
> = [
  [
    {
      author: "client",
      body: "Sorry to ping you on a Sunday. Can we move the goal review to Tuesday?",
    },
    { author: "note", body: "Prefers mornings. Tuesday works." },
    {
      author: "advisor",
      body: "Tuesday 9am works on my side. I'll send a hold.",
    },
  ],
  [
    {
      author: "client",
      body: "Got the statement. Why is cash still that high?",
    },
    {
      author: "advisor",
      body: "Mostly dividends sitting unsettled. I'll walk you through it on our call.",
    },
  ],
  [
    { author: "client", body: "Uploaded the tax form you asked for." },
    { author: "advisor", body: "Thanks, I see it. No rush on anything else." },
  ],
  [
    {
      author: "client",
      body: "Travel next month so I might be slow replying.",
    },
    {
      author: "note",
      body: "Away mid-month. Don't schedule review then.",
    },
  ],
];

function seedThreads(clients: Client[]): ConversationThread[] {
  const seeded = clients.slice(0, 4).map((client, index) => {
    const snippet =
      FALLBACK_THREAD_SNIPPETS[index % FALLBACK_THREAD_SNIPPETS.length];
    const updatedAt = new Date(Date.now() - index * 36e5).toISOString();
    const messages: ConversationMessage[] = snippet.map((entry, msgIndex) => ({
      id: createId("msg"),
      author: entry.author,
      body: entry.body,
      createdAt: new Date(
        Date.now() - (index + snippet.length - msgIndex) * 36e5,
      ).toISOString(),
    }));

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
    const raw = readStoredJson();
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
