"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { FormDialog } from "./form-dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  isSubmitting,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <FormDialog open={open} title={title} description={description} onOpenChange={(next) => !next && onClose()}>
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl bg-danger/10 p-4 text-danger">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <p className="text-sm">{description}</p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="danger" onClick={() => void onConfirm()} disabled={isSubmitting}>
            {isSubmitting ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
