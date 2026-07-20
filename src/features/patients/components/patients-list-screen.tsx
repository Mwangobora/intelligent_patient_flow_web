"use client";

import Link from "next/link";
import { RefreshCw, UserPlus } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/features/appointments/hooks/use-debounced-value";
import { useFacilitiesLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";
import { useFacilitiesQuery as useAllFacilitiesQuery } from "@/features/facilities/hooks/use-facility-queries";

import { useDeactivatePatientMutation } from "../hooks/use-patient-mutations";
import { usePatientsQuery } from "../hooks/use-patient-queries";
import { usePatientWorkspace } from "../hooks/use-patient-workspace";
import { PatientMobileCard } from "./patient-mobile-card";
import { PatientPageTabs } from "./patient-page-tabs";
import { PatientsTable } from "./patients-table";
import type { PatientRecord } from "../types/patient.types";

export function PatientsListScreen() {
  const workspace = usePatientWorkspace();
  const [deactivateTarget, setDeactivateTarget] = useState<PatientRecord | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [filters, setFilters] = useState({
    facility_id: workspace.activeMembership?.facility ?? "",
    active_state: "active" as "all" | "active" | "inactive",
  });

  const hasGlobalAccess = Boolean(workspace.data?.has_global_access || workspace.data?.is_superuser);
  const organizationId = hasGlobalAccess ? undefined : workspace.activeMembership?.organization;
  const scopedFacilityId =
    filters.facility_id || (hasGlobalAccess ? undefined : workspace.activeMembership?.facility) || undefined;
  const facilitiesQuery = useFacilitiesLookupQuery(
    { organization_id: organizationId, is_active: true },
    { enabled: Boolean(organizationId) && !hasGlobalAccess },
  );
  const allFacilitiesQuery = useAllFacilitiesQuery(
    { is_active: true },
    { enabled: hasGlobalAccess },
  );
  const facilityOptions = hasGlobalAccess ? allFacilitiesQuery.data : facilitiesQuery.data;
  const patientsQuery = usePatientsQuery(
    {
      organization_id: organizationId,
      registered_facility_id: scopedFacilityId,
      is_active:
        filters.active_state === "all" ? undefined : filters.active_state === "active",
      search: debouncedSearch || undefined,
    },
    {
      enabled: workspace.canViewPatients && workspace.hasScope,
    },
  );
  const deactivateMutation = useDeactivatePatientMutation();

  if (workspace.isLoading) {
    return <LoadingState title="Loading patients" description="Preparing the patient management workspace." />;
  }
  if (!workspace.canViewPatients) {
    return <ErrorState title="Patients access required" description="You do not have permission to view patient records." />;
  }

  return (
    <PageContainer>
      <ResponsivePageShell
        header={
          <>
            <PatientPageTabs activeTab="list" />
            <PageHeader
              title="Patients Management"
              description="Search, review, register, and maintain staff-side patient records for downstream appointment, check-in, queue, and reporting workflows."
            />
          </>
        }
        actions={
          <ResponsiveActionBar>
            {workspace.canCreatePatients ? (
              <Link href="/patients/new">
                <Button><UserPlus className="mr-2 h-4 w-4" />New patient</Button>
              </Link>
            ) : null}
            <Button variant="secondary" onClick={() => void Promise.all([patientsQuery.refetch(), facilitiesQuery.refetch(), allFacilitiesQuery.refetch()])}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
          </ResponsiveActionBar>
        }
        filters={
          <ResponsiveFilterPanel
            title="Patient filters"
            description="Filter by facility, active state, and live backend search. Gender and identifier-type filters are not exposed by the current backend list endpoint."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <TextInputField
                label="Search"
                placeholder="Patient name, phone, email, or patient number"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <SelectField
                label="Active state"
                value={filters.active_state}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    active_state: event.target.value as "all" | "active" | "inactive",
                  }))
                }
                options={[
                  { label: "Active only", value: "active" },
                  { label: "Inactive only", value: "inactive" },
                  { label: "All patients", value: "all" },
                ]}
              />
              <SelectField
                label="Facility"
                value={filters.facility_id}
                onChange={(event) => setFilters((current) => ({ ...current, facility_id: event.target.value }))}
                options={[
                  { label: "All facilities", value: "" },
                  ...(facilityOptions ?? []).map((facility) => ({
                    label: facility.name,
                    value: facility.id,
                  })),
                ]}
              />
            </div>
          </ResponsiveFilterPanel>
        }
      >
        {!workspace.hasScope ? (
          <ScopeNotice
            title="No patient scope linked yet"
            description="A real organization or facility membership is required before patient records can load, but the workspace stays visible and ready."
          />
        ) : null}
        {patientsQuery.isLoading ? <LoadingState title="Loading patients" description="Fetching patient records from the backend." /> : null}
        <ConfirmDialog
          open={Boolean(deactivateTarget)}
          title={`Deactivate ${deactivateTarget?.patient_number ?? "patient"}?`}
          description="This marks the patient inactive without deleting the record."
          confirmLabel="Deactivate patient"
          isSubmitting={deactivateMutation.isPending}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={async () => {
            if (!deactivateTarget) return;
            await deactivateMutation.mutateAsync(deactivateTarget.id);
            setDeactivateTarget(null);
          }}
        />
        {patientsQuery.error ? (
          <ErrorState
            title="Unable to load patients"
            description={patientsQuery.error.message}
            actionLabel="Retry"
            onAction={() => void patientsQuery.refetch()}
          />
        ) : null}
        {!patientsQuery.isLoading && !patientsQuery.error && workspace.hasScope ? (
          <>
            <PatientsTable
              patients={patientsQuery.data ?? []}
              canUpdate={workspace.canUpdatePatients}
              canDeactivate={workspace.canDeactivatePatients}
              onDeactivate={setDeactivateTarget}
            />
            <div className="space-y-4 md:hidden">
              {(patientsQuery.data ?? []).length ? (
                (patientsQuery.data ?? []).map((patient) => (
                  <PatientMobileCard
                    key={patient.id}
                    patient={patient}
                    canUpdate={workspace.canUpdatePatients}
                    canDeactivate={workspace.canDeactivatePatients}
                    onDeactivate={async (target) => {
                      setDeactivateTarget(target);
                    }}
                  />
                ))
              ) : (
                <EmptyState title="No patients found" description="Try changing the facility or active-state filters, or create a new patient record." />
              )}
            </div>
            {!(patientsQuery.data ?? []).length ? (
              <div className="hidden md:block">
                <EmptyState title="No patients found" description="Try another search or create a new patient record." />
              </div>
            ) : null}
          </>
        ) : null}
      </ResponsivePageShell>
    </PageContainer>
  );
}
