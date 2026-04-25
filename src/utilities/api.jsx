import axios from "axios";
import { toast } from "sonner";

const HM_API_URL = import.meta.env.VITE_HM_BASE_URL;

const api = axios.create({
  baseURL: HM_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export const setupInterceptors = (logout) => {
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
        console.error("No internet or server down");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Logging out...");
        logout();
      }
      return Promise.reject(error);
    }
  );
};

export function getErrorMessage(
  error,
  fallback = "Something went wrong"
) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export default api;