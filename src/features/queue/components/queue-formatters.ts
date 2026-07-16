import { format, formatDistanceStrict, isValid, parseISO } from "date-fns";

import type {
  QueueEntryRecord,
  QueueEntryStatus,
  QueuePriorityLevel,
  QueueStatus,
} from "../types/queue.types";

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

export function formatQueueDate(value?: string | null) {
  const parsed = parseDate(value);
  return parsed ? format(parsed, "dd MMM yyyy") : "—";
}

export function formatQueueDateTime(value?: string | null) {
  const parsed = parseDate(value);
  return parsed ? format(parsed, "dd MMM yyyy, HH:mm") : "—";
}

export function formatWaitingTime(value?: string | null) {
  const parsed = parseDate(value);
  return parsed ? formatDistanceStrict(parsed, new Date()) : "—";
}

export function queueStatusVariant(status: QueueStatus): "success" | "warning" | "danger" | "info" | "neutral" {
  if (status === "open") return "success";
  if (status === "paused") return "warning";
  if (status === "closed" || status === "cancelled") return "danger";
  if (status === "draft") return "info";
  return "neutral";
}

export function queueEntryStatusVariant(
  status: QueueEntryStatus,
): "success" | "warning" | "danger" | "info" | "neutral" {
  if (status === "completed") return "success";
  if (status === "waiting" || status === "called") return "info";
  if (status === "skipped") return "warning";
  if (status === "cancelled" || status === "transferred") return "danger";
  if (status === "in_service") return "success";
  return "neutral";
}

export function queuePriorityTone(level: QueuePriorityLevel): "success" | "warning" | "danger" | "info" {
  if (level === 3) return "danger";
  if (level === 2) return "warning";
  if (level === 1) return "info";
  return "success";
}

export function queuePriorityLabel(level: QueuePriorityLevel) {
  if (level === 3) return "Emergency";
  if (level === 2) return "Urgent";
  if (level === 1) return "Priority";
  return "Normal";
}

export function sortQueueEntries(entries: QueueEntryRecord[]) {
  return [...entries].sort((left, right) => {
    if (right.priority_level !== left.priority_level) {
      return right.priority_level - left.priority_level;
    }
    if (left.joined_at !== right.joined_at) {
      return left.joined_at.localeCompare(right.joined_at);
    }
    return left.sequence_number - right.sequence_number;
  });
}
