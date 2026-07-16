import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { formatAppointmentDateTime } from "./appointment-formatters";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import type { AppointmentStatusHistoryRecord } from "../types/appointment.types";

type AppointmentStatusHistoryProps = {
  history?: AppointmentStatusHistoryRecord[];
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

export function AppointmentStatusHistory({
  history,
  isLoading,
  errorMessage,
  onRetry,
}: AppointmentStatusHistoryProps) {
  if (isLoading && !history) {
    return <div className="h-40 animate-pulse rounded-xl bg-secondary" />;
  }

  if (errorMessage) {
    return (
      <ErrorState
        title="Unable to load status history"
        description={errorMessage}
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (!history?.length) {
    return (
      <EmptyState
        title="No status history yet"
        description="Status updates will appear here after the appointment moves through workflow."
      />
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item) => (
        <div key={item.id} className="rounded-lg border border-border px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {item.from_status ? <AppointmentStatusBadge status={item.from_status} /> : null}
              {item.from_status ? <span className="text-sm text-muted-foreground">to</span> : null}
              <AppointmentStatusBadge status={item.to_status} />
            </div>
            <span className="text-sm text-muted-foreground">
              {formatAppointmentDateTime(item.changed_at)}
            </span>
          </div>
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-foreground">
              {item.reason || "Status updated from the operations workspace."}
            </p>
            <p className="text-muted-foreground">
              Source: {item.change_source.replaceAll("_", " ")}
            </p>
            {item.changed_by_email ? (
              <p className="text-muted-foreground">{item.changed_by_email}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
