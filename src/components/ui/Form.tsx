"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

/**
 * Accessible field wrapper: wires label, hint and error to the control via
 * a render prop so any input type gets the correct ARIA relationships.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (control: ControlProps) => ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-gold">
            *
          </span>
        )}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        ...(error ? { "aria-invalid": true as const } : {}),
      })}
      {hint && (
        <p id={hintId} className="text-sm text-mist">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const control =
  "w-full rounded-plaque border border-(--input-border) bg-charcoal/70 px-4 text-base text-white transition-colors duration-(--duration-fast) placeholder:text-mist hover:border-gold/70 focus-visible:border-gold focus-visible:outline-2 focus-visible:outline-offset-0 aria-invalid:border-danger [&_optgroup]:bg-midnight [&_option]:bg-midnight light:bg-charcoal";

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-32 py-3", className)} {...rest} />;
}

export function Select({ className, ...rest }: ComponentProps<"select">) {
  return <select className={cn(control, "h-12 appearance-auto", className)} {...rest} />;
}
