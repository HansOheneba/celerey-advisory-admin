import "server-only";

import { redirect } from "next/navigation";

import { DEMO_MODE } from "@/lib/demo/config";
import { routeDemoUsecase } from "@/lib/demo/api-router";

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
  /**
   * When an access token was sent and the API says the session is invalid,
   * send the user through /auth/expire (clears cookie + login redirect).
   * Defaults to true. Set false for login-time probes.
   */
  redirectOnUnauthorized?: boolean;
};

function logApi(label: string, value: unknown) {
  console.log(`[celerey api] ${label}`, JSON.stringify(value, null, 2));
}

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

function extractErrorCode(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const error = (payload as Record<string, unknown>).error;
  return typeof error === "string" ? error : undefined;
}

/**
 * UAT often returns HTTP 200 with `{ success: false, status: 401, message }`.
 * Prefer the body status when present.
 */
function resolveStatus(httpStatus: number, payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    typeof (payload as Record<string, unknown>).status === "number"
  ) {
    return (payload as { status: number }).status;
  }

  return httpStatus;
}

function isUnauthorized(status: number, message: string) {
  if (status === 401) {
    return true;
  }

  const lower = message.toLowerCase();
  return (
    lower.includes("expired session") ||
    lower.includes("invalid or expired") ||
    lower.includes("invalid session") ||
    lower.includes("no token provided")
  );
}

function redirectToLoginIfUnauthorized(options: {
  accessToken?: string;
  redirectOnUnauthorized?: boolean;
  status: number;
  message: string;
}) {
  const shouldRedirect =
    Boolean(options.accessToken) &&
    options.redirectOnUnauthorized !== false &&
    isUnauthorized(options.status, options.message);

  if (!shouldRedirect) {
    return;
  }

  // Cookie deletion must happen in a Route Handler, not during RSC render.
  redirect("/auth/expire");
}

function failureFromPayload(
  httpStatus: number,
  payload: unknown,
  fallback: string,
): ExecuteFailure {
  const status = resolveStatus(httpStatus, payload);
  const message = extractMessage(payload, fallback);

  return {
    ok: false,
    status,
    message,
    error: extractErrorCode(payload),
  };
}

function finalizeFailure(
  httpStatus: number,
  payload: unknown,
  fallback: string,
  options: Pick<ExecuteOptions, "accessToken" | "redirectOnUnauthorized">,
): ExecuteFailure {
  const failure = failureFromPayload(httpStatus, payload, fallback);

  redirectToLoginIfUnauthorized({
    accessToken: options.accessToken,
    redirectOnUnauthorized: options.redirectOnUnauthorized,
    status: failure.status,
    message: failure.message,
  });

  return failure;
}

export async function executeApi<T>(
  usecase: string,
  options: ExecuteOptions = {},
): Promise<ExecuteResult<T>> {
  const {
    method = "GET",
    body,
    accessToken,
    searchParams,
    redirectOnUnauthorized,
  } = options;

  if (DEMO_MODE) {
    const demoResult = await routeDemoUsecase(usecase, {
      accessToken,
      body,
      searchParams,
    });

    if (demoResult) {
      if (!demoResult.ok) {
        redirectToLoginIfUnauthorized({
          accessToken,
          redirectOnUnauthorized,
          status: demoResult.status,
          message: demoResult.message,
        });

        return demoResult;
      }

      return {
        ok: true,
        status: demoResult.status,
        data: demoResult.data as T,
      };
    }
  }

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

  logApi("request", {
    usecase,
    method,
    url: url.toString(),
    body: body ?? null,
    hasAccessToken: Boolean(accessToken),
  });

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    logApi("network error", {
      usecase,
      error: error instanceof Error ? error.message : error,
    });
    return {
      ok: false,
      status: 0,
      message: "Unable to reach the advisory API. Check your connection.",
    };
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  logApi("response", {
    usecase,
    httpStatus: response.status,
    payload,
  });

  if (!response.ok) {
    return finalizeFailure(
      response.status,
      payload,
      `Request failed (${response.status}).`,
      { accessToken, redirectOnUnauthorized },
    );
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success: unknown }).success === false
  ) {
    return finalizeFailure(response.status, payload, "Request failed.", {
      accessToken,
      redirectOnUnauthorized,
    });
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

/**
 * Multipart uploads (avatar / logo). Do not set Content-Type — fetch must
 * attach the multipart boundary automatically.
 */
export async function executeMultipartApi<T>(
  usecase: string,
  options: {
    formData: FormData;
    accessToken?: string;
    method?: "POST" | "PUT";
    redirectOnUnauthorized?: boolean;
  },
): Promise<ExecuteResult<T>> {
  const {
    formData,
    accessToken,
    method = "POST",
    redirectOnUnauthorized,
  } = options;

  if (DEMO_MODE) {
    const demoResult = await routeDemoUsecase(usecase, {
      accessToken,
      formData,
    });

    if (demoResult) {
      if (!demoResult.ok) {
        return demoResult;
      }

      return {
        ok: true,
        status: demoResult.status,
        data: demoResult.data as T,
      };
    }
  }

  const url = buildUrl(usecase);

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: formData,
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Unable to reach the advisory API. Check your connection.",
    };
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return finalizeFailure(
      response.status,
      payload,
      `Request failed (${response.status}).`,
      { accessToken, redirectOnUnauthorized },
    );
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success: unknown }).success === false
  ) {
    return finalizeFailure(response.status, payload, "Request failed.", {
      accessToken,
      redirectOnUnauthorized,
    });
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
