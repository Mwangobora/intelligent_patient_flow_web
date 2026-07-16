"use client";

import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { Button } from "@/components/ui/button";
import { useFacilitiesLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";

import { useIssueCheckinTokenMutation, useRevokeCheckinTokenMutation } from "../hooks/use-checkin-mutations";
import { useCheckinTokensQuery } from "../hooks/use-checkin-queries";
import { useCheckinWorkspace } from "../hooks/use-checkin-workspace";
import { formatCheckinDateTime } from "./checkin-formatters";
import { CheckinTokenStateBadge } from "./checkin-status-badge";
import { ReasonActionDialog } from "./reason-action-dialog";
import { TokenIssuePanel } from "./token-issue-panel";
import type { IssueTokenFormValues } from "../schemas/checkin.schemas";
import type { CheckinTokenRecord, IssuedCheckinTokenRecord } from "../types/checkin.types";

function toIsoDateTime(value?: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function CheckinTokensScreen() {
  const workspace = useCheckinWorkspace();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [issuedToken, setIssuedToken] = useState<IssuedCheckinTokenRecord | null>(null);
  const [selectedToken, setSelectedToken] = useState<CheckinTokenRecord | null>(null);
  const organizationId = workspace.activeMembership?.organization;
  const facilitiesQuery = useFacilitiesLookupQuery({ organization_id: organizationId, is_active: true }, { enabled: Boolean(organizationId) });
  const tokensQuery = useCheckinTokensQuery({ appointment_id: selectedAppointmentId || undefined }, { enabled: Boolean(selectedAppointmentId) && workspace.canIssueTokens });
  const issueMutation = useIssueCheckinTokenMutation();
  const revokeMutation = useRevokeCheckinTokenMutation();

  if (workspace.isLoading) {
    return <LoadingState title="Loading token workspace" description="Preparing appointment QR token management." />;
  }
  if (!workspace.canIssueTokens) {
    return <ErrorState title="Token management access required" description="You do not have permission to issue or review check-in tokens." />;
  }

  return (
    <PageContainer className="space-y-6">
      {selectedToken ? (
        <ReasonActionDialog
          title="Revoke QR token"
          description="Revoking a token keeps the audit trail but prevents future check-in use."
          confirmLabel="Revoke token"
          placeholder="Why is this token being revoked?"
          isSubmitting={revokeMutation.isPending}
          onClose={() => setSelectedToken(null)}
          onConfirm={async (reason) => {
            await revokeMutation.mutateAsync({ tokenId: selectedToken.id, payload: { revocation_reason: reason } });
            setSelectedToken(null);
            void tokensQuery.refetch();
          }}
        />
      ) : null}
      <PageHeader title="Check-in Tokens" description="Issue appointment QR tokens, copy the raw token once, and revoke unused tokens safely." />
      <ResponsiveActionBar>
        <Button variant="secondary" onClick={() => void Promise.all([facilitiesQuery.refetch(), tokensQuery.refetch()])}>Refresh</Button>
      </ResponsiveActionBar>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <SectionCard title="Issue token" description="Select the patient appointment, then issue a new secure token.">
          <TokenIssuePanel
            facilities={facilitiesQuery.data ?? []}
            organizationId={organizationId}
            defaultFacilityId={workspace.activeMembership?.facility ?? ""}
            issuedToken={issuedToken}
            isSubmitting={issueMutation.isPending}
            onSubmit={async (values: IssueTokenFormValues) => {
              setSelectedAppointmentId(values.appointment_id);
              const token = await issueMutation.mutateAsync({
                appointment_id: values.appointment_id,
                expires_at: toIsoDateTime(values.expires_at),
              });
              setIssuedToken(token);
              void tokensQuery.refetch();
            }}
          />
        </SectionCard>
        <SectionCard title="Issued token history" description="Safe token metadata only. Raw tokens never reappear after issue.">
          {tokensQuery.isLoading ? <LoadingState title="Loading tokens" description="Fetching tokens for the selected appointment." /> : null}
          {tokensQuery.error ? <ErrorState title="Unable to load tokens" description={tokensQuery.error.message} actionLabel="Retry" onAction={() => void tokensQuery.refetch()} /> : null}
          {!tokensQuery.isLoading && !tokensQuery.error && !tokensQuery.data?.length ? (
            <EmptyState title="No token history yet" description="Issue a token for an appointment to see its active, used, or revoked metadata here." />
          ) : null}
          {tokensQuery.data?.length ? (
            <div className="space-y-3">
              {tokensQuery.data.map((token) => (
                <div key={token.id} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{token.appointment_number}</p>
                      <p className="text-sm text-muted-foreground">{token.patient_number} · {token.facility_name}</p>
                    </div>
                    <CheckinTokenStateBadge token={token} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-foreground sm:grid-cols-2">
                    <p>Issued: {formatCheckinDateTime(token.created_at)}</p>
                    <p>Expires: {formatCheckinDateTime(token.expires_at)}</p>
                    <p>Used: {formatCheckinDateTime(token.used_at)}</p>
                    <p>Revoked: {formatCheckinDateTime(token.revoked_at)}</p>
                  </div>
                  {workspace.canRevokeTokens && token.is_active ? (
                    <div className="mt-4">
                      <Button variant="danger" onClick={() => setSelectedToken(token)}>Revoke token</Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </SectionCard>
      </div>
    </PageContainer>
  );
}
