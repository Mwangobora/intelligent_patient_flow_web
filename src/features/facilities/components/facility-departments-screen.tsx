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
  const [showCreate, setShowCreate] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<DepartmentRecord | null>(null);
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
        actions={<ResponsiveActionBar><Button onClick={() => setShowCreate(true)}>Add department</Button></ResponsiveActionBar>}
      >
        <FormSheet open={showCreate} title="Create department" description="Parent departments must belong to this same facility." onOpenChange={setShowCreate}>
          <DepartmentForm departments={departmentsQuery.data ?? []} isSubmitting={createDepartment.isPending} onSubmit={async (payload) => {
            await createDepartment.mutateAsync({ ...payload, facility_id: facilityId });
            setShowCreate(false);
          }} />
        </FormSheet>
        <ConfirmDialog
          open={Boolean(deactivateTarget)}
          title={`Deactivate ${deactivateTarget?.name ?? "department"}?`}
          description="This marks the department inactive without deleting it."
          confirmLabel="Deactivate department"
          isSubmitting={deactivateDepartment.isPending}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={async () => {
            if (!deactivateTarget) return;
            await deactivateDepartment.mutateAsync(deactivateTarget.id);
            setDeactivateTarget(null);
          }}
        />
        {departmentsQuery.error ? <ErrorState title="Unable to load departments" description={departmentsQuery.error.message} /> : null}
        {departmentsQuery.isLoading ? <LoadingState title="Loading departments" description="Fetching departments." /> : (
          <FacilityResourceTable<DepartmentRecord>
            records={departmentsQuery.data ?? []}
            emptyMessage="No departments yet. The table is ready for backend data."
            canDeactivate
            onDeactivate={setDeactivateTarget}
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
