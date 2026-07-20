export function formatIntelligenceDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function formatLabel(value?: string | null) {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatMinutes(value?: number | null) {
  return value === undefined || value === null ? "—" : `${Math.round(value)} min`;
}

export function formatPercent(value?: number | string | null) {
  if (value === undefined || value === null || value === "") return "—";
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numberValue)) return "—";
  return `${Math.round(numberValue * 100)}%`;
}

export function formatOptional(value?: string | number | null) {
  return value === undefined || value === null || value === "" ? "—" : String(value);
}

export function cleanIntelligencePayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value])) as T;
}

export function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}
