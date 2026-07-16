"use client";

import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { dashboardChartColors } from "@/config/theme.config";
import { useFacilitiesLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";

import { useReportingWorkspace } from "../hooks/use-reporting-workspace";
import {
  useAppointmentUtilizationAnalyticsQuery,
  useDailyAttendanceAnalyticsQuery,
  useDoctorWorkloadAnalyticsQuery,
  usePatientWaitingTimeAnalyticsQuery,
  usePredictionAccuracyAnalyticsQuery,
} from "../hooks/use-reporting-queries";
import { formatReportingMinutes, formatReportingNumber, formatReportingPercentage } from "./reporting-formatters";

const today = format(new Date(), "yyyy-MM-dd");

export function ReportingAnalyticsScreen() {
  const workspace = useReportingWorkspace();
  const [filters, setFilters] = useState({
    facility_id: workspace.activeMembership?.facility ?? "",
    date_from: today,
    date_to: today,
  });
  const organizationId = workspace.activeMembership?.organization;
  const hasScope = Boolean(organizationId);
  const dateError = filters.date_to < filters.date_from ? "End date cannot be before start date." : undefined;
  const params = { organization_id: organizationId, facility_id: filters.facility_id || undefined, date_from: filters.date_from, date_to: filters.date_to };

  const facilitiesQuery = useFacilitiesLookupQuery({ organization_id: organizationId, is_active: true }, { enabled: Boolean(organizationId) });
  const patientWaitingQuery = usePatientWaitingTimeAnalyticsQuery(params, { enabled: workspace.canViewAnalytics && hasScope && !dateError });
  const appointmentUtilizationQuery = useAppointmentUtilizationAnalyticsQuery(params, { enabled: workspace.canViewAnalytics && hasScope && !dateError });
  const doctorWorkloadQuery = useDoctorWorkloadAnalyticsQuery(params, { enabled: workspace.canViewAnalytics && hasScope && !dateError });
  const dailyAttendanceQuery = useDailyAttendanceAnalyticsQuery(params, { enabled: workspace.canViewAnalytics && hasScope && !dateError });
  const predictionAccuracyQuery = usePredictionAccuracyAnalyticsQuery(params, { enabled: workspace.canViewAnalytics && hasScope && !dateError });

  if (workspace.isLoading) {
    return <LoadingState title="Loading analytics" description="Preparing staff-side reporting insights." />;
  }
  if (!workspace.canViewAnalytics) {
    return <ErrorState title="Analytics access required" description="You do not have permission to view reporting analytics." />;
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Reporting Analytics" description="Preview live operational analytics before generating downloadable exports." />
      <ResponsiveActionBar>
        <Button variant="secondary" onClick={() => void Promise.all([patientWaitingQuery.refetch(), appointmentUtilizationQuery.refetch(), doctorWorkloadQuery.refetch(), dailyAttendanceQuery.refetch(), predictionAccuracyQuery.refetch()])}>Refresh</Button>
      </ResponsiveActionBar>
      <ResponsiveFilterPanel title="Analytics filters" description="Choose facility and date range for analytics previews.">
        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField label="Facility" value={filters.facility_id} onChange={(event) => setFilters((current) => ({ ...current, facility_id: event.target.value }))} options={[{ label: "All organization facilities", value: "" }, ...(facilitiesQuery.data ?? []).map((facility) => ({ label: facility.name, value: facility.id }))]} />
          <TextInputField label="Date from" type="date" value={filters.date_from} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))} />
          <TextInputField label="Date to" type="date" value={filters.date_to} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))} error={dateError} />
        </div>
      </ResponsiveFilterPanel>
      {!hasScope ? <ScopeNotice title="No reporting scope linked yet" description="Analytics remain visible, but an active organization membership is required before real reporting data can load." /> : null}

      <SectionCard title="Patient Waiting Time" description="Queue wait duration between join time and service start.">
        {patientWaitingQuery.isLoading ? <LoadingState title="Loading waiting times" description="Fetching patient queue wait data." /> : null}
        {patientWaitingQuery.error ? <ErrorState title="Unable to load waiting time analytics" description={patientWaitingQuery.error.message} actionLabel="Retry" onAction={() => void patientWaitingQuery.refetch()} /> : null}
        {!patientWaitingQuery.isLoading && !patientWaitingQuery.error && !patientWaitingQuery.data?.rows.length ? <EmptyState title="No waiting time data" description="Completed queue entries with service start times will appear here." /> : null}
        {patientWaitingQuery.data?.rows.length ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Rows</p><p className="mt-1 text-2xl font-semibold">{formatReportingNumber(patientWaitingQuery.data.row_count)}</p></div>
              <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Longest wait</p><p className="mt-1 text-2xl font-semibold">{formatReportingMinutes(Math.max(...patientWaitingQuery.data.rows.map((row) => row.waiting_minutes)))}</p></div>
              <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Average wait</p><p className="mt-1 text-2xl font-semibold">{formatReportingMinutes(patientWaitingQuery.data.rows.reduce((sum, row) => sum + row.waiting_minutes, 0) / patientWaitingQuery.data.rows.length)}</p></div>
            </div>
            <div className="hidden overflow-hidden rounded-xl border border-border md:block">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-secondary/60 text-left text-muted-foreground"><tr>{["Patient #", "Queue #", "Facility", "Service point", "Wait", "Priority"].map((column) => <th key={column} className="px-4 py-3 font-medium">{column}</th>)}</tr></thead>
                <tbody className="divide-y divide-border">
                  {patientWaitingQuery.data.rows.slice(0, 8).map((row) => <tr key={`${row.queue_number}-${row.joined_at}`}><td className="px-4 py-3">{row.patient_number}</td><td className="px-4 py-3">{row.queue_number}</td><td className="px-4 py-3">{row.facility}</td><td className="px-4 py-3">{row.service_point}</td><td className="px-4 py-3">{formatReportingMinutes(row.waiting_minutes)}</td><td className="px-4 py-3">{row.priority_level}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Appointment Utilization" description="Booked slot usage by specialty.">
          {appointmentUtilizationQuery.data?.rows.length ? (
            <div className="space-y-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentUtilizationQuery.data.rows}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dashboardChartColors.soft} />
                    <XAxis dataKey="specialty" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="utilization_percentage" fill={dashboardChartColors.teal} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground">Top utilization: {formatReportingPercentage(Math.max(...appointmentUtilizationQuery.data.rows.map((row) => row.utilization_percentage)))}</p>
            </div>
          ) : appointmentUtilizationQuery.isLoading ? <LoadingState title="Loading appointment utilization" description="Fetching slot and appointment usage." /> : appointmentUtilizationQuery.error ? <ErrorState title="Unable to load appointment utilization" description={appointmentUtilizationQuery.error.message} actionLabel="Retry" onAction={() => void appointmentUtilizationQuery.refetch()} /> : <EmptyState title="No utilization data" description="Appointment slot activity will appear here once available." />}
        </SectionCard>

        <SectionCard title="Daily Attendance" description="Check-ins and completed queue flow by day.">
          {dailyAttendanceQuery.data?.rows.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyAttendanceQuery.data.rows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dashboardChartColors.soft} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total_checkins" stroke={dashboardChartColors.navy} strokeWidth={3} />
                  <Line type="monotone" dataKey="completed_queue_entries" stroke={dashboardChartColors.cyan} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : dailyAttendanceQuery.isLoading ? <LoadingState title="Loading daily attendance" description="Fetching check-in and queue completion totals." /> : dailyAttendanceQuery.error ? <ErrorState title="Unable to load daily attendance" description={dailyAttendanceQuery.error.message} actionLabel="Retry" onAction={() => void dailyAttendanceQuery.refetch()} /> : <EmptyState title="No daily attendance data" description="Attendance rows will appear when check-ins and queue events exist." />}
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Doctor Workload" description="Completed appointments and shift hours by practitioner.">
          {doctorWorkloadQuery.data?.rows.length ? (
            <div className="space-y-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={doctorWorkloadQuery.data.rows}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dashboardChartColors.soft} />
                    <XAxis dataKey="practitioner" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="completed_appointments" fill={dashboardChartColors.success} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : doctorWorkloadQuery.isLoading ? <LoadingState title="Loading doctor workload" description="Fetching practitioner shift and appointment totals." /> : doctorWorkloadQuery.error ? <ErrorState title="Unable to load doctor workload" description={doctorWorkloadQuery.error.message} actionLabel="Retry" onAction={() => void doctorWorkloadQuery.refetch()} /> : <EmptyState title="No doctor workload data" description="Practitioner workload will appear when shifts and appointments are recorded." />}
        </SectionCard>

        <SectionCard title="Prediction Accuracy" description="Absolute error between predicted and actual waits.">
          {predictionAccuracyQuery.data?.rows.length ? (
            <div className="space-y-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictionAccuracyQuery.data.rows}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dashboardChartColors.soft} />
                    <XAxis dataKey="service_point" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="absolute_error_minutes" fill={dashboardChartColors.warning} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground">Average error: {formatReportingMinutes(predictionAccuracyQuery.data.rows.reduce((sum, row) => sum + row.absolute_error_minutes, 0) / predictionAccuracyQuery.data.rows.length)}</p>
            </div>
          ) : predictionAccuracyQuery.isLoading ? <LoadingState title="Loading prediction accuracy" description="Fetching wait prediction comparisons." /> : predictionAccuracyQuery.error ? <ErrorState title="Unable to load prediction accuracy" description={predictionAccuracyQuery.error.message} actionLabel="Retry" onAction={() => void predictionAccuracyQuery.refetch()} /> : <EmptyState title="No prediction accuracy data" description="Prediction rows will appear once wait predictions and actual service starts are available." />}
        </SectionCard>
      </section>
    </PageContainer>
  );
}
