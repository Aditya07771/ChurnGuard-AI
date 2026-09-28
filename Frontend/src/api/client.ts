/**
 * ChurnGuard AI — Centralized API Client
 *
 * Single source of truth for:
 * - Base URL (from VITE_API_BASE_URL env var)
 * - Request/response handling
 * - Error normalization
 * - Typed fetch wrappers
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

/** Normalized error thrown by all API calls */
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  fieldErrors?: Record<string, string[]>;

  constructor(opts: {
    message: string;
    status: number;
    code?: string;
    details?: unknown;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
    this.fieldErrors = opts.fieldErrors;
  }
}

/** Extract field errors from Pydantic validation responses */
function extractFieldErrors(detail: unknown): Record<string, string[]> | undefined {
  if (!Array.isArray(detail)) return undefined;
  const errs: Record<string, string[]> = {};
  for (const item of detail as { loc?: unknown[]; msg?: string }[]) {
    if (item.loc && item.msg) {
      const key = item.loc.slice(1).join(".");
      errs[key] = [...(errs[key] ?? []), item.msg];
    }
  }
  return Object.keys(errs).length > 0 ? errs : undefined;
}

/** Normalize any error response into an ApiError */
async function normalizeError(response: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  // Backend custom error envelope: { error: { code, message, details } }
  if (body && typeof body === "object" && "error" in body) {
    const err = (body as { error: Record<string, unknown> }).error;
    return new ApiError({
      message: String(err.message ?? "An error occurred."),
      status: response.status,
      code: err.code ? String(err.code) : undefined,
      details: err.details,
    });
  }

  // FastAPI validation error: { detail: [...] }
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") {
      return new ApiError({ message: detail, status: response.status });
    }
    if (Array.isArray(detail)) {
      return new ApiError({
        message: "Validation failed. Please check the highlighted fields.",
        status: response.status,
        fieldErrors: extractFieldErrors(detail),
      });
    }
    // Structured detail: { code, message, ... }
    if (typeof detail === "object" && detail !== null) {
      const d = detail as Record<string, unknown>;
      return new ApiError({
        message: String(d.message ?? "An error occurred."),
        status: response.status,
        code: d.code ? String(d.code) : undefined,
        details: d,
      });
    }
  }

  // Generic message field
  if (body && typeof body === "object" && "message" in body) {
    return new ApiError({
      message: String((body as { message: unknown }).message),
      status: response.status,
    });
  }

  // HTTP status fallback
  const statusMessages: Record<number, string> = {
    400: "Bad request. Please check your input.",
    404: "The requested resource was not found.",
    409: "This action conflicts with the current state.",
    413: "The uploaded file is too large.",
    415: "Unsupported file type. Please upload a CSV.",
    422: "Input validation failed. Please check all fields.",
    503: "A required backend service is currently unavailable.",
    500: "An unexpected server error occurred.",
  };

  return new ApiError({
    message: statusMessages[response.status] ?? `Request failed (${response.status}).`,
    status: response.status,
  });
}

/** Core fetch wrapper with timeout and error normalization */
async function apiFetch(
  path: string,
  init: RequestInit = {},
  timeoutMs = 30_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${API_BASE}${path}`;
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError({ message: "Request timed out. Is the backend running?", status: 0 });
    }
    throw new ApiError({
      message: "Cannot connect to the backend. Please verify the server is running.",
      status: 0,
    });
  }
}

/** GET with JSON response */
export async function getJson<T>(path: string): Promise<T> {
  const response = await apiFetch(path, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw await normalizeError(response);
  return response.json() as Promise<T>;
}

/** POST with JSON body and JSON response */
export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await normalizeError(response);
  return response.json() as Promise<T>;
}

/** POST with FormData (multipart) */
export async function postForm<T>(path: string, formData: FormData): Promise<T> {
  // Do NOT set Content-Type manually; let the browser set multipart boundary.
  const response = await apiFetch(path, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  }, 120_000); // longer timeout for file uploads
  if (!response.ok) throw await normalizeError(response);
  return response.json() as Promise<T>;
}

/** GET file download (returns the response for streaming) */
export async function getDownload(path: string): Promise<Response> {
  const response = await apiFetch(path, { method: "GET" });
  if (!response.ok) throw await normalizeError(response);
  return response;
}

/** Resolve a relative download_url against the API origin */
export function resolveDownloadUrl(downloadUrl: string): string {
  if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
    return downloadUrl;
  }
  // Resolve relative path against the API origin (not base URL which has /api/v1)
  const apiOrigin = new URL(API_BASE).origin;
  return `${apiOrigin}${downloadUrl.startsWith("/") ? "" : "/"}${downloadUrl}`;
}

export const API_ORIGIN = new URL(API_BASE).origin;
export { API_BASE };
