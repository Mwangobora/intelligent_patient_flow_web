export const appConfig = {
  name: "Intelligent Patient Flow",
  shortName: "Patient Flow",
  defaultDateFormat: "dd MMM yyyy",
  defaultDateTimeFormat: "dd MMM yyyy, HH:mm",
} as const;

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
}
