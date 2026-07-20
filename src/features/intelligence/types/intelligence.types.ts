import type { ISODateTime, UUID } from "@/types/common";

export type PredictionMethod = "rule_based" | "machine_learning";

export type WaitTimePredictionRecord = {
  id: UUID;
  queue_entry: UUID;
  queue: UUID;
  service_point: UUID;
  facility: UUID;
  queue_entry_status: string;
  predicted_wait_minutes: number;
  prediction_method: PredictionMethod;
  model_version: string | null;
  confidence_score: string | number | null;
  generated_at: ISODateTime;
  created_at: ISODateTime;
};

export type PredictionListParams = {
  queue_entry_id?: UUID;
  prediction_method?: PredictionMethod | "";
  model_version?: string;
  generated_from?: ISODateTime;
  generated_to?: ISODateTime;
  facility_id?: UUID;
};

export type CreatePredictionPayload = {
  queue_entry_id: UUID;
  predicted_wait_minutes: number;
  prediction_method: PredictionMethod;
  model_version?: string | null;
  confidence_score?: number | null;
  generated_at?: ISODateTime | null;
};

export type RuleBasedPredictionPayload = {
  queue_entry_id: UUID;
  generated_at?: ISODateTime | null;
};

export type MachineLearningPredictionPayload = {
  queue_entry_id: UUID;
};

export type ArrivalForecastParams = {
  facility_id: UUID;
  date_from: string;
  date_to: string;
  service_point_id?: UUID;
  facility_specialty_id?: UUID;
};

export type ArrivalForecastRow = {
  day_of_week: number;
  hour_of_day: number;
  total_arrivals: number;
  average_arrivals: number;
};

export type SlotSuggestionParams = {
  facility_specialty_id: UUID;
  date_from: string;
  date_to: string;
  practitioner_id?: UUID;
};

export type SlotSuggestionRow = {
  appointment_slot_id: UUID;
  practitioner_shift_id: UUID;
  facility_specialty_id: UUID;
  starts_at: ISODateTime;
  ends_at: ISODateTime;
  capacity: number;
  booked_count: number;
  booking_ratio: number;
  historical_average_wait_minutes: number | null;
};

export type PredictionEvaluationParams = {
  prediction_method?: PredictionMethod | "";
  model_version?: string;
  generated_from?: ISODateTime;
  generated_to?: ISODateTime;
  facility_id?: UUID;
};

export type PredictionEvaluationRow = {
  prediction_id: UUID;
  queue_entry_id: UUID;
  predicted_wait_minutes: number;
  actual_wait_minutes: number;
  absolute_error_minutes: number;
  prediction_method: PredictionMethod;
  model_version: string | null;
  generated_at: ISODateTime;
};
