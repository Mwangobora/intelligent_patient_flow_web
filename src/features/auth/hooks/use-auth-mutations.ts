import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { authApiService } from "../api/auth-api.service";
import type { LoginRequest, LoginResponse, LogoutResponse } from "../types/auth.types";

type LogoutPayload = Pick<LoginResponse, "refresh">;

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: (payload) => authApiService.login(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.currentUser(), response.user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation<LogoutResponse, ApiError, LogoutPayload>({
    mutationFn: (payload) => authApiService.logout(payload),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
