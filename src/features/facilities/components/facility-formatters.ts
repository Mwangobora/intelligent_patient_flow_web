export const dayNames: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export function formatOptional(value?: string | number | null) {
  return value === undefined || value === null || value === "" ? "—" : String(value);
}

export function formatTimeRange(
  opensAt?: string | null,
  closesAt?: string | null,
  is24Hours?: boolean,
  isClosed?: boolean,
) {
  if (isClosed) return "Closed";
  if (is24Hours) return "24 hours";
  return `${formatOptional(opensAt)} - ${formatOptional(closesAt)}`;
}

export function cleanPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value]),
  ) as T;
}
