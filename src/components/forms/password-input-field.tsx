"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function PasswordInputField({
  id,
  label,
  required,
  error,
  helperText,
  className,
  ...props
}: PasswordInputFieldProps) {
  const [visible, setVisible] = useState(false);
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <FormFieldWrapper
      id={fieldId}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <div className="relative">
        <Input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={cn(
            "pr-11",
            error ? "border-danger focus-visible:outline-danger" : "",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FormFieldWrapper>
  );
}
