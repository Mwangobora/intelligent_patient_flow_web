"use client";

import { useState } from "react";

import { TextareaField } from "@/components/forms/textarea-field";
import { Button } from "@/components/ui/button";

type AppointmentCancelDialogProps = {
  open: boolean;
  appointmentNumber?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export function AppointmentCancelDialog({
  open,
  appointmentNumber,
  isSubmitting = false,
  onClose,
  onConfirm,
}: AppointmentCancelDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    setReason("");
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (reason.trim().length < 3) {
      setError("Please provide a short cancellation reason.");
      return;
    }
    setError(null);
    await onConfirm(reason.trim());
    setReason("");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-danger">
            Cancel appointment
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            Cancel {appointmentNumber ?? "this appointment"}?
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            This action keeps the appointment history but marks the appointment as cancelled.
          </p>
        </div>

        <div className="mt-5">
          <TextareaField
            label="Cancellation reason"
            required
            rows={4}
            value={reason}
            error={error ?? undefined}
            helperText="Staff-side cancellation requires a reason."
            onChange={(event) => setReason(event.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Keep appointment
          </Button>
          <Button variant="danger" onClick={() => void handleConfirm()} disabled={isSubmitting}>
            Confirm cancellation
          </Button>
        </div>
      </div>
    </div>
  );
}
