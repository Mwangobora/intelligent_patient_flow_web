import { StatusBadge } from "@/components/common/status-badge";

import { queueEntryStatusVariant, queueStatusVariant } from "./queue-formatters";
import type { QueueEntryStatus, QueueStatus } from "../types/queue.types";

type QueueStatusBadgeProps = {
  status: QueueStatus | QueueEntryStatus;
  entry?: boolean;
};

export function QueueStatusBadge({ status, entry = false }: QueueStatusBadgeProps) {
  const label = status.replaceAll("_", " ");
  const normalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <StatusBadge
      label={normalizedLabel}
      status={entry ? queueEntryStatusVariant(status as QueueEntryStatus) : queueStatusVariant(status as QueueStatus)}
    />
  );
}
