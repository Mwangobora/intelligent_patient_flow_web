export function formatDashboardNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatDashboardMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${formatDashboardNumber(Math.round(value))} min`;
}

export function formatDashboardPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatHourLabel(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

export function titleCaseLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
