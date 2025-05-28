declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken(): Promise<string | null>;
      };
    };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class BaseApiClient {
  protected async request<T>(
    endpoint: string,
    authToken?: string | null,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    if (typeof window !== "undefined" && !authToken) {
      authToken = (await window.Clerk?.session?.getToken()) as string;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.error || "An error occurred",
          data.details || ""
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error({
          status: error.status,
          message: error.message,
          details: error.details,
        });
        throw error;
      }
      console.error(error);
      throw new ApiError(500, "Network error occurred");
    }
  }

  protected async get<T>(
    endpoint: string,
    authToken?: string | null,
    params?: Record<string, string>,
    options?: RequestInit
  ): Promise<T> {
    const queryString = params ? `?${new URLSearchParams(params)}` : "";
    return this.request<T>(`${endpoint}${queryString}`, authToken, {
      method: "GET",
      ...options,
    });
  }

  protected async post<T>(
    endpoint: string,
    authToken?: string | null,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(endpoint, authToken, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected async put<T>(
    endpoint: string,
    authToken?: string | null,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(endpoint, authToken, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected async delete<T>(
    endpoint: string,
    authToken?: string | null
  ): Promise<T> {
    return this.request<T>(endpoint, authToken, {
      method: "DELETE",
    });
  }

  protected async patch<T>(
    endpoint: string,
    authToken?: string | null,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(endpoint, authToken, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}
