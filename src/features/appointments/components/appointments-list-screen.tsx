"use client";

import { format } from "date-fns";
import Link from "next/link";
import { CalendarClock, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { permissionCodes } from "@/config/permissions.config";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

import { useCancelAppointmentMutation } from "../hooks/use-appointment-mutations";
import { useAppointmentPatientsSummaryQuery, useAppointmentsQuery, useFacilitiesLookupQuery, useFacilitySpecialtiesQuery, usePractitionersLookupQuery } from "../hooks/use-appointment-queries";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { AppointmentMobileCard } from "./appointment-mobile-card";
import { AppointmentsTable } from "./appointments-table";
import type { AppointmentRecord, AppointmentStatus } from "../types/appointment.types";

const today = format(new Date(), "yyyy-MM-dd");
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

function buildDateTimeRange(date: string, isEnd = false) {
  return new Date(`${date}T${isEnd ? "23:59:59" : "00:00:00"}`).toISOString();
}

export function AppointmentsListScreen() {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUserQuery();
  const activeMembership = currentUser?.memberships?.find((item) => item.is_active) ?? currentUser?.memberships?.[0];
  const [searchText, setSearchText] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const debouncedSearch = useDebouncedValue(searchText);
  const debouncedPatientSearch = useDebouncedValue(patientSearch);
  const [filters, setFilters] = useState({
    status: "" as AppointmentStatus | "",
    facility_id: activeMembership?.facility ?? "",
    facility_specialty_id: "",
    practitioner_id: "",
    patient_id: "",
    starts_from: today,
    ends_to: today,
  });

  const hasPermission =
    currentUser?.is_staff ||
    !currentUser?.permissions ||
    currentUser.permissions.includes(permissionCodes.schedulingAppointmentView);

  const facilitiesQuery = useFacilitiesLookupQuery(
    { organization_id: activeMembership?.organization, is_active: true },
    { enabled: Boolean(activeMembership?.organization) },
  );
  const specialtiesQuery = useFacilitySpecialtiesQuery(
    { facility_id: filters.facility_id || activeMembership?.facility || undefined, is_active: true },
    { enabled: Boolean(filters.facility_id || activeMembership?.facility) },
  );
  const practitionersQuery = usePractitionersLookupQuery(
    {
      organization_id: activeMembership?.organization,
      facility_id: filters.facility_id || activeMembership?.facility || undefined,
      is_active: true,
      search: debouncedSearch || undefined,
    },
    { enabled: Boolean(activeMembership?.organization) },
  );

  const appointmentsQuery = useAppointmentsQuery(
    {
      facility_id: filters.facility_id || activeMembership?.facility || undefined,
      patient_id: filters.patient_id || undefined,
      practitioner_id: filters.practitioner_id || undefined,
      facility_specialty_id: filters.facility_specialty_id || undefined,
      status: filters.status || undefined,
      starts_from: buildDateTimeRange(filters.starts_from),
      ends_to: buildDateTimeRange(filters.ends_to, true),
    },
    { enabled: hasPermission && Boolean(activeMembership?.organization || activeMembership?.facility) },
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

  if (isUserLoading) {
    return <LoadingState title="Loading appointments" description="Preparing the scheduling workspace." />;
  }
  if (!hasPermission) {
    return <ErrorState title="Appointments access required" description="You do not have permission to view appointment scheduling." />;
  }
  if (!activeMembership) {
    return <ErrorState title="No appointment scope available" description="We could not determine a facility or organization scope for this account." />;
  }

  const handleCancel = async (appointment: AppointmentRecord) => {
    const reason = window.prompt("Enter a cancellation reason for this appointment.");
    if (!reason) return;
    if (!window.confirm(`Cancel appointment ${appointment.appointment_number}?`)) return;
    await cancelMutation.mutateAsync({ cancellation_reason: reason });
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
            <Button variant="secondary" onClick={() => void appointmentsQuery.refetch()}>
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
              <SelectField label="Facility" options={[{ label: "All facilities", value: "" }, ...(facilitiesQuery.data ?? []).map((facility) => ({ label: facility.name, value: facility.id }))]} value={filters.facility_id} onChange={(event) => setFilters((current) => ({ ...current, facility_id: event.target.value, facility_specialty_id: "", practitioner_id: "" }))} />
              <SelectField label="Specialty" options={[{ label: "All services", value: "" }, ...(specialtiesQuery.data ?? []).map((specialty) => ({ label: specialty.specialty_name, value: specialty.id }))]} value={filters.facility_specialty_id} onChange={(event) => setFilters((current) => ({ ...current, facility_specialty_id: event.target.value }))} />
              <SelectField label="Practitioner" options={[{ label: "All practitioners", value: "" }, ...(practitionersQuery.data ?? []).map((practitioner) => ({ label: `${practitioner.first_name} ${practitioner.last_name}`, value: practitioner.id }))]} value={filters.practitioner_id} onChange={(event) => setFilters((current) => ({ ...current, practitioner_id: event.target.value }))} />
              <TextInputField label="Practitioner search" placeholder="Search practitioner name" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
              <TextInputField label="Patient search" placeholder="Search patient name locally" value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} />
              <SelectField label="Patient match" options={[{ label: "All patients", value: "" }, ...Object.entries(patientNames).filter(([, name]) => name.toLowerCase().includes(debouncedPatientSearch.toLowerCase())).map(([id, name]) => ({ label: name, value: id }))]} value={filters.patient_id} onChange={(event) => setFilters((current) => ({ ...current, patient_id: event.target.value }))} />
            </div>
          </ResponsiveFilterPanel>
        }
      >
        {appointmentsQuery.isLoading ? <LoadingState title="Loading appointments" description="Fetching appointment records and status information." /> : null}
        {appointmentsQuery.error ? (
          <ErrorState title="Unable to load appointments" description={appointmentsQuery.error.message} actionLabel="Retry" onAction={() => void appointmentsQuery.refetch()} />
        ) : null}
        {!appointmentsQuery.isLoading && !appointmentsQuery.error && !appointmentsQuery.data?.length ? (
          <EmptyState title="No appointments found" description="Try adjusting the filters or create a new appointment." />
        ) : null}
        {appointmentsQuery.data?.length ? (
          <div className="space-y-4">
            <AppointmentsTable appointments={appointmentsQuery.data} patientNames={patientNames} onCancel={handleCancel} />
            <div className="space-y-4 md:hidden">
              {appointmentsQuery.data.map((appointment) => (
                <AppointmentMobileCard key={appointment.id} appointment={appointment} patientName={patientNames[appointment.patient]} onCancel={handleCancel} />
              ))}
            </div>
          </div>
        ) : null}
      </ResponsivePageShell>
    </PageContainer>
  );
}
