"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { apiEndpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/query-keys";

import { facilitiesApiService } from "../api/facilities-api.service";
import type {
  DepartmentRecord,
  FacilityPayload,
  FacilitySpecialtyRecord,
  FacilityTypeRecord,
  ConsultationRoomRecord,
  OperatingHourRecord,
  OrganizationRecord,
  ScheduleExceptionRecord,
  ServicePointRecord,
  ServicePointTypeRecord,
  SpecialtyRecord,
} from "../types/facility.types";

type Payload = Record<string, string | number | boolean | null | undefined>;
type ResourceConfig = { base: string; label: string };

function friendlyFacilityError(error: unknown) {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();
  if (normalized.status === 403) return "You do not have permission to manage this facility resource.";
  if (normalized.status === 404) return "This facility resource was not found.";
  if (message.includes("duplicate") || message.includes("already exists") || message.includes("unique")) {
    return "A record with the same code or name already exists in this scope.";
  }
  if (message.includes("inactive organization")) return "Cannot use an inactive organization.";
  if (message.includes("inactive facility type")) return "Cannot use an inactive facility type.";
  if (message.includes("same facility")) return "Please select records from the same facility.";
  if (message.includes("overlap")) return "This schedule overlaps with an existing active period.";
  if (message.includes("network") || normalized.status === null) return "Could not connect to the server.";
  return normalized.message || "Something went wrong. Please try again.";
}

function invalidateFacilities(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.facilities.all });
  if (id) void queryClient.invalidateQueries({ queryKey: queryKeys.facilities.detail(id) });
}

function useCreateResourceMutation<TRecord>(config: ResourceConfig) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Payload) => facilitiesApiService.createResource<TRecord>(config.base, payload),
    onSuccess: () => {
      toast.success(`${config.label} created.`);
      invalidateFacilities(queryClient);
    },
    onError: (error) => toast.error(friendlyFacilityError(error)),
  });
}

function useUpdateResourceMutation<TRecord>(config: ResourceConfig) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Payload }) =>
      facilitiesApiService.updateResource<TRecord>(config.base, id, payload),
    onSuccess: () => {
      toast.success(`${config.label} updated.`);
      invalidateFacilities(queryClient);
    },
    onError: (error) => toast.error(friendlyFacilityError(error)),
  });
}

function useDeactivateResourceMutation<TRecord>(config: ResourceConfig) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facilitiesApiService.deactivateResource<TRecord>(config.base, id),
    onSuccess: () => {
      toast.success(`${config.label} deactivated.`);
      invalidateFacilities(queryClient);
    },
    onError: (error) => toast.error(friendlyFacilityError(error)),
  });
}

export function useCreateFacilityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FacilityPayload) => facilitiesApiService.createFacility(payload),
    onSuccess: (facility) => {
      toast.success("Facility created.");
      invalidateFacilities(queryClient, facility.id);
    },
    onError: (error) => toast.error(friendlyFacilityError(error)),
  });
}

export function useUpdateFacilityMutation(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FacilityPayload) => facilitiesApiService.updateFacility(id!, payload),
    onSuccess: (facility) => {
      toast.success("Facility updated.");
      invalidateFacilities(queryClient, facility.id);
    },
    onError: (error) => toast.error(friendlyFacilityError(error)),
  });
}

export function useDeactivateFacilityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facilitiesApiService.deactivateFacility(id),
    onSuccess: (facility) => {
      toast.success("Facility deactivated.");
      invalidateFacilities(queryClient, facility.id);
    },
    onError: (error) => toast.error(friendlyFacilityError(error)),
  });
}

export const useCreateDepartmentMutation = () =>
  useCreateResourceMutation<DepartmentRecord>({ base: apiEndpoints.facilities.departments, label: "Department" });
export const useUpdateDepartmentMutation = () =>
  useUpdateResourceMutation<DepartmentRecord>({ base: apiEndpoints.facilities.departments, label: "Department" });
export const useDeactivateDepartmentMutation = () =>
  useDeactivateResourceMutation<DepartmentRecord>({ base: apiEndpoints.facilities.departments, label: "Department" });

export const useCreateSpecialtyMutation = () =>
  useCreateResourceMutation<SpecialtyRecord>({ base: apiEndpoints.facilities.specialties, label: "Specialty" });
export const useCreateFacilitySpecialtyMutation = () =>
  useCreateResourceMutation<FacilitySpecialtyRecord>({ base: apiEndpoints.facilities.facilitySpecialties, label: "Facility specialty" });

export const useCreateServicePointMutation = () =>
  useCreateResourceMutation<ServicePointRecord>({ base: apiEndpoints.facilities.servicePoints, label: "Service point" });
export const useDeactivateServicePointMutation = () =>
  useDeactivateResourceMutation<ServicePointRecord>({ base: apiEndpoints.facilities.servicePoints, label: "Service point" });

export const useCreateConsultationRoomMutation = () =>
  useCreateResourceMutation<ConsultationRoomRecord>({ base: apiEndpoints.facilities.consultationRooms, label: "Consultation room" });
export const useDeactivateConsultationRoomMutation = () =>
  useDeactivateResourceMutation<ConsultationRoomRecord>({ base: apiEndpoints.facilities.consultationRooms, label: "Consultation room" });

export const useCreateOperatingHourMutation = () =>
  useCreateResourceMutation<OperatingHourRecord>({ base: apiEndpoints.facilities.operatingHours, label: "Operating hour" });
export const useDeactivateOperatingHourMutation = () =>
  useDeactivateResourceMutation<OperatingHourRecord>({ base: apiEndpoints.facilities.operatingHours, label: "Operating hour" });

export const useCreateScheduleExceptionMutation = () =>
  useCreateResourceMutation<ScheduleExceptionRecord>({ base: apiEndpoints.facilities.scheduleExceptions, label: "Schedule exception" });
export const useDeactivateScheduleExceptionMutation = () =>
  useDeactivateResourceMutation<ScheduleExceptionRecord>({ base: apiEndpoints.facilities.scheduleExceptions, label: "Schedule exception" });

export const useCreateOrganizationMutation = () =>
  useCreateResourceMutation<OrganizationRecord>({ base: apiEndpoints.facilities.organizations, label: "Organization" });
export const useCreateFacilityTypeMutation = () =>
  useCreateResourceMutation<FacilityTypeRecord>({ base: apiEndpoints.facilities.facilityTypes, label: "Facility type" });
export const useCreateServicePointTypeMutation = () =>
  useCreateResourceMutation<ServicePointTypeRecord>({ base: apiEndpoints.facilities.servicePointTypes, label: "Service point type" });
