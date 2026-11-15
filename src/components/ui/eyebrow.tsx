import { cn } from "@/lib/cn";

/** Section label: optional index, a short rule, and the label in mono caps. */
export function Eyebrow({
  children,
  index,
  className,
  live = false,
}: {
  children: React.ReactNode;
  index?: string;
  className?: string;
  /** Show a pulsing lime dot instead of the rule. */
  live?: boolean;
}) {
  return (
    <p className={cn("type-eyebrow flex items-center gap-3", className)}>
      {index && <span className="opacity-50">{index}</span>}
      {live ? (
        <span className="relative grid size-2 place-items-center" aria-hidden>
          <span className="motion-decor ring-pulse absolute inset-0 rounded-full bg-lime" />
          <span className="size-1.5 rounded-full bg-lime" />
        </span>
      ) : (
        <span className="h-px w-8 bg-current opacity-30" aria-hidden />
      )}
      <span>{children}</span>
    </p>
  );
}
