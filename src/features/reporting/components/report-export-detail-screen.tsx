"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { Button } from "@/components/ui/button";

import { useCancelReportExportMutation, useDownloadReportExportMutation, useGenerateReportExportMutation } from "../hooks/use-reporting-mutations";
import { useReportExportDetailQuery } from "../hooks/use-reporting-queries";
import { useReportingWorkspace } from "../hooks/use-reporting-workspace";
import { ReportFormatBadge, ReportStatusBadge, ReportTypeBadge } from "./report-status-badge";
import { formatReportDateTime } from "./reporting-formatters";

export function ReportExportDetailScreen({ exportId }: { exportId: string }) {
  const router = useRouter();
  const workspace = useReportingWorkspace();
  const detailQuery = useReportExportDetailQuery(exportId, { enabled: workspace.canViewReports });
  const downloadMutation = useDownloadReportExportMutation();
  const cancelMutation = useCancelReportExportMutation();
  const generateMutation = useGenerateReportExportMutation();

  if (workspace.isLoading || detailQuery.isLoading) {
    return <LoadingState title="Loading report export" description="Fetching the selected export metadata and status." />;
  }
  if (!workspace.canViewReports) {
    return <ErrorState title="Report access required" description="You do not have permission to view this report export." />;
  }
  if (detailQuery.error || !detailQuery.data) {
    return <ErrorState title="Unable to load report export" description={detailQuery.error?.message ?? "Report export not found."} actionLabel="Back to exports" onAction={() => router.push("/reports/exports")} />;
  }

  const reportExport = detailQuery.data;

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Report Export Detail" description="Review export metadata, status, parameters, and secure download availability." />
      <ResponsiveActionBar>
        <Link href="/reports/exports"><Button variant="secondary">Back to exports</Button></Link>
        {workspace.canDownloadReports && reportExport.file_available ? <Button onClick={() => downloadMutation.mutate(reportExport.id)}>Download</Button> : null}
        {workspace.canGenerateReports && reportExport.status === "pending" ? <Button variant="secondary" onClick={() => generateMutation.mutate(reportExport.id)}>Generate now</Button> : null}
        {workspace.canCancelReports && (reportExport.status === "pending" || reportExport.status === "processing") ? <Button variant="danger" onClick={() => cancelMutation.mutate(reportExport.id)}>Cancel export</Button> : null}
      </ResponsiveActionBar>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Export summary" description="Safe export metadata only. Private storage paths remain hidden.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-sm text-muted-foreground">Report type</p><div className="mt-1"><ReportTypeBadge reportType={reportExport.report_type} /></div></div>
            <div><p className="text-sm text-muted-foreground">Format</p><div className="mt-1"><ReportFormatBadge exportFormat={reportExport.export_format} /></div></div>
            <div><p className="text-sm text-muted-foreground">Status</p><div className="mt-1"><ReportStatusBadge status={reportExport.status} /></div></div>
            <div><p className="text-sm text-muted-foreground">Facility</p><p className="mt-1 font-medium text-foreground">{reportExport.facility_name ?? reportExport.organization_name}</p></div>
            <div><p className="text-sm text-muted-foreground">Generated at</p><p className="mt-1 font-medium text-foreground">{formatReportDateTime(reportExport.generated_at)}</p></div>
            <div><p className="text-sm text-muted-foreground">Expires at</p><p className="mt-1 font-medium text-foreground">{formatReportDateTime(reportExport.expires_at)}</p></div>
            <div><p className="text-sm text-muted-foreground">Rows</p><p className="mt-1 font-medium text-foreground">{reportExport.row_count ?? "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Created</p><p className="mt-1 font-medium text-foreground">{formatReportDateTime(reportExport.created_at)}</p></div>
          </div>
        </SectionCard>
        <SectionCard title="Parameters and status details" description="Backend-safe parameters and failure details if generation did not complete.">
          <div className="space-y-4 text-sm text-foreground">
            <div>
              <p className="text-sm text-muted-foreground">Parameters</p>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-secondary/40 p-4 text-xs text-foreground">{JSON.stringify(reportExport.parameters ?? {}, null, 2)}</pre>
            </div>
            {reportExport.failure_reason ? (
              <div className="rounded-lg border border-danger/20 bg-danger/10 p-4 text-danger">
                <p className="font-semibold">Failure reason</p>
                <p className="mt-1">{reportExport.failure_reason}</p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
