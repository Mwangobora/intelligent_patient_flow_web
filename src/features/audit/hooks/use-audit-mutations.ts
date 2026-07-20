"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { auditApiService } from "../api/audit-api.service";
import type { AuditLogCreatePayload } from "../types/audit.types";

function friendlyAuditError(error: unknown) {
  const normalized = normalizeApiError(error);
  if (normalized.status === 403) return "You do not have permission to view audit logs.";
  if (normalized.status === 404) return "Audit log was not found.";
  if (normalized.status === 400) return "Please check the selected filters.";
  if (normalized.status === null) return "Could not connect to the server. Please try again.";
  return normalized.message || "Something went wrong while loading audit logs.";
}

export function useCreateAuditLogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AuditLogCreatePayload) => auditApiService.createAuditLog(payload),
    onSuccess: () => {
      toast.success("Manual audit log recorded.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.audit.all });
    },
    onError: (error) => toast.error(friendlyAuditError(error)),
  });
}
