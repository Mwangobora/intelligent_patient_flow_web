export function formatSettingsName(first?: string | null, middle?: string | null, last?: string | null) {
  return [first, middle, last].filter(Boolean).join(" ") || "Unnamed user";
}

export function formatOptional(value?: string | number | null) {
  return value === undefined || value === null || value === "" ? "—" : String(value);
}

export function moduleLabel(moduleName: string) {
  return moduleName.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function cleanPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value])) as T;
}
