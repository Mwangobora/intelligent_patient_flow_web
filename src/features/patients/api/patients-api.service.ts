import { apiEndpoints } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/api-client";

import type {
  CreatePatientAddressPayload,
  CreatePatientIdentifierPayload,
  CreatePatientPayload,
  CreatePatientRelatedPersonPayload,
  CreateRelatedPersonContactPayload,
  PatientAccessGrantListParams,
  PatientAccessGrantRecord,
  PatientAddressListParams,
  PatientAddressRecord,
  PatientIdentifierListParams,
  PatientIdentifierRecord,
  PatientIdentifierTypeListParams,
  PatientIdentifierTypeRecord,
  PatientListParams,
  PatientRecord,
  PatientRelatedPersonListParams,
  PatientRelatedPersonRecord,
  RelatedPersonContactListParams,
  RelatedPersonContactRecord,
  RelationshipTypeListParams,
  RelationshipTypeRecord,
  UpdatePatientAddressPayload,
  UpdatePatientPayload,
  UpdatePatientRelatedPersonPayload,
} from "../types/patient.types";

function compactParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

class PatientsApiService {
  async listPatients(params: PatientListParams) {
    const response = await apiClient.get<PatientRecord[]>(`${apiEndpoints.patients.base}/`, {
      params: compactParams(params),
    });
    return response.data;
  }

  async getPatientDetail(id: string) {
    const response = await apiClient.get<PatientRecord>(`${apiEndpoints.patients.base}/${id}/`);
    return response.data;
  }

  async createPatient(payload: CreatePatientPayload) {
    const response = await apiClient.post<PatientRecord>(`${apiEndpoints.patients.base}/`, payload);
    return response.data;
  }

  async updatePatient(id: string, payload: UpdatePatientPayload) {
    const response = await apiClient.patch<PatientRecord>(`${apiEndpoints.patients.base}/${id}/`, payload);
    return response.data;
  }

  async deactivatePatient(id: string) {
    const response = await apiClient.post<PatientRecord>(`${apiEndpoints.patients.base}/${id}/deactivate/`, {});
    return response.data;
  }

  async reactivatePatient(id: string) {
    const response = await apiClient.post<PatientRecord>(`${apiEndpoints.patients.base}/${id}/reactivate/`, {});
    return response.data;
  }

  async listPatientIdentifierTypes(params: PatientIdentifierTypeListParams) {
    const response = await apiClient.get<PatientIdentifierTypeRecord[]>(
      `${apiEndpoints.patients.base}/identifier-types/`,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async listPatientIdentifiers(params: PatientIdentifierListParams) {
    const response = await apiClient.get<PatientIdentifierRecord[]>(
      `${apiEndpoints.patients.base}/identifiers/`,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async createPatientIdentifier(patientId: string, payload: CreatePatientIdentifierPayload) {
    const response = await apiClient.post<PatientIdentifierRecord>(
      `${apiEndpoints.patients.base}/${patientId}/identifiers/`,
      payload,
    );
    return response.data;
  }

  async verifyPatientIdentifier(id: string) {
    const response = await apiClient.post<PatientIdentifierRecord>(
      `${apiEndpoints.patients.base}/identifiers/${id}/verify/`,
      {},
    );
    return response.data;
  }

  async setPrimaryPatientIdentifier(id: string) {
    const response = await apiClient.post<PatientIdentifierRecord>(
      `${apiEndpoints.patients.base}/identifiers/${id}/set-primary/`,
      {},
    );
    return response.data;
  }

  async deactivatePatientIdentifier(id: string) {
    const response = await apiClient.post<PatientIdentifierRecord>(
      `${apiEndpoints.patients.base}/identifiers/${id}/deactivate/`,
      {},
    );
    return response.data;
  }

  async listPatientAddresses(params: PatientAddressListParams) {
    const response = await apiClient.get<PatientAddressRecord[]>(
      `${apiEndpoints.patients.base}/addresses/`,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async createPatientAddress(patientId: string, payload: CreatePatientAddressPayload) {
    const response = await apiClient.post<PatientAddressRecord>(
      `${apiEndpoints.patients.base}/${patientId}/addresses/`,
      payload,
    );
    return response.data;
  }

  async updatePatientAddress(id: string, payload: UpdatePatientAddressPayload) {
    const response = await apiClient.patch<PatientAddressRecord>(
      `${apiEndpoints.patients.base}/addresses/${id}/`,
      payload,
    );
    return response.data;
  }

  async setPrimaryPatientAddress(id: string) {
    const response = await apiClient.post<PatientAddressRecord>(
      `${apiEndpoints.patients.base}/addresses/${id}/set-primary/`,
      {},
    );
    return response.data;
  }

  async deactivatePatientAddress(id: string) {
    const response = await apiClient.post<PatientAddressRecord>(
      `${apiEndpoints.patients.base}/addresses/${id}/deactivate/`,
      {},
    );
    return response.data;
  }

  async listRelationshipTypes(params: RelationshipTypeListParams) {
    const response = await apiClient.get<RelationshipTypeRecord[]>(
      `${apiEndpoints.patients.base}/relationship-types/`,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async listPatientRelatedPersons(params: PatientRelatedPersonListParams) {
    const response = await apiClient.get<PatientRelatedPersonRecord[]>(
      `${apiEndpoints.patients.base}/related-persons/`,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async createPatientRelatedPerson(patientId: string, payload: CreatePatientRelatedPersonPayload) {
    const response = await apiClient.post<PatientRelatedPersonRecord>(
      `${apiEndpoints.patients.base}/${patientId}/related-persons/`,
      payload,
    );
    return response.data;
  }

  async updatePatientRelatedPerson(id: string, payload: UpdatePatientRelatedPersonPayload) {
    const response = await apiClient.patch<PatientRelatedPersonRecord>(
      `${apiEndpoints.patients.base}/related-persons/${id}/`,
      payload,
    );
    return response.data;
  }

  async deactivatePatientRelatedPerson(id: string) {
    const response = await apiClient.post<PatientRelatedPersonRecord>(
      `${apiEndpoints.patients.base}/related-persons/${id}/deactivate/`,
      {},
    );
    return response.data;
  }

  async listRelatedPersonContacts(params: RelatedPersonContactListParams) {
    const response = await apiClient.get<RelatedPersonContactRecord[]>(
      `${apiEndpoints.patients.base}/related-person-contacts/`,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async createRelatedPersonContact(relatedPersonId: string, payload: CreateRelatedPersonContactPayload) {
    const response = await apiClient.post<RelatedPersonContactRecord>(
      `${apiEndpoints.patients.base}/related-persons/${relatedPersonId}/contacts/`,
      payload,
    );
    return response.data;
  }

  async verifyRelatedPersonContact(id: string) {
    const response = await apiClient.post<RelatedPersonContactRecord>(
      `${apiEndpoints.patients.base}/related-person-contacts/${id}/verify/`,
      {},
    );
    return response.data;
  }

  async setPrimaryRelatedPersonContact(id: string) {
    const response = await apiClient.post<RelatedPersonContactRecord>(
      `${apiEndpoints.patients.base}/related-person-contacts/${id}/set-primary/`,
      {},
    );
    return response.data;
  }

  async deactivateRelatedPersonContact(id: string) {
    const response = await apiClient.post<RelatedPersonContactRecord>(
      `${apiEndpoints.patients.base}/related-person-contacts/${id}/deactivate/`,
      {},
    );
    return response.data;
  }

  async listPatientAccessGrants(params: PatientAccessGrantListParams) {
    const response = await apiClient.get<PatientAccessGrantRecord[]>(
      `${apiEndpoints.patients.base}/access-grants/`,
      { params: compactParams(params) },
    );
    return response.data;
  }
}

export const patientsApiService = new PatientsApiService();
