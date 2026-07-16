import axios from "axios";

import { getApiBaseUrl } from "@/config/app.config";

import { normalizeApiError } from "./api-error";

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalizedError = normalizeApiError(error);
    return Promise.reject(normalizedError);
  },
);
