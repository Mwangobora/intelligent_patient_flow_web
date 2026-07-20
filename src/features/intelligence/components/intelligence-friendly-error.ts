import { normalizeApiError } from "@/lib/api/api-error";

export function getFriendlyIntelligenceError(error: unknown) {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();

  if (normalized.status === 403) return "You do not have permission to view intelligence data.";
  if (normalized.status === 404) return "Prediction is not available for this queue entry.";
  if (normalized.status === null) return "Could not connect to the server. Please try again.";
  if (message.includes("machine learning") || normalized.status === 501) return "Machine learning model is not configured yet.";
  if (message.includes("completed")) return "Prediction cannot be generated for completed queue entries.";

  return normalized.message || "Something went wrong while loading intelligence data.";
}
