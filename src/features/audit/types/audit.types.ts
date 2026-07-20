import type { ISODateTime, UUID } from "@/types/common";

export type AuditOutcome = "success" | "failure" | "denied";
export type AuditSource = "web" | "mobile" | "api" | "system" | "admin";

export type SafeUserSummary = {
  id: UUID;
  email: string | null;
  first_name: string;
  last_name: string;
};

export type AuditLogRecord = {
  id: UUID;
  actor_user: UUID | null;
  actor_user_summary: SafeUserSummary | null;
  organization: UUID | null;
  organization_name: string | null;
  facility: UUID | null;
  facility_name: string | null;
  action: string;
  resource_type: string;
  resource_id: UUID | null;
  outcome: AuditOutcome | null;
  source: AuditSource;
  request_id: UUID | null;
  ip_address: string | null;
  user_agent: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  metadata: Record<string, unknown>;
  changes: Record<string, unknown>;
  occurred_at: ISODateTime;
  created_at: ISODateTime;
};

export type AuditLogListParams = {
  actor_user_id?: UUID;
  organization_id?: UUID;
  facility_id?: UUID;
  action?: string;
  resource_type?: string;
  resource_id?: UUID;
  outcome?: AuditOutcome;
  date_from?: string;
  date_to?: string;
  search?: string;
};

export type AuditLogCreatePayload = {
  actor_user_id?: UUID | null;
  organization_id?: UUID | null;
  facility_id?: UUID | null;
  action: string;
  resource_type: string;
  resource_id?: UUID | null;
  outcome: AuditOutcome;
  source?: AuditSource;
  request_id?: UUID | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
  changes?: Record<string, unknown> | null;
  occurred_at?: ISODateTime | null;
};

export type AuditSummary = {
  total_logs: number;
  success_count: number;
  failure_count: number;
  denied_count: number;
  top_actions: Array<{ action: string; count: number }>;
  recent_critical_events: Array<{
    id: UUID;
    action: string;
    resource_type: string;
    outcome: AuditOutcome | null;
    occurred_at: ISODateTime;
    metadata: Record<string, unknown>;
  }>;
  events_by_day: Array<{ date: string; count: number }>;
};

export type AuditPaginationState = {
  page: number;
  pageSize: number;
};
