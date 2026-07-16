"use client";

import Link from "next/link";
import { Activity, BrainCircuit, Clock3, FileBarChart, FileText, Stethoscope, Users } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { MetricCard } from "@/components/common/metric-card";
import { ScopeNotice } from "@/components/common/scope-notice";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { Button } from "@/components/ui/button";

import { useDownloadReportExportMutation } from "../hooks/use-reporting-mutations";
import {
  useReportExportsQuery,
  useReportingAppointmentSummaryQuery,
  useReportingIntelligenceSummaryQuery,
  useReportingOverviewSummaryQuery,
} from "../hooks/use-reporting-queries";
import { useReportingWorkspace } from "../hooks/use-reporting-workspace";
import { formatReportType, formatReportingMinutes, formatReportingNumber, formatReportingPercentage } from "./reporting-formatters";
import { ReportExportMobileCard } from "./report-export-mobile-card";
import { ReportExportTable } from "./report-export-table";

const reportCards = [
  { type: "patient_waiting_time", title: "Patient Waiting Time", description: "Queue wait insights and service start delays.", icon: Activity },
  { type: "appointment_utilization", title: "Appointment Utilization", description: "Booked slots, completion, cancellations, and no-shows.", icon: FileBarChart },
  { type: "doctor_workload", title: "Doctor Workload", description: "Shift volume and completed appointment distribution.", icon: Stethoscope },
  { type: "daily_attendance", title: "Daily Attendance", description: "Check-ins, walk-ins, and completed queue flow by day.", icon: FileText },
  { type: "prediction_accuracy", title: "Prediction Accuracy", description: "Compare predicted and actual waiting times.", icon: BrainCircuit },
] as const;

export function ReportsOverviewScreen() {
  const workspace = useReportingWorkspace();
  const downloadMutation = useDownloadReportExportMutation();
  const organizationId = workspace.activeMembership?.organization;
  const facilityId = workspace.activeMembership?.facility ?? undefined;
  const hasScope = Boolean(organizationId);
  const params = { organization_id: organizationId, facility_id: facilityId };

  const overviewQuery = useReportingOverviewSummaryQuery(params, { enabled: workspace.canViewAnalytics && hasScope });
  const appointmentSummaryQuery = useReportingAppointmentSummaryQuery(params, { enabled: workspace.canViewAnalytics && hasScope });
  const intelligenceSummaryQuery = useReportingIntelligenceSummaryQuery(params, { enabled: workspace.canViewAnalytics && hasScope });
  const exportsQuery = useReportExportsQuery({ organization_id: organizationId, facility_id: facilityId }, { enabled: workspace.canViewReports && hasScope });

  if (workspace.isLoading) {
    return <LoadingState title="Loading reporting workspace" description="Preparing analytics summaries and export history." />;
  }
  if (!workspace.canViewReports && !workspace.canViewAnalytics) {
    return <ErrorState title="Reporting access required" description="You do not have permission to access reporting or analytics." />;
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Reporting and Analytics"
        description="Review operational analytics, generate secure exports, and download completed staff reports."
      />
      <ResponsiveActionBar>
        <Link href="/reports/analytics"><Button variant="secondary">View analytics</Button></Link>
        {workspace.canGenerateReports ? <Link href="/reports/generate"><Button>Generate export</Button></Link> : null}
        <Link href="/reports/exports"><Button variant="secondary">Export history</Button></Link>
      </ResponsiveActionBar>
      {!hasScope ? (
        <ScopeNotice
          title="No reporting scope linked yet"
          description="Reporting screens stay visible, but a real organization membership is required before analytics and exports can load."
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Patients in scope"
          value={formatReportingNumber(overviewQuery.data?.total_patients ?? 0)}
          description="Current reporting scope coverage."
          icon={Users}
        />
        <MetricCard
          title="Appointments"
          value={formatReportingNumber(appointmentSummaryQuery.data?.appointments_total ?? 0)}
          description={`Utilization ${formatReportingPercentage(appointmentSummaryQuery.data?.appointment_utilization_percentage)}`}
          icon={FileBarChart}
        />
        <MetricCard
          title="Average wait"
          value={formatReportingMinutes(overviewQuery.data?.average_wait_minutes_today ?? null)}
          description="Service start delay in the current date range."
          icon={Clock3}
        />
        <MetricCard
          title="Prediction error"
          value={formatReportingMinutes(intelligenceSummaryQuery.data?.average_prediction_error_minutes ?? null)}
          description="Average difference between predicted and actual waits."
          icon={BrainCircuit}
        />
      </section>

      <SectionCard title="Available reports" description="Open analytics previews or generate downloadable exports for the operational report you need.">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {reportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.type} className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{formatReportType(card.type)}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/reports/analytics"><Button variant="secondary">View analytics</Button></Link>
                  {workspace.canGenerateReports ? <Link href={`/reports/generate?report_type=${card.type}`}><Button>Generate export</Button></Link> : null}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Recent export history" description="Track completed, pending, failed, and expired report files.">
        {exportsQuery.isLoading ? <LoadingState title="Loading export history" description="Fetching recent report export activity." /> : null}
        {exportsQuery.error ? <ErrorState title="Unable to load export history" description={exportsQuery.error.message} actionLabel="Retry" onAction={() => void exportsQuery.refetch()} /> : null}
        {!exportsQuery.isLoading && !exportsQuery.error && !exportsQuery.data?.length ? (
          <EmptyState title="No exports yet" description="Generate your first report export to see status, history, and download actions here." />
        ) : null}
        {exportsQuery.data?.length ? (
          <>
            <ReportExportTable
              exports={exportsQuery.data.slice(0, 5)}
              canDownload={workspace.canDownloadReports}
              canCancel={workspace.canCancelReports}
              onDownload={(item) => downloadMutation.mutate(item.id)}
              onCancel={() => undefined}
            />
            <div className="space-y-4 md:hidden">
              {exportsQuery.data.slice(0, 5).map((item) => (
                <ReportExportMobileCard
                  key={item.id}
                  item={item}
                  canDownload={workspace.canDownloadReports}
                  canCancel={false}
                  onDownload={(record) => downloadMutation.mutate(record.id)}
                  onCancel={() => undefined}
                />
              ))}
            </div>
          </>
        ) : null}
      </SectionCard>
    </PageContainer>
  );
}
