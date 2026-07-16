"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { practitionersApiService } from "../api/practitioners-api.service";
import type {
  AvailabilityCreatePayload,
  AvailabilityUpdatePayload,
  DepartmentAssignmentCreatePayload,
  DepartmentAssignmentUpdatePayload,
  FacilityAssignmentCreatePayload,
  FacilityAssignmentUpdatePayload,
  GenerateSlotsPayload,
  LeaveCancellationPayload,
  LeaveDecisionPayload,
  LeaveRequestCreatePayload,
  PractitionerCreatePayload,
  PractitionerTypeCreatePayload,
  PractitionerTypeUpdatePayload,
  PractitionerUpdatePayload,
  ShiftCancellationPayload,
  ShiftCreatePayload,
  ShiftUpdatePayload,
  SpecialtyAssignmentCreatePayload,
  SpecialtyAssignmentUpdatePayload,
} from "../types/practitioner.types";

function getPractitionerFriendlyError(error: unknown) {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();
  if (normalized.status === 403) return "You do not have permission to perform this action.";
  if (message.includes("overlapping") && message.includes("shift")) return "This doctor already has a shift during this time.";
  if (message.includes("consultation room") || message.includes("room")) return "This consultation room is already assigned during this time.";
  if (message.includes("leave") && message.includes("overlap")) return "This doctor has approved leave during this period.";
  if (message.includes("department") || message.includes("specialty") || message.includes("assignment")) return "Selected department or specialty does not match this doctor’s facility assignment.";
  if (message.includes("network") || normalized.status === null) return "Could not connect to the server. Please try again.";
  return normalized.message || "Something went wrong. Please try again.";
}

function invalidatePractitionerQueries(queryClient: ReturnType<typeof useQueryClient>, practitionerId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.practitioners.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  if (practitionerId) {
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.practitioners.all, "practitioner", practitionerId] });
  }
}

function createMutation<TPayload, TResult>(mutationFn: (payload: TPayload) => Promise<TResult>, successMessage: string, practitionerIdResolver?: (result: TResult, payload: TPayload) => string | undefined) {
  return function usePractitionerMutation() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn,
      onSuccess: (result, payload) => {
        toast.success(successMessage);
        invalidatePractitionerQueries(queryClient, practitionerIdResolver?.(result, payload));
      },
      onError: (error) => toast.error(getPractitionerFriendlyError(error)),
    });
  };
}

export const useCreatePractitionerMutation = createMutation<PractitionerCreatePayload, { id: string }>((payload) => practitionersApiService.createPractitioner(payload), "Practitioner created.", (result) => result.id);
export const useUpdatePractitionerMutation = createMutation<{ id: string; payload: PractitionerUpdatePayload }, { id: string }>(({ id, payload }) => practitionersApiService.updatePractitioner(id, payload), "Practitioner updated.", (result) => result.id);
export const useDeactivatePractitionerMutation = createMutation<{ id: string }, { id: string }>(({ id }) => practitionersApiService.deactivatePractitioner(id), "Practitioner deactivated.", (result) => result.id);
export const useReactivatePractitionerMutation = createMutation<{ id: string }, { id: string }>(({ id }) => practitionersApiService.reactivatePractitioner(id), "Practitioner reactivated.", (result) => result.id);
export const useCreatePractitionerTypeMutation = createMutation<PractitionerTypeCreatePayload, { id: string }>((payload) => practitionersApiService.createPractitionerType(payload), "Practitioner type created.");
export const useUpdatePractitionerTypeMutation = createMutation<{ id: string; payload: PractitionerTypeUpdatePayload }, { id: string }>(({ id, payload }) => practitionersApiService.updatePractitionerType(id, payload), "Practitioner type updated.");
export const useCreateFacilityAssignmentMutation = createMutation<{ practitionerId: string; payload: FacilityAssignmentCreatePayload }, { practitioner: string }>(({ practitionerId, payload }) => practitionersApiService.createFacilityAssignment(practitionerId, payload), "Facility assignment created.", (result) => result.practitioner);
export const useUpdateFacilityAssignmentMutation = createMutation<{ id: string; payload: FacilityAssignmentUpdatePayload }, { practitioner: string }>(({ id, payload }) => practitionersApiService.updateFacilityAssignment(id, payload), "Facility assignment updated.", (result) => result.practitioner);
export const useDeactivateFacilityAssignmentMutation = createMutation<{ id: string }, { practitioner: string }>(({ id }) => practitionersApiService.deactivateFacilityAssignment(id), "Facility assignment deactivated.", (result) => result.practitioner);
export const useSetPrimaryFacilityAssignmentMutation = createMutation<{ id: string }, { practitioner: string }>(({ id }) => practitionersApiService.setPrimaryFacilityAssignment(id), "Primary facility updated.", (result) => result.practitioner);
export const useCreateDepartmentAssignmentMutation = createMutation<{ assignmentId: string; payload: DepartmentAssignmentCreatePayload }, { practitioner_facility_assignment: string }>(({ assignmentId, payload }) => practitionersApiService.createDepartmentAssignment(assignmentId, payload), "Department assignment created.");
export const useUpdateDepartmentAssignmentMutation = createMutation<{ id: string; payload: DepartmentAssignmentUpdatePayload }, { practitioner_facility_assignment: string }>(({ id, payload }) => practitionersApiService.updateDepartmentAssignment(id, payload), "Department assignment updated.");
export const useDeactivateDepartmentAssignmentMutation = createMutation<{ id: string }, { practitioner_facility_assignment: string }>(({ id }) => practitionersApiService.deactivateDepartmentAssignment(id), "Department assignment deactivated.");
export const useSetPrimaryDepartmentAssignmentMutation = createMutation<{ id: string }, { practitioner_facility_assignment: string }>(({ id }) => practitionersApiService.setPrimaryDepartmentAssignment(id), "Primary department updated.");
export const useCreateSpecialtyAssignmentMutation = createMutation<{ assignmentId: string; payload: SpecialtyAssignmentCreatePayload }, { practitioner_facility_assignment: string }>(({ assignmentId, payload }) => practitionersApiService.createSpecialtyAssignment(assignmentId, payload), "Specialty assignment created.");
export const useUpdateSpecialtyAssignmentMutation = createMutation<{ id: string; payload: SpecialtyAssignmentUpdatePayload }, { practitioner_facility_assignment: string }>(({ id, payload }) => practitionersApiService.updateSpecialtyAssignment(id, payload), "Specialty assignment updated.");
export const useDeactivateSpecialtyAssignmentMutation = createMutation<{ id: string }, { practitioner_facility_assignment: string }>(({ id }) => practitionersApiService.deactivateSpecialtyAssignment(id), "Specialty assignment deactivated.");
export const useSetPrimarySpecialtyAssignmentMutation = createMutation<{ id: string }, { practitioner_facility_assignment: string }>(({ id }) => practitionersApiService.setPrimarySpecialtyAssignment(id), "Primary specialty updated.");
export const useCreateAvailabilityMutation = createMutation<AvailabilityCreatePayload, { id: string; practitioner_facility_assignment: string }>((payload) => practitionersApiService.createAvailability(payload), "Availability period created.");
export const useUpdateAvailabilityMutation = createMutation<{ id: string; payload: AvailabilityUpdatePayload }, { id: string; practitioner_facility_assignment: string }>(({ id, payload }) => practitionersApiService.updateAvailability(id, payload), "Availability updated.");
export const useDeactivateAvailabilityMutation = createMutation<{ id: string }, { id: string; practitioner_facility_assignment: string }>(({ id }) => practitionersApiService.deactivateAvailability(id), "Availability deactivated.");
export const useCreateShiftMutation = createMutation<ShiftCreatePayload, { practitioner_facility_assignment: string }>((payload) => practitionersApiService.createShift(payload), "Shift created.");
export const useUpdateShiftMutation = createMutation<{ id: string; payload: ShiftUpdatePayload }, { practitioner_facility_assignment: string }>(({ id, payload }) => practitionersApiService.updateShift(id, payload), "Shift updated.");
export const useCancelShiftMutation = createMutation<{ id: string; payload: ShiftCancellationPayload }, { practitioner_facility_assignment: string }>(({ id, payload }) => practitionersApiService.cancelShift(id, payload), "Shift cancelled.");
export const useStartShiftMutation = createMutation<{ id: string }, { practitioner_facility_assignment: string }>(({ id }) => practitionersApiService.startShift(id), "Shift started.");
export const useCompleteShiftMutation = createMutation<{ id: string }, { practitioner_facility_assignment: string }>(({ id }) => practitionersApiService.completeShift(id), "Shift completed.");
export const useGenerateShiftSlotsMutation = createMutation<{ id: string; payload: GenerateSlotsPayload }, { count: number; slot_ids: string[] }>(({ id, payload }) => practitionersApiService.generateSlots(id, payload), "Appointment slots generated.");
export const useRequestLeaveMutation = createMutation<LeaveRequestCreatePayload, { practitioner_facility_assignment: string }>((payload) => practitionersApiService.requestLeave(payload), "Leave request submitted.");
export const useApproveLeaveMutation = createMutation<{ id: string; payload: LeaveDecisionPayload }, { practitioner_facility_assignment: string }>(({ id, payload }) => practitionersApiService.approveLeave(id, payload), "Leave request approved.");
export const useRejectLeaveMutation = createMutation<{ id: string; payload: LeaveDecisionPayload }, { practitioner_facility_assignment: string }>(({ id, payload }) => practitionersApiService.rejectLeave(id, payload), "Leave request rejected.");
export const useCancelLeaveMutation = createMutation<{ id: string; payload: LeaveCancellationPayload }, { practitioner_facility_assignment: string }>(({ id, payload }) => practitionersApiService.cancelLeave(id, payload), "Leave request cancelled.");
