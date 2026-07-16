import { StatusBadge } from "@/components/common/status-badge";

import { formatAppointmentStatus } from "./appointment-formatters";
import type { AppointmentStatus } from "../types/appointment.types";

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
};

const toneByStatus: Record<AppointmentStatus, "success" | "warning" | "danger" | "info" | "neutral"> = {
  pending: "warning",
  confirmed: "info",
  checked_in: "info",
  queued: "warning",
  in_service: "info",
  completed: "success",
  cancelled: "danger",
  no_show: "danger",
  rescheduled: "neutral",
};

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  return <StatusBadge label={formatAppointmentStatus(status)} status={toneByStatus[status]} />;
}
