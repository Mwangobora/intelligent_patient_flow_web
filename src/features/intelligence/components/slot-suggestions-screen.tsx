"use client";

import { format } from "date-fns";
import Link from "next/link";
import { CalendarClock, RefreshCw } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { Button } from "@/components/ui/button";
import { useFacilitiesLookupQuery, usePractitionersLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";
import { useFacilitySpecialtiesLookupQuery } from "@/features/queue/hooks/use-queue-queries";

import { useIntelligenceWorkspace, useSlotSuggestionsQuery } from "../hooks/use-intelligence-queries";
import type { SlotSuggestionParams, SlotSuggestionRow } from "../types/intelligence.types";
import { formatIntelligenceDate, formatMinutes } from "./intelligence-formatters";
import { getFriendlyIntelligenceError } from "./intelligence-friendly-error";
import { IntelligencePageTabs } from "./intelligence-page-tabs";
import { IntelligenceTable } from "./intelligence-table";

const today = format(new Date(), "yyyy-MM-dd");

export function SlotSuggestionsScreen() {
  const workspace = useIntelligenceWorkspace();
  const [facilityId, setFacilityId] = useState(workspace.activeMembership?.facility ?? "");
  const [filters, setFilters] = useState<SlotSuggestionParams>({ facility_specialty_id: "", date_from: today, date_to: today });
  const organizationId = workspace.activeMembership?.organization;
  const dateError = filters.date_to < filters.date_from ? "End date cannot be before start date." : undefined;
  const enabled = workspace.canViewSlotSuggestions && Boolean(filters.facility_specialty_id) && !dateError;
  const suggestionsQuery = useSlotSuggestionsQuery(filters, { enabled });
  const facilitiesQuery = useFacilitiesLookupQuery({ organization_id: organizationId, is_active: true }, { enabled: Boolean(organizationId) });
  const specialtiesQuery = useFacilitySpecialtiesLookupQuery({ facility_id: facilityId, is_active: true }, { enabled: Boolean(facilityId) });
  const practitionersQuery = usePractitionersLookupQuery({ organization_id: organizationId, facility_id: facilityId, is_active: true }, { enabled: Boolean(organizationId && facilityId) });

  if (workspace.isLoading) return <LoadingState title="Loading slot suggestions" description="Checking slot suggestion permission." />;
  if (!workspace.canViewSlotSuggestions) return <ErrorState title="Slot suggestion access required" description="You do not have permission to view optimal slot suggestions." />;

  const rows = suggestionsQuery.data ?? [];

  return (
    <PageContainer className="space-y-6">
      <IntelligencePageTabs activeTab="slots" />
      <PageHeader title="Optimal Slot Suggestions" description="Rank available online-bookable appointment slots without booking or changing slot capacity." />
      <ResponsiveActionBar>
        <Link href="/appointments/new"><Button><CalendarClock className="mr-2 h-4 w-4" />Book appointment</Button></Link>
        <Button variant="secondary" disabled={!enabled} onClick={() => void suggestionsQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
      </ResponsiveActionBar>
      <ResponsiveFilterPanel title="Slot suggestion filters" description="Select facility and specialty, then review ranked available slots.">
        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField label="Facility" value={facilityId} onChange={(event) => { setFacilityId(event.target.value); setFilters((current) => ({ ...current, facility_specialty_id: "", practitioner_id: "" })); }} options={[{ label: "Select facility", value: "" }, ...(facilitiesQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))]} />
          <SelectField label="Facility specialty" required value={filters.facility_specialty_id} onChange={(event) => setFilters((current) => ({ ...current, facility_specialty_id: event.target.value }))} options={[{ label: "Select specialty", value: "" }, ...(specialtiesQuery.data ?? []).map((item) => ({ label: item.specialty_name, value: item.id }))]} />
          <SelectField label="Practitioner" value={filters.practitioner_id ?? ""} onChange={(event) => setFilters((current) => ({ ...current, practitioner_id: event.target.value }))} options={[{ label: "Any practitioner", value: "" }, ...(practitionersQuery.data ?? []).map((item) => ({ label: `${item.first_name} ${item.last_name}`, value: item.id }))]} />
          <TextInputField label="Date from" required type="date" value={filters.date_from} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))} />
          <TextInputField label="Date to" required type="date" value={filters.date_to} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))} error={dateError} />
        </div>
      </ResponsiveFilterPanel>
      {!filters.facility_specialty_id ? <ErrorState title="Select a specialty" description="Slot suggestions require a facility specialty before the backend can rank available slots." /> : null}
      {suggestionsQuery.isLoading ? <LoadingState title="Loading slot suggestions" description="Fetching available bookable slots." /> : null}
      {suggestionsQuery.error ? <ErrorState title="Unable to load slot suggestions" description={getFriendlyIntelligenceError(suggestionsQuery.error)} actionLabel="Retry" onAction={() => void suggestionsQuery.refetch()} /> : null}
      {!suggestionsQuery.isLoading && !suggestionsQuery.error && filters.facility_specialty_id ? (
        <IntelligenceTable records={rows} columns={slotColumns} emptyMessage="No available online-bookable future slots match these filters." />
      ) : null}
    </PageContainer>
  );
}

const slotColumns = [
  { header: "Start", render: (row: SlotSuggestionRow) => formatIntelligenceDate(row.starts_at) },
  { header: "End", render: (row: SlotSuggestionRow) => formatIntelligenceDate(row.ends_at) },
  { header: "Capacity", render: (row: SlotSuggestionRow) => `${row.booked_count}/${row.capacity}` },
  { header: "Utilization", render: (row: SlotSuggestionRow) => `${Math.round(row.booking_ratio * 100)}%` },
  { header: "Estimated wait", render: (row: SlotSuggestionRow) => formatMinutes(row.historical_average_wait_minutes) },
  { header: "Slot ID", render: (row: SlotSuggestionRow) => row.appointment_slot_id },
];
