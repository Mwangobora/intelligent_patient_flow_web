"use client";

import { useState } from "react";

import { TextareaField } from "@/components/forms/textarea-field";
import { Button } from "@/components/ui/button";

import { FormDialog } from "./form-dialog";

type ActionDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  reasonLabel?: string;
  requireReason?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
};

export function ActionDialog({
  open,
  title,
  description,
  confirmLabel,
  reasonLabel = "Reason",
  requireReason,
  isSubmitting,
  onClose,
  onConfirm,
}: ActionDialogProps) {
  const [reason, setReason] = useState("");

  return (
    <FormDialog open={open} title={title} description={description} onOpenChange={(next) => !next && onClose()}>
      <div className="space-y-5">
        <TextareaField
          label={reasonLabel}
          required={requireReason}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button
            variant={requireReason ? "danger" : "primary"}
            disabled={isSubmitting || (requireReason && !reason.trim())}
            onClick={() => void onConfirm(reason)}
          >
            {isSubmitting ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
