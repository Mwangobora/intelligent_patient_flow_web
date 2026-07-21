"use client";

import Link from "next/link";
import { CalendarClock, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import { useFacilitiesQuery as useAllFacilitiesQuery } from "@/features/facilities/hooks/use-facility-queries";
import { hasPermission } from "@/types/permissions";

import { useCancelAppointmentMutation } from "../hooks/use-appointment-mutations";
import { useAppointmentPatientsSummaryQuery, useAppointmentsQuery, useFacilitiesLookupQuery, useFacilitySpecialtiesQuery, usePractitionersLookupQuery } from "../hooks/use-appointment-queries";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { AppointmentCancelDialog } from "./appointment-cancel-dialog";
import { AppointmentMobileCard } from "./appointment-mobile-card";
import { AppointmentsTable } from "./appointments-table";
import type { AppointmentRecord, AppointmentStatus } from "../types/appointment.types";

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Checked in", value: "checked_in" },
  { label: "Queued", value: "queued" },
  { label: "In service", value: "in_service" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No show", value: "no_show" },
  { label: "Rescheduled", value: "rescheduled" },
];

function getLocalDateTime(date: string, isEnd = false) {
  return date ? new Date(`${date}T${isEnd ? "23:59:59" : "00:00:00"}`).getTime() : null;
}

export function AppointmentsListScreen() {
  const searchParams = useSearchParams();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUserQuery();
  const activeMembership = currentUser?.memberships?.find((item) => item.is_active) ?? currentUser?.memberships?.[0];
  const initialSearch = searchParams.get("search") ?? "";
  const [searchText, setSearchText] = useState(initialSearch);
  const [patientSearch, setPatientSearch] = useState(initialSearch);
  const [cancelTarget, setCancelTarget] = useState<AppointmentRecord | null>(null);
  const debouncedSearch = useDebouncedValue(searchText);
  const debouncedPatientSearch = useDebouncedValue(patientSearch);
  const [filters, setFilters] = useState({
    status: "" as AppointmentStatus | "",
    facility_id: activeMembership?.facility ?? "",
    facility_specialty_id: "",
    practitioner_id: "",
    patient_id: "",
    starts_from: "",
    ends_to: "",
  });

  const canViewAppointments = hasPermission(currentUser, "scheduling_appointment.view");
  const hasGlobalAccess = Boolean(currentUser?.has_global_access || currentUser?.is_superuser);
  const hasScope = Boolean(hasGlobalAccess || activeMembership?.organization || activeMembership?.facility);
  const organizationId = hasGlobalAccess ? undefined : activeMembership?.organization;
  const scopedFacilityId = filters.facility_id || (hasGlobalAccess ? undefined : activeMembership?.facility) || undefined;

  const facilitiesQuery = useFacilitiesLookupQuery(
    { organization_id: organizationId, is_active: true },
    { enabled: Boolean(organizationId) && !hasGlobalAccess },
  );
  const allFacilitiesQuery = useAllFacilitiesQuery(
    { is_active: true },
    { enabled: hasGlobalAccess },
  );
  const facilityOptions = hasGlobalAccess ? allFacilitiesQuery.data : facilitiesQuery.data;
  const specialtiesQuery = useFacilitySpecialtiesQuery(
    { facility_id: scopedFacilityId, is_active: true },
    { enabled: Boolean(scopedFacilityId) },
  );
  const practitionersQuery = usePractitionersLookupQuery(
    {
      organization_id: organizationId,
      facility_id: scopedFacilityId,
      is_active: true,
      search: debouncedSearch || undefined,
    },
    { enabled: hasScope },
  );

  const appointmentsQuery = useAppointmentsQuery(
    {
      facility_id: scopedFacilityId,
    },
    { enabled: canViewAppointments && hasScope },
  );

  const patientSummaryQueries = useAppointmentPatientsSummaryQuery(
    (appointmentsQuery.data ?? []).map((appointment) => appointment.patient),
  );
  const cancelMutation = useCancelAppointmentMutation();

  const patientNames = useMemo(
    () =>
      Object.fromEntries(
        patientSummaryQueries
          .map((query) => query.data)
          .filter(Boolean)
          .map((patient) => [
            patient!.id,
            [patient!.first_name, patient!.middle_name, patient!.last_name].filter(Boolean).join(" "),
          ]),
      ),
    [patientSummaryQueries],
  );
  const filteredAppointments = useMemo(() => {
    const searchValue = debouncedSearch.trim().toLowerCase();
    const patientSearchValue = debouncedPatientSearch.trim().toLowerCase();
    const startsFrom = getLocalDateTime(filters.starts_from);
    const endsTo = getLocalDateTime(filters.ends_to, true);
    const selectedPractitioner = filters.practitioner_id
      ? practitionersQuery.data?.find((practitioner) => practitioner.id === filters.practitioner_id)
      : undefined;

    return (appointmentsQuery.data ?? []).filter((appointment) => {
      const patientName = patientNames[appointment.patient] ?? "";
      const scheduledStart = new Date(appointment.scheduled_start).getTime();
      const matchesFacility = !filters.facility_id || appointment.facility === filters.facility_id;
      const matchesSpecialty = !filters.facility_specialty_id || appointment.facility_specialty === filters.facility_specialty_id;
      const matchesPractitioner =
        !filters.practitioner_id ||
        appointment.practitioner_facility_assignment === filters.practitioner_id ||
        appointment.practitioner_number === selectedPractitioner?.practitioner_number;
      const matchesPatient = !filters.patient_id || appointment.patient === filters.patient_id;
      const matchesStatus = !filters.status || appointment.status === filters.status;
      const matchesDateFrom = startsFrom === null || scheduledStart >= startsFrom;
      const matchesDateTo = endsTo === null || scheduledStart <= endsTo;
      const searchable = [
        appointment.appointment_number,
        appointment.facility_name,
        appointment.specialty_name,
        appointment.practitioner_number,
        appointment.status,
        patientName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !searchValue || searchable.includes(searchValue);
      const matchesPatientSearch = !patientSearchValue || patientName.toLowerCase().includes(patientSearchValue);

      return (
        matchesFacility &&
        matchesSpecialty &&
        matchesPractitioner &&
        matchesPatient &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesSearch &&
        matchesPatientSearch
      );
    });
  }, [
    appointmentsQuery.data,
    debouncedPatientSearch,
    debouncedSearch,
    filters.ends_to,
    filters.facility_id,
    filters.facility_specialty_id,
    filters.patient_id,
    filters.practitioner_id,
    filters.starts_from,
    filters.status,
    patientNames,
    practitionersQuery.data,
  ]);

  if (isUserLoading) {
    return <LoadingState title="Loading appointments" description="Preparing the scheduling workspace." />;
  }
  if (!canViewAppointments) {
    return <ErrorState title="Appointments access required" description="You do not have permission to view appointment scheduling." />;
  }

  const handleCancel = async (appointment: AppointmentRecord) => {
    setCancelTarget(appointment);
  };

  return (
    <PageContainer>
      <ResponsivePageShell
        header={
          <PageHeader
            title="Appointment Scheduling"
            description="Manage bookings, reschedules, cancellations, and appointment status from one staff workspace."
          />
        }
        actions={
          <ResponsiveActionBar>
            <Link href="/appointments/new"><Button><CalendarClock className="mr-2 h-4 w-4" />New appointment</Button></Link>
            <Button variant="secondary" onClick={() => void Promise.all([appointmentsQuery.refetch(), facilitiesQuery.refetch(), allFacilitiesQuery.refetch()])} disabled={!hasScope}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
          </ResponsiveActionBar>
        }
        filters={
          <ResponsiveFilterPanel title="Appointment filters" description="Refine by date, status, facility, specialty, practitioner, or patient.">
            <div className="grid gap-4 lg:grid-cols-3">
              <TextInputField label="Date from" type="date" value={filters.starts_from} onChange={(event) => setFilters((current) => ({ ...current, starts_from: event.target.value }))} />
              <TextInputField label="Date to" type="date" value={filters.ends_to} onChange={(event) => setFilters((current) => ({ ...current, ends_to: event.target.value }))} />
              <SelectField label="Status" options={statusOptions} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as AppointmentStatus | "" }))} />
              <SelectField label="Facility" options={[{ label: "All facilities", value: "" }, ...(facilityOptions ?? []).map((facility) => ({ label: facility.name, value: facility.id }))]} value={filters.facility_id} onChange={(event) => setFilters((current) => ({ ...current, facility_id: event.target.value, facility_specialty_id: "", practitioner_id: "" }))} disabled={!hasScope} />
              <SelectField label="Specialty" options={[{ label: "All services", value: "" }, ...(specialtiesQuery.data ?? []).map((specialty) => ({ label: specialty.specialty_name, value: specialty.id }))]} value={filters.facility_specialty_id} onChange={(event) => setFilters((current) => ({ ...current, facility_specialty_id: event.target.value }))} disabled={!hasScope} />
              <SelectField label="Practitioner" options={[{ label: "All practitioners", value: "" }, ...(practitionersQuery.data ?? []).map((practitioner) => ({ label: `${practitioner.first_name} ${practitioner.last_name}`, value: practitioner.id }))]} value={filters.practitioner_id} onChange={(event) => setFilters((current) => ({ ...current, practitioner_id: event.target.value }))} disabled={!hasScope} />
              <TextInputField label="Search appointments" placeholder="Appointment, facility, specialty, practitioner" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
              <TextInputField label="Patient search" placeholder="Search patient name locally" value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} />
              <SelectField label="Patient match" options={[{ label: "All patients", value: "" }, ...Object.entries(patientNames).filter(([, name]) => name.toLowerCase().includes(debouncedPatientSearch.toLowerCase())).map(([id, name]) => ({ label: name, value: id }))]} value={filters.patient_id} onChange={(event) => setFilters((current) => ({ ...current, patient_id: event.target.value }))} disabled={!hasScope} />
            </div>
          </ResponsiveFilterPanel>
        }
      >
        <AppointmentCancelDialog
          open={Boolean(cancelTarget)}
          appointmentNumber={cancelTarget?.appointment_number}
          isSubmitting={cancelMutation.isPending}
          onClose={() => setCancelTarget(null)}
          onConfirm={async (reason) => {
            if (!cancelTarget) return;
            await cancelMutation.mutateAsync({
              appointmentId: cancelTarget.id,
              cancellation_reason: reason,
            });
            setCancelTarget(null);
          }}
        />
        {!hasScope ? (
          <ScopeNotice
            title="No scheduling scope linked yet"
            description="This account is signed in, but it is not linked to an organization or facility membership yet. Filters, tables, and actions stay visible so the scheduling workspace is still ready once scope access is assigned."
          />
        ) : null}
        {appointmentsQuery.isLoading ? <LoadingState title="Loading appointments" description="Fetching appointment records and status information." /> : null}
        {appointmentsQuery.error ? (
          <ErrorState title="Unable to load appointments" description={appointmentsQuery.error.message} actionLabel="Retry" onAction={() => void appointmentsQuery.refetch()} />
        ) : null}
        {!hasScope ? (
          <div className="space-y-4">
            <AppointmentsTable
              appointments={[]}
              patientNames={{}}
              onCancel={handleCancel}
              emptyMessage="No organization or facility scope is attached to this account yet."
            />
            <div className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground md:hidden">
              No organization or facility scope is attached to this account yet.
            </div>
          </div>
        ) : null}
        {hasScope && !appointmentsQuery.isLoading && !appointmentsQuery.error && !filteredAppointments.length ? (
          <EmptyState title="No appointments found" description="Try adjusting the filters or create a new appointment." />
        ) : null}
        {hasScope && !appointmentsQuery.isLoading && !appointmentsQuery.error ? (
          <div className="space-y-4">
            <AppointmentsTable
              appointments={filteredAppointments}
              patientNames={patientNames}
              onCancel={handleCancel}
              emptyMessage="No appointments match the selected filters."
            />
            <div className="space-y-4 md:hidden">
              {filteredAppointments.map((appointment) => (
                <AppointmentMobileCard key={appointment.id} appointment={appointment} patientName={patientNames[appointment.patient]} onCancel={handleCancel} />
              ))}
            </div>
          </div>
        ) : null}
      </ResponsivePageShell>
    </PageContainer>
  );
}
