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

import { useCreateOperatingHourMutation, useDeactivateOperatingHourMutation } from "../hooks/use-facility-mutations";
import { useFacilityQuery, useOperatingHoursQuery } from "../hooks/use-facility-queries";
import { useFacilityWorkspace } from "../hooks/use-facility-workspace";
import type { OperatingHourRecord } from "../types/facility.types";
import { dayNames, formatTimeRange } from "./facility-formatters";
import { FacilityPageTabs } from "./facility-page-tabs";
import { FacilityResourceTable } from "./facility-resource-table";
import { OperatingHourForm } from "./schedule-forms";

export function FacilityOperatingHoursScreen({ facilityId }: { facilityId: string }) {
  const workspace = useFacilityWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<OperatingHourRecord | null>(null);
  const facilityQuery = useFacilityQuery(facilityId, { enabled: workspace.canViewFacilities });
  const hoursQuery = useOperatingHoursQuery({ facility_id: facilityId }, { enabled: workspace.canManageSchedule });
  const createHour = useCreateOperatingHourMutation();
  const deactivateHour = useDeactivateOperatingHourMutation();

  if (workspace.isLoading || facilityQuery.isLoading) return <LoadingState title="Loading operating hours" description="Preparing schedule workspace." />;
  if (!workspace.canManageSchedule) return <ErrorState title="Schedule permission required" description="You need facilities_schedule.manage." />;

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<><FacilityPageTabs activeTab="operating-hours" facilityId={facilityId} /><PageHeader title="Operating hours" description={facilityQuery.data?.name ?? "Weekly facility schedule"} /></>}
        actions={<ResponsiveActionBar><Button onClick={() => setShowCreate(true)}>Add operating hours</Button></ResponsiveActionBar>}
      >
        <FormSheet open={showCreate} title="Add operating period" description="Backend rejects overlapping active periods for the same facility and day." onOpenChange={setShowCreate}>
          <OperatingHourForm isSubmitting={createHour.isPending} onSubmit={async (payload) => {
            await createHour.mutateAsync({ ...payload, facility_id: facilityId });
            setShowCreate(false);
          }} />
        </FormSheet>
        <ConfirmDialog
          open={Boolean(deactivateTarget)}
          title="Deactivate operating period?"
          description="This marks the operating period inactive without deleting it."
          confirmLabel="Deactivate period"
          isSubmitting={deactivateHour.isPending}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={async () => {
            if (!deactivateTarget) return;
            await deactivateHour.mutateAsync(deactivateTarget.id);
            setDeactivateTarget(null);
          }}
        />
        {hoursQuery.error ? <ErrorState title="Unable to load operating hours" description={hoursQuery.error.message} /> : null}
        {hoursQuery.isLoading ? <LoadingState title="Loading operating hours" description="Fetching weekly hours." /> : (
          <FacilityResourceTable<OperatingHourRecord>
            records={hoursQuery.data ?? []}
            emptyMessage="No operating hours yet."
            canDeactivate
            onDeactivate={setDeactivateTarget}
            columns={[
              { header: "Day", render: (record) => dayNames[record.day_of_week] ?? record.day_of_week },
              { header: "Period", render: (record) => record.period_order },
              { header: "Hours", render: (record) => formatTimeRange(record.opens_at, record.closes_at, record.is_24_hours) },
              { header: "Next day", render: (record) => record.closes_next_day ? "Yes" : "No" },
            ]}
          />
        )}
      </ResponsivePageShell>
    </PageContainer>
  );
}
