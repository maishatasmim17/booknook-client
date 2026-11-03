import { authClient } from "./auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiResponseWrapper<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; message?: string; error: string | null; status: number }> {
  try {
    const { params, headers, ...customConfig } = options;

    let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const query = searchParams.toString();
      if (query) {
        url += (url.includes("?") ? "&" : "?") + query;
      }
    }

    // Retrieve JWT token from Better Auth client
    let token: string | undefined;
    try {
      const tokenResult: any = await authClient.token();
      if (tokenResult?.data?.token) {
        token = tokenResult.data.token;
      } else if (typeof tokenResult?.data === "string") {
        token = tokenResult.data;
      } else if (tokenResult?.token) {
        token = tokenResult.token;
      }
    } catch {
      // In unauthenticated context or guest mode, proceed without bearer token
    }

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const mergedHeaders = {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    };

    const response = await fetch(url, {
      credentials: "include",
      headers: mergedHeaders,
      ...customConfig,
    });

    const status = response.status;
    let jsonBody: ApiResponseWrapper<T> | any = null;

    try {
      jsonBody = await response.json();
    } catch {
      jsonBody = null;
    }

    if (!response.ok) {
      const errorMessage = jsonBody?.message || `Request failed with status ${status}`;
      return { data: null, error: errorMessage, status };
    }

    // Server returns ApiResponse: { success, statusCode, message, data }
    const actualData = jsonBody?.data !== undefined ? jsonBody.data : (jsonBody as T);

    return {
      data: actualData,
      message: jsonBody?.message,
      error: null,
      status,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error?.message || "Network error occurred",
      status: 500,
    };
  }
}
