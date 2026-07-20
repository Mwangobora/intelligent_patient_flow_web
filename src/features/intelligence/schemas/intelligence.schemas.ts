import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));
const requiredText = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const predictionFilterSchema = z.object({
  queue_entry_id: optionalText,
  prediction_method: z.enum(["", "rule_based", "machine_learning"]),
  model_version: optionalText,
  generated_from: optionalText,
  generated_to: optionalText,
  facility_id: optionalText,
});

export const createPredictionSchema = z.object({
  queue_entry_id: requiredText("Queue entry"),
  predicted_wait_minutes: z.number().int().min(0),
  prediction_method: z.enum(["rule_based", "machine_learning"]),
  model_version: optionalText,
  confidence_score: z.number().min(0).max(1).nullable().optional(),
  generated_at: optionalText,
});

export const ruleBasedPredictionSchema = z.object({
  queue_entry_id: requiredText("Queue entry"),
  generated_at: optionalText,
});

export const mlPredictionSchema = z.object({
  queue_entry_id: requiredText("Queue entry"),
});

export const arrivalForecastFilterSchema = z.object({
  facility_id: requiredText("Facility"),
  date_from: requiredText("Date from"),
  date_to: requiredText("Date to"),
  service_point_id: optionalText,
  facility_specialty_id: optionalText,
});

export const slotSuggestionFilterSchema = z.object({
  facility_specialty_id: requiredText("Facility specialty"),
  date_from: requiredText("Date from"),
  date_to: requiredText("Date to"),
  practitioner_id: optionalText,
});

export const evaluationFilterSchema = z.object({
  prediction_method: z.enum(["", "rule_based", "machine_learning"]),
  model_version: optionalText,
  generated_from: optionalText,
  generated_to: optionalText,
  facility_id: optionalText,
});

export type PredictionFilterFormValues = z.infer<typeof predictionFilterSchema>;
export type CreatePredictionFormValues = z.infer<typeof createPredictionSchema>;
export type RuleBasedPredictionFormValues = z.infer<typeof ruleBasedPredictionSchema>;
export type MlPredictionFormValues = z.infer<typeof mlPredictionSchema>;
export type ArrivalForecastFilterFormValues = z.infer<typeof arrivalForecastFilterSchema>;
export type SlotSuggestionFilterFormValues = z.infer<typeof slotSuggestionFilterSchema>;
export type EvaluationFilterFormValues = z.infer<typeof evaluationFilterSchema>;
