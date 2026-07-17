import { StatusBadge } from "@/components/common/status-badge";

export function PatientStatusBadge({ isActive }: { isActive: boolean }) {
  return <StatusBadge label={isActive ? "Active" : "Inactive"} status={isActive ? "success" : "warning"} />;
}
