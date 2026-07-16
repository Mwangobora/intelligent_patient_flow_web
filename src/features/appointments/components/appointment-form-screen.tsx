"use client";

import Link from "next/link";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { SectionCard } from "@/components/common/section-card";
import { ScopeNotice } from "@/components/common/scope-notice";
import { Button } from "@/components/ui/button";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

import { useAppointmentDetailQuery } from "../hooks/use-appointment-queries";
import { AppointmentForm } from "./appointment-form";
import { formatAppointmentDateTime } from "./appointment-formatters";

type AppointmentFormScreenProps = {
  mode: "create" | "reschedule";
  appointmentId?: string;
};

export function AppointmentFormScreen({
  mode,
  appointmentId,
}: AppointmentFormScreenProps) {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUserQuery();
  const activeMembership = currentUser?.memberships?.find((item) => item.is_active) ?? currentUser?.memberships?.[0];
  const appointmentQuery = useAppointmentDetailQuery(appointmentId, { enabled: mode === "reschedule" });

  if (isUserLoading || (mode === "reschedule" && appointmentQuery.isLoading)) {
    return <LoadingState title="Preparing appointment form" description="Loading lookup data and current appointment details." />;
  }
  if (mode === "reschedule" && appointmentQuery.error) {
    return <ErrorState title="Unable to load appointment" description={appointmentQuery.error.message} actionLabel="Retry" onAction={() => void appointmentQuery.refetch()} />;
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={mode === "create" ? "Create Appointment" : "Reschedule Appointment"}
        description={
          mode === "create"
            ? "Search for a patient, choose a service, and select an available slot."
            : "Choose a new slot for the selected appointment."
        }
      />
      <ResponsiveActionBar>
        <Link href={mode === "create" ? "/appointments" : `/appointments/${appointmentId}`}><Button variant="secondary">Back</Button></Link>
      </ResponsiveActionBar>
      {!activeMembership?.organization ? (
        <ScopeNotice
          title="No appointment booking scope linked yet"
          description="This account is signed in, but it is not linked to an organization membership yet. Booking will become available as soon as organization or facility access is assigned."
        />
      ) : null}
      {mode === "reschedule" && appointmentQuery.data ? (
        <SectionCard title="Current booking" description="The original time will be replaced after rescheduling succeeds.">
          <p className="text-sm text-foreground">
            Current schedule: {formatAppointmentDateTime(appointmentQuery.data.scheduled_start)} to{" "}
            {formatAppointmentDateTime(appointmentQuery.data.scheduled_end)}
          </p>
        </SectionCard>
      ) : null}
      {activeMembership?.organization ? (
        <SectionCard title={mode === "create" ? "Booking form" : "New slot selection"} description="Use real backend slot availability before saving.">
          <AppointmentForm mode={mode} organizationId={activeMembership.organization} defaultFacilityId={activeMembership.facility ?? undefined} appointment={appointmentQuery.data} />
        </SectionCard>
      ) : null}
    </PageContainer>
  );
}
