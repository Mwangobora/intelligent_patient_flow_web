import { format } from "date-fns";

import type { AppointmentStatus } from "../types/appointment.types";

export function formatAppointmentDateTime(value: string): string {
  return format(new Date(value), "dd MMM yyyy, HH:mm");
}

export function formatAppointmentDate(value: string): string {
  return format(new Date(value), "yyyy-MM-dd");
}

export function formatAppointmentStatus(status: AppointmentStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPersonName(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
