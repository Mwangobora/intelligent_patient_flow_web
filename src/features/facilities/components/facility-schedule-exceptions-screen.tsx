"use client";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";

import { useCreateScheduleExceptionMutation, useDeactivateScheduleExceptionMutation } from "../hooks/use-facility-mutations";
import { useFacilityQuery, useScheduleExceptionsQuery } from "../hooks/use-facility-queries";
import { useFacilityWorkspace } from "../hooks/use-facility-workspace";
import type { ScheduleExceptionRecord } from "../types/facility.types";
import { formatOptional, formatTimeRange } from "./facility-formatters";
import { FacilityPageTabs } from "./facility-page-tabs";
import { FacilityResourceTable } from "./facility-resource-table";
import { ScheduleExceptionForm } from "./schedule-forms";

export function FacilityScheduleExceptionsScreen({ facilityId }: { facilityId: string }) {
  const workspace = useFacilityWorkspace();
  const facilityQuery = useFacilityQuery(facilityId, { enabled: workspace.canViewFacilities });
  const exceptionsQuery = useScheduleExceptionsQuery({ facility_id: facilityId }, { enabled: workspace.canManageSchedule });
  const createException = useCreateScheduleExceptionMutation();
  const deactivateException = useDeactivateScheduleExceptionMutation();

  if (workspace.isLoading || facilityQuery.isLoading) return <LoadingState title="Loading schedule exceptions" description="Preparing exception schedule." />;
  if (!workspace.canManageSchedule) return <ErrorState title="Schedule permission required" description="You need facilities_schedule.manage." />;

  return (
    <PageContainer>
      <ResponsivePageShell header={<><FacilityPageTabs activeTab="schedule-exceptions" facilityId={facilityId} /><PageHeader title="Schedule exceptions" description={facilityQuery.data?.name ?? "Facility schedule exceptions"} /></>}>
        <SectionCard title="Add schedule exception" description="Closed days and special hours override weekly operating hours.">
          <ScheduleExceptionForm isSubmitting={createException.isPending} onSubmit={async (payload) => {
            await createException.mutateAsync({ ...payload, facility_id: facilityId });
          }} />
        </SectionCard>
        {exceptionsQuery.error ? <ErrorState title="Unable to load schedule exceptions" description={exceptionsQuery.error.message} /> : null}
        {exceptionsQuery.isLoading ? <LoadingState title="Loading schedule exceptions" description="Fetching exceptions." /> : (
          <FacilityResourceTable<ScheduleExceptionRecord>
            records={exceptionsQuery.data ?? []}
            emptyMessage="No schedule exceptions yet."
            canDeactivate
            onDeactivate={async (record) => {
              if (!window.confirm(`Deactivate exception for ${record.exception_date}?`)) return;
              await deactivateException.mutateAsync(record.id);
            }}
            columns={[
              { header: "Date", render: (record) => record.exception_date },
              { header: "Period", render: (record) => record.period_order },
              { header: "Hours", render: (record) => formatTimeRange(record.opens_at, record.closes_at, record.is_24_hours, record.is_closed) },
              { header: "Reason", render: (record) => formatOptional(record.reason) },
            ]}
          />
        )}
      </ResponsivePageShell>
    </PageContainer>
  );
}
