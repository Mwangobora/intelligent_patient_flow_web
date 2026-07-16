export const permissionCodes = {
  reportingAnalyticsView: "reporting_analytics.view",
  schedulingAppointmentView: "scheduling_appointment.view",
  queueingEntryView: "queueing_entry.view",
  checkinsCheckinView: "checkins_checkin.view",
  patientsPatientView: "patients_patient.view",
  practitionersPractitionerView: "practitioners_practitioner.view",
  facilitiesFacilityView: "facilities_facility.view",
  intelligencePredictionView: "intelligence_prediction.view",
  notificationsNotificationView: "notifications_notification.view",
  reportingReportView: "reporting_report.view",
  auditLogView: "audit_log.view",
} as const;

export type AppPermissionCode =
  (typeof permissionCodes)[keyof typeof permissionCodes];
