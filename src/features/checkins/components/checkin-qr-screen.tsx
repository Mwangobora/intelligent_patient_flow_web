"use client";

import { useRouter } from "next/navigation";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/common/section-card";

import { useConsumeCheckinTokenMutation } from "../hooks/use-checkin-mutations";
import { useCheckinWorkspace } from "../hooks/use-checkin-workspace";
import { TokenConsumePanel } from "./token-consume-panel";
import type { ConsumeTokenFormValues } from "../schemas/checkin.schemas";

export function CheckinQrScreen() {
  const router = useRouter();
  const workspace = useCheckinWorkspace();
  const consumeMutation = useConsumeCheckinTokenMutation();

  if (workspace.isLoading) {
    return <LoadingState title="Preparing QR check-in" description="Verifying token access for the signed-in staff account." />;
  }
  if (!workspace.canConsumeTokens) {
    return <ErrorState title="QR token access required" description="You do not have permission to consume check-in QR tokens." />;
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="QR Check-in" description="Use the real backend consume endpoint to process a secure appointment token and complete patient arrival." />
      <SectionCard title="Consume token" description="Paste or enter the token from a printed QR code or SMS handoff.">
        <TokenConsumePanel
          isSubmitting={consumeMutation.isPending}
          onSubmit={async (values: ConsumeTokenFormValues) => {
            const checkin = await consumeMutation.mutateAsync({
              raw_token: values.raw_token.trim(),
              notes: values.notes?.trim() || null,
            });
            router.push(`/checkins/${checkin.id}`);
          }}
        />
      </SectionCard>
    </PageContainer>
  );
}
