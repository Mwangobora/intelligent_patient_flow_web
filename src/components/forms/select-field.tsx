import type { SelectHTMLAttributes } from "react";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import type { SelectOption } from "@/types/common";
import { cn } from "@/lib/utils";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
};

export function SelectField({
  id,
  label,
  options,
  required,
  error,
  helperText,
  className,
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <FormFieldWrapper
      id={fieldId}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <select
        id={fieldId}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          error ? "border-danger focus-visible:outline-danger" : "",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormFieldWrapper>
  );
}
