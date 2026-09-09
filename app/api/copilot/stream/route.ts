import { revalidatePath } from "next/cache";

import { prepareCopilotRequest } from "@/lib/ai/copilot-request";
import {
  simulateTextStream,
  streamChatCompletion,
} from "@/lib/ai/deepseek";
import { recordAiSession } from "@/lib/ai/record-session";
import { verifySession } from "@/lib/dal";

export const runtime = "nodejs";

type StreamRequestBody = {
  question?: string;
  clientId?: string | null;
};

export async function POST(request: Request) {
  const session = await verifySession();

  if (!session) {
    return new Response("Unauthorised.", { status: 401 });
  }

  let body: StreamRequestBody;

  try {
    body = (await request.json()) as StreamRequestBody;
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question : "";
  const clientId =
    typeof body.clientId === "string" && body.clientId.length > 0
      ? body.clientId
      : undefined;

  const prepared = await prepareCopilotRequest(session, question, clientId);

  if (!prepared.ok) {
    return new Response(prepared.message, { status: 400 });
  }

  const { payload } = prepared;
  const live = await streamChatCompletion(payload.messages);
  const offline = !live.ok;
  const source = live.ok
    ? live.stream
    : simulateTextStream(await payload.resolveFallback());

  let fullText = "";

  const tap = source.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        fullText += new TextDecoder().decode(chunk);
        controller.enqueue(chunk);
      },
      async flush() {
        await recordAiSession({
          userId: session.userId,
          userName: session.name,
          role: session.capabilities.label,
          mode: "book_question",
          clientId: payload.clientId,
          prompt: payload.prompt,
          response: fullText,
          contextScopes: payload.contextScopes,
        });
        revalidatePath("/insights");
      },
    }),
  );

  return new Response(tap, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Copilot-Offline": offline ? "true" : "false",
    },
  });
}
