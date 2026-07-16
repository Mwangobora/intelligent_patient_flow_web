"use client";

import { useState } from "react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { TextareaField } from "@/components/forms/textarea-field";
import { Button } from "@/components/ui/button";

type ReasonActionDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  placeholder: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export function ReasonActionDialog({
  title,
  description,
  confirmLabel,
  placeholder,
  isSubmitting = false,
  onClose,
  onConfirm,
}: ReasonActionDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 space-y-4">
          <FormErrorAlert message={error} />
          <TextareaField
            label="Reason"
            required
            rows={4}
            value={reason}
            placeholder={placeholder}
            onChange={(event) => setReason(event.target.value)}
          />
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Keep record</Button>
            <Button
              variant="danger"
              disabled={isSubmitting}
              onClick={async () => {
                if (!reason.trim()) {
                  setError("Please provide a reason before continuing.");
                  return;
                }
                setError(null);
                await onConfirm(reason.trim());
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
