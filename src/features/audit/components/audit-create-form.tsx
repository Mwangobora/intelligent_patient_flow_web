"use client";

import { useState } from "react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextareaField } from "@/components/forms/textarea-field";
import { TextInputField } from "@/components/forms/text-input-field";

import { auditLogCreateSchema } from "../schemas/audit.schemas";
import type { AuditLogCreatePayload, AuditOutcome } from "../types/audit.types";
import { sanitizeForDisplay } from "./audit-formatters";

type AuditCreateFormProps = {
  isSubmitting: boolean;
  onSubmit: (payload: AuditLogCreatePayload) => Promise<void>;
};

export function AuditCreateForm({ isSubmitting, onSubmit }: AuditCreateFormProps) {
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    actor_user_id: "",
    organization_id: "",
    facility_id: "",
    action: "",
    resource_type: "",
    resource_id: "",
    outcome: "success" as AuditOutcome,
    source: "admin" as const,
    metadata_json: "",
  });
  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setError("");
      const parsed = auditLogCreateSchema.safeParse(values);
      if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check the audit log form.");
      let metadata: Record<string, unknown> | null = null;
      if (parsed.data.metadata_json) {
        try {
          metadata = sanitizeForDisplay(JSON.parse(parsed.data.metadata_json)) as Record<string, unknown>;
        } catch {
          setError("Metadata must be valid JSON.");
          return;
        }
      }
      await onSubmit({
        actor_user_id: parsed.data.actor_user_id || null,
        organization_id: parsed.data.organization_id || null,
        facility_id: parsed.data.facility_id || null,
        action: parsed.data.action,
        resource_type: parsed.data.resource_type,
        resource_id: parsed.data.resource_id || null,
        outcome: parsed.data.outcome,
        source: parsed.data.source,
        metadata,
      });
      setValues({ actor_user_id: "", organization_id: "", facility_id: "", action: "", resource_type: "", resource_id: "", outcome: "success", source: "admin", metadata_json: "" });
    }}>
      <FormErrorAlert message={error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TextInputField label="Action" required value={values.action} onChange={(event) => update("action", event.target.value)} placeholder="admin.note" />
        <TextInputField label="Resource type" required value={values.resource_type} onChange={(event) => update("resource_type", event.target.value)} placeholder="facility" />
        <TextInputField label="Resource ID" value={values.resource_id} onChange={(event) => update("resource_id", event.target.value)} />
        <TextInputField label="Actor user ID" value={values.actor_user_id} onChange={(event) => update("actor_user_id", event.target.value)} />
        <TextInputField label="Organization ID" value={values.organization_id} onChange={(event) => update("organization_id", event.target.value)} />
        <TextInputField label="Facility ID" value={values.facility_id} onChange={(event) => update("facility_id", event.target.value)} />
        <SelectField
          label="Outcome"
          value={values.outcome}
          onChange={(event) => update("outcome", event.target.value)}
          options={[
            { label: "Success", value: "success" },
            { label: "Failure", value: "failure" },
            { label: "Denied", value: "denied" },
          ]}
        />
        <TextareaField label="Metadata JSON" value={values.metadata_json} onChange={(event) => update("metadata_json", event.target.value)} helperText="Sensitive keys are redacted before display and backend also sanitizes metadata." />
      </div>
      <SubmitButton label="Record manual audit log" loadingLabel="Recording..." isLoading={isSubmitting} />
    </form>
  );
}
