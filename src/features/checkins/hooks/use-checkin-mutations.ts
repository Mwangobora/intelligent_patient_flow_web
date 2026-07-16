"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { checkinsApiService } from "../api/checkins-api.service";
import type {
  AppointmentCheckinPayload,
  CheckinRecord,
  CheckinTokenRecord,
  ConsumeCheckinTokenPayload,
  IssueCheckinTokenPayload,
  IssuedCheckinTokenRecord,
  RevokeCheckinTokenPayload,
  VoidCheckinPayload,
  WalkinCheckinPayload,
} from "../types/checkin.types";

function getCheckinFriendlyError(error: unknown): string {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();

  if (normalized.status === 403) return "You do not have permission to perform this action.";
  if (message.includes("already has a non-voided check-in")) return "This appointment has already been checked in.";
  if (message.includes("status is not eligible")) return "This appointment is not eligible for check-in.";
  if (message.includes("valid check-in token not found")) return "This QR code is invalid or expired.";
  if (message.includes("token has expired")) return "This QR code is invalid or expired.";
  if (message.includes("token has already been used")) return "This QR code has already been used.";
  if (message.includes("token has been revoked")) return "This QR code has been revoked.";
  if (message.includes("walk-in specialty must accept walk-ins")) return "Walk-ins are not accepted for this service.";
  if (message.includes("walk-in specialty must belong")) return "Selected walk-in service does not belong to this facility.";
  if (message.includes("already voided")) return "This check-in has already been voided.";
  if (message.includes("used check-in token cannot be revoked")) return "Used QR tokens cannot be revoked.";
  if (message.includes("already revoked")) return "This QR token has already been revoked.";
  if (normalized.status === null) return "Could not connect to the server. Please try again.";
  return normalized.message || "Something went wrong. Please try again.";
}

function invalidateCheckinQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.checkins.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.queueing.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

function createMutation<TPayload, TResult>(
  mutationFn: (payload: TPayload) => Promise<TResult>,
  successMessage: string,
) {
  return function useCheckinMutation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn,
      onSuccess: () => {
        toast.success(successMessage);
        invalidateCheckinQueries(queryClient);
      },
      onError: (error) => {
        toast.error(getCheckinFriendlyError(error));
      },
    });
  };
}

export const useCreateAppointmentCheckinMutation = createMutation<AppointmentCheckinPayload, CheckinRecord>(
  (payload) => checkinsApiService.createAppointmentCheckin(payload),
  "Appointment check-in completed.",
);

export const useCreateWalkinCheckinMutation = createMutation<WalkinCheckinPayload, CheckinRecord>(
  (payload) => checkinsApiService.createWalkinCheckin(payload),
  "Walk-in check-in completed.",
);

export const useVoidCheckinMutation = createMutation<{ checkinId: string; payload: VoidCheckinPayload }, CheckinRecord>(
  ({ checkinId, payload }) => checkinsApiService.voidCheckin(checkinId, payload),
  "Check-in voided successfully.",
);

export const useIssueCheckinTokenMutation = createMutation<IssueCheckinTokenPayload, IssuedCheckinTokenRecord>(
  (payload) => checkinsApiService.issueCheckinToken(payload),
  "Check-in token issued.",
);

export const useConsumeCheckinTokenMutation = createMutation<ConsumeCheckinTokenPayload, CheckinRecord>(
  (payload) => checkinsApiService.consumeCheckinToken(payload),
  "QR token consumed and patient checked in.",
);

export const useRevokeCheckinTokenMutation = createMutation<{ tokenId: string; payload: RevokeCheckinTokenPayload }, CheckinTokenRecord>(
  ({ tokenId, payload }) => checkinsApiService.revokeCheckinToken(tokenId, payload),
  "Check-in token revoked.",
);
