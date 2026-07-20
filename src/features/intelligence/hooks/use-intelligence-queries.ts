"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";
import { hasPermission } from "@/types/permissions";

import { intelligenceApiService } from "../api/intelligence-api.service";
import type { ArrivalForecastParams, PredictionEvaluationParams, PredictionListParams, SlotSuggestionParams } from "../types/intelligence.types";

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

function useIntelligenceBase<TData>(key: readonly unknown[], queryFn: () => Promise<TData>, options?: QueryOptions) {
  return useQuery<TData, ApiError>({ queryKey: key, queryFn, enabled: options?.enabled, placeholderData: keepPreviousData });
}

export function usePredictionsQuery(params: PredictionListParams = {}, options?: QueryOptions) {
  return useIntelligenceBase([...queryKeys.intelligence.lists(), "predictions", scopeKey(params)], () => intelligenceApiService.listPredictions(params), options);
}

export function usePredictionDetailQuery(id?: string, options?: QueryOptions) {
  return useIntelligenceBase(id ? queryKeys.intelligence.detail(id) : [...queryKeys.intelligence.all, "missing"], () => intelligenceApiService.getPrediction(id!), { enabled: Boolean(id) && options?.enabled !== false });
}

export function useQueueEntryLatestPredictionQuery(queueEntryId?: string, options?: QueryOptions) {
  return useIntelligenceBase([...queryKeys.intelligence.all, "queue-entry-latest", queueEntryId], () => intelligenceApiService.getLatestPredictionForQueueEntry(queueEntryId!), { enabled: Boolean(queueEntryId) && options?.enabled !== false });
}

export function useQueueEntryPredictionsQuery(queueEntryId?: string, options?: QueryOptions) {
  return useIntelligenceBase([...queryKeys.intelligence.all, "queue-entry-predictions", queueEntryId], () => intelligenceApiService.listPredictionsForQueueEntry(queueEntryId!), { enabled: Boolean(queueEntryId) && options?.enabled !== false });
}

export function useArrivalForecastQuery(params: ArrivalForecastParams, options?: QueryOptions) {
  return useIntelligenceBase([...queryKeys.intelligence.lists(), "arrival-forecast", scopeKey(params)], () => intelligenceApiService.getArrivalForecast(params), options);
}

export function useSlotSuggestionsQuery(params: SlotSuggestionParams, options?: QueryOptions) {
  return useIntelligenceBase([...queryKeys.intelligence.lists(), "slot-suggestions", scopeKey(params)], () => intelligenceApiService.getSlotSuggestions(params), options);
}

export function usePredictionEvaluationQuery(params: PredictionEvaluationParams = {}, options?: QueryOptions) {
  return useIntelligenceBase([...queryKeys.intelligence.lists(), "evaluation", scopeKey(params)], () => intelligenceApiService.getPredictionEvaluation(params), options);
}

export function useIntelligenceWorkspace() {
  const userQuery = useCurrentUserQuery();
  const activeMembership = useMemo(
    () =>
      userQuery.data?.memberships?.find((membership) => membership.is_active) ??
      userQuery.data?.memberships?.[0],
    [userQuery.data?.memberships],
  );
  const can = (permission: string) => hasPermission(userQuery.data, permission);

  return {
    ...userQuery,
    activeMembership,
    canViewPredictions: can("intelligence_prediction.view"),
    canCreatePredictions: can("intelligence_prediction.create"),
    canEvaluatePredictions: can("intelligence_prediction.evaluate"),
    canViewForecast: can("intelligence_forecast.view"),
    canViewSlotSuggestions: can("intelligence_slot_suggestion.view"),
  };
}
