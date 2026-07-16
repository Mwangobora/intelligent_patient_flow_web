export const brandColors = {
  primaryTeal: "#088395",
  darkNavy: "#102A43",
  softCyan: "#E6F7F9",
  appBackground: "#F8FAFC",
  cardBackground: "#FFFFFF",
  textPrimary: "#102A43",
  textSecondary: "#475569",
  border: "#D9E2EC",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  info: "#0284C7",
} as const;

export type StatusTone = "success" | "warning" | "danger" | "info";

export const statusToneLabels: Record<StatusTone, string> = {
  success: "Success",
  warning: "Warning",
  danger: "Error",
  info: "Info",
};

export const dashboardColorPreview = [
  { name: "Primary teal", token: "bg-primary", value: brandColors.primaryTeal },
  { name: "Dark navy", token: "bg-foreground", value: brandColors.darkNavy },
  { name: "Soft cyan", token: "bg-secondary", value: brandColors.softCyan },
  { name: "Success", token: "bg-success", value: brandColors.success },
  { name: "Warning", token: "bg-warning", value: brandColors.warning },
  { name: "Danger", token: "bg-danger", value: brandColors.danger },
  { name: "Info", token: "bg-info", value: brandColors.info },
] as const;

export const dashboardChartColors = {
  teal: brandColors.primaryTeal,
  navy: brandColors.darkNavy,
  cyan: brandColors.info,
  success: brandColors.success,
  warning: brandColors.warning,
  danger: brandColors.danger,
  soft: brandColors.softCyan,
} as const;
