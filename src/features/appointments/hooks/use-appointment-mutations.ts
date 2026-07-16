"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { appointmentsApiService } from "../api/appointments-api.service";
import type {
  AssignPractitionerPayload,
  CancelAppointmentPayload,
  CreateAppointmentPayload,
  RescheduleAppointmentPayload,
  UpdateAppointmentPayload,
} from "../types/appointment.types";

function getAppointmentFriendlyError(error: unknown): string {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();

  if (normalized.status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (message.includes("overlapping")) {
    return "This patient or practitioner already has an appointment at this time.";
  }
  if (message.includes("slot is full")) {
    return "This appointment slot is already full.";
  }
  if (message.includes("slot is not bookable")) {
    return "This appointment slot is not available for booking.";
  }
  if (message.includes("specialty must belong") || message.includes("selected facility specialty")) {
    return "Selected service is not available at this facility.";
  }
  if (message.includes("network") || normalized.status === null) {
    return "Could not connect to the server. Please try again.";
  }
  return normalized.message || "Something went wrong. Please try again.";
}

function invalidateAppointmentQueries(queryClient: ReturnType<typeof useQueryClient>, appointmentId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
  if (appointmentId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(appointmentId) });
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.appointments.all, "status-history", appointmentId] });
  }
}

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentsApiService.createAppointment(payload),
    onSuccess: () => {
      toast.success("Appointment booked successfully.");
      invalidateAppointmentQueries(queryClient);
    },
    onError: (error) => {
      toast.error(getAppointmentFriendlyError(error));
    },
  });
}

export function useUpdateAppointmentMutation(appointmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAppointmentPayload) =>
      appointmentsApiService.updateAppointment(appointmentId!, payload),
    onSuccess: () => {
      toast.success("Appointment updated successfully.");
      invalidateAppointmentQueries(queryClient, appointmentId);
    },
    onError: (error) => {
      toast.error(getAppointmentFriendlyError(error));
    },
  });
}

export function useCancelAppointmentMutation(appointmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelAppointmentPayload) =>
      appointmentsApiService.cancelAppointment(appointmentId!, payload),
    onSuccess: () => {
      toast.success("Appointment cancelled successfully.");
      invalidateAppointmentQueries(queryClient, appointmentId);
    },
    onError: (error) => {
      toast.error(getAppointmentFriendlyError(error));
    },
  });
}

export function useRescheduleAppointmentMutation(appointmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RescheduleAppointmentPayload) =>
      appointmentsApiService.rescheduleAppointment(appointmentId!, payload),
    onSuccess: (appointment) => {
      toast.success("Appointment rescheduled successfully.");
      invalidateAppointmentQueries(queryClient, appointmentId);
      invalidateAppointmentQueries(queryClient, appointment.id);
    },
    onError: (error) => {
      toast.error(getAppointmentFriendlyError(error));
    },
  });
}

export function useAssignPractitionerMutation(appointmentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignPractitionerPayload) =>
      appointmentsApiService.assignPractitioner(appointmentId!, payload),
    onSuccess: () => {
      toast.success("Practitioner assignment updated.");
      invalidateAppointmentQueries(queryClient, appointmentId);
    },
    onError: (error) => {
      toast.error(getAppointmentFriendlyError(error));
    },
  });
}
