"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { useFacilitiesLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";

import { patientsApiService } from "../api/patients-api.service";
import { useCreatePatientMutation, useUpdatePatientMutation } from "../hooks/use-patient-mutations";
import {
  usePatientDetailQuery,
  usePatientIdentifierTypesQuery,
  useRelationshipTypesQuery,
} from "../hooks/use-patient-queries";
import { usePatientWorkspace } from "../hooks/use-patient-workspace";
import { patientCreateSchema, patientUpdateSchema } from "../schemas/patient.schemas";
import type { PatientSexCode } from "../types/patient.types";
import { PatientForm } from "./patient-form";
import { PatientPageTabs } from "./patient-page-tabs";

type PatientCreateValues = z.input<typeof patientCreateSchema>;
type PatientUpdateValues = z.input<typeof patientUpdateSchema>;

type PatientFormScreenProps = {
  mode: "create" | "update";
  patientId?: string;
};

function hasAddressValues(values: PatientCreateValues) {
  return Boolean(values.address_line1 || values.address_line2 || values.address_region || values.address_postal_code);
}

function hasRelatedPersonValues(values: PatientCreateValues) {
  return Boolean(values.related_person_relationship_type_id && values.related_person_first_name && values.related_person_last_name);
}

function normalizeSexCode(value: PatientSexCode | "" | null | undefined): PatientSexCode | null {
  if (!value) {
    return null;
  }
  return value;
}

export function PatientFormScreen({ mode, patientId }: PatientFormScreenProps) {
  const router = useRouter();
  const workspace = usePatientWorkspace();
  const patientQuery = usePatientDetailQuery(patientId, { enabled: mode === "update" && workspace.canViewPatients });
  const organizationId = patientQuery.data?.organization ?? workspace.activeMembership?.organization;
  const facilitiesQuery = useFacilitiesLookupQuery(
    { organization_id: organizationId, is_active: true },
    { enabled: Boolean(organizationId) },
  );
  const identifierTypesQuery = usePatientIdentifierTypesQuery(
    { organization_id: organizationId, include_global: true, is_active: true },
    { enabled: mode === "create" && Boolean(organizationId) },
  );
  const relationshipTypesQuery = useRelationshipTypesQuery(
    { is_active: true },
    { enabled: mode === "create" && workspace.canManageRelationshipTypes },
  );
  const createMutation = useCreatePatientMutation();
  const updateMutation = useUpdatePatientMutation(patientId);
  const scopedOrganizationId = organizationId;

  if (workspace.isLoading || (mode === "update" && patientQuery.isLoading)) {
    return <LoadingState title="Loading patient form" description="Preparing patient data and facility lookups." />;
  }
  if (mode === "create" && !workspace.canCreatePatients) {
    return <ErrorState title="Patient creation access required" description="You do not have permission to create patient records." />;
  }
  if (mode === "create" && !scopedOrganizationId) {
    return <ErrorState title="Organization scope required" description="A valid organization membership is required before a new patient can be created." />;
  }
  if (mode === "update" && !workspace.canUpdatePatients) {
    return <ErrorState title="Patient update access required" description="You do not have permission to update patient records." />;
  }
  if (mode === "update" && !patientQuery.data) {
    return <ErrorState title="Patient not found" description="The patient record you are trying to edit was not found." />;
  }

  const patient = patientQuery.data;

  return (
    <PageContainer className="space-y-6">
      <PatientPageTabs activeTab={mode === "create" ? "new" : "edit"} patientId={patientId} />
      <PageHeader
        title={mode === "create" ? "Register Patient" : "Edit Patient"}
        description={
          mode === "create"
            ? "Create a patient profile for staff workflows. Optional identifier, address, and emergency-contact details can be saved right after the main profile."
            : "Update the core patient profile without overwriting identifier or related-person records."
        }
      />
      {!workspace.hasScope ? (
        <ScopeNotice
          title="No patient scope available"
          description="A valid organization membership is required before a patient record can be created or updated."
        />
      ) : null}
      <SectionCard
        title={mode === "create" ? "Patient registration form" : "Patient update form"}
        description="Core profile fields are saved to the real backend patient service."
      >
        <PatientForm
          mode={mode}
          facilities={facilitiesQuery.data ?? []}
          identifierTypes={identifierTypesQuery.data ?? []}
          relationshipTypes={relationshipTypesQuery.data ?? []}
          initialValues={
            patient
              ? {
                  registered_facility_id: patient.registered_facility ?? "",
                  first_name: patient.first_name,
                  middle_name: patient.middle_name ?? "",
                  last_name: patient.last_name,
                  date_of_birth: patient.date_of_birth ?? "",
                  date_of_birth_is_estimated: patient.date_of_birth_is_estimated,
                  sex_code: patient.sex_code ?? "",
                  email: patient.email ?? "",
                  phone_number: patient.phone_number ?? "+255",
                }
              : undefined
          }
          defaultFacilityId={workspace.activeMembership?.facility ?? ""}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={async (rawValues) => {
            if (mode === "create") {
              const orgId = scopedOrganizationId;
              if (!orgId) {
                toast.error("A valid organization membership is required before a patient can be created.");
                return;
              }
              const values = rawValues as PatientCreateValues;
              const created = await createMutation.mutateAsync({
                organization_id: orgId,
                registered_facility_id: values.registered_facility_id || null,
                first_name: values.first_name,
                middle_name: values.middle_name || null,
                last_name: values.last_name,
                date_of_birth: values.date_of_birth || null,
                date_of_birth_is_estimated: values.date_of_birth_is_estimated,
                sex_code: normalizeSexCode(values.sex_code),
                email: values.email || null,
                phone_number: values.phone_number || null,
              });

              try {
                if (values.identifier_type_id && values.identifier_value) {
                  await patientsApiService.createPatientIdentifier(created.id, {
                    identifier_type_id: values.identifier_type_id,
                    value: values.identifier_value,
                    issuing_authority: values.identifier_issuing_authority || null,
                    is_primary: values.identifier_is_primary,
                  });
                }
                if (hasAddressValues(values)) {
                  await patientsApiService.createPatientAddress(created.id, {
                    label: values.address_label || null,
                    address_line1: values.address_line1 || null,
                    address_line2: values.address_line2 || null,
                    country_code: values.address_country_code || null,
                    region: values.address_region || null,
                    district: values.address_district || null,
                    ward: values.address_ward || null,
                    postal_code: values.address_postal_code || null,
                    is_primary: true,
                  });
                }
                if (hasRelatedPersonValues(values)) {
                  const relatedPerson = await patientsApiService.createPatientRelatedPerson(created.id, {
                    relationship_type_id: values.related_person_relationship_type_id!,
                    first_name: values.related_person_first_name!,
                    middle_name: values.related_person_middle_name || null,
                    last_name: values.related_person_last_name!,
                    is_emergency_contact: values.related_person_is_emergency_contact,
                    priority_order: 1,
                  });
                  if (values.related_person_phone) {
                    await patientsApiService.createRelatedPersonContact(relatedPerson.id, {
                      channel: "phone",
                      value: values.related_person_phone,
                      label: "Primary phone",
                      is_primary: true,
                    });
                  }
                  if (values.related_person_email) {
                    await patientsApiService.createRelatedPersonContact(relatedPerson.id, {
                      channel: "email",
                      value: values.related_person_email,
                      label: "Primary email",
                      is_primary: !values.related_person_phone,
                    });
                  }
                }
              } catch {
                toast.warning("Patient created, but one or more optional records could not be saved. You can finish them from the patient detail pages.");
              }

              router.push(`/patients/${created.id}`);
              return;
            }

            const values = rawValues as PatientUpdateValues;
            const updated = await updateMutation.mutateAsync({
              registered_facility_id: values.registered_facility_id || null,
              first_name: values.first_name,
              middle_name: values.middle_name || null,
              last_name: values.last_name,
              date_of_birth: values.date_of_birth || null,
              date_of_birth_is_estimated: values.date_of_birth_is_estimated,
              sex_code: normalizeSexCode(values.sex_code),
              email: values.email || null,
              phone_number: values.phone_number || null,
            });
            router.push(`/patients/${updated.id}`);
          }}
        />
      </SectionCard>
    </PageContainer>
  );
}
