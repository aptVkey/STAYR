import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "lime" | "ink" | "outline" | "outline-ink";
export type ButtonSize = "md" | "lg";

const base =
  "group/btn relative inline-flex shrink-0 items-center justify-between gap-4 rounded-full font-medium tracking-[-0.01em] transition-[background-color,border-color,color,transform] duration-300 ease-(--ease-expo) active:scale-[0.98] disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  lime: "bg-lime text-ink hover:bg-paper",
  ink: "bg-ink text-paper hover:bg-surface-2",
  outline:
    "border border-paper/25 text-paper hover:border-paper/70 hover:bg-paper/5",
  "outline-ink":
    "border border-ink/20 text-ink hover:border-ink/60 hover:bg-ink/[0.03]",
};

const iconVariants: Record<ButtonVariant, string> = {
  lime: "bg-ink text-lime",
  ink: "bg-lime text-ink",
  outline: "bg-paper/10 text-paper",
  "outline-ink": "bg-ink text-paper",
};

const sizes: Record<ButtonSize, { root: string; icon: string }> = {
  md: { root: "h-12 pl-5 pr-1.5 text-[0.9375rem]", icon: "size-9" },
  lg: { root: "h-14 pl-7 pr-2 text-base", icon: "size-10" },
};

export function buttonClass(
  variant: ButtonVariant = "lime",
  size: ButtonSize = "lg",
  className?: string,
) {
  return cn(base, variants[variant], sizes[size].root, className);
}

/** The label + rotating arrow used inside every button. */
export function ButtonInner({
  children,
  variant = "lime",
  size = "lg",
  icon,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}) {
  return (
    <>
      <span className="whitespace-nowrap">{children}</span>
      <span
        aria-hidden
        className={cn(
          "grid place-items-center overflow-hidden rounded-full transition-transform duration-500 ease-(--ease-expo) group-hover/btn:rotate-45",
          iconVariants[variant],
          sizes[size].icon,
        )}
      >
        {icon ?? <ArrowUpRight className="size-[1.05rem]" strokeWidth={1.75} />}
      </span>
    </>
  );
}

type Shared = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

export function Button({
  variant = "lime",
  size = "lg",
  icon,
  className,
  children,
  ...props
}: Shared & ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={buttonClass(variant, size, className)}
      {...props}
    >
      <ButtonInner variant={variant} size={size} icon={icon}>
        {children}
      </ButtonInner>
    </button>
  );
}

export function ButtonLink({
  variant = "lime",
  size = "lg",
  icon,
  className,
  children,
  ...props
}: Shared & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      <ButtonInner variant={variant} size={size} icon={icon}>
        {children}
      </ButtonInner>
    </Link>
  );
}

/** Quiet inline link with an animated underline. */
export function textLinkClass(className?: string) {
  return cn(
    "group/link inline-flex items-center gap-2 font-medium underline decoration-current/30 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-300 hover:decoration-current",
    className,
  );
}
