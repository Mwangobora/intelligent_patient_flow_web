import type { PermissionCode } from "@/types/permissions";

export type NavigationIconName =
  | "layout-dashboard"
  | "calendar-clock"
  | "list-ordered"
  | "qr-code"
  | "users"
  | "stethoscope"
  | "hospital"
  | "brain-circuit"
  | "bell"
  | "file-text"
  | "shield-check"
  | "settings";

export type NavigationItem = {
  label: string;
  href: string;
  icon: NavigationIconName;
  requiredPermission: PermissionCode | null;
};

export const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/", icon: "layout-dashboard", requiredPermission: "reporting_analytics.view" },
  { label: "Appointments", href: "/appointments", icon: "calendar-clock", requiredPermission: "scheduling_appointment.view" },
  { label: "Queue", href: "/queue", icon: "list-ordered", requiredPermission: "queueing_entry.view" },
  { label: "Check-ins", href: "/checkins", icon: "qr-code", requiredPermission: "checkins_checkin.view" },
  { label: "Patients", href: "/patients", icon: "users", requiredPermission: "patients_patient.view" },
  { label: "Practitioners", href: "/practitioners", icon: "stethoscope", requiredPermission: "practitioners_practitioner.view" },
  { label: "Facilities", href: "/facilities", icon: "hospital", requiredPermission: "facilities_facility.view" },
  { label: "Intelligence", href: "/intelligence", icon: "brain-circuit", requiredPermission: "intelligence_prediction.view" },
  { label: "Notifications", href: "/notifications", icon: "bell", requiredPermission: "notifications_notification.view" },
  { label: "Reports", href: "/reports", icon: "file-text", requiredPermission: "reporting_report.view" },
  { label: "Audit Logs", href: "/audit-logs", icon: "shield-check", requiredPermission: "audit_log.view" },
  { label: "Settings", href: "/settings", icon: "settings", requiredPermission: null },
];
