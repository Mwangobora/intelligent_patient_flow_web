"use client";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";

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
  const facilityQuery = useFacilityQuery(facilityId, { enabled: workspace.canViewFacilities });
  const hoursQuery = useOperatingHoursQuery({ facility_id: facilityId }, { enabled: workspace.canManageSchedule });
  const createHour = useCreateOperatingHourMutation();
  const deactivateHour = useDeactivateOperatingHourMutation();

  if (workspace.isLoading || facilityQuery.isLoading) return <LoadingState title="Loading operating hours" description="Preparing schedule workspace." />;
  if (!workspace.canManageSchedule) return <ErrorState title="Schedule permission required" description="You need facilities_schedule.manage." />;

  return (
    <PageContainer>
      <ResponsivePageShell header={<><FacilityPageTabs activeTab="operating-hours" facilityId={facilityId} /><PageHeader title="Operating hours" description={facilityQuery.data?.name ?? "Weekly facility schedule"} /></>}>
        <SectionCard title="Add operating period" description="Backend rejects overlapping active periods for the same facility and day.">
          <OperatingHourForm isSubmitting={createHour.isPending} onSubmit={async (payload) => {
            await createHour.mutateAsync({ ...payload, facility_id: facilityId });
          }} />
        </SectionCard>
        {hoursQuery.error ? <ErrorState title="Unable to load operating hours" description={hoursQuery.error.message} /> : null}
        {hoursQuery.isLoading ? <LoadingState title="Loading operating hours" description="Fetching weekly hours." /> : (
          <FacilityResourceTable<OperatingHourRecord>
            records={hoursQuery.data ?? []}
            emptyMessage="No operating hours yet."
            canDeactivate
            onDeactivate={async (record) => {
              if (!window.confirm(`Deactivate ${dayNames[record.day_of_week]} period?`)) return;
              await deactivateHour.mutateAsync(record.id);
            }}
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
