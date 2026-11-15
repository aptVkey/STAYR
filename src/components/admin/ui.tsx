"use client";

import { ArrowDownRight, ArrowUpRight, LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[1.75rem] font-medium leading-none tracking-[-0.04em] sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-relaxed text-mute">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function Card({
  title,
  hint,
  action,
  children,
  className,
}: {
  title?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl bg-surface p-5 ring-1 ring-paper/8 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-[1.0625rem] font-medium tracking-[-0.02em]">{title}</h2>}
            {hint && <p className="mt-1 text-[0.8125rem] leading-snug text-mute">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Headline figure with a signed change against the previous period. */
export function StatTile({
  label,
  value,
  current,
  previous,
  hint,
}: {
  label: string;
  value: string;
  current?: number;
  previous?: number;
  hint?: string;
}) {
  let delta: ReactNode = null;
  if (current !== undefined && previous !== undefined) {
    if (previous > 0) {
      const change = (current - previous) / previous;
      const up = change >= 0;
      const Icon = up ? ArrowUpRight : ArrowDownRight;
      delta = (
        <span className={cn("inline-flex items-center gap-0.5", up ? "text-lime" : "text-danger")}>
          <Icon className="size-3.5" aria-hidden />
          {Math.abs(change * 100).toLocaleString("pt-PT", { maximumFractionDigits: 0 })}%
        </span>
      );
    } else if (current > 0) {
      delta = <span className="text-lime">novo</span>;
    }
  }
  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-paper/8 sm:p-5">
      <p className="text-[0.8125rem] text-mute">{label}</p>
      <p className="mt-2 text-[1.75rem] font-medium leading-none tracking-[-0.04em]">{value}</p>
      <p className="mt-2.5 flex min-h-4 items-center gap-1.5 text-[0.75rem] text-mute">
        {delta}
        {delta ? "vs. período anterior" : (hint ?? "")}
      </p>
    </div>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-surface p-1 ring-1 ring-paper/10">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-8 rounded-full px-3.5 text-[0.8125rem] transition-colors",
            option.value === value ? "bg-paper font-medium text-ink" : "text-mute hover:text-paper",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AdminButton({
  variant = "primary",
  busy,
  className,
  children,
  ...props
}: { variant?: "primary" | "ghost" | "danger"; busy?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || busy}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[0.875rem] font-medium transition-colors disabled:opacity-50",
        variant === "primary" && "bg-lime text-ink hover:bg-paper",
        variant === "ghost" && "text-paper ring-1 ring-paper/20 hover:ring-paper/60",
        variant === "danger" && "text-danger ring-1 ring-danger/40 hover:bg-danger/10",
        className,
      )}
    >
      {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

const inputClass =
  "h-10 w-full rounded-lg bg-ink px-3 text-[0.9375rem] text-paper ring-1 ring-paper/12 transition-shadow placeholder:text-mute/60 focus:outline-none focus:ring-2 focus:ring-lime disabled:opacity-50";

export function Labeled({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.8125rem] text-mute">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[0.75rem] leading-snug text-mute/80">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, className)} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select {...props} className={cn(inputClass, "appearance-none pr-8", className)}>
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6">
      <span>
        <span className="block text-[0.9375rem]">{label}</span>
        {description && <span className="mt-1 block text-[0.8125rem] leading-snug text-mute">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-full bg-paper/15 transition-colors checked:bg-lime"
        />
        <span className="pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-full bg-paper transition-transform peer-checked:translate-x-5 peer-checked:bg-ink" />
      </span>
    </label>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "lime" | "danger" | "blue";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[0.6875rem] font-medium",
        tone === "neutral" && "bg-paper/8 text-paper/80",
        tone === "lime" && "bg-lime/15 text-lime",
        tone === "danger" && "bg-danger/15 text-danger",
        tone === "blue" && "bg-[#3987e5]/20 text-[#9cc4f6]",
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-paper/15 px-5 py-9 text-center">
      <p className="text-[0.9375rem]">{title}</p>
      {body && <p className="mx-auto mt-1.5 max-w-[48ch] text-[0.8125rem] leading-relaxed text-mute">{body}</p>}
    </div>
  );
}

export function LoadState({ loading, error }: { loading: boolean; error: boolean }) {
  if (error) {
    return (
      <EmptyState
        title="Não foi possível carregar os dados."
        body="Verifica se a base de dados está acessível e volta a tentar."
      />
    );
  }
  if (loading) {
    return (
      <p className="flex items-center gap-2 py-10 text-[0.875rem] text-mute" role="status">
        <LoaderCircle className="size-4 animate-spin text-lime" aria-hidden />A carregar…
      </p>
    );
  }
  return null;
}
