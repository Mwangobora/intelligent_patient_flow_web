import { Badge } from "@/components/ui/badge";

import { queuePriorityLabel, queuePriorityTone } from "./queue-formatters";
import type { QueuePriorityLevel } from "../types/queue.types";

type QueuePriorityBadgeProps = {
  level: QueuePriorityLevel;
};

export function QueuePriorityBadge({ level }: QueuePriorityBadgeProps) {
  return <Badge tone={queuePriorityTone(level)}>{queuePriorityLabel(level)}</Badge>;
}
