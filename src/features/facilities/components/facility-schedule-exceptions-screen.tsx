"use client";

import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";

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
  const [showCreate, setShowCreate] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<ScheduleExceptionRecord | null>(null);
  const facilityQuery = useFacilityQuery(facilityId, { enabled: workspace.canViewFacilities });
  const exceptionsQuery = useScheduleExceptionsQuery({ facility_id: facilityId }, { enabled: workspace.canManageSchedule });
  const createException = useCreateScheduleExceptionMutation();
  const deactivateException = useDeactivateScheduleExceptionMutation();

  if (workspace.isLoading || facilityQuery.isLoading) return <LoadingState title="Loading schedule exceptions" description="Preparing exception schedule." />;
  if (!workspace.canManageSchedule) return <ErrorState title="Schedule permission required" description="You need facilities_schedule.manage." />;

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<><FacilityPageTabs activeTab="schedule-exceptions" facilityId={facilityId} /><PageHeader title="Schedule exceptions" description={facilityQuery.data?.name ?? "Facility schedule exceptions"} /></>}
        actions={<ResponsiveActionBar><Button onClick={() => setShowCreate(true)}>Add exception</Button></ResponsiveActionBar>}
      >
        <FormSheet open={showCreate} title="Add schedule exception" description="Closed days and special hours override weekly operating hours." onOpenChange={setShowCreate}>
          <ScheduleExceptionForm isSubmitting={createException.isPending} onSubmit={async (payload) => {
            await createException.mutateAsync({ ...payload, facility_id: facilityId });
            setShowCreate(false);
          }} />
        </FormSheet>
        <ConfirmDialog
          open={Boolean(deactivateTarget)}
          title="Deactivate schedule exception?"
          description="This marks the exception inactive without deleting it."
          confirmLabel="Deactivate exception"
          isSubmitting={deactivateException.isPending}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={async () => {
            if (!deactivateTarget) return;
            await deactivateException.mutateAsync(deactivateTarget.id);
            setDeactivateTarget(null);
          }}
        />
        {exceptionsQuery.error ? <ErrorState title="Unable to load schedule exceptions" description={exceptionsQuery.error.message} /> : null}
        {exceptionsQuery.isLoading ? <LoadingState title="Loading schedule exceptions" description="Fetching exceptions." /> : (
          <FacilityResourceTable<ScheduleExceptionRecord>
            records={exceptionsQuery.data ?? []}
            emptyMessage="No schedule exceptions yet."
            canDeactivate
            onDeactivate={setDeactivateTarget}
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
