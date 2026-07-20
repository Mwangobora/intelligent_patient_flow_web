"use client";

import { format } from "date-fns";
import { BrainCircuit, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { StatusBadge } from "@/components/common/status-badge";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import { hasPermission } from "@/types/permissions";

import { useAppointmentDashboardQuery, useCheckinDashboardQuery, useDashboardOverviewQuery, useIntelligenceDashboardQuery, usePractitionerDashboardQuery, useQueueDashboardQuery } from "../hooks/use-dashboard-queries";
import type { DashboardQueryParams } from "../types/dashboard.types";
import { AppointmentStatusChart } from "./appointment-status-chart";
import { CheckinTrendChart } from "./checkin-trend-chart";
import { DashboardFilterBar } from "./dashboard-filter-bar";
import { DashboardOverviewCards } from "./dashboard-overview-cards";
import { IntelligenceSummaryPanel } from "./intelligence-summary-panel";
import { PractitionerWorkloadPanel } from "./practitioner-workload-panel";
import { QueueSummaryPanel } from "./queue-summary-panel";

const today = format(new Date(), "yyyy-MM-dd");
const emptyOverviewSummary = {
  total_patients: 0,
  total_appointments_today: 0,
  total_checkins_today: 0,
  total_waiting_now: 0,
  total_called_now: 0,
  total_in_service_now: 0,
  completed_visits_today: 0,
  cancelled_appointments_today: 0,
  no_show_appointments_today: 0,
  average_wait_minutes_today: null,
  active_queues: 0,
  generated_at: new Date().toISOString(),
};

const emptyAppointmentSummary = {
  appointments_total: 0,
  pending: 0,
  confirmed: 0,
  checked_in: 0,
  queued: 0,
  in_service: 0,
  completed: 0,
  cancelled: 0,
  no_show: 0,
  rescheduled: 0,
  appointments_by_status: [],
  appointments_by_specialty: [],
  appointments_by_hour: [],
  appointment_utilization_percentage: null,
  generated_at: new Date().toISOString(),
};

const emptyQueueSummary = {
  active_queues: 0,
  waiting_patients: 0,
  called_patients: 0,
  in_service_patients: 0,
  skipped_patients: 0,
  completed_today: 0,
  cancelled_today: 0,
  transferred_today: 0,
  average_wait_minutes: null,
  longest_wait_minutes: null,
  queues_by_service_point: [],
  next_entries_summary: [],
  generated_at: new Date().toISOString(),
};

const emptyCheckinSummary = {
  total_checkins: 0,
  appointment_checkins: 0,
  walkin_checkins: 0,
  qr_checkins: 0,
  reception_checkins: 0,
  mobile_checkins: 0,
  self_service_checkins: 0,
  voided_checkins: 0,
  checkins_by_hour: [],
  checkins_by_method: [],
  generated_at: new Date().toISOString(),
};

const emptyPractitionerSummary = {
  active_practitioners_today: 0,
  practitioners_on_shift_now: 0,
  scheduled_shifts: 0,
  completed_shifts: 0,
  cancelled_shifts: 0,
  total_scheduled_hours: 0,
  completed_appointments_by_practitioner: [],
  average_service_time_by_practitioner: [],
  workload_summary: [],
  generated_at: new Date().toISOString(),
};

const emptyIntelligenceSummary = {
  predictions_generated: 0,
  rule_based_predictions: 0,
  machine_learning_predictions: 0,
  average_predicted_wait_minutes: null,
  average_actual_wait_minutes: null,
  average_prediction_error_minutes: null,
  latest_predictions_summary: [],
  generated_at: new Date().toISOString(),
};

export function DashboardScreen() {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUserQuery();
  const [dateFilters, setDateFilters] = useState<Pick<DashboardQueryParams, "date_from" | "date_to">>({
    date_from: today,
    date_to: today,
  });

  const activeMembership = useMemo(
    () => currentUser?.memberships?.find((membership) => membership.is_active) ?? currentUser?.memberships?.[0],
    [currentUser?.memberships],
  );

  const filters = useMemo<DashboardQueryParams>(
    () => ({
      organization_id: activeMembership?.organization,
      facility_id: activeMembership?.facility ?? undefined,
      date_from: dateFilters.date_from,
      date_to: dateFilters.date_to,
    }),
    [activeMembership, dateFilters.date_from, dateFilters.date_to],
  );

  const canViewDashboard = hasPermission(currentUser, "reporting_analytics.view");
  const hasScope = Boolean(currentUser?.has_global_access || currentUser?.is_superuser || filters.organization_id || filters.facility_id);
  const dateError =
    filters.date_from && filters.date_to && filters.date_to < filters.date_from
      ? "Date to must be on or after date from."
      : undefined;
  const queryOptions = { enabled: hasScope && !dateError };

  const overviewQuery = useDashboardOverviewQuery(filters, queryOptions);
  const appointmentsQuery = useAppointmentDashboardQuery(filters, queryOptions);
  const queueQuery = useQueueDashboardQuery(filters, queryOptions);
  const checkinQuery = useCheckinDashboardQuery(filters, queryOptions);
  const practitionerQuery = usePractitionerDashboardQuery(filters, queryOptions);
  const intelligenceQuery = useIntelligenceDashboardQuery(filters, queryOptions);

  if (isUserLoading) {
    return (
      <LoadingState
        title="Loading dashboard"
        description="Please wait while we prepare your hospital operations summary."
      />
    );
  }

  if (!canViewDashboard) {
    return (
      <ErrorState
        title="Dashboard access required"
        description="Your current account does not include permission to view reporting analytics."
      />
    );
  }

  const refreshAll = async () => {
    await Promise.all([
      overviewQuery.refetch(),
      appointmentsQuery.refetch(),
      queueQuery.refetch(),
      checkinQuery.refetch(),
      practitionerQuery.refetch(),
      intelligenceQuery.refetch(),
    ]);
  };

  const scopeLabel = currentUser?.has_global_access || currentUser?.is_superuser
    ? "All organizations dashboard"
    : activeMembership?.facility_name
    ? `${activeMembership.facility_name} facility dashboard`
    : `${activeMembership?.organization_name ?? "Unassigned dashboard scope"}`;
  const facilityPlaceholder =
    activeMembership?.facility_name ?? (currentUser?.has_global_access || currentUser?.is_superuser ? "All facilities" : "Facility selector will be wired to facilities APIs next.");
  const isRefreshing = [
    overviewQuery,
    appointmentsQuery,
    queueQuery,
    checkinQuery,
    practitionerQuery,
    intelligenceQuery,
  ].some((query) => query.isFetching);
  const overviewSummary = hasScope ? overviewQuery.data : emptyOverviewSummary;
  const appointmentSummary = hasScope ? appointmentsQuery.data : emptyAppointmentSummary;
  const queueSummary = hasScope ? queueQuery.data : emptyQueueSummary;
  const checkinSummary = hasScope ? checkinQuery.data : emptyCheckinSummary;
  const practitionerSummary = hasScope ? practitionerQuery.data : emptyPractitionerSummary;
  const intelligenceSummary = hasScope ? intelligenceQuery.data : emptyIntelligenceSummary;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Hospital Operations Dashboard"
        description="Monitor appointments, queues, check-ins, practitioners, and predictions in real time."
        actions={
          <>
            <StatusBadge label="Live Dashboard" status="success" />
            <Button
              variant="secondary"
              onClick={() => void refreshAll()}
              disabled={!hasScope || isRefreshing}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </>
        }
      />

      <DashboardFilterBar
        dateFrom={filters.date_from ?? today}
        dateTo={filters.date_to ?? today}
        scopeLabel={scopeLabel}
        facilityPlaceholder={facilityPlaceholder}
        dateError={dateError}
        onDateFromChange={(date_from) => setDateFilters((current) => ({ ...current, date_from }))}
        onDateToChange={(date_to) => setDateFilters((current) => ({ ...current, date_to }))}
      />

      {!hasScope ? (
        <ScopeNotice
          title="No dashboard scope linked yet"
          description="This account is signed in, but no organization or facility membership is attached yet. The dashboard stays visible with empty cards and panels so the workspace is still ready once scope access is assigned."
        />
      ) : null}

      <DashboardOverviewCards
        summary={overviewSummary}
        isLoading={hasScope ? overviewQuery.isLoading : false}
        errorMessage={hasScope ? overviewQuery.error?.message : undefined}
        onRetry={() => void overviewQuery.refetch()}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <AppointmentStatusChart
          summary={appointmentSummary}
          isLoading={hasScope ? appointmentsQuery.isLoading : false}
          errorMessage={hasScope ? appointmentsQuery.error?.message : undefined}
          onRetry={() => void appointmentsQuery.refetch()}
        />
        <QueueSummaryPanel
          summary={queueSummary}
          isLoading={hasScope ? queueQuery.isLoading : false}
          errorMessage={hasScope ? queueQuery.error?.message : undefined}
          onRetry={() => void queueQuery.refetch()}
        />
        <CheckinTrendChart
          summary={checkinSummary}
          isLoading={hasScope ? checkinQuery.isLoading : false}
          errorMessage={hasScope ? checkinQuery.error?.message : undefined}
          onRetry={() => void checkinQuery.refetch()}
        />
        <PractitionerWorkloadPanel
          summary={practitionerSummary}
          isLoading={hasScope ? practitionerQuery.isLoading : false}
          errorMessage={hasScope ? practitionerQuery.error?.message : undefined}
          onRetry={() => void practitionerQuery.refetch()}
        />
      </section>

      <section className="grid gap-6">
        <PageHeader
          title="Operational Intelligence"
          description="Rule-based waiting-time predictions and recent accuracy signals."
          actions={<BrainCircuit className="h-5 w-5 text-primary" />}
        />
        <IntelligenceSummaryPanel
          summary={intelligenceSummary}
          isLoading={hasScope ? intelligenceQuery.isLoading : false}
          errorMessage={hasScope ? intelligenceQuery.error?.message : undefined}
          onRetry={() => void intelligenceQuery.refetch()}
        />
      </section>
    </PageContainer>
  );
}
