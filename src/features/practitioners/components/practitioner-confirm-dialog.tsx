"use client";

import { useState } from "react";

import { TextareaField } from "@/components/forms/textarea-field";
import { Button } from "@/components/ui/button";

type PractitionerConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
};

export function PractitionerConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  requireReason = false,
  reasonLabel = "Reason",
  onClose,
  onConfirm,
}: PractitionerConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    setReason("");
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (requireReason && reason.trim().length < 3) {
      setError("Please provide a short reason.");
      return;
    }
    setError(null);
    await onConfirm(requireReason ? reason.trim() : undefined);
    setReason("");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-danger">Confirm action</p>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {requireReason ? (
          <div className="mt-5">
            <TextareaField label={reasonLabel} value={reason} error={error ?? undefined} rows={4} onChange={(event) => setReason(event.target.value)} />
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Back</Button>
          <Button variant="danger" onClick={() => void handleConfirm()} disabled={isSubmitting}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
