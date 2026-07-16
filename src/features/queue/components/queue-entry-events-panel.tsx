import { EmptyState } from "@/components/common/empty-state";
import { SectionCard } from "@/components/common/section-card";

import { formatQueueDateTime } from "./queue-formatters";
import { QueueStatusBadge } from "./queue-status-badge";
import type { QueueEntryEventRecord } from "../types/queue.types";

type QueueEntryEventsPanelProps = {
  events: QueueEntryEventRecord[];
};

export function QueueEntryEventsPanel({ events }: QueueEntryEventsPanelProps) {
  return (
    <SectionCard title="Entry history" description="Append-only event history for the selected queue entry.">
      {!events.length ? (
        <EmptyState title="No events yet" description="Event history will appear after the patient joins or moves through the queue." />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-xl border border-border px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold capitalize text-foreground">{event.event_type.replaceAll("_", " ")}</p>
                  <p className="text-sm text-muted-foreground">{formatQueueDateTime(event.occurred_at)}</p>
                </div>
                {event.to_status ? <QueueStatusBadge status={event.to_status} entry /> : null}
              </div>
              {(event.reason || event.performed_by_email) ? (
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {event.performed_by_email ? <p>By: {event.performed_by_email}</p> : null}
                  {event.reason ? <p>Reason: {event.reason}</p> : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
