"use client";

import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";

import {
  useCreatePatientIdentifierMutation,
  useDeactivatePatientIdentifierMutation,
  useSetPrimaryPatientIdentifierMutation,
  useVerifyPatientIdentifierMutation,
} from "../hooks/use-patient-mutations";
import {
  usePatientDetailQuery,
  usePatientIdentifiersQuery,
  usePatientIdentifierTypesQuery,
} from "../hooks/use-patient-queries";
import { usePatientWorkspace } from "../hooks/use-patient-workspace";
import { PatientIdentifierForm } from "./patient-identifier-form";
import { formatPatientDate, formatPatientRecordName } from "./patient-formatters";
import { PatientPageTabs } from "./patient-page-tabs";

export function PatientIdentifiersScreen({ patientId }: { patientId: string }) {
  const workspace = usePatientWorkspace();
  const [showAddIdentifier, setShowAddIdentifier] = useState(false);
  const patientQuery = usePatientDetailQuery(patientId, { enabled: workspace.canViewPatients });
  const patient = patientQuery.data;
  const identifierTypesQuery = usePatientIdentifierTypesQuery(
    { organization_id: patient?.organization, include_global: true, is_active: true },
    { enabled: Boolean(patient?.organization) },
  );
  const identifiersQuery = usePatientIdentifiersQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });
  const createMutation = useCreatePatientIdentifierMutation(patientId);
  const verifyMutation = useVerifyPatientIdentifierMutation(patientId);
  const setPrimaryMutation = useSetPrimaryPatientIdentifierMutation(patientId);
  const deactivateMutation = useDeactivatePatientIdentifierMutation(patientId);

  if (workspace.isLoading || patientQuery.isLoading) {
    return <LoadingState title="Loading patient identifiers" description="Fetching identifier metadata and types." />;
  }
  if (!workspace.canViewPatients) {
    return <ErrorState title="Patients access required" description="You do not have permission to review patient identifiers." />;
  }
  if (!patient) {
    return <EmptyState title="Patient not found" description="The patient record for these identifiers could not be found." />;
  }

  return (
    <PageContainer className="space-y-6">
      <PatientPageTabs activeTab="identifiers" patientId={patientId} />
      <PageHeader
        title={`${formatPatientRecordName(patient)} Identifiers`}
        description="The current backend supports adding, verifying, setting primary, and deactivating identifiers. Update-in-place is not exposed by the API yet."
        actions={workspace.canManageIdentifiers ? <Button onClick={() => setShowAddIdentifier(true)}>Add identifier</Button> : null}
      />
      {workspace.canManageIdentifiers ? (
        <FormSheet open={showAddIdentifier} title="Add identifier" description="Create a new patient identifier using the real backend create endpoint." onOpenChange={setShowAddIdentifier}>
          <PatientIdentifierForm
            identifierTypes={identifierTypesQuery.data ?? []}
            isSubmitting={createMutation.isPending}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setShowAddIdentifier(false);
            }}
          />
        </FormSheet>
      ) : null}
      <SectionCard title="Identifier records" description="Safe identifier metadata only. Plain sensitive values are never exposed.">
        <div className="space-y-4">
          {(identifiersQuery.data ?? []).map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{item.identifier_type_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Last four: {item.last_four ?? "—"} • Issued {formatPatientDate(item.issued_on)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!item.verified_at ? <Button variant="secondary" onClick={() => void verifyMutation.mutateAsync(item.id)}>Verify</Button> : null}
                  {!item.is_primary ? <Button variant="secondary" onClick={() => void setPrimaryMutation.mutateAsync(item.id)}>Set primary</Button> : null}
                  {item.is_active ? <Button variant="danger" onClick={() => void deactivateMutation.mutateAsync(item.id)}>Deactivate</Button> : null}
                </div>
              </div>
            </div>
          ))}
          {!identifiersQuery.data?.length ? (
            <EmptyState title="No identifiers yet" description="Add the first identifier to help staff locate and validate the patient record." />
          ) : null}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
