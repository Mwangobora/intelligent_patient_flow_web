import { Card, CardContent } from "@/components/ui/card";

import { QueuePriorityBadge } from "./queue-priority-badge";
import { QueueStatusBadge } from "./queue-status-badge";
import { formatQueueDateTime, formatWaitingTime } from "./queue-formatters";
import type { QueueEntryRecord } from "../types/queue.types";

type QueueEntryMobileCardProps = {
  entry: QueueEntryRecord;
  selected?: boolean;
  onSelect?: (entry: QueueEntryRecord) => void;
};

export function QueueEntryMobileCard({
  entry,
  selected = false,
  onSelect,
}: QueueEntryMobileCardProps) {
  return (
    <Card
      className={selected ? "border-primary/40" : undefined}
      onClick={() => onSelect?.(entry)}
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">{entry.display_queue_number}</p>
            <p className="text-sm text-muted-foreground">{entry.patient_name}</p>
          </div>
          <QueueStatusBadge status={entry.status} entry />
        </div>
        <div className="flex flex-wrap gap-2">
          <QueuePriorityBadge level={entry.priority_level} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Joined</p>
            <p className="font-medium">{formatQueueDateTime(entry.joined_at)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Waiting</p>
            <p className="font-medium">{formatWaitingTime(entry.joined_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
