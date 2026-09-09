import "server-only";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";
/** Keep the demo responsive — fall back rather than hang on a slow call. */
const REQUEST_TIMEOUT_MS = 25_000;

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatResult =
  | { ok: true; content: string }
  | { ok: false; message: string };

export function isDeepseekConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

function parseSseDelta(line: string): string | null {
  const trimmed = line.trim();

  if (!trimmed.startsWith("data: ")) {
    return null;
  }

  const payload = trimmed.slice(6);

  if (payload === "[DONE]") {
    return null;
  }

  try {
    const json = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };

    return json.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

/** Converts an OpenAI-compatible SSE body into a plain-text token stream. */
export function openAiSseToTextStream(
  body: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const text = parseSseDelta(line);

          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      },
      flush(controller) {
        if (buffer.trim()) {
          const text = parseSseDelta(buffer);

          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      },
    }),
  );
}

/** Streams fallback prose in small chunks so offline answers feel live too. */
export function simulateTextStream(
  text: string,
  chunkSize = 28,
  delayMs = 10,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let offset = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (offset >= text.length) {
        controller.close();
        return;
      }

      const chunk = text.slice(offset, offset + chunkSize);
      offset += chunkSize;
      controller.enqueue(encoder.encode(chunk));

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    },
  });
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<
  | { ok: true; stream: ReadableStream<Uint8Array> }
  | { ok: false; message: string }
> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return { ok: false, message: "DEEPSEEK_API_KEY is not configured." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 1200,
        stream: true,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok || !response.body) {
      return {
        ok: false,
        message: `DeepSeek request failed (${response.status}).`,
      };
    }

    return {
      ok: true,
      stream: openAiSseToTextStream(response.body),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error && error.name === "AbortError"
          ? "DeepSeek request timed out."
          : "Unable to reach DeepSeek.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<ChatResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return { ok: false, message: "DEEPSEEK_API_KEY is not configured." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 900,
        stream: false,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `DeepSeek request failed (${response.status}).`,
      };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return { ok: false, message: "DeepSeek returned an empty response." };
    }

    return { ok: true, content };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error && error.name === "AbortError"
          ? "DeepSeek request timed out."
          : "Unable to reach DeepSeek.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
