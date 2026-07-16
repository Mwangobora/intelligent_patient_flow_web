import Link from "next/link";

import { Button } from "@/components/ui/button";

import { formatQueueDate } from "./queue-formatters";
import { QueueStatusBadge } from "./queue-status-badge";
import type { QueueRecord } from "../types/queue.types";

type QueuesTableProps = {
  queues: QueueRecord[];
  emptyMessage?: string;
};

export function QueuesTable({
  queues,
  emptyMessage = "No queues available for the selected filters.",
}: QueuesTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            {["Service point", "Specialty", "Queue date", "Status", "Next sequence", "Actions"].map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {queues.length ? (
            queues.map((queue) => (
              <tr key={queue.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-foreground">{queue.service_point_name}</p>
                  <p className="text-muted-foreground">{queue.service_point_code}</p>
                </td>
                <td className="px-4 py-4">{queue.specialty_name ?? "General queue"}</td>
                <td className="px-4 py-4">{formatQueueDate(queue.queue_date)}</td>
                <td className="px-4 py-4"><QueueStatusBadge status={queue.status} /></td>
                <td className="px-4 py-4">{queue.next_sequence_number}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/queue/queues/${queue.id}`}><Button variant="secondary">View</Button></Link>
                    <Link href={`/queue/service-desk?queueId=${queue.id}`}><Button>Service desk</Button></Link>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
