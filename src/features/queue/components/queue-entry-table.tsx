import { QueuePriorityBadge } from "./queue-priority-badge";
import { QueueStatusBadge } from "./queue-status-badge";
import { formatQueueDateTime, formatWaitingTime } from "./queue-formatters";
import type { QueueEntryRecord } from "../types/queue.types";

type QueueEntryTableProps = {
  entries: QueueEntryRecord[];
  selectedEntryId?: string | null;
  onSelect?: (entry: QueueEntryRecord) => void;
  emptyMessage?: string;
};

export function QueueEntryTable({
  entries,
  selectedEntryId,
  onSelect,
  emptyMessage = "No queue entries found yet.",
}: QueueEntryTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            {["Queue #", "Patient", "Priority", "Status", "Joined", "Wait", "Service point"].map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entries.length ? (
            entries.map((entry) => (
              <tr
                key={entry.id}
                className={
                  onSelect
                    ? selectedEntryId === entry.id
                      ? "cursor-pointer bg-secondary/40"
                      : "cursor-pointer"
                    : selectedEntryId === entry.id
                      ? "bg-secondary/40"
                      : ""
                }
                onClick={() => onSelect?.(entry)}
              >
                <td className="px-4 py-4 font-semibold text-foreground">{entry.display_queue_number}</td>
                <td className="px-4 py-4">
                  <p className="font-medium text-foreground">{entry.patient_name}</p>
                  <p className="text-muted-foreground">{entry.patient_number}</p>
                </td>
                <td className="px-4 py-4"><QueuePriorityBadge level={entry.priority_level} /></td>
                <td className="px-4 py-4"><QueueStatusBadge status={entry.status} entry /></td>
                <td className="px-4 py-4">{formatQueueDateTime(entry.joined_at)}</td>
                <td className="px-4 py-4">{formatWaitingTime(entry.joined_at)}</td>
                <td className="px-4 py-4">{entry.service_point_name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
