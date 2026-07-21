"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { patientsApiService } from "../api/patients-api.service";
import type {
  CreatePatientAddressPayload,
  CreatePatientIdentifierPayload,
  CreatePatientPayload,
  CreatePatientRelatedPersonPayload,
  CreateRelatedPersonContactPayload,
  UpdatePatientAddressPayload,
  UpdatePatientPayload,
  UpdatePatientRelatedPersonPayload,
} from "../types/patient.types";

function getPatientFriendlyError(error: unknown) {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();

  if (normalized.status === 403) return "You do not have permission to manage patients.";
  if (normalized.status === 404) return "Patient record was not found.";
  if (message.includes("identifier") && (message.includes("exists") || message.includes("duplicate"))) {
    return "A patient with this identifier already exists.";
  }
  if ((message.includes("phone") || message.includes("email")) && (message.includes("exists") || message.includes("already"))) {
    return "This contact is already used by another patient.";
  }
  if (message.includes("identifier type")) return "Please select a valid identifier type.";
  if (message.includes("network") || normalized.status === null) {
    return "Could not connect to the server. Please try again.";
  }
  return normalized.message || "Something went wrong. Please try again.";
}

function invalidatePatientQueries(queryClient: ReturnType<typeof useQueryClient>, patientId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.checkins.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.queueing.all });
  if (patientId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });
  }
}

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePatientPayload) => patientsApiService.createPatient(payload),
    onSuccess: (patient) => {
      toast.success("Patient created successfully.");
      invalidatePatientQueries(queryClient, patient.id);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useUpdatePatientMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePatientPayload) => patientsApiService.updatePatient(patientId!, payload),
    onSuccess: (patient) => {
      toast.success("Patient updated successfully.");
      invalidatePatientQueries(queryClient, patientId ?? patient.id);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useDeactivatePatientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => patientsApiService.deactivatePatient(patientId),
    onSuccess: (patient) => {
      toast.success("Patient deactivated sucessifully.");
      invalidatePatientQueries(queryClient, patient.id);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useCreatePatientIdentifierMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePatientIdentifierPayload) =>
      patientsApiService.createPatientIdentifier(patientId!, payload),
    onSuccess: () => {
      toast.success("Patient identifier added successifully.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useVerifyPatientIdentifierMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (identifierId: string) => patientsApiService.verifyPatientIdentifier(identifierId),
    onSuccess: () => {
      toast.success("Patient identifier verified.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useSetPrimaryPatientIdentifierMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (identifierId: string) => patientsApiService.setPrimaryPatientIdentifier(identifierId),
    onSuccess: () => {
      toast.success("Primary identifier updated successifully.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useDeactivatePatientIdentifierMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (identifierId: string) => patientsApiService.deactivatePatientIdentifier(identifierId),
    onSuccess: () => {
      toast.success("Patient identifier deactivated successifully.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useCreatePatientAddressMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePatientAddressPayload) =>
      patientsApiService.createPatientAddress(patientId!, payload),
    onSuccess: () => {
      toast.success("Address added successifully.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useUpdatePatientAddressMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePatientAddressPayload }) =>
      patientsApiService.updatePatientAddress(id, payload),
    onSuccess: () => {
      toast.success("Address updated successifully.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useSetPrimaryPatientAddressMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) => patientsApiService.setPrimaryPatientAddress(addressId),
    onSuccess: () => {
      toast.success("Primary address updated successifully.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useCreateRelatedPersonMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePatientRelatedPersonPayload) =>
      patientsApiService.createPatientRelatedPerson(patientId!, payload),
    onSuccess: () => {
      toast.success("Related person added successifully.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useUpdateRelatedPersonMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePatientRelatedPersonPayload }) =>
      patientsApiService.updatePatientRelatedPerson(id, payload),
    onSuccess: () => {
      toast.success("Related person updated successifully.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useDeactivateRelatedPersonMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (relatedPersonId: string) => patientsApiService.deactivatePatientRelatedPerson(relatedPersonId),
    onSuccess: () => {
      toast.success("Related person deactivated.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useCreateRelatedPersonContactMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      relatedPersonId,
      payload,
    }: {
      relatedPersonId: string;
      payload: CreateRelatedPersonContactPayload;
    }) => patientsApiService.createRelatedPersonContact(relatedPersonId, payload),
    onSuccess: () => {
      toast.success("Related person contact added.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useVerifyRelatedPersonContactMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => patientsApiService.verifyRelatedPersonContact(contactId),
    onSuccess: () => {
      toast.success("Related person contact verified.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useSetPrimaryRelatedPersonContactMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => patientsApiService.setPrimaryRelatedPersonContact(contactId),
    onSuccess: () => {
      toast.success("Primary contact updated successifuuly.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}

export function useDeactivateRelatedPersonContactMutation(patientId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => patientsApiService.deactivateRelatedPersonContact(contactId),
    onSuccess: () => {
      toast.success("Related person contact deactivated successifully.");
      invalidatePatientQueries(queryClient, patientId);
    },
    onError: (error) => toast.error(getPatientFriendlyError(error)),
  });
}
