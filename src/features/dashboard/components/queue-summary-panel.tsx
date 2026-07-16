import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionCard } from "@/components/common/section-card";
import { formatDashboardMinutes, formatDashboardNumber } from "./dashboard-formatters";
import type { QueueDashboardSummary } from "../types/dashboard.types";

type QueueSummaryPanelProps = {
  summary?: QueueDashboardSummary;
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

export function QueueSummaryPanel({
  summary,
  isLoading,
  errorMessage,
  onRetry,
}: QueueSummaryPanelProps) {
  return (
    <SectionCard title="Queue Summary" description="Review current movement across active service points.">
      {isLoading && !summary ? <div className="h-72 animate-pulse rounded-xl bg-secondary" /> : null}
      {errorMessage ? (
        <ErrorState title="Unable to load queue activity" description={errorMessage} actionLabel="Retry" onAction={onRetry} />
      ) : null}
      {!isLoading && !errorMessage && summary?.active_queues === 0 ? (
        <EmptyState title="No active queues" description="Queue activity will appear once service points are open for the selected date." />
      ) : null}
      {!isLoading && !errorMessage && summary && summary.active_queues > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Waiting</p><p className="mt-1 text-2xl font-semibold">{formatDashboardNumber(summary.waiting_patients)}</p></div>
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Called</p><p className="mt-1 text-2xl font-semibold">{formatDashboardNumber(summary.called_patients)}</p></div>
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">In service</p><p className="mt-1 text-2xl font-semibold">{formatDashboardNumber(summary.in_service_patients)}</p></div>
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Average wait</p><p className="mt-1 text-2xl font-semibold">{formatDashboardMinutes(summary.average_wait_minutes)}</p></div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Next entries</p>
            {summary.next_entries_summary.slice(0, 4).map((entry) => (
              <div key={entry.queue_id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{entry.display_queue_number}</p>
                  <p className="text-sm text-muted-foreground">{entry.service_point_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">Priority {entry.priority_level}</p>
                  <p className="text-sm text-muted-foreground">{formatDashboardMinutes(entry.waiting_minutes)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
