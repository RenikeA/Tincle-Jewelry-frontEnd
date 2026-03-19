/// <reference types="vite/client" />

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AuthTokens } from "../types/user";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export const tokenStorage = {
  getAccess: (): string | null => sessionStorage.getItem("tincle_access_token"),
  getRefresh: (): string | null => localStorage.getItem("tincle_refresh_token"),
  setTokens: (tokens: AuthTokens): void => {
    sessionStorage.setItem("tincle_access_token", tokens.accessToken);
    localStorage.setItem("tincle_refresh_token", tokens.refreshToken);
  },
  clearAll: (): void => {
    sessionStorage.removeItem("tincle_access_token");
    localStorage.removeItem("tincle_refresh_token");
  },
};

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = tokenStorage.getAccess();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const processQueue = (token: string): void => {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // List of public endpoints that should NOT trigger token refresh
    const publicEndpoints = [
      '/auth/register',
      '/auth/login', 
      '/auth/refresh',
      '/auth/forgot-password',
      '/auth/reset-password'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest?.url?.includes(endpoint)
    );

    // Skip token refresh for public endpoints
    if (isPublicEndpoint) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = tokenStorage.getRefresh();

      if (!refreshToken) {
        tokenStorage.clearAll();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve) => {
          pendingRequests.push(resolve);
        }).then((newToken) => {
          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<AuthTokens>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );
        tokenStorage.setTokens(data);
        processQueue(data.accessToken);
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)["Authorization"] = `Bearer ${data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearAll();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const get = <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
  apiClient.get<T>(url, { params }).then((res) => res.data);

export const post = <T>(url: string, data?: unknown): Promise<T> =>
  apiClient.post<T>(url, data).then((res) => res.data);

export const put = <T>(url: string, data?: unknown): Promise<T> =>
  apiClient.put<T>(url, data).then((res) => res.data);

export const patch = <T>(url: string, data?: unknown): Promise<T> =>
  apiClient.patch<T>(url, data).then((res) => res.data);

export const del = <T>(url: string): Promise<T> =>
  apiClient.delete<T>(url).then((res) => res.data);

export default apiClient;