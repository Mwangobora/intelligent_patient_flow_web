"use client";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";

import { useCreateFacilitySpecialtyMutation, useCreateSpecialtyMutation } from "../hooks/use-facility-mutations";
import { useDepartmentsQuery, useFacilityQuery, useFacilitySpecialtiesQuery, useSpecialtiesQuery } from "../hooks/use-facility-queries";
import { useFacilityWorkspace } from "../hooks/use-facility-workspace";
import type { FacilitySpecialtyRecord, SpecialtyRecord } from "../types/facility.types";
import { FacilityPageTabs } from "./facility-page-tabs";
import { FacilityResourceTable } from "./facility-resource-table";
import { formatOptional } from "./facility-formatters";
import { FacilitySpecialtyForm, SpecialtyForm } from "./specialty-forms";

export function FacilitySpecialtiesScreen({ facilityId }: { facilityId: string }) {
  const workspace = useFacilityWorkspace();
  const facilityQuery = useFacilityQuery(facilityId, { enabled: workspace.canViewFacilities });
  const specialtiesQuery = useSpecialtiesQuery({}, { enabled: workspace.canManageSpecialties });
  const departmentsQuery = useDepartmentsQuery({ facility_id: facilityId, is_active: true }, { enabled: workspace.canManageSpecialties });
  const facilitySpecialtiesQuery = useFacilitySpecialtiesQuery({ facility_id: facilityId }, { enabled: workspace.canManageSpecialties });
  const createSpecialty = useCreateSpecialtyMutation();
  const createFacilitySpecialty = useCreateFacilitySpecialtyMutation();

  if (workspace.isLoading || facilityQuery.isLoading) return <LoadingState title="Loading specialties" description="Preparing specialty records." />;
  if (!workspace.canManageSpecialties) return <ErrorState title="Specialty permission required" description="You need facilities_specialty.manage to maintain specialties." />;

  return (
    <PageContainer>
      <ResponsivePageShell header={<><FacilityPageTabs activeTab="specialties" facilityId={facilityId} /><PageHeader title="Specialties" description={facilityQuery.data?.name ?? "Facility specialties"} /></>}>
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard title="Create global specialty" description="Creates a specialty from the backend /facilities/specialties/ endpoint.">
            <SpecialtyForm specialties={specialtiesQuery.data ?? []} isSubmitting={createSpecialty.isPending} onSubmit={async (payload) => {
              await createSpecialty.mutateAsync(payload);
            }} />
          </SectionCard>
          <SectionCard title="Attach specialty to facility" description="Department must belong to the current facility.">
            <FacilitySpecialtyForm departments={departmentsQuery.data ?? []} specialties={specialtiesQuery.data ?? []} isSubmitting={createFacilitySpecialty.isPending} onSubmit={async (payload) => {
              await createFacilitySpecialty.mutateAsync({ ...payload, facility_id: facilityId });
            }} />
          </SectionCard>
        </div>
        {facilitySpecialtiesQuery.error ? <ErrorState title="Unable to load facility specialties" description={facilitySpecialtiesQuery.error.message} /> : null}
        {facilitySpecialtiesQuery.isLoading ? <LoadingState title="Loading facility specialties" description="Fetching assignments." /> : (
          <FacilityResourceTable<FacilitySpecialtyRecord>
            records={facilitySpecialtiesQuery.data ?? []}
            emptyMessage="No specialties attached yet."
            columns={[
              { header: "Specialty", render: (record) => record.specialty_name },
              { header: "Department", render: (record) => formatOptional(record.department_name) },
              { header: "Duration", render: (record) => `${record.appointment_duration_minutes} min` },
              { header: "Access", render: (record) => `${record.accepts_appointments ? "Appointments" : "No appointments"} · ${record.accepts_walk_ins ? "Walk-ins" : "No walk-ins"}` },
            ]}
          />
        )}
        <SectionCard title="Global specialty catalogue" description="Specialties available for assignment.">
          <FacilityResourceTable<SpecialtyRecord>
            records={specialtiesQuery.data ?? []}
            emptyMessage="No global specialties yet."
            columns={[
              { header: "Specialty", render: (record) => <><strong>{record.name}</strong><div className="text-xs text-muted-foreground">{record.code}</div></> },
              { header: "Parent", render: (record) => formatOptional(record.parent_specialty_name) },
              { header: "Description", render: (record) => formatOptional(record.description) },
            ]}
          />
        </SectionCard>
      </ResponsivePageShell>
    </PageContainer>
  );
}
