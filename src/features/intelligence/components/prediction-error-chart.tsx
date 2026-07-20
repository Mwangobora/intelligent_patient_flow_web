"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { SectionCard } from "@/components/common/section-card";
import { dashboardChartColors } from "@/config/theme.config";

import type { PredictionEvaluationRow } from "../types/intelligence.types";

export function PredictionErrorChart({ rows }: { rows: PredictionEvaluationRow[] }) {
  const chartData = rows.slice(0, 12).map((row, index) => ({
    label: `#${index + 1}`,
    absolute_error_minutes: row.absolute_error_minutes,
    predicted_wait_minutes: row.predicted_wait_minutes,
    actual_wait_minutes: row.actual_wait_minutes,
  }));

  return (
    <SectionCard title="Prediction Error" description="Absolute error between predicted and actual wait time.">
      {!rows.length ? <EmptyState title="No evaluated predictions" description="Evaluation appears once queue entries have actual service start times." /> : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dashboardChartColors.soft} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="absolute_error_minutes" radius={[8, 8, 0, 0]} fill={dashboardChartColors.warning} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}
