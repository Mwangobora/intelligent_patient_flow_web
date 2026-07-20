import type { PermissionCode } from "@/types/permissions";

import { permissionCodes } from "@/config/permissions.config";

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
  { label: "Dashboard", href: "/", icon: "layout-dashboard", requiredPermission: permissionCodes.reportingAnalyticsView },
  { label: "Appointments", href: "/appointments", icon: "calendar-clock", requiredPermission: permissionCodes.schedulingAppointmentView },
  { label: "Queue", href: "/queue", icon: "list-ordered", requiredPermission: permissionCodes.queueingEntryView },
  { label: "Check-ins", href: "/checkins", icon: "qr-code", requiredPermission: permissionCodes.checkinsCheckinView },
  { label: "Patients", href: "/patients", icon: "users", requiredPermission: permissionCodes.patientsPatientView },
  { label: "Practitioners", href: "/practitioners", icon: "stethoscope", requiredPermission: permissionCodes.practitionersPractitionerView },
  { label: "Facilities", href: "/facilities", icon: "hospital", requiredPermission: permissionCodes.facilitiesFacilityView },
  { label: "Intelligence", href: "/intelligence", icon: "brain-circuit", requiredPermission: permissionCodes.intelligencePredictionView },
  { label: "Notifications", href: "/notifications", icon: "bell", requiredPermission: permissionCodes.notificationsNotificationView },
  { label: "Reports", href: "/reports", icon: "file-text", requiredPermission: permissionCodes.reportingReportView },
  { label: "Audit Logs", href: "/audit-logs", icon: "shield-check", requiredPermission: permissionCodes.auditLogView },
  { label: "Settings", href: "/settings", icon: "settings", requiredPermission: null },
];
