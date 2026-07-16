import { CheckCircle, Clock, ListOrdered, PlayCircle, UserRoundCheck } from "lucide-react";

import { MetricCard } from "@/components/common/metric-card";

type QueueOverviewCardsProps = {
  activeQueues: number;
  waitingPatients: number;
  calledPatients: number;
  inServicePatients: number;
  completedToday: number;
};

export function QueueOverviewCards({
  activeQueues,
  waitingPatients,
  calledPatients,
  inServicePatients,
  completedToday,
}: QueueOverviewCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard title="Active Queues" value={String(activeQueues)} description="Open or paused queues in the selected scope." icon={ListOrdered} />
      <MetricCard title="Waiting Patients" value={String(waitingPatients)} description="Patients currently waiting to be called." icon={Clock} />
      <MetricCard title="Called Patients" value={String(calledPatients)} description="Patients already called to the desk or room." icon={UserRoundCheck} />
      <MetricCard title="In Service" value={String(inServicePatients)} description="Patients actively being served right now." icon={PlayCircle} />
      <MetricCard title="Completed Today" value={String(completedToday)} description="Queue entries completed in the current working day." icon={CheckCircle} />
    </section>
  );
}
