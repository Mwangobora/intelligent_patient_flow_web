import {
  Activity,
  CalendarClock,
  Clock3,
  ListOrdered,
  QrCode,
  Users,
} from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { MetricCard } from "@/components/common/metric-card";

import { formatDashboardMinutes, formatDashboardNumber } from "./dashboard-formatters";
import type { DashboardOverviewSummary } from "../types/dashboard.types";

type DashboardOverviewCardsProps = {
  summary?: DashboardOverviewSummary;
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

function OverviewSkeletonCard() {
  return <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />;
}

export function DashboardOverviewCards({
  summary,
  isLoading,
  errorMessage,
  onRetry,
}: DashboardOverviewCardsProps) {
  if (isLoading && !summary) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <OverviewSkeletonCard key={index} />
        ))}
      </section>
    );
  }

  if (errorMessage) {
    return (
      <ErrorState
        title="Unable to load dashboard overview"
        description={errorMessage}
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard title="Patients" value={formatDashboardNumber(summary.total_patients)} description="Active patient records in the selected scope." icon={Users} />
      <MetricCard title="Appointments Today" value={formatDashboardNumber(summary.total_appointments_today)} description="Scheduled appointments inside the current date window." icon={CalendarClock} />
      <MetricCard title="Check-ins Today" value={formatDashboardNumber(summary.total_checkins_today)} description="Patients already registered at reception, mobile, or kiosk." icon={QrCode} />
      <MetricCard title="Waiting Now" value={formatDashboardNumber(summary.total_waiting_now)} description="Patients currently waiting across active queues." icon={ListOrdered} />
      <MetricCard title="In Service" value={formatDashboardNumber(summary.total_in_service_now)} description="Patients actively being served right now." icon={Activity} />
      <MetricCard title="Average Wait Time" value={formatDashboardMinutes(summary.average_wait_minutes_today)} description="Average queue wait before service starts." icon={Clock3} />
    </section>
  );
}
