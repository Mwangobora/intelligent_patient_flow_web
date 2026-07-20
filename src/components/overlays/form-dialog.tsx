"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type FormDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
};

export function FormDialog({ open, title, description, children, onOpenChange }: FormDialogProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(
        "[role='dialog'] input:not([type='hidden']), [role='dialog'] select, [role='dialog'] textarea",
      );
      target?.focus();
    }, 0);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button type="button" aria-label="Close dialog" className="absolute inset-0 cursor-pointer bg-foreground/45" onClick={() => onOpenChange(false)} />
      <section role="dialog" aria-modal="true" aria-labelledby="form-dialog-title" className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 id="form-dialog-title" className="text-lg font-semibold text-foreground">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button variant="secondary" aria-label="Close dialog" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
      </section>
    </div>
  );
}
