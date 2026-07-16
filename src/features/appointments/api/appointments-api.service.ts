import { apiClient } from "@/lib/api/api-client";

import type {
  AppointmentListParams,
  AppointmentRecord,
  AppointmentSlotRecord,
  AppointmentStatusHistoryRecord,
  AssignPractitionerPayload,
  AvailableSlotsParams,
  CancelAppointmentPayload,
  CreateAppointmentPayload,
  FacilityLookupRecord,
  FacilitySpecialtyLookupRecord,
  PatientLookupRecord,
  PractitionerLookupRecord,
  RescheduleAppointmentPayload,
  UpdateAppointmentPayload,
} from "../types/appointment.types";

function compactParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

class AppointmentApiService {
  async listAppointments(params: AppointmentListParams): Promise<AppointmentRecord[]> {
    const response = await apiClient.get<AppointmentRecord[]>("/scheduling/appointments/", {
      params: compactParams(params),
    });
    return response.data;
  }

  async getAppointmentDetail(id: string): Promise<AppointmentRecord> {
    const response = await apiClient.get<AppointmentRecord>(`/scheduling/appointments/${id}/`);
    return response.data;
  }

  async createAppointment(payload: CreateAppointmentPayload): Promise<AppointmentRecord> {
    const response = await apiClient.post<AppointmentRecord>("/scheduling/appointments/", payload);
    return response.data;
  }

  async updateAppointment(id: string, payload: UpdateAppointmentPayload): Promise<AppointmentRecord> {
    const response = await apiClient.patch<AppointmentRecord>(`/scheduling/appointments/${id}/`, payload);
    return response.data;
  }

  async cancelAppointment(id: string, payload: CancelAppointmentPayload): Promise<AppointmentRecord> {
    const response = await apiClient.post<AppointmentRecord>(`/scheduling/appointments/${id}/cancel/`, payload);
    return response.data;
  }

  async rescheduleAppointment(id: string, payload: RescheduleAppointmentPayload): Promise<AppointmentRecord> {
    const response = await apiClient.post<AppointmentRecord>(`/scheduling/appointments/${id}/reschedule/`, payload);
    return response.data;
  }

  async assignPractitioner(id: string, payload: AssignPractitionerPayload): Promise<AppointmentRecord> {
    const response = await apiClient.post<AppointmentRecord>(
      `/scheduling/appointments/${id}/assign-practitioner/`,
      payload,
    );
    return response.data;
  }

  async getAppointmentStatusHistory(id: string): Promise<AppointmentStatusHistoryRecord[]> {
    const response = await apiClient.get<AppointmentStatusHistoryRecord[]>(
      `/scheduling/appointments/${id}/status-history/`,
    );
    return response.data;
  }

  async listAvailableSlots(params: AvailableSlotsParams): Promise<AppointmentSlotRecord[]> {
    const response = await apiClient.get<AppointmentSlotRecord[]>("/scheduling/slots/", {
      params: compactParams(params),
    });
    return response.data;
  }

  async listPatients(params: {
    organization_id: string;
    registered_facility_id?: string;
    search?: string;
    is_active?: boolean;
  }): Promise<PatientLookupRecord[]> {
    const response = await apiClient.get<PatientLookupRecord[]>("/patients/", {
      params: compactParams(params),
    });
    return response.data;
  }

  async getPatientDetail(id: string): Promise<PatientLookupRecord> {
    const response = await apiClient.get<PatientLookupRecord>(`/patients/${id}/`);
    return response.data;
  }

  async listFacilities(params: {
    organization_id: string;
    search?: string;
    is_active?: boolean;
  }): Promise<FacilityLookupRecord[]> {
    const response = await apiClient.get<FacilityLookupRecord[]>("/facilities/facilities/", {
      params: compactParams(params),
    });
    return response.data;
  }

  async listFacilitySpecialties(params: {
    facility_id: string;
    specialty_id?: string;
    is_active?: boolean;
  }): Promise<FacilitySpecialtyLookupRecord[]> {
    const response = await apiClient.get<FacilitySpecialtyLookupRecord[]>(
      "/facilities/facility-specialties/",
      {
        params: compactParams(params),
      },
    );
    return response.data;
  }

  async listPractitioners(params: {
    organization_id: string;
    facility_id?: string;
    search?: string;
    is_active?: boolean;
  }): Promise<PractitionerLookupRecord[]> {
    const response = await apiClient.get<PractitionerLookupRecord[]>("/practitioners/", {
      params: compactParams(params),
    });
    return response.data;
  }
}

export const appointmentsApiService = new AppointmentApiService();
