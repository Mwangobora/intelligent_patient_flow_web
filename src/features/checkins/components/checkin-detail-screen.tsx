"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { Button } from "@/components/ui/button";

import { useVoidCheckinMutation } from "../hooks/use-checkin-mutations";
import { useCheckinDetailQuery } from "../hooks/use-checkin-queries";
import { useCheckinWorkspace } from "../hooks/use-checkin-workspace";
import { CheckinMethodBadge, CheckinModeBadge, CheckinStatusBadge } from "./checkin-status-badge";
import { formatCheckinDateTime, getCheckinPatientSummary } from "./checkin-formatters";
import { ReasonActionDialog } from "./reason-action-dialog";

export function CheckinDetailScreen({ checkinId }: { checkinId: string }) {
  const router = useRouter();
  const workspace = useCheckinWorkspace();
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
  const checkinQuery = useCheckinDetailQuery(checkinId, { enabled: workspace.canViewCheckins });
  const voidMutation = useVoidCheckinMutation();

  if (workspace.isLoading || checkinQuery.isLoading) {
    return <LoadingState title="Loading check-in detail" description="Fetching the selected arrival record." />;
  }
  if (!workspace.canViewCheckins) {
    return <ErrorState title="Check-in access required" description="You do not have permission to view this patient check-in." />;
  }
  if (checkinQuery.error || !checkinQuery.data) {
    return <ErrorState title="Unable to load check-in" description={checkinQuery.error?.message ?? "Check-in not found."} actionLabel="Back to list" onAction={() => router.push("/checkins")} />;
  }

  const checkin = checkinQuery.data;

  return (
    <PageContainer className="space-y-6">
      {isVoidDialogOpen ? (
        <ReasonActionDialog
          title="Void check-in"
          description="Voiding keeps the arrival record for audit but removes it from the active check-in workflow."
          confirmLabel="Void check-in"
          placeholder="Why is this check-in being voided?"
          isSubmitting={voidMutation.isPending}
          onClose={() => setIsVoidDialogOpen(false)}
          onConfirm={async (reason) => {
            await voidMutation.mutateAsync({ checkinId: checkin.id, payload: { void_reason: reason } });
            setIsVoidDialogOpen(false);
            void checkinQuery.refetch();
          }}
        />
      ) : null}
      <PageHeader title={`Check-in ${checkin.appointment_number ?? checkin.patient_number}`} description="Review the patient arrival record, linked appointment or walk-in service, and current eligibility for queue flow." />
      <ResponsiveActionBar>
        <Link href="/checkins"><Button variant="secondary">Back to check-ins</Button></Link>
        {!checkin.voided_at ? <Link href="/queue/service-desk"><Button variant="secondary">Add to queue</Button></Link> : null}
        {workspace.canVoidCheckins && !checkin.voided_at ? (
          <Button variant="danger" onClick={() => setIsVoidDialogOpen(true)}>Void check-in</Button>
        ) : null}
      </ResponsiveActionBar>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Arrival summary" description="Safe patient and arrival metadata only.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-sm text-muted-foreground">Patient</p><p className="font-semibold text-foreground">{getCheckinPatientSummary(checkin)}</p></div>
            <div><p className="text-sm text-muted-foreground">Facility</p><p className="font-semibold text-foreground">{checkin.facility_name}</p></div>
            <div><p className="text-sm text-muted-foreground">Appointment</p><p className="font-semibold text-foreground">{checkin.appointment_number ?? "Walk-in"}</p></div>
            <div><p className="text-sm text-muted-foreground">Service</p><p className="font-semibold text-foreground">{checkin.specialty_name ?? "General"}</p></div>
            <div><p className="text-sm text-muted-foreground">Checked in</p><p className="font-semibold text-foreground">{formatCheckinDateTime(checkin.checked_in_at)}</p></div>
            <div><p className="text-sm text-muted-foreground">Recorded by</p><p className="font-semibold text-foreground">{checkin.checked_in_by_email ?? "System"}</p></div>
          </div>
        </SectionCard>
        <SectionCard title="Workflow status" description="Current operational state for this arrival record.">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <CheckinStatusBadge checkin={checkin} />
              <CheckinMethodBadge method={checkin.checkin_method} />
              <CheckinModeBadge checkin={checkin} />
            </div>
            <div><p className="text-sm text-muted-foreground">Notes</p><p className="mt-1 text-sm text-foreground">{checkin.notes ?? "No arrival notes added."}</p></div>
            {checkin.voided_at ? (
              <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                <p className="font-semibold">Voided at {formatCheckinDateTime(checkin.voided_at)}</p>
                <p className="mt-1">Reason: {checkin.void_reason}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">This check-in is still active and can be used by queue staff.</p>
            )}
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
