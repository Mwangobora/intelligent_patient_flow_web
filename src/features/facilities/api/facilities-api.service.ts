import { apiClient } from "@/lib/api/api-client";
import { apiEndpoints } from "@/lib/api/endpoints";

import type {
  DepartmentRecord,
  FacilityListParams,
  FacilityPayload,
  FacilityRecord,
  FacilityScopedParams,
  FacilitySpecialtyRecord,
  FacilityTypeRecord,
  ConsultationRoomRecord,
  OperatingHourRecord,
  OrganizationRecord,
  ScheduleExceptionRecord,
  ServicePointRecord,
  ServicePointTypeRecord,
  SimpleListParams,
  SpecialtyRecord,
} from "../types/facility.types";

type Payload = Record<string, string | number | boolean | null | undefined>;

function compactParams<T extends Record<string, unknown>>(params?: T) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function detailUrl(base: string, id: string, action?: string) {
  return action ? `${base}${id}/${action}/` : `${base}${id}/`;
}

class FacilitiesApiService {
  async listOrganizations(params: SimpleListParams = {}) {
    const response = await apiClient.get<OrganizationRecord[]>(apiEndpoints.facilities.organizations, {
      params: compactParams(params),
    });
    return response.data;
  }

  async listFacilityTypes(params: SimpleListParams = {}) {
    const response = await apiClient.get<FacilityTypeRecord[]>(apiEndpoints.facilities.facilityTypes, {
      params: compactParams(params),
    });
    return response.data;
  }

  async listFacilities(params: FacilityListParams = {}) {
    const response = await apiClient.get<FacilityRecord[]>(apiEndpoints.facilities.facilities, {
      params: compactParams(params),
    });
    return response.data;
  }

  async getFacility(id: string) {
    const response = await apiClient.get<FacilityRecord>(detailUrl(apiEndpoints.facilities.facilities, id));
    return response.data;
  }

  async createFacility(payload: FacilityPayload) {
    const response = await apiClient.post<FacilityRecord>(apiEndpoints.facilities.facilities, payload);
    return response.data;
  }

  async updateFacility(id: string, payload: FacilityPayload) {
    const response = await apiClient.patch<FacilityRecord>(detailUrl(apiEndpoints.facilities.facilities, id), payload);
    return response.data;
  }

  async deactivateFacility(id: string) {
    const response = await apiClient.post<FacilityRecord>(
      detailUrl(apiEndpoints.facilities.facilities, id, "deactivate"),
      {},
    );
    return response.data;
  }

  async listDepartments(params: FacilityScopedParams = {}) {
    const response = await apiClient.get<DepartmentRecord[]>(apiEndpoints.facilities.departments, {
      params: compactParams(params),
    });
    return response.data;
  }

  async listSpecialties(params: SimpleListParams = {}) {
    const response = await apiClient.get<SpecialtyRecord[]>(apiEndpoints.facilities.specialties, {
      params: compactParams(params),
    });
    return response.data;
  }

  async listFacilitySpecialties(params: FacilityScopedParams & { specialty_id?: string } = {}) {
    const response = await apiClient.get<FacilitySpecialtyRecord[]>(
      apiEndpoints.facilities.facilitySpecialties,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async listServicePointTypes(params: SimpleListParams = {}) {
    const response = await apiClient.get<ServicePointTypeRecord[]>(apiEndpoints.facilities.servicePointTypes, {
      params: compactParams(params),
    });
    return response.data;
  }

  async listServicePoints(params: FacilityScopedParams = {}) {
    const response = await apiClient.get<ServicePointRecord[]>(apiEndpoints.facilities.servicePoints, {
      params: compactParams(params),
    });
    return response.data;
  }

  async listConsultationRooms(params: FacilityScopedParams = {}) {
    const response = await apiClient.get<ConsultationRoomRecord[]>(apiEndpoints.facilities.consultationRooms, {
      params: compactParams(params),
    });
    return response.data;
  }

  async listOperatingHours(params: { facility_id?: string; day_of_week?: number; is_active?: boolean } = {}) {
    const response = await apiClient.get<OperatingHourRecord[]>(apiEndpoints.facilities.operatingHours, {
      params: compactParams(params),
    });
    return response.data;
  }

  async listScheduleExceptions(params: { facility_id?: string; exception_date?: string; is_active?: boolean } = {}) {
    const response = await apiClient.get<ScheduleExceptionRecord[]>(
      apiEndpoints.facilities.scheduleExceptions,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async createResource<TRecord>(base: string, payload: Payload) {
    const response = await apiClient.post<TRecord>(base, payload);
    return response.data;
  }

  async updateResource<TRecord>(base: string, id: string, payload: Payload) {
    const response = await apiClient.patch<TRecord>(detailUrl(base, id), payload);
    return response.data;
  }

  async deactivateResource<TRecord>(base: string, id: string) {
    const response = await apiClient.post<TRecord>(detailUrl(base, id, "deactivate"), {});
    return response.data;
  }
}

export const facilitiesApiService = new FacilitiesApiService();
