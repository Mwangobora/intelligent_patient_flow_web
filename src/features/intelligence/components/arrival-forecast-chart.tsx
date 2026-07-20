"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { SectionCard } from "@/components/common/section-card";
import { dashboardChartColors } from "@/config/theme.config";

import type { ArrivalForecastRow } from "../types/intelligence.types";

export function ArrivalForecastChart({ rows }: { rows: ArrivalForecastRow[] }) {
  const byHour = Array.from({ length: 24 }, (_, hour) => {
    const items = rows.filter((row) => row.hour_of_day === hour);
    const average = items.length ? items.reduce((total, row) => total + row.average_arrivals, 0) / items.length : 0;
    return { hour, average_arrivals: Number(average.toFixed(2)) };
  });

  return (
    <SectionCard title="Average Arrivals by Hour" description="Statistical arrival forecast from historical check-ins or queue entries.">
      {!rows.length ? <EmptyState title="No forecast data" description="Forecast rows will appear after matching historical arrivals exist." /> : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byHour}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dashboardChartColors.soft} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="average_arrivals" radius={[8, 8, 0, 0]} fill={dashboardChartColors.teal} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}
