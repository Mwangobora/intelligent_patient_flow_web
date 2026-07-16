"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, QrCode, RefreshCw } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { Button } from "@/components/ui/button";
import { useFacilitiesLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";

import { useCreateAppointmentCheckinMutation, useCreateWalkinCheckinMutation } from "../hooks/use-checkin-mutations";
import { useCheckinWorkspace } from "../hooks/use-checkin-workspace";
import { AppointmentCheckinForm } from "./appointment-checkin-form";
import { WalkinCheckinForm } from "./walkin-checkin-form";
import type { AppointmentCheckinFormValues, WalkinCheckinFormValues } from "../schemas/checkin.schemas";

export function CheckinFormScreen() {
  const router = useRouter();
  const workspace = useCheckinWorkspace();
  const [mode, setMode] = useState<"appointment" | "walk_in">("appointment");
  const createAppointmentCheckin = useCreateAppointmentCheckinMutation();
  const createWalkinCheckin = useCreateWalkinCheckinMutation();

  const organizationId = workspace.activeMembership?.organization;
  const defaultFacilityId = workspace.activeMembership?.facility ?? "";
  const facilitiesQuery = useFacilitiesLookupQuery(
    { organization_id: organizationId, is_active: true },
    { enabled: Boolean(organizationId) },
  );

  if (workspace.isLoading) {
    return <LoadingState title="Preparing check-in flow" description="Loading facility and patient check-in workspace." />;
  }
  if (!workspace.canCreateCheckins) {
    return <ErrorState title="Check-in access required" description="You do not have permission to create patient check-ins." />;
  }

  const facilities = facilitiesQuery.data ?? [];

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="New Patient Check-in"
        description="Confirm patient arrival for an appointment or register a walk-in using the real backend workflow."
      />
      <ResponsiveActionBar>
        <Button variant={mode === "appointment" ? "primary" : "secondary"} onClick={() => setMode("appointment")}>
          <ClipboardCheck className="mr-2 h-4 w-4" />Appointment check-in
        </Button>
        <Button variant={mode === "walk_in" ? "primary" : "secondary"} onClick={() => setMode("walk_in")}>
          <QrCode className="mr-2 h-4 w-4" />Walk-in check-in
        </Button>
        <Button variant="secondary" onClick={() => void facilitiesQuery.refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </ResponsiveActionBar>
      {!organizationId ? (
        <ScopeNotice
          title="Facility or organization scope is still missing"
          description="The forms stay visible, but a real organization or facility membership is required before patient check-ins can be created."
        />
      ) : null}
      <SectionCard
        title={mode === "appointment" ? "Appointment arrival confirmation" : "Walk-in registration"}
        description={
          mode === "appointment"
            ? "Search the patient, choose the booking, and confirm arrival. The backend will move the appointment to checked-in."
            : "Search the patient, choose a facility and walk-in service, then register their arrival."
        }
      >
        {mode === "appointment" ? (
          <AppointmentCheckinForm
            facilities={facilities}
            defaultFacilityId={defaultFacilityId}
            organizationId={organizationId}
            isSubmitting={createAppointmentCheckin.isPending}
            onSubmit={async (values: AppointmentCheckinFormValues) => {
              const checkin = await createAppointmentCheckin.mutateAsync({
                ...values,
                checked_in_by_id: workspace.data?.id ?? null,
                notes: values.notes?.trim() || null,
              });
              router.push(`/checkins/${checkin.id}`);
            }}
          />
        ) : (
          <WalkinCheckinForm
            facilities={facilities}
            defaultFacilityId={defaultFacilityId}
            organizationId={organizationId}
            isSubmitting={createWalkinCheckin.isPending}
            onSubmit={async (values: WalkinCheckinFormValues) => {
              const checkin = await createWalkinCheckin.mutateAsync({
                ...values,
                checked_in_by_id: workspace.data?.id ?? null,
                notes: values.notes?.trim() || null,
              });
              router.push(`/checkins/${checkin.id}`);
            }}
          />
        )}
      </SectionCard>
    </PageContainer>
  );
}
