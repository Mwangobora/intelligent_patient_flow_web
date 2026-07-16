import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionCard } from "@/components/common/section-card";
import { formatDashboardMinutes, formatDashboardNumber } from "./dashboard-formatters";
import type { PractitionerDashboardSummary } from "../types/dashboard.types";

type PractitionerWorkloadPanelProps = {
  summary?: PractitionerDashboardSummary;
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

export function PractitionerWorkloadPanel({
  summary,
  isLoading,
  errorMessage,
  onRetry,
}: PractitionerWorkloadPanelProps) {
  return (
    <SectionCard title="Practitioner Workload" description="See who is on shift and how appointment volume is distributed.">
      {isLoading && !summary ? <div className="h-72 animate-pulse rounded-xl bg-secondary" /> : null}
      {errorMessage ? (
        <ErrorState title="Unable to load practitioner workload" description={errorMessage} actionLabel="Retry" onAction={onRetry} />
      ) : null}
      {!isLoading && !errorMessage && summary?.workload_summary.length === 0 ? (
        <EmptyState title="No practitioner workload yet" description="Shift and appointment summaries will appear as operational data arrives." />
      ) : null}
      {!isLoading && !errorMessage && summary && summary.workload_summary.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">On shift now</p><p className="mt-1 text-2xl font-semibold">{formatDashboardNumber(summary.practitioners_on_shift_now)}</p></div>
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Scheduled shifts</p><p className="mt-1 text-2xl font-semibold">{formatDashboardNumber(summary.scheduled_shifts)}</p></div>
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Scheduled hours</p><p className="mt-1 text-2xl font-semibold">{summary.total_scheduled_hours.toFixed(1)} h</p></div>
          </div>
          <div className="space-y-3">
            {summary.workload_summary.slice(0, 4).map((row) => {
              const serviceTime = summary.average_service_time_by_practitioner.find(
                (item) => item.practitioner_id === row.practitioner_id,
              );

              return (
                <div key={row.practitioner_id} className="rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{row.practitioner_name}</p>
                      <p className="text-sm text-muted-foreground">{row.shifts_count} shifts scheduled</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-foreground">{formatDashboardNumber(row.completed_appointments)} completed</p>
                      <p className="text-muted-foreground">{formatDashboardMinutes(serviceTime?.average_service_minutes ?? null)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
