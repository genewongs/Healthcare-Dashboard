export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
};

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(typeof detail === "string" ? detail : `API request failed with status ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (typeof error.detail === "string" && error.detail.trim()) {
      return error.detail;
    }

    if (Array.isArray(error.detail) && error.detail.length > 0) {
      const firstMessage = error.detail.find(
        (item) => typeof item?.msg === "string" && item.msg.trim(),
      )?.msg;

      if (firstMessage) {
        return firstMessage.replace(/^Value error,\s*/i, "");
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path, API_BASE_URL);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Unable to reach the API. Confirm the backend is running.");
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => response.statusText);
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
