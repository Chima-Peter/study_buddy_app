import { env } from "@/config/env";
import type { ApiEnvelope } from "@/types";
import { useSessionStore } from "@/stores/session-store";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function readErrorField(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  return null;
}

function getErrorMessage(
  json: ApiEnvelope<unknown> | null,
  status: number,
): string {
  const fallback = `Request failed with status ${status}`;
  if (!json) return fallback;

  const fromError = readErrorField(json.error);
  const fromMessage =
    typeof json.message === "string" ? json.message.trim() || null : null;

  // 4xx responses carry the user-facing detail in `error`
  if (status >= 400 && status < 500) {
    return fromError || fromMessage || fallback;
  }

  return fromMessage || fromError || fallback;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(expiredToken: string): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${env.apiUrl}/authentication/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: expiredToken }),
      });

      if (!res.ok) {
        useSessionStore.getState().clearSession();
        return null;
      }

      const json = (await res.json()) as ApiEnvelope<{ token: string; user: unknown }>;
      const newToken = json.data.token;
      const user = json.data.user as Parameters<
        ReturnType<typeof useSessionStore.getState>["setSession"]
      >[1];

      useSessionStore.getState().setSession(newToken, user);
      return newToken;
    } catch {
      useSessionStore.getState().clearSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth, skipRefresh, headers, ...rest } = options;
  const token = useSessionStore.getState().token;

  const requestHeaders: HeadersInit = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  if (!skipAuth && token) {
    (requestHeaders as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !skipAuth && !skipRefresh && token) {
    const newToken = await refreshAccessToken(token);
    if (newToken) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  let json: ApiEnvelope<T> | null = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(getErrorMessage(json, res.status), res.status, json);
  }

  if (json && "data" in json) {
    return json.data;
  }

  return text as unknown as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
