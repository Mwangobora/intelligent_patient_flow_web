import { BellRing, Clock, UserRoundCheck } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { SectionCard } from "@/components/common/section-card";

import { QueuePriorityBadge } from "./queue-priority-badge";
import { QueueStatusBadge } from "./queue-status-badge";
import { formatQueueDateTime, formatWaitingTime } from "./queue-formatters";
import type { QueueEntryRecord } from "../types/queue.types";

type NextQueueEntryPanelProps = {
  entry?: QueueEntryRecord | null;
  title?: string;
};

export function NextQueueEntryPanel({
  entry,
  title = "Next patient",
}: NextQueueEntryPanelProps) {
  return (
    <SectionCard title={title} description="Priority-aware queue ordering and current service readiness.">
      {!entry ? (
        <EmptyState title="No patient ready" description="The next callable patient will appear here when the queue has waiting entries." />
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 rounded-xl bg-secondary p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <BellRing className="h-4 w-4" />
                <span>{entry.display_queue_number}</span>
              </div>
              <p className="text-xl font-semibold text-foreground">{entry.patient_name}</p>
              <p className="text-sm text-muted-foreground">{entry.patient_number}</p>
            </div>
            <QueuePriorityBadge level={entry.priority_level} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Status</p>
              <div className="mt-2"><QueueStatusBadge status={entry.status} entry /></div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground"><Clock className="h-3.5 w-3.5" />Waiting</p>
              <p className="mt-2 text-base font-semibold text-foreground">{formatWaitingTime(entry.joined_at)}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground"><UserRoundCheck className="h-3.5 w-3.5" />Joined</p>
              <p className="mt-2 text-base font-semibold text-foreground">{formatQueueDateTime(entry.joined_at)}</p>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
