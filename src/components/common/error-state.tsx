import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
};

export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-danger/20 bg-card px-6 py-12 text-center">
      <div className="rounded-full bg-danger/10 p-3 text-danger">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {actionLabel || secondaryActionLabel ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {actionLabel ? (
            <Button variant="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
          {secondaryActionLabel ? (
            <Button onClick={onSecondaryAction}>{secondaryActionLabel}</Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
