import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

const PROPERTY_API_URL = import.meta.env.VITE_PROPERTY_BASE_URL;

export const propertyApi = axios.create({
  baseURL: PROPERTY_API_URL,
  headers: {
    Accept: "application/json",
  },
});

const HM_API_URL = import.meta.env.VITE_HM_BASE_URL;

export const hmApi = axios.create({
  baseURL: HM_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const setupInterceptors = (logout: () => void) => {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.code === "ERR_NETWORK") {
        toast.error("No internet or server down");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Logging out...");
        logout();
      }
      return Promise.reject(error);
    },
  );
  hmApi.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.code === "ERR_NETWORK") {
        toast.error("No internet or server down");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Logging out...");
        logout();
      }
      return Promise.reject(error);
    },
  );

  propertyApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  hmApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
