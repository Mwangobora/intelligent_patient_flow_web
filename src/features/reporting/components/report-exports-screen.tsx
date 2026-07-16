"use client";

import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/forms/select-field";
import { useFacilitiesLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";

import { useCancelReportExportMutation, useDownloadReportExportMutation } from "../hooks/use-reporting-mutations";
import { useReportExportsQuery } from "../hooks/use-reporting-queries";
import { useReportingWorkspace } from "../hooks/use-reporting-workspace";
import { ReportExportMobileCard } from "./report-export-mobile-card";
import { ReportExportTable } from "./report-export-table";
import type { ReportExportStatus, ReportType } from "../types/reporting.types";

export function ReportExportsScreen() {
  const workspace = useReportingWorkspace();
  const [filters, setFilters] = useState<{
    facility_id: string;
    report_type: ReportType | "";
    status: ReportExportStatus | "";
  }>({
    facility_id: workspace.activeMembership?.facility ?? "",
    report_type: "",
    status: "",
  });
  const organizationId = workspace.activeMembership?.organization;
  const facilitiesQuery = useFacilitiesLookupQuery({ organization_id: organizationId, is_active: true }, { enabled: Boolean(organizationId) });
  const exportsQuery = useReportExportsQuery(
    { organization_id: organizationId, facility_id: filters.facility_id || undefined, report_type: filters.report_type || undefined, status: filters.status || undefined },
    { enabled: workspace.canViewReports && Boolean(organizationId) },
  );
  const downloadMutation = useDownloadReportExportMutation();
  const cancelMutation = useCancelReportExportMutation();

  if (workspace.isLoading) {
    return <LoadingState title="Loading report exports" description="Preparing export history and download actions." />;
  }
  if (!workspace.canViewReports) {
    return <ErrorState title="Report access required" description="You do not have permission to view report exports." />;
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Report Export History" description="Track generated exports, monitor status, and download completed files securely." />
      <ResponsiveActionBar>
        {workspace.canGenerateReports ? <Button onClick={() => window.location.assign("/reports/generate")}>Generate report</Button> : null}
        <Button variant="secondary" onClick={() => void exportsQuery.refetch()}>Refresh</Button>
      </ResponsiveActionBar>
      {!organizationId ? <ScopeNotice title="No reporting scope linked yet" description="A real organization membership is required before export history can load." /> : null}
      <ResponsiveFilterPanel title="Export filters" description="Filter report exports by facility, type, or status.">
        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField label="Facility" value={filters.facility_id} onChange={(event) => setFilters((current) => ({ ...current, facility_id: event.target.value }))} options={[{ label: "All facilities", value: "" }, ...(facilitiesQuery.data ?? []).map((facility) => ({ label: facility.name, value: facility.id }))]} />
          <SelectField label="Report type" value={filters.report_type} onChange={(event) => setFilters((current) => ({ ...current, report_type: event.target.value as ReportType | "" }))} options={[{ label: "All report types", value: "" }, { label: "Patient Waiting Time", value: "patient_waiting_time" }, { label: "Appointment Utilization", value: "appointment_utilization" }, { label: "Doctor Workload", value: "doctor_workload" }, { label: "Daily Attendance", value: "daily_attendance" }, { label: "Prediction Accuracy", value: "prediction_accuracy" }]} />
          <SelectField label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as ReportExportStatus | "" }))} options={[{ label: "All statuses", value: "" }, { label: "Pending", value: "pending" }, { label: "Processing", value: "processing" }, { label: "Completed", value: "completed" }, { label: "Failed", value: "failed" }, { label: "Expired", value: "expired" }, { label: "Cancelled", value: "cancelled" }]} />
        </div>
      </ResponsiveFilterPanel>
      {exportsQuery.isLoading ? <LoadingState title="Loading exports" description="Fetching report export records from the backend." /> : null}
      {exportsQuery.error ? <ErrorState title="Unable to load exports" description={exportsQuery.error.message} actionLabel="Retry" onAction={() => void exportsQuery.refetch()} /> : null}
      {!exportsQuery.isLoading && !exportsQuery.error && !exportsQuery.data?.length ? <EmptyState title="No report exports found" description="Generate your first report to create export history." /> : null}
      {exportsQuery.data?.length ? (
        <>
          <ReportExportTable
            exports={exportsQuery.data}
            canDownload={workspace.canDownloadReports}
            canCancel={workspace.canCancelReports}
            onDownload={(item) => downloadMutation.mutate(item.id)}
            onCancel={(item) => cancelMutation.mutate(item.id)}
          />
          <div className="space-y-4 md:hidden">
            {exportsQuery.data.map((item) => (
              <ReportExportMobileCard
                key={item.id}
                item={item}
                canDownload={workspace.canDownloadReports}
                canCancel={workspace.canCancelReports}
                onDownload={(record) => downloadMutation.mutate(record.id)}
                onCancel={(record) => cancelMutation.mutate(record.id)}
              />
            ))}
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}
