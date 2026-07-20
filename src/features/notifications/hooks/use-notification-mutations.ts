"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { notificationsApiService } from "../api/notifications-api.service";
import type { CreateNotificationPayload, NotificationFactoryPayload, RegisterPushDevicePayload } from "../types/notification.types";

type FactoryKind =
  | "appointment_confirmation"
  | "appointment_reminder"
  | "appointment_rescheduled"
  | "appointment_cancelled"
  | "queue_joined"
  | "queue_updated"
  | "queue_called";

function friendlyNotificationError(error: unknown) {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();

  if (normalized.status === 403) return "You do not have permission to manage notifications.";
  if (normalized.status === null) return "Could not connect to the server. Please try again.";
  if (message.includes("provider") && message.includes("not configured")) return "Notification provider is not configured yet.";
  if (message.includes("cancelled")) return "Cancelled notifications cannot be sent.";
  if (message.includes("delivered")) return "This notification has already been delivered.";
  if (message.includes("failed")) return "This notification failed to send.";
  if (message.includes("permission")) return "You do not have permission to manage notifications.";
  return normalized.message || "Something went wrong while managing notifications.";
}

function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

export function useCreateNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotificationPayload) => notificationsApiService.createNotification(payload),
    onSuccess: () => {
      toast.success("Notification created.");
      invalidateNotifications(queryClient);
    },
    onError: (error) => toast.error(friendlyNotificationError(error)),
  });
}

export function useCancelNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => notificationsApiService.cancelNotification(id, reason),
    onSuccess: () => {
      toast.success("Notification cancelled.");
      invalidateNotifications(queryClient);
    },
    onError: (error) => toast.error(friendlyNotificationError(error)),
  });
}

export function useSendNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApiService.sendNotification(id),
    onSuccess: (notification) => {
      toast[notification.status === "failed" ? "error" : "success"](
        notification.status === "failed" ? "Notification delivery failed." : "Notification sent.",
      );
      invalidateNotifications(queryClient);
    },
    onError: (error) => toast.error(friendlyNotificationError(error)),
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApiService.markNotificationRead(id),
    onSuccess: () => {
      toast.success("Notification marked as read.");
      invalidateNotifications(queryClient);
    },
    onError: (error) => toast.error(friendlyNotificationError(error)),
  });
}

export function useCreateFactoryNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, payload }: { kind: FactoryKind; payload: NotificationFactoryPayload }) => {
      const factory = {
        appointment_confirmation: notificationsApiService.createAppointmentConfirmation.bind(notificationsApiService),
        appointment_reminder: notificationsApiService.createAppointmentReminder.bind(notificationsApiService),
        appointment_rescheduled: notificationsApiService.createAppointmentRescheduled.bind(notificationsApiService),
        appointment_cancelled: notificationsApiService.createAppointmentCancelled.bind(notificationsApiService),
        queue_joined: notificationsApiService.createQueueJoined.bind(notificationsApiService),
        queue_updated: notificationsApiService.createQueueUpdated.bind(notificationsApiService),
        queue_called: notificationsApiService.createQueueCalled.bind(notificationsApiService),
      }[kind];
      return factory(payload);
    },
    onSuccess: () => {
      toast.success("Factory notification created.");
      invalidateNotifications(queryClient);
    },
    onError: (error) => toast.error(friendlyNotificationError(error)),
  });
}

export function useRegisterPushDeviceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPushDevicePayload) => notificationsApiService.registerPushDevice(payload),
    onSuccess: () => {
      toast.success("Push device registered.");
      invalidateNotifications(queryClient);
    },
    onError: (error) => toast.error(friendlyNotificationError(error)),
  });
}

export function useRevokePushDeviceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApiService.revokePushDevice(id),
    onSuccess: () => {
      toast.success("Push device revoked.");
      invalidateNotifications(queryClient);
    },
    onError: (error) => toast.error(friendlyNotificationError(error)),
  });
}

export function useDeactivatePushDeviceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApiService.deactivatePushDevice(id),
    onSuccess: () => {
      toast.success("Push device deactivated.");
      invalidateNotifications(queryClient);
    },
    onError: (error) => toast.error(friendlyNotificationError(error)),
  });
}

export function useUpdatePushDeviceLastSeenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApiService.updatePushDeviceLastSeen(id),
    onSuccess: () => {
      toast.success("Push device last seen updated.");
      invalidateNotifications(queryClient);
    },
    onError: (error) => toast.error(friendlyNotificationError(error)),
  });
}
