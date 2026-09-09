import "server-only";

import { mutateDemoDb } from "@/lib/demo/store";

export type AiSessionMode =
  | "client_brief"
  | "meeting_prep"
  | "portfolio_review"
  | "book_question";

export async function recordAiSession(input: {
  userId: string;
  userName: string;
  role: string;
  mode: AiSessionMode;
  clientId: string | null;
  prompt: string;
  response: string;
  contextScopes: string[];
}) {
  await mutateDemoDb((db) => {
    db.aiSessions.unshift({
      id: `ai-${Date.now().toString(36)}`,
      userId: input.userId,
      userName: input.userName,
      role: input.role,
      mode: input.mode,
      clientId: input.clientId,
      prompt: input.prompt,
      response: input.response,
      createdAt: new Date().toISOString(),
      contextScopes: input.contextScopes,
    });

    db.aiSessions = db.aiSessions.slice(0, 100);
  });
}
