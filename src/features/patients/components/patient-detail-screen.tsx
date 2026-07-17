"use client";

import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { Button } from "@/components/ui/button";
import { useAppointmentsQuery } from "@/features/appointments/hooks/use-appointment-queries";
import { useCheckinsQuery } from "@/features/checkins/hooks/use-checkin-queries";
import { useQueueEntriesQuery } from "@/features/queue/hooks/use-queue-queries";

import {
  useCreatePatientAddressMutation,
  useSetPrimaryPatientAddressMutation,
  useUpdatePatientAddressMutation,
} from "../hooks/use-patient-mutations";
import {
  usePatientAccessGrantsQuery,
  usePatientAddressesQuery,
  usePatientDetailQuery,
  usePatientIdentifiersQuery,
  usePatientRelatedPersonsQuery,
} from "../hooks/use-patient-queries";
import { usePatientWorkspace } from "../hooks/use-patient-workspace";
import { PatientAddressForm } from "./patient-address-form";
import {
  formatPatientDate,
  formatPatientDateTime,
  formatPatientName,
  formatPatientRecordName,
  formatSexCodeLabel,
} from "./patient-formatters";
import { PatientPageTabs } from "./patient-page-tabs";
import { PatientStatusBadge } from "./patient-status-badge";

export function PatientDetailScreen({ patientId }: { patientId: string }) {
  const workspace = usePatientWorkspace();
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const patientQuery = usePatientDetailQuery(patientId, { enabled: workspace.canViewPatients });
  const identifiersQuery = usePatientIdentifiersQuery({ patient_id: patientId, is_active: true }, { enabled: workspace.canViewPatients });
  const addressesQuery = usePatientAddressesQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });
  const relatedPersonsQuery = usePatientRelatedPersonsQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });
  const accessGrantsQuery = usePatientAccessGrantsQuery({ patient_id: patientId, is_active: true }, { enabled: workspace.canManageAccessGrants });
  const appointmentsQuery = useAppointmentsQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });
  const checkinsQuery = useCheckinsQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });
  const queueEntriesQuery = useQueueEntriesQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });
  const createAddressMutation = useCreatePatientAddressMutation(patientId);
  const updateAddressMutation = useUpdatePatientAddressMutation(patientId);
  const setPrimaryAddressMutation = useSetPrimaryPatientAddressMutation(patientId);

  if (workspace.isLoading || patientQuery.isLoading) {
    return <LoadingState title="Loading patient detail" description="Fetching patient profile, contact, and workflow summary." />;
  }
  if (!workspace.canViewPatients) {
    return <ErrorState title="Patients access required" description="You do not have permission to view patient records." />;
  }
  if (patientQuery.error) {
    return <ErrorState title="Unable to load patient" description={patientQuery.error.message} actionLabel="Retry" onAction={() => void patientQuery.refetch()} />;
  }
  if (!patientQuery.data) {
    return <EmptyState title="Patient not found" description="This patient record could not be found." />;
  }

  const patient = patientQuery.data;

  return (
    <PageContainer className="space-y-6">
      <PatientPageTabs activeTab="detail" patientId={patientId} />
      <PageHeader
        title={formatPatientRecordName(patient)}
        description="Review the patient profile, safe contact details, identifiers, related persons, and operational workflow history."
      />
      <ResponsiveActionBar>
        <Link href="/patients"><Button variant="secondary">Back to patients</Button></Link>
        {workspace.canUpdatePatients ? <Link href={`/patients/${patientId}/edit`}><Button>Edit patient</Button></Link> : null}
      </ResponsiveActionBar>

      <SectionCard title="Patient summary" description="Safe demographic and registration fields only.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div><p className="text-sm text-muted-foreground">Patient number</p><p className="mt-1 font-medium">{patient.patient_number}</p></div>
          <div><p className="text-sm text-muted-foreground">Status</p><div className="mt-1"><PatientStatusBadge isActive={patient.is_active} /></div></div>
          <div><p className="text-sm text-muted-foreground">Facility</p><p className="mt-1 font-medium">{patient.registered_facility_name ?? "—"}</p></div>
          <div><p className="text-sm text-muted-foreground">Organization</p><p className="mt-1 font-medium">{patient.organization_name}</p></div>
          <div><p className="text-sm text-muted-foreground">Date of birth</p><p className="mt-1 font-medium">{formatPatientDate(patient.date_of_birth)}</p></div>
          <div><p className="text-sm text-muted-foreground">Sex</p><p className="mt-1 font-medium">{formatSexCodeLabel(patient.sex_code)}</p></div>
          <div><p className="text-sm text-muted-foreground">Created</p><p className="mt-1 font-medium">{formatPatientDateTime(patient.created_at)}</p></div>
          <div><p className="text-sm text-muted-foreground">User link</p><p className="mt-1 font-medium">{patient.user_email ?? "—"}</p></div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Contact information" description="Direct patient contact channels used by staff workflows.">
          <div className="space-y-3 text-sm">
            <div><p className="text-muted-foreground">Email</p><p className="font-medium">{patient.email ?? "—"}</p></div>
            <div><p className="text-muted-foreground">Phone number</p><p className="font-medium">{patient.phone_number ?? "—"}</p></div>
          </div>
        </SectionCard>
        <SectionCard title="Workflow summary" description="Counts from real appointment, check-in, and queue records.">
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="text-sm text-muted-foreground">Appointments</p><p className="mt-1 text-2xl font-semibold">{appointmentsQuery.data?.length ?? 0}</p></div>
            <div><p className="text-sm text-muted-foreground">Check-ins</p><p className="mt-1 text-2xl font-semibold">{checkinsQuery.data?.length ?? 0}</p></div>
            <div><p className="text-sm text-muted-foreground">Queue entries</p><p className="mt-1 text-2xl font-semibold">{queueEntriesQuery.data?.length ?? 0}</p></div>
          </div>
          <div className="mt-4">
            <Link href={`/patients/${patientId}/history`}><Button variant="secondary">View full history</Button></Link>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Identifiers" description="Safe identifier metadata only. Deeper actions are handled on the identifiers page.">
          <div className="space-y-3">
            {(identifiersQuery.data ?? []).slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium text-foreground">{item.identifier_type_name}</p>
                <p className="text-sm text-muted-foreground">Last four: {item.last_four ?? "—"} • {item.is_primary ? "Primary" : "Secondary"}</p>
              </div>
            ))}
            {!identifiersQuery.data?.length ? <EmptyState title="No identifiers" description="This patient does not have any active identifiers yet." /> : null}
          </div>
          <div className="mt-4">
            <Link href={`/patients/${patientId}/identifiers`}><Button variant="secondary">Manage identifiers</Button></Link>
          </div>
        </SectionCard>

        <SectionCard title="Related persons" description="Emergency contacts, guardians, and caregiver records.">
          <div className="space-y-3">
            {(relatedPersonsQuery.data ?? []).slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium text-foreground">
                  {formatPatientName(item.first_name, item.middle_name, item.last_name)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.relationship_type_name} • Priority {item.priority_order}
                </p>
              </div>
            ))}
            {!relatedPersonsQuery.data?.length ? <EmptyState title="No related persons" description="No guardians, next-of-kin, or emergency contacts are linked yet." /> : null}
          </div>
          <div className="mt-4">
            <Link href={`/patients/${patientId}/related-persons`}><Button variant="secondary">Manage related persons</Button></Link>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Addresses" description="Encrypted street lines stay private. Only safe address metadata is shown here.">
        <div className="space-y-4">
          {(addressesQuery.data ?? []).map((address) => (
            <div key={address.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{address.label ?? "Address"}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.region ?? "—"} • {address.district ?? "—"} • {address.postal_code ?? "—"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!address.is_primary ? (
                    <Button variant="secondary" onClick={() => void setPrimaryAddressMutation.mutateAsync(address.id)}>
                      Set primary
                    </Button>
                  ) : null}
                  {workspace.canManageAddresses ? (
                    <Button variant="secondary" onClick={() => setEditingAddressId((current) => current === address.id ? null : address.id)}>
                      {editingAddressId === address.id ? "Hide edit" : "Edit"}
                    </Button>
                  ) : null}
                </div>
              </div>
              {editingAddressId === address.id ? (
                <div className="mt-4">
                  <PatientAddressForm
                    isSubmitting={updateAddressMutation.isPending}
                    submitLabel="Update address"
                    initialValues={{
                      label: address.label ?? "",
                      country_code: address.country_code ?? "",
                      region: address.region ?? "",
                      district: address.district ?? "",
                      ward: address.ward ?? "",
                      postal_code: address.postal_code ?? "",
                      is_primary: address.is_primary,
                    }}
                    onSubmit={async (values) => {
                      await updateAddressMutation.mutateAsync({ id: address.id, payload: values });
                      setEditingAddressId(null);
                    }}
                  />
                </div>
              ) : null}
            </div>
          ))}
          {workspace.canManageAddresses ? (
            <PatientAddressForm
              isSubmitting={createAddressMutation.isPending}
              submitLabel="Add address"
              onSubmit={async (values) => {
                await createAddressMutation.mutateAsync(values);
              }}
            />
          ) : null}
        </div>
      </SectionCard>

      {workspace.canManageAccessGrants ? (
        <SectionCard title="Patient access grants" description="Current digital-access grants for linked related persons.">
          <div className="space-y-3">
            {(accessGrantsQuery.data ?? []).map((grant) => (
              <div key={grant.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium text-foreground">{grant.related_person_name}</p>
                <p className="text-sm text-muted-foreground">{grant.role_name} • {grant.grantee_user_email}</p>
              </div>
            ))}
            {!accessGrantsQuery.data?.length ? (
              <EmptyState title="No access grants" description="This patient does not have any active access grants yet." />
            ) : null}
          </div>
        </SectionCard>
      ) : null}
    </PageContainer>
  );
}
