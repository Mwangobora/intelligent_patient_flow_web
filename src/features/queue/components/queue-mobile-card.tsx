import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { formatQueueDate } from "./queue-formatters";
import { QueueStatusBadge } from "./queue-status-badge";
import type { QueueRecord } from "../types/queue.types";

type QueueMobileCardProps = {
  queue: QueueRecord;
};

export function QueueMobileCard({ queue }: QueueMobileCardProps) {
  return (
    <Card className="md:hidden">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">{queue.service_point_name}</p>
            <p className="text-sm text-muted-foreground">{queue.specialty_name ?? "General queue"}</p>
          </div>
          <QueueStatusBadge status={queue.status} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Queue date</p>
            <p className="font-medium">{formatQueueDate(queue.queue_date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Next sequence</p>
            <p className="font-medium">{queue.next_sequence_number}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/queue/queues/${queue.id}`} className="flex-1">
            <Button variant="secondary" className="w-full">View</Button>
          </Link>
          <Link href={`/queue/service-desk?queueId=${queue.id}`} className="flex-1">
            <Button className="w-full">Service desk</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
