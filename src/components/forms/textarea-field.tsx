import type { TextareaHTMLAttributes } from "react";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function TextareaField({
  id,
  label,
  required,
  error,
  helperText,
  className,
  ...props
}: TextareaFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <FormFieldWrapper
      id={fieldId}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <Textarea
        id={fieldId}
        className={cn(error ? "border-danger focus-visible:outline-danger" : "", className)}
        {...props}
      />
    </FormFieldWrapper>
  );
}
