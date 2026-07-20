import type { AuditLogRecord, SafeUserSummary } from "../types/audit.types";

const sensitivePatterns = [
  "password",
  "token",
  "authorization",
  "cookie",
  "secret",
  "api_key",
  "otp",
  "pin",
  "body_encrypted",
  "destination_encrypted",
  "subject_encrypted",
  "token_encrypted",
  "token_hash",
  "id_number",
  "medical_notes",
];

export function formatAuditDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatActor(actor?: SafeUserSummary | null) {
  if (!actor) return "System";
  const name = [actor.first_name, actor.last_name].filter(Boolean).join(" ");
  return name || actor.email || actor.id;
}

export function formatOptional(value?: string | number | null) {
  return value === undefined || value === null || value === "" ? "—" : String(value);
}

export function sanitizeForDisplay(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeForDisplay);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        sensitivePatterns.some((pattern) => key.toLowerCase().includes(pattern))
          ? "[REDACTED]"
          : sanitizeForDisplay(entry),
      ]),
    );
  }
  return value;
}

export function summarizeAuditLog(log: AuditLogRecord) {
  return `${log.action} · ${log.resource_type}${log.resource_id ? `/${log.resource_id}` : ""}`;
}

export function getFriendlyAuditErrorMessage(message?: string) {
  const normalized = (message ?? "").toLowerCase();
  if (normalized.includes("permission") || normalized.includes("forbidden")) {
    return "You do not have permission to view audit logs.";
  }
  if (normalized.includes("not found")) return "Audit log was not found.";
  if (normalized.includes("date_to") || normalized.includes("invalid")) return "Please check the selected filters.";
  if (normalized.includes("network")) return "Could not connect to the server. Please try again.";
  return message || "Something went wrong while loading audit logs.";
}
