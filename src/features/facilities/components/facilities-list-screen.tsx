"use client";

import { Building2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/features/appointments/hooks/use-debounced-value";

import { useCreateFacilityMutation, useDeactivateFacilityMutation } from "../hooks/use-facility-mutations";
import { useFacilitiesQuery, useFacilityTypesQuery, useOrganizationsQuery } from "../hooks/use-facility-queries";
import { useFacilityWorkspace } from "../hooks/use-facility-workspace";
import type { ActiveState, FacilityRecord } from "../types/facility.types";
import { FacilitiesTable } from "./facilities-table";
import { FacilityForm } from "./facility-form";
import { FacilityMobileCard } from "./facility-mobile-card";
import { FacilityPageTabs } from "./facility-page-tabs";

export function FacilitiesListScreen() {
  const workspace = useFacilityWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<FacilityRecord | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [filters, setFilters] = useState({
    organization_id: workspace.activeMembership?.organization ?? "",
    facility_type_id: "",
    active_state: "active" as ActiveState,
  });

  const organizationsQuery = useOrganizationsQuery({ is_active: true }, { enabled: workspace.canViewOrganizations });
  const facilityTypesQuery = useFacilityTypesQuery({ is_active: true }, { enabled: workspace.canViewFacilityTypes });
  const facilitiesQuery = useFacilitiesQuery({
    organization_id: filters.organization_id || undefined,
    facility_type_id: filters.facility_type_id || undefined,
    is_active: filters.active_state === "all" ? undefined : filters.active_state === "active",
    search: debouncedSearch || undefined,
  }, { enabled: workspace.canViewFacilities });
  const createFacility = useCreateFacilityMutation();
  const deactivateFacility = useDeactivateFacilityMutation();

  if (workspace.isLoading) return <LoadingState title="Loading facilities" description="Preparing facility management." />;
  if (!workspace.canViewFacilities) return <ErrorState title="Facilities access required" description="You do not have permission to view facilities." />;

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<><FacilityPageTabs activeTab="list" /><PageHeader title="Facilities Management" description="Manage hospitals, departments, specialties, service points, rooms, and operating schedules from real backend APIs." /></>}
        actions={<ResponsiveActionBar>
          {workspace.canCreateFacilities ? <Button onClick={() => setShowCreate((current) => !current)}><Building2 className="mr-2 h-4 w-4" />New facility</Button> : null}
          <Button variant="secondary" onClick={() => void facilitiesQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </ResponsiveActionBar>}
        filters={<ResponsiveFilterPanel title="Facility filters" description="Search and filter using the backend facilities list endpoint.">
          <div className="grid gap-4 lg:grid-cols-4">
            <TextInputField label="Search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Facility name or code" />
            <SelectField label="Organization" value={filters.organization_id} onChange={(event) => setFilters((current) => ({ ...current, organization_id: event.target.value }))} options={[{ label: "All organizations", value: "" }, ...(organizationsQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))]} />
            <SelectField label="Facility type" value={filters.facility_type_id} onChange={(event) => setFilters((current) => ({ ...current, facility_type_id: event.target.value }))} options={[{ label: "All types", value: "" }, ...(facilityTypesQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))]} />
            <SelectField label="Active state" value={filters.active_state} onChange={(event) => setFilters((current) => ({ ...current, active_state: event.target.value as ActiveState }))} options={[{ label: "Active only", value: "active" }, { label: "Inactive only", value: "inactive" }, { label: "All facilities", value: "all" }]} />
          </div>
        </ResponsiveFilterPanel>}
      >
        {!workspace.hasScope ? <ScopeNotice title="No facility scope linked yet" description="A membership helps preselect organization scope, but staff with permission can still filter manually." /> : null}
        <FormSheet
          open={showCreate}
          title="Create facility"
          description="Codes are generated by backend services when left blank."
          onOpenChange={setShowCreate}
        >
            <FacilityForm
              organizations={organizationsQuery.data ?? []}
              facilityTypes={facilityTypesQuery.data ?? []}
              isSubmitting={createFacility.isPending}
              onSubmit={async (payload) => { await createFacility.mutateAsync(payload); setShowCreate(false); }}
            />
        </FormSheet>
        <ConfirmDialog
          open={Boolean(deactivateTarget)}
          title={`Deactivate ${deactivateTarget?.name ?? "facility"}?`}
          description="This marks the facility inactive without deleting its history."
          confirmLabel="Deactivate facility"
          isSubmitting={deactivateFacility.isPending}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={async () => {
            if (!deactivateTarget) return;
            await deactivateFacility.mutateAsync(deactivateTarget.id);
            setDeactivateTarget(null);
          }}
        />
        {facilitiesQuery.isLoading ? <LoadingState title="Loading facilities" description="Fetching facility records." /> : null}
        {facilitiesQuery.error ? <ErrorState title="Unable to load facilities" description={facilitiesQuery.error.message} actionLabel="Retry" onAction={() => void facilitiesQuery.refetch()} /> : null}
        {!facilitiesQuery.isLoading && !facilitiesQuery.error ? (
          <>
            <FacilitiesTable facilities={facilitiesQuery.data ?? []} canDeactivate={workspace.canDeactivateFacilities} onDeactivate={setDeactivateTarget} />
            <div className="space-y-4 md:hidden">
              {(facilitiesQuery.data ?? []).map((facility) => <FacilityMobileCard key={facility.id} facility={facility} canDeactivate={workspace.canDeactivateFacilities} onDeactivate={setDeactivateTarget} />)}
              {!(facilitiesQuery.data ?? []).length ? <EmptyState title="No facilities found" description="Create a facility or adjust filters. The module remains visible even before data exists." /> : null}
            </div>
          </>
        ) : null}
      </ResponsivePageShell>
    </PageContainer>
  );
}
