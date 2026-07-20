"use client";

import { useMemo, useState } from "react";
import { Building2, CalendarDays, RefreshCw, Stethoscope, UserRoundCheck } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { MetricCard } from "@/components/common/metric-card";
import { ScopeNotice } from "@/components/common/scope-notice";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { FormSheet } from "@/components/overlays/form-sheet";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { Button } from "@/components/ui/button";

import { useCreatePractitionerMutation, useCreatePractitionerTypeMutation, useDeactivatePractitionerMutation } from "../hooks/use-practitioner-mutations";
import {
  useDepartmentsLookupQuery,
  useFacilitiesLookupQuery,
  useFacilitySpecialtiesLookupQuery,
  usePractitionerDepartmentAssignmentsQuery,
  usePractitionerFacilityAssignmentsQuery,
  usePractitionersQuery,
  usePractitionerSpecialtyAssignmentsQuery,
  usePractitionerTypesQuery,
} from "../hooks/use-practitioner-queries";
import { usePractitionerWorkspace } from "../hooks/use-practitioner-workspace";
import { PractitionerConfirmDialog } from "./practitioner-confirm-dialog";
import { PractitionerForm } from "./practitioner-form";
import { PractitionerMobileCard } from "./practitioner-mobile-card";
import { PractitionerPageTabs } from "./practitioner-page-tabs";
import { PractitionerTypeForm } from "./practitioner-type-form";
import { PractitionersTable } from "./practitioners-table";
import type { PractitionerRecord } from "../types/practitioner.types";

export function PractitionersListScreen() {
  const workspace = usePractitionerWorkspace();
  const organizationId = workspace.activeMembership?.organization;
  const [search, setSearch] = useState("");
  const [sheetMode, setSheetMode] = useState<"practitioner" | "type" | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<PractitionerRecord | null>(null);
  const [filters, setFilters] = useState({
    facility_id: workspace.activeMembership?.facility ?? "",
    practitioner_type_id: "",
    department_id: "",
    facility_specialty_id: "",
    is_active: "true",
  });

  const typesQuery = usePractitionerTypesQuery({ is_active: true }, { enabled: workspace.canViewTypes });
  const facilitiesQuery = useFacilitiesLookupQuery({ organization_id: organizationId, is_active: true }, { enabled: Boolean(organizationId) });
  const departmentsQuery = useDepartmentsLookupQuery({ facility_id: filters.facility_id || undefined, is_active: true }, { enabled: Boolean(filters.facility_id) });
  const facilitySpecialtiesQuery = useFacilitySpecialtiesLookupQuery({ facility_id: filters.facility_id || undefined, is_active: true }, { enabled: Boolean(filters.facility_id) });
  const practitionersQuery = usePractitionersQuery(
    {
      organization_id: organizationId,
      facility_id: filters.facility_id || undefined,
      practitioner_type_id: filters.practitioner_type_id || undefined,
      is_active: filters.is_active === "" ? undefined : filters.is_active === "true",
      search: search || undefined,
    },
    { enabled: workspace.canViewPractitioners && Boolean(organizationId) },
  );
  const facilityAssignmentsQuery = usePractitionerFacilityAssignmentsQuery(
    {
      organization_id: organizationId,
      facility_id: filters.facility_id || undefined,
      is_active: true,
    },
    { enabled: workspace.canViewPractitioners && Boolean(organizationId) },
  );
  const departmentAssignmentsQuery = usePractitionerDepartmentAssignmentsQuery(
    {
      organization_id: organizationId,
      facility_id: filters.facility_id || undefined,
      department_id: filters.department_id || undefined,
      is_active: true,
    },
    { enabled: workspace.canViewPractitioners && Boolean(organizationId) },
  );
  const specialtyAssignmentsQuery = usePractitionerSpecialtyAssignmentsQuery(
    {
      organization_id: organizationId,
      facility_id: filters.facility_id || undefined,
      facility_specialty_id: filters.facility_specialty_id || undefined,
      is_active: true,
    },
    { enabled: workspace.canViewPractitioners && Boolean(organizationId) },
  );

  const createPractitionerMutation = useCreatePractitionerMutation();
  const createTypeMutation = useCreatePractitionerTypeMutation();
  const deactivateMutation = useDeactivatePractitionerMutation();

  const filteredPractitioners = useMemo(() => {
    const practitioners = practitionersQuery.data ?? [];
    const facilityAssignments = facilityAssignmentsQuery.data ?? [];
    const assignmentPractitionerMap = new Map(facilityAssignments.map((item) => [item.id, item.practitioner]));
    const departmentPractitionerIds = new Set(
      (departmentAssignmentsQuery.data ?? [])
        .map((assignment) => assignmentPractitionerMap.get(assignment.practitioner_facility_assignment))
        .filter(Boolean),
    );
    const specialtyPractitionerIds = new Set(
      (specialtyAssignmentsQuery.data ?? [])
        .map((assignment) => assignmentPractitionerMap.get(assignment.practitioner_facility_assignment))
        .filter(Boolean),
    );

    return practitioners.filter((practitioner) => {
      if (filters.department_id && !departmentPractitionerIds.has(practitioner.id)) return false;
      if (filters.facility_specialty_id && !specialtyPractitionerIds.has(practitioner.id)) return false;
      return true;
    });
  }, [departmentAssignmentsQuery.data, facilityAssignmentsQuery.data, filters.department_id, filters.facility_specialty_id, practitionersQuery.data, specialtyAssignmentsQuery.data]);

  const overview = {
    practitioners: filteredPractitioners.length,
    active: filteredPractitioners.filter((item) => item.is_active).length,
    facilities: new Set((facilityAssignmentsQuery.data ?? []).map((item) => item.facility)).size,
    departments: new Set((departmentAssignmentsQuery.data ?? []).map((item) => item.department)).size,
  };

  if (workspace.isLoading) return <LoadingState title="Loading practitioners" description="Preparing the doctor schedule management workspace." />;
  if (!workspace.canViewPractitioners) return <ErrorState title="Practitioner access required" description="You do not have permission to view practitioner management." />;

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<PageHeader title="Doctor Schedule Management" description="Manage practitioners, assignments, availability, shifts, and leave from one staff workspace." />}
        actions={
          <ResponsiveActionBar>
            <Button variant="secondary" onClick={() => void Promise.all([practitionersQuery.refetch(), facilityAssignmentsQuery.refetch(), departmentAssignmentsQuery.refetch(), specialtyAssignmentsQuery.refetch()])} disabled={!organizationId}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
            {workspace.canCreatePractitioners && organizationId ? <Button onClick={() => setSheetMode("practitioner")}>Create practitioner</Button> : null}
            {workspace.canManageTypes ? <Button variant="secondary" onClick={() => setSheetMode("type")}>Create type</Button> : null}
          </ResponsiveActionBar>
        }
        filters={
          <ResponsiveFilterPanel title="Practitioner filters" description="Search and filter by type, facility, department, specialty, or active state.">
            <div className="grid gap-4 lg:grid-cols-3">
              <TextInputField label="Search" placeholder="Search practitioner name or number" value={search} onChange={(event) => setSearch(event.target.value)} />
              <SelectField label="Practitioner type" value={filters.practitioner_type_id} onChange={(event) => setFilters((current) => ({ ...current, practitioner_type_id: event.target.value }))} options={[{ label: "All types", value: "" }, ...(typesQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))]} />
              <SelectField label="Facility" value={filters.facility_id} onChange={(event) => setFilters((current) => ({ ...current, facility_id: event.target.value, department_id: "", facility_specialty_id: "" }))} options={[{ label: "All facilities", value: "" }, ...(facilitiesQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))]} />
              <SelectField label="Department" value={filters.department_id} onChange={(event) => setFilters((current) => ({ ...current, department_id: event.target.value }))} options={[{ label: "All departments", value: "" }, ...(departmentsQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))]} disabled={!filters.facility_id} />
              <SelectField label="Specialty" value={filters.facility_specialty_id} onChange={(event) => setFilters((current) => ({ ...current, facility_specialty_id: event.target.value }))} options={[{ label: "All specialties", value: "" }, ...(facilitySpecialtiesQuery.data ?? []).map((item) => ({ label: item.specialty_name, value: item.id }))]} />
              <SelectField label="Status" value={filters.is_active} onChange={(event) => setFilters((current) => ({ ...current, is_active: event.target.value }))} options={[{ label: "All", value: "" }, { label: "Active", value: "true" }, { label: "Inactive", value: "false" }]} />
            </div>
          </ResponsiveFilterPanel>
        }
      >
        <PractitionerConfirmDialog
          open={Boolean(deactivateTarget)}
          title={`Deactivate ${deactivateTarget?.first_name ?? "this practitioner"}?`}
          description="This keeps the practitioner history but marks the profile inactive."
          confirmLabel="Deactivate practitioner"
          isSubmitting={deactivateMutation.isPending}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={async () => {
            if (!deactivateTarget) return;
            await deactivateMutation.mutateAsync({ id: deactivateTarget.id });
            setDeactivateTarget(null);
          }}
        />
        <PractitionerPageTabs activeTab="list" />
        {!organizationId ? <ScopeNotice title="Organization scope required" description="Practitioner management is organization-based. Link this account to an organization membership to start managing doctor schedules." /> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Practitioners" value={String(overview.practitioners)} description="Profiles in the current scope." icon={Stethoscope} />
          <MetricCard title="Active practitioners" value={String(overview.active)} description="Ready for assignments and scheduling." icon={UserRoundCheck} />
          <MetricCard title="Assigned facilities" value={String(overview.facilities)} description="Facilities currently linked to doctors." icon={Building2} />
          <MetricCard title="Assigned departments" value={String(overview.departments)} description="Departments covered by current assignments." icon={CalendarDays} />
        </div>
        {workspace.canCreatePractitioners && organizationId ? (
          <FormSheet open={sheetMode === "practitioner"} title="Create practitioner" description="Register a practitioner profile before adding assignments, availability, and shifts." onOpenChange={(open) => setSheetMode(open ? "practitioner" : null)}>
            <PractitionerForm
              organizationId={organizationId}
              practitionerTypes={typesQuery.data ?? []}
              facilities={facilitiesQuery.data ?? []}
              isSubmitting={createPractitionerMutation.isPending}
              onSubmit={async (values) => {
                await createPractitionerMutation.mutateAsync({
                  organization_id: organizationId,
                  practitioner_type_id: values.practitioner_type_id,
                  user_id: values.user_id || null,
                  first_name: values.first_name,
                  middle_name: values.middle_name || null,
                  last_name: values.last_name,
                  preferred_name: values.preferred_name || null,
                  email: values.email || null,
                  phone_number: values.phone_number || null,
                });
                setSheetMode(null);
              }}
            />
          </FormSheet>
        ) : null}
        {workspace.canManageTypes ? (
          <FormSheet open={sheetMode === "type"} title="Create practitioner type" description="Create doctor categories that staff can use when onboarding new practitioners." onOpenChange={(open) => setSheetMode(open ? "type" : null)}>
            <PractitionerTypeForm
              isSubmitting={createTypeMutation.isPending}
              onSubmit={async (values) => {
                await createTypeMutation.mutateAsync({
                  name: values.name,
                  code: values.code || null,
                  description: values.description || null,
                  requires_license: values.requires_license,
                });
                setSheetMode(null);
              }}
            />
          </FormSheet>
        ) : null}
        {practitionersQuery.isLoading ? <LoadingState title="Loading practitioners" description="Fetching doctor profiles and assignment coverage." /> : null}
        {practitionersQuery.error ? <ErrorState title="Unable to load practitioners" description={practitionersQuery.error.message} actionLabel="Retry" onAction={() => void practitionersQuery.refetch()} /> : null}
        {!practitionersQuery.isLoading && !practitionersQuery.error && !filteredPractitioners.length ? <EmptyState title="No practitioners found" description="Try adjusting the filters or create a new practitioner profile." /> : null}
        {filteredPractitioners.length ? (
          <>
            <PractitionersTable practitioners={filteredPractitioners} onDeactivate={setDeactivateTarget} />
            <div className="space-y-4 md:hidden">
              {filteredPractitioners.map((practitioner) => <PractitionerMobileCard key={practitioner.id} practitioner={practitioner} onDeactivate={setDeactivateTarget} />)}
            </div>
          </>
        ) : null}
      </ResponsivePageShell>
    </PageContainer>
  );
}
