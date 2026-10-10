const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

function storedToken() {
  try {
    return (JSON.parse(localStorage.getItem("classpulse-demo") || "null") as { token?: string } | null)?.token;
  } catch { return undefined; }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(storedToken() ? { Authorization: `Bearer ${storedToken()}` } : {}),
        ...(options?.headers || {}),
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Unable to load academic data. Please try again later.");
    }
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.message && !error.message.includes("fetch")) {
      throw error;
    }
    throw new Error("Unable to load academic data. Please try again later.");
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
};
