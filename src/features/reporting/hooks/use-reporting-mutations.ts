"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { reportingApiService } from "../api/reporting-api.service";
import type { CreateReportExportPayload } from "../types/reporting.types";

function getReportingFriendlyError(error: unknown): string {
  const normalized = normalizeApiError(error);
  const message = normalized.message.toLowerCase();

  if (normalized.status === 403) return "You do not have permission to access this report.";
  if (message.includes("date_to must be")) return "End date cannot be before start date.";
  if (message.includes("not ready") || message.includes("pending")) return "This report is not ready for download yet.";
  if (message.includes("expired")) return "This report has expired. Please generate it again.";
  if (message.includes("failed")) return "Report generation failed. Please review the report details.";
  if (message.includes("file")) return "Could not prepare the report file.";
  if (normalized.status === null) return "Could not connect to the server. Please try again.";
  return normalized.message || "Something went wrong. Please try again.";
}

function invalidateReportingQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.reporting.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export function useCreateReportExportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReportExportPayload) => reportingApiService.createReportExport(payload),
    onSuccess: () => {
      toast.success("Report export request created.");
      invalidateReportingQueries(queryClient);
    },
    onError: (error) => toast.error(getReportingFriendlyError(error)),
  });
}

export function useGenerateReportExportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportingApiService.generateReportExport(id),
    onSuccess: () => {
      toast.success("Report generation started.");
      invalidateReportingQueries(queryClient);
    },
    onError: (error) => toast.error(getReportingFriendlyError(error)),
  });
}

export function useCancelReportExportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportingApiService.cancelReportExport(id),
    onSuccess: () => {
      toast.success("Report export cancelled.");
      invalidateReportingQueries(queryClient);
    },
    onError: (error) => toast.error(getReportingFriendlyError(error)),
  });
}

export function useDownloadReportExportMutation() {
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await reportingApiService.downloadReportExport(id);
      triggerDownload(result.blob, result.filename);
      return result;
    },
    onSuccess: () => toast.success("Report download started."),
    onError: (error) => toast.error(getReportingFriendlyError(error)),
  });
}
