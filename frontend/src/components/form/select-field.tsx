"use client";

import type { ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: ReactNode;
}

interface SelectFieldProps<T extends FieldValues, TTransformed extends FieldValues = T> {
  control: Control<T, unknown, TTransformed>;
  name: FieldPath<T>;
  label: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  description?: ReactNode;
  disabled?: boolean;
}

/** Single-value select bound to react-hook-form. */
export function SelectField<T extends FieldValues, TTransformed extends FieldValues = T>({
  control,
  name,
  label,
  options,
  placeholder = "Select...",
  description,
  disabled,
}: SelectFieldProps<T, TTransformed>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select
            items={options}
            value={field.value ?? null}
            onValueChange={(value) => field.onChange(value ?? "")}
            disabled={disabled}
          >
            <SelectTrigger id={name} className="w-full" aria-invalid={fieldState.invalid} onBlur={field.onBlur}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
