import { StatusBadge } from "@/components/common/status-badge";

import type { LeaveStatus, ShiftStatus } from "../types/practitioner.types";

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const tone = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    cancelled: "neutral",
  } as const;
  return <StatusBadge label={status.replaceAll("_", " ")} status={tone[status]} />;
}

export function ShiftStatusBadge({ status }: { status: ShiftStatus }) {
  const tone = {
    scheduled: "info",
    in_progress: "warning",
    completed: "success",
    cancelled: "danger",
  } as const;
  return <StatusBadge label={status.replaceAll("_", " ")} status={tone[status]} />;
}
