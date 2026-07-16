import { format } from "date-fns";

import type { CheckinMethod, CheckinRecord, CheckinTokenRecord } from "../types/checkin.types";

export function formatCheckinDateTime(value?: string | null) {
  if (!value) return "—";
  return format(new Date(value), "PPp");
}

export function buildDayBoundary(date: string, isEnd = false) {
  return new Date(`${date}T${isEnd ? "23:59:59" : "00:00:00"}`).toISOString();
}

export function getCheckinMode(checkin: CheckinRecord) {
  return checkin.appointment ? "appointment" : "walk_in";
}

export function getCheckinModeLabel(checkin: CheckinRecord) {
  return getCheckinMode(checkin) === "appointment" ? "Appointment" : "Walk-in";
}

export function getCheckinMethodLabel(method: CheckinMethod) {
  return {
    reception: "Reception",
    mobile: "Mobile",
    qr_code: "QR code",
    self_service: "Self service",
  }[method];
}

export function getCheckinStatusLabel(checkin: CheckinRecord) {
  return checkin.voided_at ? "Voided" : "Checked in";
}

export function getCheckinPatientSummary(checkin: CheckinRecord) {
  return `${checkin.patient_name} (${checkin.patient_number})`;
}

export function getTokenStateLabel(token: CheckinTokenRecord) {
  if (token.revoked_at) return "Revoked";
  if (token.used_at) return "Used";
  if (token.is_active) return "Active";
  return "Expired";
}
