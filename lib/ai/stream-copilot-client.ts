export type StreamCopilotResult = {
  content: string;
  offline: boolean;
};

export async function streamCopilotAnswer(
  question: string,
  clientId: string | undefined,
  onChunk: (partial: string) => void,
): Promise<StreamCopilotResult> {
  const response = await fetch("/api/copilot/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      clientId: clientId ?? null,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Copilot request failed.");
  }

  if (!response.body) {
    throw new Error("Copilot returned an empty stream.");
  }

  const offline = response.headers.get("X-Copilot-Offline") === "true";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let content = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    content += decoder.decode(value, { stream: true });
    onChunk(content);
  }

  return { content, offline };
}
