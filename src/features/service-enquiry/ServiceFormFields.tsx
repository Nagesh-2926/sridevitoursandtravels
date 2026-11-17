"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import type { ServiceId } from "@/config/services";
import { cn } from "@/lib/cn";
import {
  digitalServiceIds,
  busCategories,
  templeDestinations,
  travelClasses,
  type FieldErrors,
  type FieldSpec,
} from "./schema";
import type { ServiceModalCopy } from "./ServiceModal";

/** Renders a kind's field specs with shared, accessible primitives. */
export function ServiceFormFields({
  fields,
  values,
  errors,
  copy,
  today,
  onChange,
  disabled = false,
}: {
  fields: FieldSpec[];
  values: Record<string, string>;
  errors: FieldErrors;
  copy: ServiceModalCopy;
  today: string;
  onChange: (name: string, value: string) => void;
  disabled?: boolean;
}) {
  const { enquiry, services } = copy;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields
        .filter((field) => !field.visibleWhen || field.visibleWhen(values))
        .map((field) => {
          const label = enquiry.fields[field.name];
          const error = errors[field.name]
            ? enquiry.errors[errors[field.name]!]
            : undefined;
          const span = cn(!field.half && "sm:col-span-2");

          if (field.type === "radio") {
            return (
              <fieldset
                key={field.name}
                className={span}
                aria-describedby={error ? `${field.name}-error` : undefined}
              >
                <legend className="text-sm font-medium text-white">
                  {label}
                  <span aria-hidden="true" className="ml-1 text-gold">
                    *
                  </span>
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["oneWay", "roundTrip"] as const).map((option) => (
                    <label
                      key={option}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-plaque border border-(--input-border) bg-charcoal/50 px-4 text-sm text-white transition-colors hover:border-gold/70 has-checked:border-gold has-checked:bg-gold/12 has-checked:font-semibold has-checked:ring-1 has-checked:ring-gold/60 has-focus-visible:outline-2 has-focus-visible:outline-gold light:bg-charcoal"
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={option}
                        checked={values[field.name] === option}
                        disabled={disabled}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        className="size-4 accent-[var(--color-gold)] focus-visible:outline-none"
                      />
                      {enquiry.fields[option]}
                    </label>
                  ))}
                </div>
                {error && (
                  <p
                    id={`${field.name}-error`}
                    className="mt-2 text-sm font-medium text-danger"
                  >
                    {error}
                  </p>
                )}
              </fieldset>
            );
          }

          return (
            <div key={field.name} className={span}>
              <Field
                label={field.required ? label : `${label} (${enquiry.optional})`}
                required={field.required}
                error={error}
              >
                {(control) => {
                  const common = {
                    ...control,
                    name: field.name,
                    value: values[field.name] ?? "",
                    required: field.required,
                    disabled,
                    autoComplete: field.autoComplete ?? "off",
                  };
                  const set = (e: { target: { value: string } }) =>
                    onChange(field.name, e.target.value);
                  switch (field.type) {
                    case "textarea":
                      return (
                        <Textarea
                          {...common}
                          rows={field.required ? 4 : 2}
                          onChange={set}
                        />
                      );
                    case "select":
                      return (
                        <Select {...common} onChange={set}>
                          {field.name === "travelClass"
                            ? travelClasses.map((c) => (
                                <option key={c} value={c}>
                                  {enquiry.classes[c]}
                                </option>
                              ))
                            : field.name === "busCategory"
                              ? busCategories.map((c) => (
                                  <option key={c} value={c}>
                                    {enquiry.busCategories[c]}
                                  </option>
                                ))
                              : field.name === "temple"
                                ? templeDestinations.map((t) => (
                                    <option key={t} value={t}>
                                      {enquiry.temples[t]}
                                    </option>
                                  ))
                                : digitalServiceIds.map((id: ServiceId) => (
                                    <option key={id} value={id}>
                                      {services.items[id].title}
                                    </option>
                                  ))}
                        </Select>
                      );
                    case "date":
                      return (
                        <Input
                          {...common}
                          type="date"
                          min={
                            field.name === "returnDate"
                              ? values.departDate || today
                              : today
                          }
                          onChange={set}
                        />
                      );
                    case "number":
                      return (
                        <Input
                          {...common}
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={20}
                          onChange={set}
                        />
                      );
                    case "tel":
                      return (
                        <Input {...common} type="tel" inputMode="tel" onChange={set} />
                      );
                    case "email":
                      return (
                        <Input
                          {...common}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          onChange={set}
                        />
                      );
                    default:
                      return <Input {...common} type="text" onChange={set} />;
                  }
                }}
              </Field>
            </div>
          );
        })}
    </div>
  );
}
