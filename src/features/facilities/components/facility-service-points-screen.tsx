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

import { useCreateServicePointMutation, useDeactivateServicePointMutation } from "../hooks/use-facility-mutations";
import { useDepartmentsQuery, useFacilityQuery, useServicePointsQuery, useServicePointTypesQuery } from "../hooks/use-facility-queries";
import { useFacilityWorkspace } from "../hooks/use-facility-workspace";
import type { ServicePointRecord } from "../types/facility.types";
import { FacilityPageTabs } from "./facility-page-tabs";
import { FacilityResourceTable } from "./facility-resource-table";
import { formatOptional } from "./facility-formatters";
import { ServicePointForm } from "./service-point-forms";

export function FacilityServicePointsScreen({ facilityId }: { facilityId: string }) {
  const workspace = useFacilityWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<ServicePointRecord | null>(null);
  const facilityQuery = useFacilityQuery(facilityId, { enabled: workspace.canViewFacilities });
  const departmentsQuery = useDepartmentsQuery({ facility_id: facilityId, is_active: true }, { enabled: workspace.canManageServicePoints });
  const typesQuery = useServicePointTypesQuery({ is_active: true }, { enabled: workspace.canManageServicePoints });
  const servicePointsQuery = useServicePointsQuery({ facility_id: facilityId }, { enabled: workspace.canManageServicePoints });
  const createServicePoint = useCreateServicePointMutation();
  const deactivateServicePoint = useDeactivateServicePointMutation();

  if (workspace.isLoading || facilityQuery.isLoading) return <LoadingState title="Loading service points" description="Preparing service point workspace." />;
  if (!workspace.canManageServicePoints) return <ErrorState title="Service point permission required" description="You need facilities_service_point.manage." />;

  return (
    <PageContainer>
      <ResponsivePageShell header={<><FacilityPageTabs activeTab="service-points" facilityId={facilityId} /><PageHeader title="Service points" description={facilityQuery.data?.name ?? "Facility service points"} /></>} actions={<ResponsiveActionBar><Button onClick={() => setShowCreate(true)}>Add service point</Button></ResponsiveActionBar>}>
        <FormSheet open={showCreate} title="Create service point" description="Service point type and optional department are sent to the backend service point endpoint." onOpenChange={setShowCreate}>
          <ServicePointForm departments={departmentsQuery.data ?? []} servicePointTypes={typesQuery.data ?? []} isSubmitting={createServicePoint.isPending} onSubmit={async (payload) => {
            await createServicePoint.mutateAsync({ ...payload, facility_id: facilityId });
            setShowCreate(false);
          }} />
        </FormSheet>
        <ConfirmDialog
          open={Boolean(deactivateTarget)}
          title={`Deactivate ${deactivateTarget?.name ?? "service point"}?`}
          description="This marks the service point inactive without deleting it."
          confirmLabel="Deactivate service point"
          isSubmitting={deactivateServicePoint.isPending}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={async () => {
            if (!deactivateTarget) return;
            await deactivateServicePoint.mutateAsync(deactivateTarget.id);
            setDeactivateTarget(null);
          }}
        />
        {servicePointsQuery.error ? <ErrorState title="Unable to load service points" description={servicePointsQuery.error.message} /> : null}
        {servicePointsQuery.isLoading ? <LoadingState title="Loading service points" description="Fetching service points." /> : (
          <FacilityResourceTable<ServicePointRecord>
            records={servicePointsQuery.data ?? []}
            emptyMessage="No service points yet."
            canDeactivate
            onDeactivate={setDeactivateTarget}
            columns={[
              { header: "Service point", render: (record) => <><strong>{record.name}</strong><div className="text-xs text-muted-foreground">{record.code}</div></> },
              { header: "Type", render: (record) => record.service_point_type_name },
              { header: "Department", render: (record) => formatOptional(record.department_name) },
              { header: "Location", render: (record) => formatOptional(record.location_description ?? record.floor) },
              { header: "Order", render: (record) => record.display_order },
            ]}
          />
        )}
      </ResponsivePageShell>
    </PageContainer>
  );
}
