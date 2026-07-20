"use client";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";

import { useCreateDepartmentMutation, useDeactivateDepartmentMutation } from "../hooks/use-facility-mutations";
import { useDepartmentsQuery, useFacilityQuery } from "../hooks/use-facility-queries";
import { useFacilityWorkspace } from "../hooks/use-facility-workspace";
import type { DepartmentRecord } from "../types/facility.types";
import { DepartmentForm } from "./department-form";
import { FacilityPageTabs } from "./facility-page-tabs";
import { FacilityResourceTable } from "./facility-resource-table";
import { formatOptional } from "./facility-formatters";

export function FacilityDepartmentsScreen({ facilityId }: { facilityId: string }) {
  const workspace = useFacilityWorkspace();
  const facilityQuery = useFacilityQuery(facilityId, { enabled: workspace.canViewFacilities });
  const departmentsQuery = useDepartmentsQuery({ facility_id: facilityId }, { enabled: workspace.canManageDepartments });
  const createDepartment = useCreateDepartmentMutation();
  const deactivateDepartment = useDeactivateDepartmentMutation();

  if (workspace.isLoading || facilityQuery.isLoading) return <LoadingState title="Loading departments" description="Preparing department records." />;
  if (!workspace.canManageDepartments) return <ErrorState title="Department permission required" description="You need facilities_department.manage to maintain departments." />;

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<><FacilityPageTabs activeTab="departments" facilityId={facilityId} /><PageHeader title="Departments" description={facilityQuery.data?.name ?? "Facility departments"} /></>}
      >
        <SectionCard title="Create department" description="Parent departments must belong to this same facility.">
          <DepartmentForm departments={departmentsQuery.data ?? []} isSubmitting={createDepartment.isPending} onSubmit={async (payload) => {
            await createDepartment.mutateAsync({ ...payload, facility_id: facilityId });
          }} />
        </SectionCard>
        {departmentsQuery.error ? <ErrorState title="Unable to load departments" description={departmentsQuery.error.message} /> : null}
        {departmentsQuery.isLoading ? <LoadingState title="Loading departments" description="Fetching departments." /> : (
          <FacilityResourceTable<DepartmentRecord>
            records={departmentsQuery.data ?? []}
            emptyMessage="No departments yet. The table is ready for backend data."
            canDeactivate
            onDeactivate={async (department) => {
              if (!window.confirm(`Deactivate ${department.name}?`)) return;
              await deactivateDepartment.mutateAsync(department.id);
            }}
            columns={[
              { header: "Department", render: (record) => <><strong>{record.name}</strong><div className="text-xs text-muted-foreground">{record.code}</div></> },
              { header: "Parent", render: (record) => formatOptional(record.parent_department_name) },
              { header: "Description", render: (record) => formatOptional(record.description) },
            ]}
          />
        )}
      </ResponsivePageShell>
    </PageContainer>
  );
}
