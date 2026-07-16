import { Badge } from "@/components/ui/badge";

import type { StatusVariant } from "@/types/common";

type StatusBadgeProps = {
  label: string;
  status: StatusVariant;
};

const toneByStatus: Record<StatusVariant, "success" | "warning" | "danger" | "info"> = {
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  neutral: "info",
};

export function StatusBadge({ label, status }: StatusBadgeProps) {
  return <Badge tone={toneByStatus[status]}>{label}</Badge>;
}
