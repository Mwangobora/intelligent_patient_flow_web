export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiListResponse<T> = {
  data: T[];
  count?: number;
  message?: string;
};

export type ApiErrorResponse = {
  code?: string;
  detail?: string;
  message?: string;
  errors?: Record<string, string | string[]>;
};
