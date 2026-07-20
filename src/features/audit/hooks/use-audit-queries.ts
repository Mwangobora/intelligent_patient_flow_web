"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { auditApiService } from "../api/audit-api.service";
import type { AuditLogListParams, AuditLogRecord, AuditSummary } from "../types/audit.types";

type QueryOptions = { enabled?: boolean };

function scopeKey(params: Record<string, unknown>) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  );
}

function useAuditBase<TData>(key: readonly unknown[], queryFn: () => Promise<TData>, options?: QueryOptions) {
  return useQuery<TData, ApiError>({
    queryKey: key,
    queryFn,
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAuditLogsQuery(params: AuditLogListParams = {}, options?: QueryOptions) {
  return useAuditBase<AuditLogRecord[]>(
    [...queryKeys.audit.lists(), "logs", scopeKey(params)],
    () => auditApiService.listAuditLogs(params),
    options,
  );
}

export function useAuditLogDetailQuery(id?: string, options?: QueryOptions) {
  return useAuditBase<AuditLogRecord>(
    id ? queryKeys.audit.detail(id) : [...queryKeys.audit.all, "detail", "missing"],
    () => auditApiService.getAuditLog(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function useAuditSummaryQuery(params: AuditLogListParams = {}, options?: QueryOptions) {
  return useAuditBase<AuditSummary>(
    [...queryKeys.audit.lists(), "summary", scopeKey(params)],
    () => auditApiService.getAuditSummary(params),
    options,
  );
}

export function useResourceAuditLogsQuery(resourceType?: string, resourceId?: string, options?: QueryOptions) {
  return useAuditBase<AuditLogRecord[]>(
    [...queryKeys.audit.lists(), "resource", resourceType, resourceId],
    () => auditApiService.listResourceAuditLogs(resourceType!, resourceId!),
    { enabled: Boolean(resourceType && resourceId) && options?.enabled !== false },
  );
}

export function useActorAuditLogsQuery(userId?: string, options?: QueryOptions) {
  return useAuditBase<AuditLogRecord[]>(
    [...queryKeys.audit.lists(), "actor", userId],
    () => auditApiService.listActorAuditLogs(userId!),
    { enabled: Boolean(userId) && options?.enabled !== false },
  );
}
