"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { dashboardChartColors } from "@/config/theme.config";

import { formatDashboardPercentage, titleCaseLabel } from "./dashboard-formatters";
import type { AppointmentDashboardSummary } from "../types/dashboard.types";

type AppointmentStatusChartProps = {
  summary?: AppointmentDashboardSummary;
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

const statusKeys = [
  "pending",
  "confirmed",
  "checked_in",
  "queued",
  "in_service",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
] as const;

export function AppointmentStatusChart({
  summary,
  isLoading,
  errorMessage,
  onRetry,
}: AppointmentStatusChartProps) {
  const chartData = summary
    ? statusKeys.map((status) => ({ status: titleCaseLabel(status), count: summary[status] }))
    : [];

  return (
    <SectionCard
      title="Appointment Status"
      description="Track how booked appointments are moving through the day."
      action={<StatusBadge label={formatDashboardPercentage(summary?.appointment_utilization_percentage)} status="info" />}
    >
      {isLoading && !summary ? <div className="h-72 animate-pulse rounded-xl bg-secondary" /> : null}
      {errorMessage ? (
        <ErrorState title="Unable to load appointment summary" description={errorMessage} actionLabel="Retry" onAction={onRetry} />
      ) : null}
      {!isLoading && !errorMessage && summary?.appointments_total === 0 ? (
        <EmptyState title="No appointments in range" description="Choose another day or scope to review appointment activity." />
      ) : null}
      {!isLoading && !errorMessage && summary && summary.appointments_total > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary p-3"><p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Total</p><p className="mt-1 text-2xl font-semibold">{summary.appointments_total}</p></div>
            <div className="rounded-lg bg-secondary p-3"><p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Completed</p><p className="mt-1 text-2xl font-semibold">{summary.completed}</p></div>
            <div className="rounded-lg bg-secondary p-3"><p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Cancelled</p><p className="mt-1 text-2xl font-semibold">{summary.cancelled}</p></div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dashboardChartColors.soft} />
                <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: dashboardChartColors.soft }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill={dashboardChartColors.teal} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
