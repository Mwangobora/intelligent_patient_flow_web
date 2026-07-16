"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { queueApiService } from "../api/queue-api.service";
import type {
  QueueCreatePayload,
  QueueEntryActionPayload,
  QueueEntryCancelPayload,
  QueueEntryCreatePayload,
  QueueEntryPriorityPayload,
  QueueStatusActionPayload,
  QueueTransferPayload,
} from "../types/queue.types";

function getQueueFriendlyError(error: unknown): string {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();

  if (normalized.status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (message.includes("already exists")) {
    return "A queue already exists for this service point and date.";
  }
  if (message.includes("closed") || message.includes("cannot accept")) {
    return "This queue is closed and cannot accept new patients.";
  }
  if (message.includes("already in this queue") || message.includes("same check-in cannot")) {
    return "This patient is already in this queue.";
  }
  if (message.includes("only waiting") || message.includes("not allowed") || message.includes("cannot be")) {
    return "This action is not allowed for the current queue status.";
  }
  if (message.includes("priority") && message.includes("reason")) {
    return "Please provide a reason for the selected priority level.";
  }
  if (message.includes("network") || normalized.status === null) {
    return "Could not connect to the server. Please try again.";
  }
  return normalized.message || "Something went wrong. Please try again.";
}

function invalidateQueueQueries(queryClient: ReturnType<typeof useQueryClient>, queueId?: string, entryId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.queueing.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  if (queueId) {
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.queueing.all, "queue", queueId] });
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.queueing.all, "next-entry", queueId] });
  }
  if (entryId) {
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.queueing.all, "entry", entryId] });
    void queryClient.invalidateQueries({ queryKey: [...queryKeys.queueing.all, "events", entryId] });
  }
}

function createQueueMutation<TPayload, TResult>(
  mutationFn: (payload: TPayload) => Promise<TResult>,
  successMessage: string,
  onSuccessExtra?: (result: TResult, queryClient: ReturnType<typeof useQueryClient>) => void,
) {
  return function useQueueMutation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn,
      onSuccess: (result) => {
        toast.success(successMessage);
        invalidateQueueQueries(queryClient);
        onSuccessExtra?.(result, queryClient);
      },
      onError: (error) => {
        toast.error(getQueueFriendlyError(error));
      },
    });
  };
}

export const useCreateQueueMutation = createQueueMutation<QueueCreatePayload, { id: string }>(
  (payload) => queueApiService.createQueue(payload),
  "Queue created successfully.",
);

export const useOpenQueueMutation = createQueueMutation<
  { queueId: string; payload?: QueueStatusActionPayload },
  { id: string }
>(({ queueId, payload }) => queueApiService.openQueue(queueId, payload), "Queue opened.");

export const usePauseQueueMutation = createQueueMutation<
  { queueId: string; payload?: QueueStatusActionPayload },
  { id: string }
>(({ queueId, payload }) => queueApiService.pauseQueue(queueId, payload), "Queue paused.");

export const useResumeQueueMutation = createQueueMutation<{ queueId: string }, { id: string }>(
  ({ queueId }) => queueApiService.resumeQueue(queueId),
  "Queue resumed.",
);

export const useCloseQueueMutation = createQueueMutation<
  { queueId: string; payload?: QueueStatusActionPayload },
  { id: string }
>(({ queueId, payload }) => queueApiService.closeQueue(queueId, payload), "Queue closed.");

export const useCancelQueueMutation = createQueueMutation<{ queueId: string }, { id: string }>(
  ({ queueId }) => queueApiService.cancelQueue(queueId),
  "Queue cancelled.",
);

export const useCreateQueueEntryMutation = createQueueMutation<QueueEntryCreatePayload, { id: string; queue: string }>(
  (payload) => queueApiService.createQueueEntry(payload),
  "Patient added to queue.",
  (result, queryClient) => invalidateQueueQueries(queryClient, result.queue, result.id),
);

export const useCallQueueEntryMutation = createQueueMutation<
  { entryId: string; payload?: QueueEntryActionPayload },
  { id: string; queue: string }
>(({ entryId, payload }) => queueApiService.callQueueEntry(entryId, payload), "Patient called.");

export const useRecallQueueEntryMutation = createQueueMutation<
  { entryId: string; payload?: QueueEntryActionPayload },
  { id: string; queue: string }
>(({ entryId, payload }) => queueApiService.recallQueueEntry(entryId, payload), "Patient recalled.");

export const useSkipQueueEntryMutation = createQueueMutation<
  { entryId: string; payload?: QueueEntryActionPayload },
  { id: string; queue: string }
>(({ entryId, payload }) => queueApiService.skipQueueEntry(entryId, payload), "Queue entry skipped.");

export const useStartServiceMutation = createQueueMutation<
  { entryId: string; payload?: QueueEntryActionPayload },
  { id: string; queue: string }
>(({ entryId, payload }) => queueApiService.startService(entryId, payload), "Service started.");

export const useCompleteServiceMutation = createQueueMutation<
  { entryId: string; payload?: QueueEntryActionPayload },
  { id: string; queue: string }
>(({ entryId, payload }) => queueApiService.completeService(entryId, payload), "Service completed.");

export const useCancelQueueEntryMutation = createQueueMutation<
  { entryId: string; payload: QueueEntryCancelPayload },
  { id: string; queue: string }
>(({ entryId, payload }) => queueApiService.cancelQueueEntry(entryId, payload), "Queue entry cancelled.");

export const useChangePriorityMutation = createQueueMutation<
  { entryId: string; payload: QueueEntryPriorityPayload },
  { id: string; queue: string }
>(({ entryId, payload }) => queueApiService.changePriority(entryId, payload), "Queue priority updated.");

export const useTransferQueueEntryMutation = createQueueMutation<
  { entryId: string; payload: QueueTransferPayload },
  { id: string }
>(({ entryId, payload }) => queueApiService.transferQueueEntry(entryId, payload), "Queue entry transferred.");
