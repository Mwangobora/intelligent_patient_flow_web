import axios from "axios";

import type { ApiErrorResponse } from "@/types/api";

export type ApiError = {
  status: number | null;
  code: string;
  message: string;
  details: unknown;
};

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status ?? null;
    const payload = error.response?.data;
    return {
      status,
      code: payload?.code ?? "api_error",
      message:
        payload?.detail ??
        payload?.message ??
        error.message ??
        "Something went wrong while contacting the server.",
      details: payload?.errors ?? null,
    };
  }

  if (error instanceof Error) {
    return {
      status: null,
      code: "unknown_error",
      message: error.message,
      details: null,
    };
  }

  return {
    status: null,
    code: "unknown_error",
    message: "Something went wrong while contacting the server.",
    details: null,
  };
}

export function getErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}
