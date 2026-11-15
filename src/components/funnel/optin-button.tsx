"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFunnel } from "@/components/providers/funnel-provider";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { track } from "@/lib/analytics";

/**
 * Any "Unlock the Case Study" call to action. Opens the shared opt-in modal
 * and records which placement was used.
 */
export function OptinButton({
  placement,
  children,
  variant = "lime",
  size = "lg",
  className,
  icon,
}: {
  placement: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
}) {
  const { openOptin } = useFunnel();
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      icon={icon}
      aria-haspopup="dialog"
      onClick={() => {
        if (placement === "hero") track("hero_cta_click", { cta: "unlock_case_study" });
        openOptin(placement);
      }}
    >
      {children}
    </Button>
  );
}

/** Unstyled trigger for custom surfaces (e.g. the video thumbnail). */
export function OptinTrigger({
  placement,
  children,
  ...props
}: { placement: string; children: ReactNode } & Omit<
  ComponentProps<"button">,
  "onClick" | "type"
>) {
  const { openOptin } = useFunnel();
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => openOptin(placement)}
      {...props}
    >
      {children}
    </button>
  );
}
