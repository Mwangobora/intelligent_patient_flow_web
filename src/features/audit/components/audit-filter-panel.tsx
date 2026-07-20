"use client";

import { Filter, Search } from "lucide-react";

import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";

import type { AuditLogListParams, AuditOutcome } from "../types/audit.types";

type AuditFilterPanelProps = {
  filters: AuditLogListParams;
  onChange: (filters: AuditLogListParams) => void;
};

export function AuditFilterPanel({ filters, onChange }: AuditFilterPanelProps) {
  const update = (key: keyof AuditLogListParams, value: string) =>
    onChange({ ...filters, [key]: value || undefined });

  return (
    <ResponsiveFilterPanel
      title="Audit filters"
      description="Filter by actor, scope, action, resource, outcome, date range, and sanitized metadata search."
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <TextInputField label="Search" value={filters.search ?? ""} onChange={(event) => update("search", event.target.value)} placeholder="Search action/resource/metadata" />
        <TextInputField label="Actor user ID" value={filters.actor_user_id ?? ""} onChange={(event) => update("actor_user_id", event.target.value)} />
        <TextInputField label="Organization ID" value={filters.organization_id ?? ""} onChange={(event) => update("organization_id", event.target.value)} />
        <TextInputField label="Facility ID" value={filters.facility_id ?? ""} onChange={(event) => update("facility_id", event.target.value)} />
        <TextInputField label="Action" value={filters.action ?? ""} onChange={(event) => update("action", event.target.value)} placeholder="e.g. user.login" />
        <TextInputField label="Resource type" value={filters.resource_type ?? ""} onChange={(event) => update("resource_type", event.target.value)} />
        <TextInputField label="Resource ID" value={filters.resource_id ?? ""} onChange={(event) => update("resource_id", event.target.value)} />
        <SelectField
          label="Outcome"
          value={filters.outcome ?? ""}
          onChange={(event) => update("outcome", event.target.value as AuditOutcome | "")}
          options={[
            { label: "All outcomes", value: "" },
            { label: "Success", value: "success" },
            { label: "Failure", value: "failure" },
            { label: "Denied", value: "denied" },
          ]}
        />
        <TextInputField label="Date from" type="date" value={filters.date_from ?? ""} onChange={(event) => update("date_from", event.target.value)} />
        <TextInputField label="Date to" type="date" value={filters.date_to ?? ""} onChange={(event) => update("date_to", event.target.value)} />
        <div className="hidden items-end gap-2 text-sm text-muted-foreground lg:flex">
          <Filter className="h-4 w-4" />
          <span>Backend filters only</span>
        </div>
        <div className="hidden items-end gap-2 text-sm text-muted-foreground lg:flex">
          <Search className="h-4 w-4" />
          <span>Search is debounced</span>
        </div>
      </div>
    </ResponsiveFilterPanel>
  );
}
