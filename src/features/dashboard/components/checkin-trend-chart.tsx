"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SectionCard } from "@/components/common/section-card";
import { dashboardChartColors } from "@/config/theme.config";

import { formatHourLabel, titleCaseLabel } from "./dashboard-formatters";
import type { CheckinDashboardSummary } from "../types/dashboard.types";

type CheckinTrendChartProps = {
  summary?: CheckinDashboardSummary;
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

export function CheckinTrendChart({
  summary,
  isLoading,
  errorMessage,
  onRetry,
}: CheckinTrendChartProps) {
  return (
    <SectionCard
      title="Check-ins by Hour"
      description="Monitor when arrivals are peaking across the selected scope."
    >
      {isLoading && !summary ? <div className="h-72 animate-pulse rounded-xl bg-secondary" /> : null}
      {errorMessage ? (
        <ErrorState title="Unable to load check-in trends" description={errorMessage} actionLabel="Retry" onAction={onRetry} />
      ) : null}
      {!isLoading && !errorMessage && summary?.total_checkins === 0 ? (
        <EmptyState title="No check-ins in range" description="Check-in charts will appear once arrivals are recorded." />
      ) : null}
      {!isLoading && !errorMessage && summary && summary.total_checkins > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {summary.checkins_by_method.map((item) => (
              <span key={item.method} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                {titleCaseLabel(item.method)}: {item.count}
              </span>
            ))}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.checkins_by_hour}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dashboardChartColors.soft} />
                <XAxis dataKey="hour" tickFormatter={formatHourLabel} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip labelFormatter={(value) => formatHourLabel(Number(value))} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill={dashboardChartColors.cyan} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
