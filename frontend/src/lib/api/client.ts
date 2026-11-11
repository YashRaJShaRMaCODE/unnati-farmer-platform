import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const authApiClient = axios.create({
  baseURL: API_URL.replace("/api", "") + "/api/auth",
  headers: { "Content-Type": "application/json" },
});

const memoryStorage = new Map<string, string>();

function readStorage(key: string) {
  try {
    const value = localStorage.getItem(key);
    if (value !== null) memoryStorage.set(key, value);
    return value ?? memoryStorage.get(key) ?? null;
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

function writeStorage(key: string, value: string) {
  memoryStorage.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

function removeStorage(key: string) {
  memoryStorage.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    // Continue logout even when browser storage is unavailable.
  }
}

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return readStorage("access_token");
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return readStorage("refresh_token");
}

export { getAccessToken, getRefreshToken };

export function setTokens(access: string, refresh: string) {
  writeStorage("access_token", access);
  writeStorage("refresh_token", refresh);
}

export function clearTokens() {
  removeStorage("access_token");
  removeStorage("refresh_token");
  removeStorage("user");
}

export function setStoredUser(user: unknown) {
  writeStorage("user", JSON.stringify(user));
}

export function getStoredUser<T>() {
  if (typeof window === "undefined") return null;
  const raw = readStorage("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

authApiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;
    const refresh = getRefreshToken();

    if (!refresh) {
      clearTokens();
      if (typeof window !== "undefined") window.dispatchEvent(new Event("auth:expired"));
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_URL.replace("/api", "")}/api/auth/refresh/`, {
        refresh,
      });
      setTokens(data.access, data.refresh || refresh);
      processQueue(null, data.access);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      if (typeof window !== "undefined") window.dispatchEvent(new Event("auth:expired"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
