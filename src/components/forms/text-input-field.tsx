import type { InputHTMLAttributes } from "react";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TextInputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function TextInputField({
  id,
  label,
  required,
  error,
  helperText,
  className,
  ...props
}: TextInputFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <FormFieldWrapper
      id={fieldId}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <Input
        id={fieldId}
        className={cn(error ? "border-danger focus-visible:outline-danger" : "", className)}
        {...props}
      />
    </FormFieldWrapper>
  );
}
