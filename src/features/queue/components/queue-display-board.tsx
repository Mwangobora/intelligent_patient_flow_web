import { EmptyState } from "@/components/common/empty-state";
import { SectionCard } from "@/components/common/section-card";

import { QueuePriorityBadge } from "./queue-priority-badge";
import type { QueueEntryRecord } from "../types/queue.types";

type QueueDisplayBoardProps = {
  nowCalling?: QueueEntryRecord | null;
  waitingEntries: QueueEntryRecord[];
};

export function QueueDisplayBoard({
  nowCalling,
  waitingEntries,
}: QueueDisplayBoardProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <SectionCard
        title="Now calling"
        description="Patient privacy-safe display board for waiting areas."
      >
        {!nowCalling ? (
          <EmptyState
            title="No queue number being called"
            description="The next queue number will appear here when the selected queue becomes active."
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-secondary px-6 py-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Now calling
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {nowCalling.display_queue_number}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <QueuePriorityBadge level={nowCalling.priority_level} />
                <p className="text-sm text-muted-foreground">
                  Please proceed to {nowCalling.service_point_name}
                </p>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Waiting numbers"
        description="Queue numbers only. Patient names are intentionally hidden."
      >
        {!waitingEntries.length ? (
          <EmptyState
            title="No waiting numbers"
            description="Waiting queue numbers will appear here once patients join the selected queue."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {waitingEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-border bg-card px-4 py-4"
              >
                <p className="text-lg font-semibold text-foreground">
                  {entry.display_queue_number}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.service_point_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
