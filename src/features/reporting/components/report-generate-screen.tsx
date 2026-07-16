"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { useFacilitiesLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";

import { useCreateReportExportMutation, useGenerateReportExportMutation } from "../hooks/use-reporting-mutations";
import { useReportingWorkspace } from "../hooks/use-reporting-workspace";
import { ReportGenerateForm } from "./report-generate-form";
import type { ReportExportFormValues } from "../schemas/reporting.schemas";

export function ReportGenerateScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspace = useReportingWorkspace();
  const organizationId = workspace.activeMembership?.organization;
  const facilitiesQuery = useFacilitiesLookupQuery({ organization_id: organizationId, is_active: true }, { enabled: Boolean(organizationId) });
  const createMutation = useCreateReportExportMutation();
  const generateMutation = useGenerateReportExportMutation();

  if (workspace.isLoading) {
    return <LoadingState title="Preparing report export form" description="Loading facilities and report generation permissions." />;
  }
  if (!workspace.canGenerateReports) {
    return <ErrorState title="Report generation access required" description="You do not have permission to generate report exports." />;
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Generate Report Export" description="Choose report type, date range, facility scope, and export format, then generate a secure downloadable file." />
      {!organizationId ? <ScopeNotice title="No reporting scope linked yet" description="A real organization membership is required before report generation can start." /> : null}
      <SectionCard title="Export request" description="The backend creates and generates the report export. The frontend only monitors and downloads the result.">
        <ReportGenerateForm
          facilities={facilitiesQuery.data ?? []}
          defaultFacilityId={workspace.activeMembership?.facility ?? ""}
          isSubmitting={createMutation.isPending || generateMutation.isPending}
          onSubmit={async (values: ReportExportFormValues) => {
            const reportType = (searchParams.get("report_type") || values.report_type) as ReportExportFormValues["report_type"];
            const created = await createMutation.mutateAsync({
              organization_id: organizationId!,
              facility_id: values.facility_id || null,
              report_type: reportType,
              export_format: values.export_format,
              parameters: { date_from: values.date_from, date_to: values.date_to },
            });
            await generateMutation.mutateAsync(created.id);
            router.push(`/reports/exports/${created.id}`);
          }}
        />
      </SectionCard>
    </PageContainer>
  );
}
