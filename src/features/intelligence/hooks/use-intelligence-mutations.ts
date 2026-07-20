"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { intelligenceApiService } from "../api/intelligence-api.service";
import type { CreatePredictionPayload, MachineLearningPredictionPayload, RuleBasedPredictionPayload } from "../types/intelligence.types";

function friendlyIntelligenceError(error: unknown) {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();
  if (normalized.status === 403) return "You do not have permission to view intelligence data.";
  if (normalized.status === null) return "Could not connect to the server. Please try again.";
  if (message.includes("machine learning") || normalized.status === 501) return "Machine learning model is not configured yet.";
  if (message.includes("completed")) return "Prediction cannot be generated for completed queue entries.";
  if (message.includes("not found") || message.includes("unavailable")) return "Prediction is not available for this queue entry.";
  return normalized.message || "Something went wrong while managing predictions.";
}

function invalidateIntelligence(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.intelligence.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

export function useCreatePredictionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePredictionPayload) => intelligenceApiService.createPrediction(payload),
    onSuccess: () => {
      toast.success("Prediction created.");
      invalidateIntelligence(queryClient);
    },
    onError: (error) => toast.error(friendlyIntelligenceError(error)),
  });
}

export function useGenerateRuleBasedPredictionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RuleBasedPredictionPayload) => intelligenceApiService.generateRuleBasedPrediction(payload),
    onSuccess: () => {
      toast.success("Rule-based prediction generated.");
      invalidateIntelligence(queryClient);
    },
    onError: (error) => toast.error(friendlyIntelligenceError(error)),
  });
}

export function useGenerateMachineLearningPredictionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MachineLearningPredictionPayload) => intelligenceApiService.generateMachineLearningPrediction(payload),
    onSuccess: () => {
      toast.success("Machine learning prediction generated.");
      invalidateIntelligence(queryClient);
    },
    onError: (error) => toast.error(friendlyIntelligenceError(error)),
  });
}
