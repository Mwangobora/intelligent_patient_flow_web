"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormSheetProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  side?: "right" | "bottom";
  onOpenChange: (open: boolean) => void;
};

export function FormSheet({
  open,
  title,
  description,
  children,
  side = "right",
  onOpenChange,
}: FormSheetProps) {
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
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close form"
        className="absolute inset-0 cursor-pointer bg-foreground/45"
        onClick={() => onOpenChange(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-sheet-title"
        className={cn(
          "absolute flex max-h-[100dvh] flex-col overflow-hidden border-border bg-card shadow-2xl",
          side === "right"
            ? "right-0 top-0 h-full w-full border-l sm:max-w-xl lg:max-w-2xl"
            : "bottom-0 left-0 right-0 max-h-[92dvh] rounded-t-2xl border-t",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 id="form-sheet-title" className="text-lg font-semibold text-foreground">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button variant="secondary" aria-label="Close form" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </section>
    </div>
  );
}
