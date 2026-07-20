"use client";

import { format } from "date-fns";
import Link from "next/link";
import { QrCode, RefreshCw, TicketPlus, UserCheck } from "lucide-react";
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
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { Button } from "@/components/ui/button";
import { useFacilitiesLookupQuery, useFacilitySpecialtiesQuery, usePatientsLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";
import { useDebouncedValue } from "@/features/appointments/hooks/use-debounced-value";
import { useFacilitiesQuery as useAllFacilitiesQuery } from "@/features/facilities/hooks/use-facility-queries";

import { useVoidCheckinMutation } from "../hooks/use-checkin-mutations";
import { useCheckinsQuery } from "../hooks/use-checkin-queries";
import { useCheckinWorkspace } from "../hooks/use-checkin-workspace";
import { buildDayBoundary, getCheckinMode } from "./checkin-formatters";
import { CheckinMobileCard } from "./checkin-mobile-card";
import { CheckinsTable } from "./checkins-table";
import { ReasonActionDialog } from "./reason-action-dialog";
import type { CheckinMethod, CheckinRecord } from "../types/checkin.types";

const today = format(new Date(), "yyyy-MM-dd");

export function CheckinsListScreen() {
  const workspace = useCheckinWorkspace();
  const [selectedCheckin, setSelectedCheckin] = useState<CheckinRecord | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const debouncedPatientSearch = useDebouncedValue(patientSearch);
  const [filters, setFilters] = useState({
    facility_id: workspace.activeMembership?.facility ?? "",
    facility_specialty_id: "",
    patient_id: "",
    method: "" as CheckinMethod | "",
    mode: "" as "appointment" | "walk_in" | "",
    is_voided: "all" as "all" | "active" | "voided",
    checked_in_from: today,
    checked_in_to: today,
  });

  const hasGlobalAccess = Boolean(workspace.data?.has_global_access || workspace.data?.is_superuser);
  const organizationId = hasGlobalAccess ? undefined : workspace.activeMembership?.organization;
  const scopedFacilityId =
    filters.facility_id || (hasGlobalAccess ? undefined : workspace.activeMembership?.facility) || undefined;
  const facilitiesQuery = useFacilitiesLookupQuery({ organization_id: organizationId, is_active: true }, { enabled: Boolean(organizationId) && !hasGlobalAccess });
  const allFacilitiesQuery = useAllFacilitiesQuery({ is_active: true }, { enabled: hasGlobalAccess });
  const facilityOptions = hasGlobalAccess ? allFacilitiesQuery.data : facilitiesQuery.data;
  const specialtiesQuery = useFacilitySpecialtiesQuery({ facility_id: filters.facility_id || undefined, is_active: true }, { enabled: Boolean(filters.facility_id) });
  const patientsQuery = usePatientsLookupQuery(
    { organization_id: organizationId, registered_facility_id: filters.facility_id || undefined, is_active: true, search: debouncedPatientSearch || undefined },
    { enabled: Boolean(organizationId) },
  );
  const checkinsQuery = useCheckinsQuery(
    {
      facility_id: scopedFacilityId,
      patient_id: filters.patient_id || undefined,
      checked_in_from: buildDayBoundary(filters.checked_in_from),
      checked_in_to: buildDayBoundary(filters.checked_in_to, true),
      is_voided: filters.is_voided === "all" ? undefined : filters.is_voided === "voided",
    },
    { enabled: workspace.canViewCheckins && workspace.hasScope },
  );
  const voidMutation = useVoidCheckinMutation();

  const filteredCheckins = useMemo(() => {
    return (checkinsQuery.data ?? []).filter((checkin) => {
      if (filters.method && checkin.checkin_method !== filters.method) return false;
      if (filters.mode && getCheckinMode(checkin) !== filters.mode) return false;
      if (filters.facility_specialty_id && checkin.facility_specialty !== filters.facility_specialty_id) return false;
      return true;
    });
  }, [checkinsQuery.data, filters.facility_specialty_id, filters.method, filters.mode]);

  if (workspace.isLoading) {
    return <LoadingState title="Loading check-ins" description="Preparing the patient arrival workspace." />;
  }
  if (!workspace.canViewCheckins) {
    return <ErrorState title="Check-in access required" description="You do not have permission to view patient check-ins." />;
  }

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<PageHeader title="Patient Check-ins" description="Track arrivals, verify walk-ins, handle QR token check-in, and move patients into the next queue-ready state." />}
        actions={
          <ResponsiveActionBar>
            <Link href="/checkins/new"><Button><UserCheck className="mr-2 h-4 w-4" />New check-in</Button></Link>
            <Link href="/checkins/qr-scanner"><Button variant="secondary"><QrCode className="mr-2 h-4 w-4" />Consume QR token</Button></Link>
            <Link href="/checkins/tokens"><Button variant="secondary"><TicketPlus className="mr-2 h-4 w-4" />Manage tokens</Button></Link>
            <Button variant="secondary" onClick={() => void Promise.all([checkinsQuery.refetch(), facilitiesQuery.refetch(), allFacilitiesQuery.refetch(), specialtiesQuery.refetch()])}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
          </ResponsiveActionBar>
        }
        filters={
          <ResponsiveFilterPanel title="Check-in filters" description="Filter by date, facility, patient, method, service, and void status.">
            <div className="grid gap-4 lg:grid-cols-3">
              <TextInputField label="Date from" type="date" value={filters.checked_in_from} onChange={(event) => setFilters((current) => ({ ...current, checked_in_from: event.target.value }))} />
              <TextInputField label="Date to" type="date" value={filters.checked_in_to} onChange={(event) => setFilters((current) => ({ ...current, checked_in_to: event.target.value }))} />
              <SelectField label="Voided state" value={filters.is_voided} onChange={(event) => setFilters((current) => ({ ...current, is_voided: event.target.value as "all" | "active" | "voided" }))} options={[{ label: "All check-ins", value: "all" }, { label: "Active only", value: "active" }, { label: "Voided only", value: "voided" }]} />
              <SelectField label="Facility" value={filters.facility_id} onChange={(event) => setFilters((current) => ({ ...current, facility_id: event.target.value, facility_specialty_id: "", patient_id: "" }))} options={[{ label: "All facilities", value: "" }, ...(facilityOptions ?? []).map((facility) => ({ label: facility.name, value: facility.id }))]} />
              <SelectField label="Service" value={filters.facility_specialty_id} onChange={(event) => setFilters((current) => ({ ...current, facility_specialty_id: event.target.value }))} options={[{ label: "All services", value: "" }, ...(specialtiesQuery.data ?? []).map((specialty) => ({ label: specialty.specialty_name, value: specialty.id }))]} />
              <SelectField label="Mode" value={filters.mode} onChange={(event) => setFilters((current) => ({ ...current, mode: event.target.value as "appointment" | "walk_in" | "" }))} options={[{ label: "All modes", value: "" }, { label: "Appointment", value: "appointment" }, { label: "Walk-in", value: "walk_in" }]} />
              <SelectField label="Method" value={filters.method} onChange={(event) => setFilters((current) => ({ ...current, method: event.target.value as CheckinMethod | "" }))} options={[{ label: "All methods", value: "" }, { label: "Reception", value: "reception" }, { label: "Mobile", value: "mobile" }, { label: "QR code", value: "qr_code" }, { label: "Self service", value: "self_service" }]} />
              <TextInputField label="Patient search" placeholder="Search patient by name or number" value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} />
              <SelectField label="Patient match" value={filters.patient_id} onChange={(event) => setFilters((current) => ({ ...current, patient_id: event.target.value }))} options={[{ label: "All patients", value: "" }, ...(patientsQuery.data ?? []).map((patient) => ({ label: `${patient.first_name} ${patient.last_name} (${patient.patient_number})`, value: patient.id }))]} />
            </div>
          </ResponsiveFilterPanel>
        }
      >
        {selectedCheckin ? (
          <ReasonActionDialog
            title="Void check-in"
            description="Voiding keeps the record for audit and removes it from active arrival workflows."
            confirmLabel="Void check-in"
            placeholder="Why is this check-in being voided?"
            isSubmitting={voidMutation.isPending}
            onClose={() => setSelectedCheckin(null)}
            onConfirm={async (reason) => {
              await voidMutation.mutateAsync({ checkinId: selectedCheckin.id, payload: { void_reason: reason } });
              setSelectedCheckin(null);
            }}
          />
        ) : null}
        {!workspace.hasScope ? (
          <ScopeNotice
            title="No facility scope available yet"
            description="The table and filters remain visible, but the signed-in account still needs organization or facility membership before real check-ins can load."
          />
        ) : null}
        {checkinsQuery.isLoading ? <LoadingState title="Loading check-ins" description="Fetching patient arrival records from the backend." /> : null}
        {checkinsQuery.error ? <ErrorState title="Unable to load check-ins" description={checkinsQuery.error.message} actionLabel="Retry" onAction={() => void checkinsQuery.refetch()} /> : null}
        {!checkinsQuery.isLoading && !checkinsQuery.error ? (
          <>
            <CheckinsTable checkins={filteredCheckins} canVoid={workspace.canVoidCheckins} onVoid={setSelectedCheckin} />
            <div className="space-y-4 md:hidden">
              {filteredCheckins.length ? filteredCheckins.map((checkin) => (
                <CheckinMobileCard key={checkin.id} checkin={checkin} canVoid={workspace.canVoidCheckins} onVoid={setSelectedCheckin} />
              )) : <EmptyState title="No check-ins found" description="Try another date range, facility, patient, or method filter." />}
            </div>
            {!filteredCheckins.length ? <div className="hidden md:block"><EmptyState title="No check-ins found" description="Try another date range, facility, patient, or method filter." /></div> : null}
          </>
        ) : null}
      </ResponsivePageShell>
    </PageContainer>
  );
}
