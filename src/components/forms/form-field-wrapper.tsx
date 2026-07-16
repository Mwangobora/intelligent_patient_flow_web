import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormFieldWrapperProps = {
  id: string;
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: ReactNode;
};

export function FormFieldWrapper({
  id,
  label,
  required = false,
  helperText,
  error,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      {children}
      <p className={cn("text-xs", error ? "text-danger" : "text-muted-foreground")}>
        {error ?? helperText ?? " "}
      </p>
    </div>
  );
}
