import { cn } from "@/lib/cn";

/** STAYR wordmark. Typeset, so it inherits colour and scales with font-size. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-[0.14em] font-sans text-[1.375rem] font-semibold leading-none tracking-[-0.07em]",
        className,
      )}
      aria-label="STAYR"
      role="img"
    >
      <span aria-hidden>STAYR</span>
      <span
        aria-hidden
        className="inline-block size-[0.24em] translate-y-[-0.02em] rounded-full bg-lime"
      />
    </span>
  );
}
