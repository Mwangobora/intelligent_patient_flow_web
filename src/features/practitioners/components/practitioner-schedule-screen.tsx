"use client";

import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";

import {
  useCreateAvailabilityMutation,
  useCreateShiftMutation,
  useRequestLeaveMutation,
} from "../hooks/use-practitioner-mutations";
import {
  useConsultationRoomsLookupQuery,
  usePractitionerAvailabilityQuery,
  usePractitionerDepartmentAssignmentsQuery,
  usePractitionerDetailQuery,
  usePractitionerFacilityAssignmentsQuery,
  usePractitionerLeaveRequestsQuery,
  usePractitionerShiftsQuery,
  useServicePointsLookupQuery,
} from "../hooks/use-practitioner-queries";
import { usePractitionerWorkspace } from "../hooks/use-practitioner-workspace";
import { PractitionerAvailabilityForm } from "./practitioner-availability-form";
import { PractitionerLeaveForm } from "./practitioner-leave-form";
import { PractitionerPageTabs } from "./practitioner-page-tabs";
import { PractitionerScheduleCalendar } from "./practitioner-schedule-calendar";
import { PractitionerShiftForm } from "./practitioner-shift-form";
import { formatPractitionerName } from "./practitioner-formatters";

type PractitionerScheduleScreenProps = {
  practitionerId: string;
};

export function PractitionerScheduleScreen({ practitionerId }: PractitionerScheduleScreenProps) {
  const workspace = usePractitionerWorkspace();
  const [sheetMode, setSheetMode] = useState<"availability" | "shift" | "leave" | null>(null);
  const practitionerQuery = usePractitionerDetailQuery(practitionerId, { enabled: workspace.canViewPractitioners });
  const assignmentsQuery = usePractitionerFacilityAssignmentsQuery({ practitioner_id: practitionerId, is_active: true }, { enabled: workspace.canViewPractitioners });
  const availabilityQuery = usePractitionerAvailabilityQuery({ practitioner_id: practitionerId, is_active: true }, { enabled: workspace.canManageAvailability });
  const shiftsQuery = usePractitionerShiftsQuery({ practitioner_id: practitionerId }, { enabled: workspace.canManageShifts, refetchInterval: 30_000 });
  const leaveQuery = usePractitionerLeaveRequestsQuery({ practitioner_id: practitionerId }, { enabled: workspace.canManageLeave });
  const departmentAssignmentsQuery = usePractitionerDepartmentAssignmentsQuery({ practitioner_id: practitionerId, is_active: true }, { enabled: workspace.canManageShifts });
  const facilityId = assignmentsQuery.data?.find((item) => item.is_primary)?.facility ?? assignmentsQuery.data?.[0]?.facility;
  const servicePointsQuery = useServicePointsLookupQuery({ facility_id: facilityId, is_active: true }, { enabled: Boolean(facilityId) });
  const roomsQuery = useConsultationRoomsLookupQuery({ facility_id: facilityId, is_active: true }, { enabled: Boolean(facilityId) });

  const createAvailabilityMutation = useCreateAvailabilityMutation();
  const createShiftMutation = useCreateShiftMutation();
  const requestLeaveMutation = useRequestLeaveMutation();

  if (workspace.isLoading || practitionerQuery.isLoading) return <LoadingState title="Loading schedule" description="Preparing availability, shifts, and leave information." />;
  if (!workspace.canViewPractitioners) return <ErrorState title="Practitioner access required" description="You do not have permission to view this schedule." />;
  if (practitionerQuery.error) return <ErrorState title="Unable to load practitioner schedule" description={practitionerQuery.error.message} actionLabel="Retry" onAction={() => void practitionerQuery.refetch()} />;
  if (!practitionerQuery.data) return <EmptyState title="Practitioner not found" description="This practitioner record is no longer available." />;

  const practitioner = practitionerQuery.data;

  return (
    <PageContainer className="space-y-6">
      <PractitionerPageTabs activeTab="schedule" practitionerId={practitionerId} />
      <PageHeader
        title={`${formatPractitionerName(practitioner.first_name, practitioner.middle_name, practitioner.last_name)} Schedule`}
        description="Manage weekly availability, operational shifts, consultation rooms, and leave requests for this practitioner."
        actions={
          <ResponsiveActionBar>
            {workspace.canManageAvailability ? <Button variant="secondary" onClick={() => setSheetMode("availability")}>Add availability</Button> : null}
            {workspace.canManageShifts ? <Button onClick={() => setSheetMode("shift")}>Create shift</Button> : null}
            {workspace.canManageLeave ? <Button variant="secondary" onClick={() => setSheetMode("leave")}>Request leave</Button> : null}
          </ResponsiveActionBar>
        }
      />
      <PractitionerScheduleCalendar availability={availabilityQuery.data ?? []} shifts={shiftsQuery.data ?? []} leaveRequests={leaveQuery.data ?? []} />
      {workspace.canManageAvailability ? (
        <FormSheet open={sheetMode === "availability"} title="Create weekly availability" description="Add regular weekly availability windows used by scheduling." onOpenChange={(open) => setSheetMode(open ? "availability" : null)}>
          <PractitionerAvailabilityForm
            assignments={assignmentsQuery.data ?? []}
            isSubmitting={createAvailabilityMutation.isPending}
            onSubmit={async (values) => {
              await createAvailabilityMutation.mutateAsync({
                practitioner_facility_assignment_id: values.practitioner_facility_assignment_id,
                day_of_week: Number(values.day_of_week),
                starts_at: values.starts_at,
                ends_at: values.ends_at,
                valid_from: values.valid_from,
                valid_until: values.valid_until || null,
                is_available_for_appointments: values.is_available_for_appointments ?? true,
              });
              setSheetMode(null);
            }}
          />
        </FormSheet>
      ) : null}
      {workspace.canManageShifts ? (
        <FormSheet open={sheetMode === "shift"} title="Create shift" description="Create an operational shift and optionally assign a department, service point, and consultation room." onOpenChange={(open) => setSheetMode(open ? "shift" : null)}>
          <PractitionerShiftForm
            assignments={assignmentsQuery.data ?? []}
            departmentAssignments={departmentAssignmentsQuery.data ?? []}
            servicePoints={servicePointsQuery.data ?? []}
            rooms={roomsQuery.data ?? []}
            isSubmitting={createShiftMutation.isPending}
            onSubmit={async (values) => {
              await createShiftMutation.mutateAsync({
                practitioner_facility_assignment_id: values.practitioner_facility_assignment_id,
                practitioner_department_assignment_id: values.practitioner_department_assignment_id || null,
                service_point_id: values.service_point_id || null,
                consultation_room_id: values.consultation_room_id || null,
                starts_at: new Date(values.starts_at).toISOString(),
                ends_at: new Date(values.ends_at).toISOString(),
                accepts_appointments: values.accepts_appointments ?? true,
                notes: values.notes || null,
              });
              setSheetMode(null);
            }}
          />
        </FormSheet>
      ) : null}
      {workspace.canManageLeave ? (
        <FormSheet open={sheetMode === "leave"} title="Request leave" description="Submit approved or pending leave windows for this practitioner." onOpenChange={(open) => setSheetMode(open ? "leave" : null)}>
          <PractitionerLeaveForm
            assignments={assignmentsQuery.data ?? []}
            isSubmitting={requestLeaveMutation.isPending}
            onSubmit={async (values) => {
              await requestLeaveMutation.mutateAsync({
                practitioner_facility_assignment_id: values.practitioner_facility_assignment_id,
                starts_at: new Date(values.starts_at).toISOString(),
                ends_at: new Date(values.ends_at).toISOString(),
                reason: values.reason || null,
              });
              setSheetMode(null);
            }}
          />
        </FormSheet>
      ) : null}
    </PageContainer>
  );
}
