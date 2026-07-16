import { format } from "date-fns";

import type { ExportFormat, ReportExportStatus, ReportType } from "../types/reporting.types";

export function formatReportingNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatReportingMinutes(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${formatReportingNumber(Math.round(value))} min`;
}

export function formatReportingPercentage(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatReportDateTime(value?: string | null) {
  if (!value) return "—";
  return format(new Date(value), "PPp");
}

export function formatReportType(reportType: ReportType) {
  return reportType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatExportFormat(formatValue: ExportFormat) {
  return formatValue.toUpperCase();
}

export function getReportStatusTone(status: ReportExportStatus) {
  const tones = {
    pending: "warning",
    processing: "info",
    completed: "success",
    failed: "danger",
    expired: "warning",
    cancelled: "danger",
  } as const;
  return tones[status];
}

export function formatHourLabel(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

export function buildAnalyticsDateRange(dateFrom: string, dateTo: string) {
  return { date_from: dateFrom, date_to: dateTo };
}
