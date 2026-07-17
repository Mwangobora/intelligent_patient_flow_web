"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

import {
  useCreateRelatedPersonContactMutation,
  useCreateRelatedPersonMutation,
  useDeactivateRelatedPersonContactMutation,
  useDeactivateRelatedPersonMutation,
  useSetPrimaryRelatedPersonContactMutation,
  useUpdateRelatedPersonMutation,
  useVerifyRelatedPersonContactMutation,
} from "../hooks/use-patient-mutations";
import {
  usePatientDetailQuery,
  usePatientRelatedPersonsQuery,
  useRelatedPersonContactsQuery,
  useRelationshipTypesQuery,
} from "../hooks/use-patient-queries";
import { usePatientWorkspace } from "../hooks/use-patient-workspace";
import { PatientPageTabs } from "./patient-page-tabs";
import { formatPatientName, formatPatientRecordName } from "./patient-formatters";
import { RelatedPersonContactForm } from "./related-person-contact-form";
import { RelatedPersonForm } from "./related-person-form";

export function PatientRelatedPersonsScreen({ patientId }: { patientId: string }) {
  const workspace = usePatientWorkspace();
  const [editingRelatedPersonId, setEditingRelatedPersonId] = useState<string | null>(null);
  const [expandedContactFormId, setExpandedContactFormId] = useState<string | null>(null);
  const patientQuery = usePatientDetailQuery(patientId, { enabled: workspace.canViewPatients });
  const relatedPersonsQuery = usePatientRelatedPersonsQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });
  const contactsQuery = useRelatedPersonContactsQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });
  const relationshipTypesQuery = useRelationshipTypesQuery({ is_active: true }, { enabled: workspace.canManageRelationshipTypes });
  const createRelatedPersonMutation = useCreateRelatedPersonMutation(patientId);
  const updateRelatedPersonMutation = useUpdateRelatedPersonMutation(patientId);
  const deactivateRelatedPersonMutation = useDeactivateRelatedPersonMutation(patientId);
  const createContactMutation = useCreateRelatedPersonContactMutation(patientId);
  const verifyContactMutation = useVerifyRelatedPersonContactMutation(patientId);
  const setPrimaryContactMutation = useSetPrimaryRelatedPersonContactMutation(patientId);
  const deactivateContactMutation = useDeactivateRelatedPersonContactMutation(patientId);

  const contactsByRelatedPerson = useMemo(() => {
    return (contactsQuery.data ?? []).reduce<Record<string, typeof contactsQuery.data>>((acc, item) => {
      const current = acc[item.related_person] ?? [];
      acc[item.related_person] = [...current, item];
      return acc;
    }, {});
  }, [contactsQuery]);

  if (workspace.isLoading || patientQuery.isLoading) {
    return <LoadingState title="Loading related persons" description="Fetching guardians, emergency contacts, and contact channels." />;
  }
  if (!workspace.canViewPatients) {
    return <ErrorState title="Patients access required" description="You do not have permission to review related person records." />;
  }
  if (!patientQuery.data) {
    return <EmptyState title="Patient not found" description="The related-person workspace could not find this patient." />;
  }

  return (
    <PageContainer className="space-y-6">
      <PatientPageTabs activeTab="related" patientId={patientId} />
      <PageHeader
        title={`${formatPatientRecordName(patientQuery.data)} Related Persons`}
        description="Manage guardians, emergency contacts, and safe contact channels. Related-person contacts support add, verify, set primary, and deactivate actions."
      />
      {workspace.canManageRelatedPersons ? (
        <SectionCard title="Add related person" description="Create a guardian, caregiver, next-of-kin, or emergency contact record.">
          <RelatedPersonForm
            relationshipTypes={relationshipTypesQuery.data ?? []}
            isSubmitting={createRelatedPersonMutation.isPending}
            onSubmit={async (values) => {
              await createRelatedPersonMutation.mutateAsync({
                relationship_type_id: values.relationship_type_id,
                first_name: values.first_name,
                middle_name: values.middle_name || null,
                last_name: values.last_name,
                is_guardian: values.is_guardian,
                is_caregiver: values.is_caregiver,
                is_next_of_kin: values.is_next_of_kin,
                is_emergency_contact: values.is_emergency_contact,
                priority_order: Number(values.priority_order),
              });
            }}
          />
        </SectionCard>
      ) : null}
      <SectionCard title="Related persons" description="Safe summaries only. Sensitive contact values remain encrypted and are never exposed directly.">
        <div className="space-y-4">
          {(relatedPersonsQuery.data ?? []).map((person) => (
            <div key={person.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    {formatPatientName(person.first_name, person.middle_name, person.last_name)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {person.relationship_type_name} • Priority {person.priority_order}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {workspace.canManageRelatedPersons ? (
                    <Button variant="secondary" onClick={() => setEditingRelatedPersonId((current) => current === person.id ? null : person.id)}>
                      {editingRelatedPersonId === person.id ? "Hide edit" : "Edit"}
                    </Button>
                  ) : null}
                  {workspace.canManageRelatedPersons && person.is_active ? (
                    <Button variant="danger" onClick={() => void deactivateRelatedPersonMutation.mutateAsync(person.id)}>
                      Deactivate
                    </Button>
                  ) : null}
                </div>
              </div>

              {editingRelatedPersonId === person.id ? (
                <div className="mt-4">
                  <RelatedPersonForm
                    relationshipTypes={relationshipTypesQuery.data ?? []}
                    initialValues={{
                      relationship_type_id: person.relationship_type,
                      first_name: person.first_name,
                      middle_name: person.middle_name ?? "",
                      last_name: person.last_name,
                      is_guardian: person.is_guardian,
                      is_caregiver: person.is_caregiver,
                      is_next_of_kin: person.is_next_of_kin,
                      is_emergency_contact: person.is_emergency_contact,
                      priority_order: person.priority_order,
                    }}
                    submitLabel="Update related person"
                    isSubmitting={updateRelatedPersonMutation.isPending}
                    onSubmit={async (values) => {
                      await updateRelatedPersonMutation.mutateAsync({
                        id: person.id,
                        payload: {
                          relationship_type_id: values.relationship_type_id,
                          first_name: values.first_name,
                          middle_name: values.middle_name || null,
                          last_name: values.last_name,
                          is_guardian: values.is_guardian,
                          is_caregiver: values.is_caregiver,
                          is_next_of_kin: values.is_next_of_kin,
                          is_emergency_contact: values.is_emergency_contact,
                          priority_order: Number(values.priority_order),
                        },
                      });
                      setEditingRelatedPersonId(null);
                    }}
                  />
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Contacts</p>
                  {workspace.canManageRelatedPersonContacts ? (
                    <Button variant="secondary" onClick={() => setExpandedContactFormId((current) => current === person.id ? null : person.id)}>
                      {expandedContactFormId === person.id ? "Hide contact form" : "Add contact"}
                    </Button>
                  ) : null}
                </div>

                {(contactsByRelatedPerson[person.id] ?? []).map((contact) => (
                  <div key={contact.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{contact.channel.toUpperCase()} • {contact.label ?? "Contact"}</p>
                      <p className="text-sm text-muted-foreground">
                        {contact.value_present ? "Stored securely" : "No value"} • {contact.is_primary ? "Primary" : "Secondary"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!contact.verified_at ? <Button variant="secondary" onClick={() => void verifyContactMutation.mutateAsync(contact.id)}>Verify</Button> : null}
                      {!contact.is_primary ? <Button variant="secondary" onClick={() => void setPrimaryContactMutation.mutateAsync(contact.id)}>Set primary</Button> : null}
                      {contact.is_active ? <Button variant="danger" onClick={() => void deactivateContactMutation.mutateAsync(contact.id)}>Deactivate</Button> : null}
                    </div>
                  </div>
                ))}

                {expandedContactFormId === person.id ? (
                  <RelatedPersonContactForm
                    isSubmitting={createContactMutation.isPending}
                    onSubmit={async (values) => {
                      await createContactMutation.mutateAsync({ relatedPersonId: person.id, payload: values });
                    }}
                  />
                ) : null}
              </div>
            </div>
          ))}
          {!relatedPersonsQuery.data?.length ? (
            <EmptyState title="No related persons yet" description="Add emergency contacts or caregiver records for this patient." />
          ) : null}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
