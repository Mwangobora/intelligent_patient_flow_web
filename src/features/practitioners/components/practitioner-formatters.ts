import { format } from "date-fns";

import type { LeaveStatus, ShiftStatus } from "../types/practitioner.types";

export function formatPractitionerName(firstName?: string | null, middleName?: string | null, lastName?: string | null) {
  return [firstName, middleName, lastName].filter(Boolean).join(" ");
}

export function formatDateLabel(value?: string | null) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy");
}

export function formatDateTimeLabel(value?: string | null) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy, HH:mm");
}

export function formatTimeRangeLabel(startsAt?: string | null, endsAt?: string | null) {
  if (!startsAt || !endsAt) return "—";
  return `${startsAt.slice(0, 5)} - ${endsAt.slice(0, 5)}`;
}

export function formatLeaveStatusLabel(status: LeaveStatus) {
  return status.replaceAll("_", " ");
}

export function formatShiftStatusLabel(status: ShiftStatus) {
  return status.replaceAll("_", " ");
}

export function dayOfWeekLabel(dayOfWeek: number) {
  return ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayOfWeek] ?? "Unknown";
}
