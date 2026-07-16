import type { PermissionCode } from "@/types/permissions";

import { permissionCodes } from "@/config/permissions.config";

type NavigationItem = {
  label: string;
  href: string;
  icon: string;
  requiredPermission: PermissionCode | null;
};

export const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/", icon: "layout-dashboard", requiredPermission: permissionCodes.reportingAnalyticsView },
  { label: "Appointments", href: "/appointments", icon: "calendar-days", requiredPermission: permissionCodes.schedulingAppointmentView },
  { label: "Queue", href: "/queue", icon: "list-ordered", requiredPermission: permissionCodes.queueingEntryView },
  { label: "Check-ins", href: "/checkins", icon: "scan-line", requiredPermission: permissionCodes.checkinsCheckinView },
  { label: "Patients", href: "/patients", icon: "users", requiredPermission: permissionCodes.patientsPatientView },
  { label: "Practitioners", href: "/practitioners", icon: "stethoscope", requiredPermission: permissionCodes.practitionersPractitionerView },
  { label: "Facilities", href: "/facilities", icon: "building-2", requiredPermission: permissionCodes.facilitiesFacilityView },
  { label: "Intelligence", href: "/intelligence", icon: "brain-circuit", requiredPermission: permissionCodes.reportingAnalyticsView },
  { label: "Notifications", href: "/notifications", icon: "bell", requiredPermission: permissionCodes.reportingAnalyticsView },
  { label: "Reports", href: "/reports", icon: "file-text", requiredPermission: permissionCodes.reportingReportView },
  { label: "Audit Logs", href: "/audit", icon: "shield-check", requiredPermission: permissionCodes.auditLogView },
  { label: "Settings", href: "/settings", icon: "settings", requiredPermission: null },
];
