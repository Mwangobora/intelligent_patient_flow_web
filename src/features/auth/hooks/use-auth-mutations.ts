import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { authApiService } from "../api/auth-api.service";
import type { CurrentUserResponse, LoginRequest, LoginResponse, LogoutResponse } from "../types/auth.types";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: (payload) => authApiService.login(payload),
    onSuccess: async () => {
      await queryClient.fetchQuery<CurrentUserResponse>({
        queryKey: queryKeys.auth.currentUser(),
        queryFn: () => authApiService.getCurrentUser(),
        staleTime: 0,
      });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation<LogoutResponse, ApiError, void>({
    mutationFn: () => authApiService.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
