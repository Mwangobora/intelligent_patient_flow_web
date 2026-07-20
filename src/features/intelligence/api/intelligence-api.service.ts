import { apiClient } from "@/lib/api/api-client";
import { apiEndpoints } from "@/lib/api/endpoints";

import type {
  ArrivalForecastParams,
  ArrivalForecastRow,
  CreatePredictionPayload,
  MachineLearningPredictionPayload,
  PredictionEvaluationParams,
  PredictionEvaluationRow,
  PredictionListParams,
  RuleBasedPredictionPayload,
  SlotSuggestionParams,
  SlotSuggestionRow,
  WaitTimePredictionRecord,
} from "../types/intelligence.types";

function compactParams<T extends Record<string, unknown>>(params?: T) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

const intelligenceBase = apiEndpoints.intelligence.base;

class IntelligenceApiService {
  async listPredictions(params: PredictionListParams = {}) {
    const response = await apiClient.get<WaitTimePredictionRecord[]>(`${intelligenceBase}/predictions/`, { params: compactParams(params) });
    return response.data;
  }

  async createPrediction(payload: CreatePredictionPayload) {
    const response = await apiClient.post<WaitTimePredictionRecord>(`${intelligenceBase}/predictions/`, payload);
    return response.data;
  }

  async getPrediction(id: string) {
    const response = await apiClient.get<WaitTimePredictionRecord>(`${intelligenceBase}/predictions/${id}/`);
    return response.data;
  }

  async generateRuleBasedPrediction(payload: RuleBasedPredictionPayload) {
    const response = await apiClient.post<WaitTimePredictionRecord>(`${intelligenceBase}/predictions/rule-based/`, payload);
    return response.data;
  }

  async generateMachineLearningPrediction(payload: MachineLearningPredictionPayload) {
    const response = await apiClient.post<WaitTimePredictionRecord>(`${intelligenceBase}/predictions/machine-learning/`, payload);
    return response.data;
  }

  async getLatestPredictionForQueueEntry(queueEntryId: string) {
    const response = await apiClient.get<WaitTimePredictionRecord>(`${intelligenceBase}/queue-entries/${queueEntryId}/latest-prediction/`);
    return response.data;
  }

  async listPredictionsForQueueEntry(queueEntryId: string) {
    const response = await apiClient.get<WaitTimePredictionRecord[]>(`${intelligenceBase}/queue-entries/${queueEntryId}/predictions/`);
    return response.data;
  }

  async getArrivalForecast(params: ArrivalForecastParams) {
    const response = await apiClient.get<ArrivalForecastRow[]>(`${intelligenceBase}/arrival-forecast/`, { params: compactParams(params) });
    return response.data;
  }

  async getSlotSuggestions(params: SlotSuggestionParams) {
    const response = await apiClient.get<SlotSuggestionRow[]>(`${intelligenceBase}/slot-suggestions/`, { params: compactParams(params) });
    return response.data;
  }

  async getPredictionEvaluation(params: PredictionEvaluationParams = {}) {
    const response = await apiClient.get<PredictionEvaluationRow[]>(`${intelligenceBase}/predictions/evaluation/`, { params: compactParams(params) });
    return response.data;
  }
}

export const intelligenceApiService = new IntelligenceApiService();
