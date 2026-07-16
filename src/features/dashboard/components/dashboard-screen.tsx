"use client";

import { format } from "date-fns";
import { BrainCircuit, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { StatusBadge } from "@/components/common/status-badge";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { permissionCodes } from "@/config/permissions.config";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

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

  const hasPermission =
    currentUser?.is_staff ||
    !currentUser?.permissions ||
    currentUser.permissions.includes(permissionCodes.reportingAnalyticsView);
  const hasScope = Boolean(filters.organization_id || filters.facility_id);
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

  if (!hasPermission) {
    return (
      <ErrorState
        title="Dashboard access required"
        description="Your current account does not include permission to view reporting analytics."
      />
    );
  }

  if (!activeMembership && !hasScope) {
    return (
      <ErrorState
        title="No dashboard scope available"
        description="We could not determine an organization or facility scope for this account."
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

  const scopeLabel = activeMembership?.facility_name
    ? `${activeMembership.facility_name} facility dashboard`
    : `${activeMembership?.organization_name ?? "Current organization"} dashboard`;
  const facilityPlaceholder =
    activeMembership?.facility_name ?? "Facility selector will be wired to facilities APIs next.";
  const isRefreshing = [
    overviewQuery,
    appointmentsQuery,
    queueQuery,
    checkinQuery,
    practitionerQuery,
    intelligenceQuery,
  ].some((query) => query.isFetching);

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Hospital Operations Dashboard"
        description="Monitor appointments, queues, check-ins, practitioners, and predictions in real time."
        actions={
          <>
            <StatusBadge label="Live Dashboard" status="success" />
            <Button variant="secondary" onClick={() => void refreshAll()} disabled={isRefreshing}>
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

      <DashboardOverviewCards
        summary={overviewQuery.data}
        isLoading={overviewQuery.isLoading}
        errorMessage={overviewQuery.error?.message}
        onRetry={() => void overviewQuery.refetch()}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <AppointmentStatusChart
          summary={appointmentsQuery.data}
          isLoading={appointmentsQuery.isLoading}
          errorMessage={appointmentsQuery.error?.message}
          onRetry={() => void appointmentsQuery.refetch()}
        />
        <QueueSummaryPanel
          summary={queueQuery.data}
          isLoading={queueQuery.isLoading}
          errorMessage={queueQuery.error?.message}
          onRetry={() => void queueQuery.refetch()}
        />
        <CheckinTrendChart
          summary={checkinQuery.data}
          isLoading={checkinQuery.isLoading}
          errorMessage={checkinQuery.error?.message}
          onRetry={() => void checkinQuery.refetch()}
        />
        <PractitionerWorkloadPanel
          summary={practitionerQuery.data}
          isLoading={practitionerQuery.isLoading}
          errorMessage={practitionerQuery.error?.message}
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
          summary={intelligenceQuery.data}
          isLoading={intelligenceQuery.isLoading}
          errorMessage={intelligenceQuery.error?.message}
          onRetry={() => void intelligenceQuery.refetch()}
        />
      </section>
    </PageContainer>
  );
}
