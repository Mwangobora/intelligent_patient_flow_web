import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionCard } from "@/components/common/section-card";
import { formatDashboardMinutes, formatDashboardNumber } from "./dashboard-formatters";
import type { IntelligenceDashboardSummary } from "../types/dashboard.types";

type IntelligenceSummaryPanelProps = {
  summary?: IntelligenceDashboardSummary;
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

export function IntelligenceSummaryPanel({
  summary,
  isLoading,
  errorMessage,
  onRetry,
}: IntelligenceSummaryPanelProps) {
  return (
    <SectionCard title="Prediction Accuracy" description="Track how wait-time predictions compare with actual service starts.">
      {isLoading && !summary ? <div className="h-72 animate-pulse rounded-xl bg-secondary" /> : null}
      {errorMessage ? (
        <ErrorState title="Unable to load intelligence summary" description={errorMessage} actionLabel="Retry" onAction={onRetry} />
      ) : null}
      {!isLoading && !errorMessage && summary?.predictions_generated === 0 ? (
        <EmptyState title="No predictions yet" description="Prediction accuracy will appear after queue wait predictions are generated." />
      ) : null}
      {!isLoading && !errorMessage && summary && summary.predictions_generated > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Predictions</p><p className="mt-1 text-2xl font-semibold">{formatDashboardNumber(summary.predictions_generated)}</p></div>
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Predicted wait</p><p className="mt-1 text-2xl font-semibold">{formatDashboardMinutes(summary.average_predicted_wait_minutes)}</p></div>
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Actual wait</p><p className="mt-1 text-2xl font-semibold">{formatDashboardMinutes(summary.average_actual_wait_minutes)}</p></div>
            <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Average error</p><p className="mt-1 text-2xl font-semibold">{formatDashboardMinutes(summary.average_prediction_error_minutes)}</p></div>
          </div>
          <div className="space-y-3">
            {summary.latest_predictions_summary.slice(0, 4).map((item) => (
              <div key={item.prediction_id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.prediction_method.replace("_", " ")}</p>
                  <p className="text-sm text-muted-foreground">Queue entry {item.queue_entry_id.slice(0, 8)}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium text-foreground">{formatDashboardMinutes(item.predicted_wait_minutes)}</p>
                  <p className="text-muted-foreground">{formatDashboardMinutes(item.absolute_error_minutes)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
