import { apiEndpoints } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/api-client";

import type {
  AssignmentListParams,
  AvailabilityCreatePayload,
  AvailabilityListParams,
  AvailabilityPeriodRecord,
  AvailabilityUpdatePayload,
  ConsultationRoomLookupRecord,
  DepartmentAssignmentCreatePayload,
  DepartmentAssignmentUpdatePayload,
  DepartmentLookupRecord,
  FacilityAssignmentCreatePayload,
  FacilityAssignmentUpdatePayload,
  FacilityLookupRecord,
  FacilitySpecialtyLookupRecord,
  GenerateSlotsPayload,
  LeaveCancellationPayload,
  LeaveDecisionPayload,
  LeaveListParams,
  LeaveRequestCreatePayload,
  LeaveRequestRecord,
  PractitionerCreatePayload,
  PractitionerDepartmentAssignmentRecord,
  PractitionerFacilityAssignmentRecord,
  PractitionerListParams,
  PractitionerRecord,
  PractitionerShiftRecord,
  PractitionerSpecialtyAssignmentRecord,
  PractitionerTypeCreatePayload,
  PractitionerTypeRecord,
  PractitionerTypeUpdatePayload,
  PractitionerUpdatePayload,
  ServicePointLookupRecord,
  ShiftCancellationPayload,
  ShiftCreatePayload,
  ShiftListParams,
  ShiftUpdatePayload,
  SpecialtyAssignmentCreatePayload,
  SpecialtyAssignmentUpdatePayload,
} from "../types/practitioner.types";

function compactParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

class PractitionersApiService {
  async listPractitioners(params: PractitionerListParams) {
    const response = await apiClient.get<PractitionerRecord[]>(`${apiEndpoints.practitioners.base}/`, { params: compactParams(params) });
    return response.data;
  }

  async getPractitionerDetail(id: string) {
    const response = await apiClient.get<PractitionerRecord>(`${apiEndpoints.practitioners.base}/${id}/`);
    return response.data;
  }

  async createPractitioner(payload: PractitionerCreatePayload) {
    const response = await apiClient.post<PractitionerRecord>(`${apiEndpoints.practitioners.base}/`, payload);
    return response.data;
  }

  async updatePractitioner(id: string, payload: PractitionerUpdatePayload) {
    const response = await apiClient.patch<PractitionerRecord>(`${apiEndpoints.practitioners.base}/${id}/`, payload);
    return response.data;
  }

  async deactivatePractitioner(id: string) {
    const response = await apiClient.post<PractitionerRecord>(`${apiEndpoints.practitioners.base}/${id}/deactivate/`, {});
    return response.data;
  }

  async reactivatePractitioner(id: string) {
    const response = await apiClient.post<PractitionerRecord>(`${apiEndpoints.practitioners.base}/${id}/reactivate/`, {});
    return response.data;
  }

  async listPractitionerTypes(params: { is_active?: boolean; search?: string }) {
    const response = await apiClient.get<PractitionerTypeRecord[]>(`${apiEndpoints.practitioners.base}/types/`, { params: compactParams(params) });
    return response.data;
  }

  async createPractitionerType(payload: PractitionerTypeCreatePayload) {
    const response = await apiClient.post<PractitionerTypeRecord>(`${apiEndpoints.practitioners.base}/types/`, payload);
    return response.data;
  }

  async updatePractitionerType(id: string, payload: PractitionerTypeUpdatePayload) {
    const response = await apiClient.patch<PractitionerTypeRecord>(`${apiEndpoints.practitioners.base}/types/${id}/`, payload);
    return response.data;
  }

  async listFacilityAssignments(params: AssignmentListParams) {
    const response = await apiClient.get<PractitionerFacilityAssignmentRecord[]>(`${apiEndpoints.practitioners.base}/facility-assignments/`, { params: compactParams(params) });
    return response.data;
  }

  async createFacilityAssignment(practitionerId: string, payload: FacilityAssignmentCreatePayload) {
    const response = await apiClient.post<PractitionerFacilityAssignmentRecord>(`${apiEndpoints.practitioners.base}/${practitionerId}/facility-assignments/`, payload);
    return response.data;
  }

  async updateFacilityAssignment(id: string, payload: FacilityAssignmentUpdatePayload) {
    const response = await apiClient.patch<PractitionerFacilityAssignmentRecord>(`${apiEndpoints.practitioners.base}/facility-assignments/${id}/`, payload);
    return response.data;
  }

  async deactivateFacilityAssignment(id: string) {
    const response = await apiClient.post<PractitionerFacilityAssignmentRecord>(`${apiEndpoints.practitioners.base}/facility-assignments/${id}/deactivate/`, {});
    return response.data;
  }

  async setPrimaryFacilityAssignment(id: string) {
    const response = await apiClient.post<PractitionerFacilityAssignmentRecord>(`${apiEndpoints.practitioners.base}/facility-assignments/${id}/set-primary/`, {});
    return response.data;
  }

  async listDepartmentAssignments(params: AssignmentListParams) {
    const response = await apiClient.get<PractitionerDepartmentAssignmentRecord[]>(`${apiEndpoints.practitioners.base}/department-assignments/`, { params: compactParams(params) });
    return response.data;
  }

  async createDepartmentAssignment(assignmentId: string, payload: DepartmentAssignmentCreatePayload) {
    const response = await apiClient.post<PractitionerDepartmentAssignmentRecord>(`${apiEndpoints.practitioners.base}/facility-assignments/${assignmentId}/department-assignments/`, payload);
    return response.data;
  }

  async updateDepartmentAssignment(id: string, payload: DepartmentAssignmentUpdatePayload) {
    const response = await apiClient.patch<PractitionerDepartmentAssignmentRecord>(`${apiEndpoints.practitioners.base}/department-assignments/${id}/`, payload);
    return response.data;
  }

  async deactivateDepartmentAssignment(id: string) {
    const response = await apiClient.post<PractitionerDepartmentAssignmentRecord>(`${apiEndpoints.practitioners.base}/department-assignments/${id}/deactivate/`, {});
    return response.data;
  }

  async setPrimaryDepartmentAssignment(id: string) {
    const response = await apiClient.post<PractitionerDepartmentAssignmentRecord>(`${apiEndpoints.practitioners.base}/department-assignments/${id}/set-primary/`, {});
    return response.data;
  }

  async listSpecialtyAssignments(params: AssignmentListParams) {
    const response = await apiClient.get<PractitionerSpecialtyAssignmentRecord[]>(`${apiEndpoints.practitioners.base}/specialty-assignments/`, { params: compactParams(params) });
    return response.data;
  }

  async createSpecialtyAssignment(assignmentId: string, payload: SpecialtyAssignmentCreatePayload) {
    const response = await apiClient.post<PractitionerSpecialtyAssignmentRecord>(`${apiEndpoints.practitioners.base}/facility-assignments/${assignmentId}/specialty-assignments/`, payload);
    return response.data;
  }

  async updateSpecialtyAssignment(id: string, payload: SpecialtyAssignmentUpdatePayload) {
    const response = await apiClient.patch<PractitionerSpecialtyAssignmentRecord>(`${apiEndpoints.practitioners.base}/specialty-assignments/${id}/`, payload);
    return response.data;
  }

  async deactivateSpecialtyAssignment(id: string) {
    const response = await apiClient.post<PractitionerSpecialtyAssignmentRecord>(`${apiEndpoints.practitioners.base}/specialty-assignments/${id}/deactivate/`, {});
    return response.data;
  }

  async setPrimarySpecialtyAssignment(id: string) {
    const response = await apiClient.post<PractitionerSpecialtyAssignmentRecord>(`${apiEndpoints.practitioners.base}/specialty-assignments/${id}/set-primary/`, {});
    return response.data;
  }

  async listAvailability(params: AvailabilityListParams) {
    const response = await apiClient.get<AvailabilityPeriodRecord[]>("/scheduling/availability/", { params: compactParams(params) });
    return response.data;
  }

  async createAvailability(payload: AvailabilityCreatePayload) {
    const response = await apiClient.post<AvailabilityPeriodRecord>("/scheduling/availability/", payload);
    return response.data;
  }

  async updateAvailability(id: string, payload: AvailabilityUpdatePayload) {
    const response = await apiClient.patch<AvailabilityPeriodRecord>(`/scheduling/availability/${id}/`, payload);
    return response.data;
  }

  async deactivateAvailability(id: string) {
    const response = await apiClient.post<AvailabilityPeriodRecord>(`/scheduling/availability/${id}/deactivate/`, {});
    return response.data;
  }

  async listLeaveRequests(params: LeaveListParams) {
    const response = await apiClient.get<LeaveRequestRecord[]>("/scheduling/leave-requests/", { params: compactParams(params) });
    return response.data;
  }

  async requestLeave(payload: LeaveRequestCreatePayload) {
    const response = await apiClient.post<LeaveRequestRecord>("/scheduling/leave-requests/", payload);
    return response.data;
  }

  async approveLeave(id: string, payload: LeaveDecisionPayload) {
    const response = await apiClient.post<LeaveRequestRecord>(`/scheduling/leave-requests/${id}/approve/`, payload);
    return response.data;
  }

  async rejectLeave(id: string, payload: LeaveDecisionPayload) {
    const response = await apiClient.post<LeaveRequestRecord>(`/scheduling/leave-requests/${id}/reject/`, payload);
    return response.data;
  }

  async cancelLeave(id: string, payload: LeaveCancellationPayload) {
    const response = await apiClient.post<LeaveRequestRecord>(`/scheduling/leave-requests/${id}/cancel/`, payload);
    return response.data;
  }

  async listShifts(params: ShiftListParams) {
    const response = await apiClient.get<PractitionerShiftRecord[]>("/scheduling/shifts/", { params: compactParams(params) });
    return response.data;
  }

  async createShift(payload: ShiftCreatePayload) {
    const response = await apiClient.post<PractitionerShiftRecord>("/scheduling/shifts/", payload);
    return response.data;
  }

  async updateShift(id: string, payload: ShiftUpdatePayload) {
    const response = await apiClient.patch<PractitionerShiftRecord>(`/scheduling/shifts/${id}/`, payload);
    return response.data;
  }

  async cancelShift(id: string, payload: ShiftCancellationPayload) {
    const response = await apiClient.post<PractitionerShiftRecord>(`/scheduling/shifts/${id}/cancel/`, payload);
    return response.data;
  }

  async startShift(id: string) {
    const response = await apiClient.post<PractitionerShiftRecord>(`/scheduling/shifts/${id}/start/`, {});
    return response.data;
  }

  async completeShift(id: string) {
    const response = await apiClient.post<PractitionerShiftRecord>(`/scheduling/shifts/${id}/complete/`, {});
    return response.data;
  }

  async generateSlots(id: string, payload: GenerateSlotsPayload) {
    const response = await apiClient.post<{ count: number; slot_ids: string[] }>(`/scheduling/shifts/${id}/generate-slots/`, payload);
    return response.data;
  }

  async listFacilities(params: { organization_id?: string; search?: string; is_active?: boolean }) {
    const response = await apiClient.get<FacilityLookupRecord[]>(`${apiEndpoints.facilities.base}/facilities/`, { params: compactParams(params) });
    return response.data;
  }

  async listDepartments(params: { facility_id?: string; is_active?: boolean; search?: string }) {
    const response = await apiClient.get<DepartmentLookupRecord[]>(`${apiEndpoints.facilities.base}/departments/`, { params: compactParams(params) });
    return response.data;
  }

  async listFacilitySpecialties(params: { facility_id?: string; specialty_id?: string; department_id?: string; is_active?: boolean }) {
    const response = await apiClient.get<FacilitySpecialtyLookupRecord[]>(`${apiEndpoints.facilities.base}/facility-specialties/`, { params: compactParams(params) });
    return response.data;
  }

  async listServicePoints(params: { facility_id?: string; department_id?: string; is_active?: boolean; search?: string }) {
    const response = await apiClient.get<ServicePointLookupRecord[]>(`${apiEndpoints.facilities.base}/service-points/`, { params: compactParams(params) });
    return response.data;
  }

  async listConsultationRooms(params: { facility_id?: string; department_id?: string; is_active?: boolean; search?: string }) {
    const response = await apiClient.get<ConsultationRoomLookupRecord[]>(`${apiEndpoints.facilities.base}/consultation-rooms/`, { params: compactParams(params) });
    return response.data;
  }
}

export const practitionersApiService = new PractitionersApiService();
