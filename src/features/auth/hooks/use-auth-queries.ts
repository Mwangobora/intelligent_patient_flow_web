import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { authApiService } from "../api/auth-api.service";
import type { CurrentUserResponse } from "../types/auth.types";

export function useCurrentUserQuery() {
  return useQuery<CurrentUserResponse, ApiError>({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => authApiService.getCurrentUser(),
    retry: false,
    staleTime: 60_000,
  });
}
