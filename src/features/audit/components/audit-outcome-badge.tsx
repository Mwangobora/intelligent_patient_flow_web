import { StatusBadge } from "@/components/common/status-badge";

import type { AuditOutcome } from "../types/audit.types";

const statusByOutcome: Record<AuditOutcome, "success" | "warning" | "danger"> = {
  success: "success",
  failure: "danger",
  denied: "warning",
};

export function AuditOutcomeBadge({ outcome }: { outcome?: AuditOutcome | null }) {
  if (!outcome) return <StatusBadge label="Unknown" status="neutral" />;
  return <StatusBadge label={outcome} status={statusByOutcome[outcome]} />;
}
