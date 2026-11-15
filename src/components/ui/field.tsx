"use client";

import { CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Form field shell: label, optional tag, control and an accessible error.
 * The control is passed as children and must use the `id` given here plus
 * `aria-invalid` / `aria-describedby={`${id}-error`}` when `error` is set.
 */
export function Field({
  id,
  label,
  optional,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  optional?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label
        htmlFor={id}
        className="type-eyebrow flex items-center justify-between gap-3 opacity-70"
      >
        <span>{label}</span>
        {optional && <span className="opacity-60">{optional}</span>}
      </label>
      {children}
      <div className="min-h-5 pt-1.5 text-[0.8125rem] leading-tight">
        {error ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-danger"
          >
            <CircleAlert className="size-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        ) : hint ? (
          <p className="opacity-55">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function TextInput({
  id,
  error,
  className,
  ...props
}: { id: string; error?: boolean } & ComponentProps<"input">) {
  return (
    <input
      id={id}
      name={id}
      aria-invalid={error || undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn("field-input", className)}
      {...props}
    />
  );
}

export function SelectInput({
  id,
  error,
  options,
  placeholder,
  className,
  ...props
}: {
  id: string;
  error?: boolean;
  options: readonly string[];
  placeholder: string;
} & ComponentProps<"select">) {
  return (
    <select
      id={id}
      name={id}
      aria-invalid={error || undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn("field-input", className)}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

/** Square checkbox with a custom tick, for optional consent. */
export function Checkbox({
  id,
  children,
  className,
  ...props
}: { id: string; children: ReactNode } & ComponentProps<"input">) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 text-[0.8125rem] leading-snug",
        className,
      )}
    >
      <span className="relative mt-0.5 grid size-[1.125rem] shrink-0 place-items-center">
        <input
          id={id}
          name={id}
          type="checkbox"
          className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-[3px] border border-current/35 transition-colors checked:border-(--field-accent,var(--color-lime)) checked:bg-(--field-accent,var(--color-lime))"
          {...props}
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none relative size-2.5 scale-0 text-(--field-check,var(--color-ink)) transition-transform duration-200 peer-checked:scale-100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M2 6.2l2.6 2.6L10 3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="opacity-70">{children}</span>
    </label>
  );
}
