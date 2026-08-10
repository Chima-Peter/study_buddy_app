import { env } from "@/config/env";
import type { ApiEnvelope } from "@/types";
import { useSessionStore } from "@/stores/session-store";
import { disconnectSharedChatSocket } from "@/lib/ws/chat-socket";

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

function readFastapiDetail(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("detail" in body)) return null;
  const detail = (body as { detail: unknown }).detail;
  if (typeof detail === "string") {
    const trimmed = detail.trim();
    return trimmed || null;
  }
  if (!Array.isArray(detail)) return null;
  const parts = detail
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const msg = (item as { msg?: unknown }).msg;
      return typeof msg === "string" ? msg.trim() : "";
    })
    .filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function getErrorMessage(
  json: ApiEnvelope<unknown> | null,
  status: number,
  rawBody?: unknown,
): string {
  const fallback = `Request failed with status ${status}`;
  if (!json && !rawBody) return fallback;

  const fromError = json ? readErrorField(json.error) : null;
  const fromMessage =
    json && typeof json.message === "string" ? json.message.trim() || null : null;
  const fromDetail = readFastapiDetail(json ?? rawBody);

  // 4xx responses carry the user-facing detail in `error`
  if (status >= 400 && status < 500) {
    return fromError || fromMessage || fromDetail || fallback;
  }

  return fromMessage || fromError || fromDetail || fallback;
}

export function applyNewTokenFromHeaders(headers: Headers) {
  const newToken = headers.get("X-New-Token");
  if (newToken) {
    useSessionStore.getState().setToken(newToken);
  }
}

function endSession() {
  disconnectSharedChatSocket();
  useSessionStore.getState().clearSession();
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;
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

  applyNewTokenFromHeaders(res.headers);

  if (res.status === 401 && !skipAuth) {
    endSession();
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  let parsed: unknown = null;
  let json: ApiEnvelope<T> | null = null;
  const text = await res.text();
  if (text) {
    try {
      parsed = JSON.parse(text);
      json = parsed as ApiEnvelope<T>;
    } catch {
      parsed = null;
      json = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(getErrorMessage(json, res.status, parsed), res.status, parsed);
  }

  if (json && "data" in json) {
    return json.data as T;
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
