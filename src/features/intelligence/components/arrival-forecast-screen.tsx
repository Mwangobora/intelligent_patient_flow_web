"use client";

import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
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
import { useFacilitiesLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";
import { useFacilitySpecialtiesLookupQuery, useServicePointsLookupQuery } from "@/features/queue/hooks/use-queue-queries";

import { useArrivalForecastQuery, useIntelligenceWorkspace } from "../hooks/use-intelligence-queries";
import type { ArrivalForecastParams, ArrivalForecastRow } from "../types/intelligence.types";
import { ArrivalForecastChart } from "./arrival-forecast-chart";
import { formatOptional } from "./intelligence-formatters";
import { getFriendlyIntelligenceError } from "./intelligence-friendly-error";
import { IntelligencePageTabs } from "./intelligence-page-tabs";
import { IntelligenceTable } from "./intelligence-table";

const today = format(new Date(), "yyyy-MM-dd");
const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function ArrivalForecastScreen() {
  const workspace = useIntelligenceWorkspace();
  const [filters, setFilters] = useState<ArrivalForecastParams>({
    facility_id: workspace.activeMembership?.facility ?? "",
    date_from: today,
    date_to: today,
  });
  const organizationId = workspace.activeMembership?.organization;
  const dateError = filters.date_to < filters.date_from ? "End date cannot be before start date." : undefined;
  const enabled = workspace.canViewForecast && Boolean(filters.facility_id) && !dateError;
  const forecastQuery = useArrivalForecastQuery(filters, { enabled });
  const facilitiesQuery = useFacilitiesLookupQuery({ organization_id: organizationId, is_active: true }, { enabled: Boolean(organizationId) });
  const servicePointsQuery = useServicePointsLookupQuery({ facility_id: filters.facility_id, is_active: true }, { enabled: Boolean(filters.facility_id) });
  const specialtiesQuery = useFacilitySpecialtiesLookupQuery({ facility_id: filters.facility_id, is_active: true }, { enabled: Boolean(filters.facility_id) });

  if (workspace.isLoading) return <LoadingState title="Loading arrival forecast" description="Checking forecast permission." />;
  if (!workspace.canViewForecast) return <ErrorState title="Forecast access required" description="You do not have permission to view arrival forecasts." />;

  const rows = forecastQuery.data ?? [];

  return (
    <PageContainer className="space-y-6">
      <IntelligencePageTabs activeTab="forecast" />
      <PageHeader title="Arrival Forecast" description="Statistical grouped forecast from historical arrivals. This does not create forecast rows." />
      <ResponsiveActionBar>
        <Button variant="secondary" disabled={!enabled} onClick={() => void forecastQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
      </ResponsiveActionBar>
      <ResponsiveFilterPanel title="Forecast filters" description="Facility and date range are required by the backend forecast endpoint.">
        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField label="Facility" required value={filters.facility_id} onChange={(event) => setFilters((current) => ({ ...current, facility_id: event.target.value, service_point_id: "", facility_specialty_id: "" }))} options={[{ label: "Select facility", value: "" }, ...(facilitiesQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))]} />
          <TextInputField label="Date from" required type="date" value={filters.date_from} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))} />
          <TextInputField label="Date to" required type="date" value={filters.date_to} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))} error={dateError} />
          <SelectField label="Service point" value={filters.service_point_id ?? ""} onChange={(event) => setFilters((current) => ({ ...current, service_point_id: event.target.value }))} options={[{ label: "All service points", value: "" }, ...(servicePointsQuery.data ?? []).map((item) => ({ label: `${item.name} (${item.code})`, value: item.id }))]} />
          <SelectField label="Specialty" value={filters.facility_specialty_id ?? ""} onChange={(event) => setFilters((current) => ({ ...current, facility_specialty_id: event.target.value }))} options={[{ label: "All specialties", value: "" }, ...(specialtiesQuery.data ?? []).map((item) => ({ label: item.specialty_name, value: item.id }))]} />
        </div>
      </ResponsiveFilterPanel>
      {!filters.facility_id ? <ErrorState title="Select a facility" description="Arrival forecast requires a facility before the backend can calculate grouped arrival data." /> : null}
      {forecastQuery.isLoading ? <LoadingState title="Loading forecast" description="Fetching grouped arrival forecast rows." /> : null}
      {forecastQuery.error ? <ErrorState title="Unable to load forecast" description={getFriendlyIntelligenceError(forecastQuery.error)} actionLabel="Retry" onAction={() => void forecastQuery.refetch()} /> : null}
      {!forecastQuery.isLoading && !forecastQuery.error && filters.facility_id ? (
        <>
          <ArrivalForecastChart rows={rows} />
          <IntelligenceTable records={rows} columns={forecastColumns} emptyMessage="No arrival forecast data matches these filters." getKey={(row) => `${row.day_of_week}-${row.hour_of_day}`} />
        </>
      ) : null}
    </PageContainer>
  );
}

const forecastColumns = [
  { header: "Day", render: (row: ArrivalForecastRow) => dayNames[row.day_of_week] ?? formatOptional(row.day_of_week) },
  { header: "Hour", render: (row: ArrivalForecastRow) => `${String(row.hour_of_day).padStart(2, "0")}:00` },
  { header: "Total arrivals", render: (row: ArrivalForecastRow) => row.total_arrivals },
  { header: "Average arrivals", render: (row: ArrivalForecastRow) => row.average_arrivals },
];
