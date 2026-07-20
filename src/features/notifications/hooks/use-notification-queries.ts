"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";
import { hasPermission } from "@/types/permissions";

import { notificationsApiService } from "../api/notifications-api.service";
import type { NotificationListParams, PushDeviceListParams } from "../types/notification.types";

type QueryOptions = { enabled?: boolean };

function scopeKey(params: Record<string, unknown>) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  );
}

function useNotificationsBase<TData>(key: readonly unknown[], queryFn: () => Promise<TData>, options?: QueryOptions) {
  return useQuery<TData, ApiError>({
    queryKey: key,
    queryFn,
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}

export function useNotificationsQuery(params: NotificationListParams = {}, options?: QueryOptions) {
  return useNotificationsBase(
    [...queryKeys.notifications.lists(), "notifications", scopeKey(params)],
    () => notificationsApiService.listNotifications(params),
    options,
  );
}

export function useNotificationDetailQuery(id?: string, options?: QueryOptions) {
  return useNotificationsBase(
    id ? queryKeys.notifications.detail(id) : [...queryKeys.notifications.all, "missing"],
    () => notificationsApiService.getNotification(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function usePushDevicesQuery(params: PushDeviceListParams = {}, options?: QueryOptions) {
  return useNotificationsBase(
    [...queryKeys.notifications.lists(), "push-devices", scopeKey(params)],
    () => notificationsApiService.listPushDevices(params),
    options,
  );
}

export function useNotificationWorkspace() {
  const userQuery = useCurrentUserQuery();
  const can = (permission: string) => hasPermission(userQuery.data, permission);

  return {
    ...userQuery,
    canViewNotifications: can("notifications_notification.view"),
    canCreateNotifications: can("notifications_notification.create"),
    canSendNotifications: can("notifications_notification.send"),
    canCancelNotifications: can("notifications_notification.cancel"),
    canViewDevices: can("notifications_device.view"),
    canManageDevices: can("notifications_device.manage"),
  };
}
