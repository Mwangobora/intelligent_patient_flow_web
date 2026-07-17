import { format } from "date-fns";

import type { PatientRecord, PatientSexCode } from "../types/patient.types";

export function formatPatientName(
  firstName?: string | null,
  middleName?: string | null,
  lastName?: string | null,
) {
  return [firstName, middleName, lastName].filter(Boolean).join(" ").trim() || "Unknown patient";
}

export function formatPatientRecordName(patient: PatientRecord) {
  return formatPatientName(patient.first_name, patient.middle_name, patient.last_name);
}

export function formatPatientDate(value?: string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

export function formatPatientDateTime(value?: string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd MMM yyyy, HH:mm");
  } catch {
    return value;
  }
}

export function formatSexCodeLabel(value?: PatientSexCode | null) {
  if (!value) return "—";
  return {
    male: "Male",
    female: "Female",
    intersex: "Intersex",
    unknown: "Unknown",
  }[value];
}
