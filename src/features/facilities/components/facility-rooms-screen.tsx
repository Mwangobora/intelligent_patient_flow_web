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

import { useCreateConsultationRoomMutation, useDeactivateConsultationRoomMutation } from "../hooks/use-facility-mutations";
import { useConsultationRoomsQuery, useDepartmentsQuery, useFacilityQuery } from "../hooks/use-facility-queries";
import { useFacilityWorkspace } from "../hooks/use-facility-workspace";
import type { ConsultationRoomRecord } from "../types/facility.types";
import { FacilityPageTabs } from "./facility-page-tabs";
import { FacilityResourceTable } from "./facility-resource-table";
import { formatOptional } from "./facility-formatters";
import { ConsultationRoomForm } from "./service-point-forms";

export function FacilityRoomsScreen({ facilityId }: { facilityId: string }) {
  const workspace = useFacilityWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<ConsultationRoomRecord | null>(null);
  const facilityQuery = useFacilityQuery(facilityId, { enabled: workspace.canViewFacilities });
  const departmentsQuery = useDepartmentsQuery({ facility_id: facilityId, is_active: true }, { enabled: workspace.canManageRooms });
  const roomsQuery = useConsultationRoomsQuery({ facility_id: facilityId }, { enabled: workspace.canManageRooms });
  const createRoom = useCreateConsultationRoomMutation();
  const deactivateRoom = useDeactivateConsultationRoomMutation();

  if (workspace.isLoading || facilityQuery.isLoading) return <LoadingState title="Loading rooms" description="Preparing consultation rooms." />;
  if (!workspace.canManageRooms) return <ErrorState title="Room permission required" description="You need facilities_room.manage." />;

  return (
    <PageContainer>
      <ResponsivePageShell header={<><FacilityPageTabs activeTab="rooms" facilityId={facilityId} /><PageHeader title="Consultation rooms" description={facilityQuery.data?.name ?? "Facility rooms"} /></>} actions={<ResponsiveActionBar><Button onClick={() => setShowCreate(true)}>Add room</Button></ResponsiveActionBar>}>
        <FormSheet open={showCreate} title="Create room" description="Capacity must be greater than zero and department must belong to this facility." onOpenChange={setShowCreate}>
          <ConsultationRoomForm departments={departmentsQuery.data ?? []} isSubmitting={createRoom.isPending} onSubmit={async (payload) => {
            await createRoom.mutateAsync({ ...payload, facility_id: facilityId });
            setShowCreate(false);
          }} />
        </FormSheet>
        <ConfirmDialog
          open={Boolean(deactivateTarget)}
          title={`Deactivate ${deactivateTarget?.name ?? "room"}?`}
          description="This marks the room inactive without deleting it."
          confirmLabel="Deactivate room"
          isSubmitting={deactivateRoom.isPending}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={async () => {
            if (!deactivateTarget) return;
            await deactivateRoom.mutateAsync(deactivateTarget.id);
            setDeactivateTarget(null);
          }}
        />
        {roomsQuery.error ? <ErrorState title="Unable to load rooms" description={roomsQuery.error.message} /> : null}
        {roomsQuery.isLoading ? <LoadingState title="Loading rooms" description="Fetching rooms." /> : (
          <FacilityResourceTable<ConsultationRoomRecord>
            records={roomsQuery.data ?? []}
            emptyMessage="No consultation rooms yet."
            canDeactivate
            onDeactivate={setDeactivateTarget}
            columns={[
              { header: "Room", render: (record) => <><strong>{record.name}</strong><div className="text-xs text-muted-foreground">{record.code}</div></> },
              { header: "Department", render: (record) => formatOptional(record.department_name) },
              { header: "Capacity", render: (record) => record.capacity },
              { header: "Location", render: (record) => formatOptional(record.location_description ?? record.floor) },
            ]}
          />
        )}
      </ResponsivePageShell>
    </PageContainer>
  );
}
