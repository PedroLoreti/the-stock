"use client";

import type { ComponentProps, ReactNode } from "react";
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
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps<T extends FieldValues, TTransformed extends FieldValues = T>
  extends Omit<ComponentProps<typeof Textarea>, "name" | "value" | "onChange" | "onBlur"> {
  /** `TTransformed` is the schema output when the form transforms values (e.g. string -> number). */
  control: Control<T, unknown, TTransformed>;
  name: FieldPath<T>;
  label: ReactNode;
  description?: ReactNode;
}

export function TextareaField<T extends FieldValues, TTransformed extends FieldValues = T>({
  control,
  name,
  label,
  description,
  id,
  ...textareaProps
}: TextareaFieldProps<T, TTransformed>) {
  const inputId = id ?? name;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          <Textarea
            id={inputId}
            aria-invalid={fieldState.invalid}
            {...textareaProps}
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
