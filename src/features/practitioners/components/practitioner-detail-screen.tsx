"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";

import {
  useCreateDepartmentAssignmentMutation,
  useCreateFacilityAssignmentMutation,
  useCreateSpecialtyAssignmentMutation,
  useDeactivateFacilityAssignmentMutation,
  useSetPrimaryDepartmentAssignmentMutation,
  useSetPrimaryFacilityAssignmentMutation,
  useSetPrimarySpecialtyAssignmentMutation,
  useUpdatePractitionerMutation,
} from "../hooks/use-practitioner-mutations";
import {
  useDepartmentsLookupQuery,
  useFacilitiesLookupQuery,
  useFacilitySpecialtiesLookupQuery,
  usePractitionerDepartmentAssignmentsQuery,
  usePractitionerDetailQuery,
  usePractitionerFacilityAssignmentsQuery,
  usePractitionerSpecialtyAssignmentsQuery,
  usePractitionerTypesQuery,
} from "../hooks/use-practitioner-queries";
import { usePractitionerWorkspace } from "../hooks/use-practitioner-workspace";
import { PractitionerDepartmentAssignmentForm } from "./practitioner-department-assignment-form";
import { PractitionerFacilityAssignmentForm } from "./practitioner-facility-assignment-form";
import { PractitionerForm } from "./practitioner-form";
import { PractitionerPageTabs } from "./practitioner-page-tabs";
import { PractitionerSpecialtyAssignmentForm } from "./practitioner-specialty-assignment-form";
import { formatDateLabel, formatPractitionerName } from "./practitioner-formatters";

type PractitionerDetailScreenProps = {
  practitionerId: string;
};

export function PractitionerDetailScreen({ practitionerId }: PractitionerDetailScreenProps) {
  const workspace = usePractitionerWorkspace();
  const practitionerQuery = usePractitionerDetailQuery(practitionerId, { enabled: workspace.canViewPractitioners });
  const facilityAssignmentsQuery = usePractitionerFacilityAssignmentsQuery({ practitioner_id: practitionerId, is_active: true }, { enabled: workspace.canViewPractitioners });
  const departmentAssignmentsQuery = usePractitionerDepartmentAssignmentsQuery({ practitioner_id: practitionerId, is_active: true }, { enabled: workspace.canViewPractitioners });
  const specialtyAssignmentsQuery = usePractitionerSpecialtyAssignmentsQuery({ practitioner_id: practitionerId, is_active: true }, { enabled: workspace.canViewPractitioners });
  const facilitiesQuery = useFacilitiesLookupQuery({ organization_id: practitionerQuery.data?.organization, is_active: true }, { enabled: Boolean(practitionerQuery.data?.organization) });
  const practitionerTypesQuery = usePractitionerTypesQuery({ is_active: true }, { enabled: workspace.canViewTypes });
  const updateMutation = useUpdatePractitionerMutation();
  const createFacilityAssignmentMutation = useCreateFacilityAssignmentMutation();
  const createDepartmentAssignmentMutation = useCreateDepartmentAssignmentMutation();
  const createSpecialtyAssignmentMutation = useCreateSpecialtyAssignmentMutation();
  const setPrimaryFacilityMutation = useSetPrimaryFacilityAssignmentMutation();
  const setPrimaryDepartmentMutation = useSetPrimaryDepartmentAssignmentMutation();
  const setPrimarySpecialtyMutation = useSetPrimarySpecialtyAssignmentMutation();
  const deactivateFacilityMutation = useDeactivateFacilityAssignmentMutation();
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFacilityAssignment, setShowFacilityAssignment] = useState(false);

  const assignmentFacilityId = useMemo(
    () => facilityAssignmentsQuery.data?.find((assignment) => assignment.id === expandedAssignmentId)?.facility,
    [expandedAssignmentId, facilityAssignmentsQuery.data],
  );
  const departmentsLookup = useDepartmentsLookupQuery({ facility_id: assignmentFacilityId, is_active: true }, { enabled: Boolean(assignmentFacilityId) });
  const facilitySpecialtiesLookup = useFacilitySpecialtiesLookupQuery({ facility_id: assignmentFacilityId, is_active: true }, { enabled: Boolean(assignmentFacilityId) });

  if (workspace.isLoading || practitionerQuery.isLoading) return <LoadingState title="Loading practitioner" description="Fetching doctor profile, assignments, and schedule references." />;
  if (!workspace.canViewPractitioners) return <ErrorState title="Practitioner access required" description="You do not have permission to view practitioner details." />;
  if (practitionerQuery.error) return <ErrorState title="Unable to load practitioner" description={practitionerQuery.error.message} actionLabel="Retry" onAction={() => void practitionerQuery.refetch()} />;
  if (!practitionerQuery.data) return <EmptyState title="Practitioner not found" description="This practitioner record is no longer available." />;

  const practitioner = practitionerQuery.data;

  return (
    <PageContainer className="space-y-6">
      <PractitionerPageTabs activeTab="detail" practitionerId={practitionerId} />
      <PageHeader title={formatPractitionerName(practitioner.first_name, practitioner.middle_name, practitioner.last_name)} description="Review practitioner profile, facility assignments, department coverage, and specialty assignments." />
      <ResponsiveActionBar>
        <Link href="/practitioners"><Button variant="secondary">Back to practitioners</Button></Link>
        <Link href={`/practitioners/${practitionerId}/schedule`}><Button>View schedule</Button></Link>
        {workspace.canUpdatePractitioners ? <Button variant="secondary" onClick={() => setShowEditProfile(true)}>Edit profile</Button> : null}
        {workspace.canManageAssignments ? <Button variant="secondary" onClick={() => setShowFacilityAssignment(true)}>Add facility assignment</Button> : null}
      </ResponsiveActionBar>

      <SectionCard title="Profile summary" description="Safe practitioner information used by staff scheduling workflows.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div><p className="text-sm text-muted-foreground">Practitioner number</p><p className="mt-1 font-medium">{practitioner.practitioner_number}</p></div>
          <div><p className="text-sm text-muted-foreground">Type</p><p className="mt-1 font-medium">{practitioner.practitioner_type_name}</p></div>
          <div><p className="text-sm text-muted-foreground">Email</p><p className="mt-1 font-medium">{practitioner.email ?? "—"}</p></div>
          <div><p className="text-sm text-muted-foreground">Phone</p><p className="mt-1 font-medium">{practitioner.phone_number ?? "—"}</p></div>
        </div>
      </SectionCard>

      {workspace.canUpdatePractitioners ? (
        <FormSheet open={showEditProfile} title="Update profile" description="Keep the practitioner profile current without reloading the page." onOpenChange={setShowEditProfile}>
          <PractitionerForm
            organizationId={practitioner.organization}
            practitionerTypes={practitionerTypesQuery.data ?? []}
            facilities={facilitiesQuery.data ?? []}
            initialValues={practitioner}
            mode="update"
            isSubmitting={updateMutation.isPending}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync({
                id: practitioner.id,
                payload: {
                  practitioner_type_id: values.practitioner_type_id,
                  user_id: values.user_id || null,
                  first_name: values.first_name,
                  middle_name: values.middle_name || null,
                  last_name: values.last_name,
                  preferred_name: values.preferred_name || null,
                  email: values.email || null,
                  phone_number: values.phone_number || null,
                },
              });
              setShowEditProfile(false);
            }}
          />
        </FormSheet>
      ) : null}

      {workspace.canManageAssignments ? (
        <FormSheet open={showFacilityAssignment} title="Add facility assignment" description="Link this practitioner to an active facility before creating department or specialty assignments." onOpenChange={setShowFacilityAssignment}>
          <PractitionerFacilityAssignmentForm
            facilities={facilitiesQuery.data ?? []}
            isSubmitting={createFacilityAssignmentMutation.isPending}
            onSubmit={async (values) => {
              await createFacilityAssignmentMutation.mutateAsync({
                practitionerId,
                payload: {
                  facility_id: values.facility_id,
                  starts_on: values.starts_on,
                  ends_on: values.ends_on || null,
                  is_primary: values.is_primary,
                },
              });
              setShowFacilityAssignment(false);
            }}
          />
        </FormSheet>
      ) : null}

      <SectionCard title="Facility assignments" description="Primary and active facility coverage for this practitioner.">
        <div className="space-y-4">
          {(facilityAssignmentsQuery.data ?? []).map((assignment) => (
            <div key={assignment.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{assignment.facility_name}</p>
                  <p className="text-sm text-muted-foreground">{formatDateLabel(assignment.starts_on)} to {formatDateLabel(assignment.ends_on)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!assignment.is_primary ? <Button variant="secondary" onClick={() => void setPrimaryFacilityMutation.mutateAsync({ id: assignment.id })}>Set primary</Button> : null}
                  <Button variant="secondary" onClick={() => setExpandedAssignmentId(assignment.id)}>Manage assignment</Button>
                  <Button variant="danger" onClick={() => void deactivateFacilityMutation.mutateAsync({ id: assignment.id })}>Deactivate</Button>
                </div>
              </div>
              {expandedAssignmentId === assignment.id ? (
                <FormSheet open={expandedAssignmentId === assignment.id} title="Manage assignment" description={`Add department or specialty assignments for ${assignment.facility_name}.`} onOpenChange={(open) => !open && setExpandedAssignmentId(null)}>
                  <div className="grid gap-6">
                    <section className="rounded-xl border border-border p-4">
                      <h3 className="font-semibold text-foreground">Add department assignment</h3>
                      <p className="mb-4 text-sm text-muted-foreground">Attach a department that belongs to the same facility.</p>
                    <PractitionerDepartmentAssignmentForm
                      departments={departmentsLookup.data ?? []}
                      isSubmitting={createDepartmentAssignmentMutation.isPending}
                      onSubmit={async (values) => {
                        await createDepartmentAssignmentMutation.mutateAsync({
                          assignmentId: assignment.id,
                          payload: {
                            department_id: values.department_id,
                            starts_on: values.starts_on,
                            ends_on: values.ends_on || null,
                            is_primary: values.is_primary,
                          },
                        });
                        setExpandedAssignmentId(null);
                      }}
                    />
                    </section>
                    <section className="rounded-xl border border-border p-4">
                      <h3 className="font-semibold text-foreground">Add specialty assignment</h3>
                      <p className="mb-4 text-sm text-muted-foreground">Attach a facility specialty that belongs to the same facility and department scope.</p>
                    <PractitionerSpecialtyAssignmentForm
                      specialties={facilitySpecialtiesLookup.data ?? []}
                      isSubmitting={createSpecialtyAssignmentMutation.isPending}
                      onSubmit={async (values) => {
                        await createSpecialtyAssignmentMutation.mutateAsync({
                          assignmentId: assignment.id,
                          payload: {
                            facility_specialty_id: values.facility_specialty_id,
                            starts_on: values.starts_on,
                            ends_on: values.ends_on || null,
                            is_primary: values.is_primary,
                          },
                        });
                        setExpandedAssignmentId(null);
                      }}
                    />
                    </section>
                  </div>
                </FormSheet>
              ) : null}
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Department assignments" description="Current department coverage across active facilities.">
          <div className="space-y-3">
            {(departmentAssignmentsQuery.data ?? []).map((assignment) => (
              <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{assignment.department_name}</p>
                  <p className="text-sm text-muted-foreground">{assignment.facility_name} • {formatDateLabel(assignment.starts_on)}</p>
                </div>
                {!assignment.is_primary ? <Button variant="secondary" onClick={() => void setPrimaryDepartmentMutation.mutateAsync({ id: assignment.id })}>Set primary</Button> : <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Primary</span>}
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Specialty assignments" description="Current specialty coverage used for shifts and appointment scheduling.">
          <div className="space-y-3">
            {(specialtyAssignmentsQuery.data ?? []).map((assignment) => (
              <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{assignment.specialty_name}</p>
                  <p className="text-sm text-muted-foreground">{assignment.department_name ?? "No department"} • {formatDateLabel(assignment.starts_on)}</p>
                </div>
                {!assignment.is_primary ? <Button variant="secondary" onClick={() => void setPrimarySpecialtyMutation.mutateAsync({ id: assignment.id })}>Set primary</Button> : <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Primary</span>}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
