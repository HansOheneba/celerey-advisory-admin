import "server-only";

export type ExecuteSuccess<T> = {
  ok: true;
  data: T;
  status: number;
};

export type ExecuteFailure = {
  ok: false;
  message: string;
  status: number;
  error?: string;
};

export type ExecuteResult<T> = ExecuteSuccess<T> | ExecuteFailure;

type ExecuteOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string;
  searchParams?: Record<string, string | number | boolean | undefined | null>;
};

function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_API_URL is not configured.");
  }

  return baseUrl;
}

function buildUrl(
  usecase: string,
  searchParams?: ExecuteOptions["searchParams"],
) {
  const url = new URL(`${getBaseUrl()}/${usecase}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

function extractMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  if (typeof record.error === "string" && record.error.trim()) {
    return record.error;
  }

  if (
    record.data &&
    typeof record.data === "object" &&
    typeof (record.data as Record<string, unknown>).message === "string"
  ) {
    return (record.data as Record<string, unknown>).message as string;
  }

  return fallback;
}

export async function executeApi<T>(
  usecase: string,
  options: ExecuteOptions = {},
): Promise<ExecuteResult<T>> {
  const { method = "GET", body, accessToken, searchParams } = options;
  const url = buildUrl(usecase, searchParams);

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Unable to reach the Celerey API. Check your connection.",
    };
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: extractMessage(
        payload,
        `Request failed (${response.status}).`,
      ),
      error:
        payload &&
        typeof payload === "object" &&
        typeof (payload as Record<string, unknown>).error === "string"
          ? ((payload as Record<string, unknown>).error as string)
          : undefined,
    };
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success: unknown }).success === false
  ) {
    return {
      ok: false,
      status: response.status,
      message: extractMessage(payload, "Request failed."),
      error:
        typeof (payload as Record<string, unknown>).error === "string"
          ? ((payload as Record<string, unknown>).error as string)
          : undefined,
    };
  }

  const data =
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data !== undefined
      ? ((payload as { data: T }).data as T)
      : (payload as T);

  return {
    ok: true,
    status: response.status,
    data,
  };
}
