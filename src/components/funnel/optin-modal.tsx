"use client";

import { ArrowRight, Check, CircleAlert, LoaderCircle, Lock, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Checkbox, Field, TextInput } from "@/components/ui/field";
import { Logo } from "@/components/ui/logo";
import { EASE } from "@/components/ui/reveal";
import { images } from "@/config/images";
import { content } from "@/content";
import { ACCESS_HINT_KEY } from "@/lib/access";
import { adContext, newEventId, track } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import {
  hasErrors,
  validateOptin,
  type Errors,
  type OptinField,
  type OptinInput,
} from "@/lib/validation";

const t = content.optin;

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: OptinInput = {
  firstName: "",
  email: "",
  company: "",
  website: "",
  marketingConsent: false,
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function OptinModal({
  open,
  placement,
  onClose,
}: {
  open: boolean;
  placement: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const uid = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const [values, setValues] = useState<OptinInput>(EMPTY);
  const [errors, setErrors] = useState<Errors<OptinField>>({});
  const [touched, setTouched] = useState<Partial<Record<OptinField, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [hp, setHp] = useState("");

  const busy = status === "submitting" || status === "success";

  /* Focus management + scroll lock */
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 80);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      returnFocusRef.current?.focus?.();
    };
  }, [open]);

  const requestClose = useCallback(() => {
    if (status === "submitting") return;
    onClose();
  }, [onClose, status]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      requestClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const nodes = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((node) => node.offsetParent !== null);
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const setField = (field: OptinField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) {
      const fieldError = validateOptin(trimmed(next))[field];
      setErrors((current) => ({ ...current, [field]: fieldError }));
    }
  };

  const onBlur = (field: OptinField) => {
    setTouched((current) => ({ ...current, [field]: true }));
    const fieldError = validateOptin(trimmed(values))[field];
    setErrors((current) => ({ ...current, [field]: fieldError }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    const input = trimmed(values);
    const found = validateOptin(input);
    setErrors(found);
    setTouched({ firstName: true, email: true, company: true, website: true });
    if (hasErrors(found)) {
      const firstInvalid = (["firstName", "email", "company", "website"] as const).find(
        (key) => found[key],
      );
      if (firstInvalid) document.getElementById(`${uid}-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("submitting");
    setFormError(null);

    const eventId = newEventId();
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...input,
          hp,
          placement,
          locale: "en",
          attribution: getAttribution(),
          ad: adContext(eventId),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        mode?: string;
        fields?: Errors<OptinField>;
      };

      if (!response.ok || !data.ok) {
        if (data.error === "validation" && data.fields) setErrors(data.fields);
        setFormError(
          data.error === "not_configured"
            ? t.errors.notConfigured
            : data.error === "rate_limited"
              ? t.errors.rateLimited
              : t.errors.generic,
        );
        setStatus("error");
        return;
      }

      // No personal data in the event — only where the form was opened from.
      track(
        "optin_submit",
        { placement, marketing_opt_in: input.marketingConsent },
        { eventId },
      );
      try {
        window.localStorage.setItem(ACCESS_HINT_KEY, "1");
      } catch {
        /* ignore */
      }
      setDevMode(data.mode === "local-dev");
      setStatus("success");
      window.setTimeout(
        () => {
          router.push("/case-study");
          onClose();
          setValues(EMPTY);
          setTouched({});
          setStatus("idle");
        },
        data.mode === "local-dev" ? 1600 : 900,
      );
    } catch {
      setFormError(t.errors.network);
      setStatus("error");
    }
  };

  const message = (field: OptinField) => {
    const code = errors[field];
    return code ? content.validation[code] : undefined;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute inset-0 bg-ink-deep/80 backdrop-blur-md"
            onClick={requestClose}
            aria-hidden
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            aria-describedby={`${uid}-desc`}
            onKeyDown={onKeyDown}
            className="relative grid max-h-[94svh] w-full max-w-[62rem] overflow-hidden rounded-t-[1.25rem] bg-surface text-paper shadow-[0_40px_120px_-20px_rgb(0_0_0/0.7)] ring-1 ring-paper/10 sm:rounded-[1.25rem] md:grid-cols-[0.82fr_1fr]"
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {/* Editorial panel — desktop only */}
            <div className="relative hidden min-h-[36rem] flex-col justify-between overflow-hidden p-8 md:flex">
              <Image
                src={images.caseStudy.src}
                alt=""
                fill
                sizes="900px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/55 to-ink-deep/30" />
              <div className="relative flex items-center justify-between">
                <Logo className="text-xl" />
                <span className="type-eyebrow flex items-center gap-2 rounded-full bg-ink-deep/60 px-3 py-1.5 backdrop-blur-sm">
                  <Lock className="size-3" aria-hidden />
                  {content.caseStudy.thumb.meta}
                </span>
              </div>
              <div className="relative">
                <p className="type-eyebrow mb-4 text-lime">{t.eyebrow}</p>
                <p className="type-h3 max-w-[16ch] text-balance">
                  {content.caseStudy.thumb.title}
                </p>
                <ul className="mt-7 space-y-2.5 border-t border-paper/15 pt-6">
                  {t.points.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm text-paper/80">
                      <Check className="size-3.5 text-lime" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="relative overflow-y-auto overscroll-contain p-6 pb-8 sm:p-9 md:p-10">
              <button
                type="button"
                onClick={requestClose}
                className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-paper/5 text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper"
                aria-label={content.nav.close}
              >
                <X className="size-4" aria-hidden />
              </button>

              <p className="type-eyebrow mb-5 text-lime md:hidden">{t.eyebrow}</p>
              <h2
                id={`${uid}-title`}
                className="max-w-[14ch] text-[clamp(1.75rem,3.2vw,2.5rem)] font-medium leading-[1.02] tracking-[-0.04em]"
              >
                {t.headline}
              </h2>
              <p id={`${uid}-desc`} className="mt-4 max-w-[42ch] text-[0.9375rem] leading-relaxed text-mute">
                {t.body}
              </p>

              <form onSubmit={onSubmit} noValidate className="mt-8">
                {/* Honeypot — hidden from people and assistive tech */}
                <div className="absolute -left-[9999px] size-px overflow-hidden" aria-hidden>
                  <label>
                    Leave this field empty
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={hp}
                      onChange={(event) => setHp(event.target.value)}
                    />
                  </label>
                </div>

                <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <Field id={`${uid}-firstName`} label={t.fields.firstName.label} error={message("firstName")}>
                    <TextInput
                      ref={firstFieldRef}
                      id={`${uid}-firstName`}
                      autoComplete="given-name"
                      placeholder={t.fields.firstName.placeholder}
                      value={values.firstName}
                      error={Boolean(errors.firstName)}
                      disabled={busy}
                      required
                      onChange={(event) => setField("firstName", event.target.value)}
                      onBlur={() => onBlur("firstName")}
                    />
                  </Field>
                  <Field id={`${uid}-email`} label={t.fields.email.label} error={message("email")}>
                    <TextInput
                      id={`${uid}-email`}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder={t.fields.email.placeholder}
                      value={values.email}
                      error={Boolean(errors.email)}
                      disabled={busy}
                      required
                      onChange={(event) => setField("email", event.target.value)}
                      onBlur={() => onBlur("email")}
                    />
                  </Field>
                  <Field id={`${uid}-company`} label={t.fields.company.label} error={message("company")}>
                    <TextInput
                      id={`${uid}-company`}
                      autoComplete="organization"
                      placeholder={t.fields.company.placeholder}
                      value={values.company}
                      error={Boolean(errors.company)}
                      disabled={busy}
                      required
                      onChange={(event) => setField("company", event.target.value)}
                      onBlur={() => onBlur("company")}
                    />
                  </Field>
                  <Field
                    id={`${uid}-website`}
                    label={t.fields.website.label}
                    optional={t.fields.website.optional}
                    error={message("website")}
                  >
                    <TextInput
                      id={`${uid}-website`}
                      inputMode="url"
                      autoComplete="url"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder={t.fields.website.placeholder}
                      value={values.website}
                      error={Boolean(errors.website)}
                      disabled={busy}
                      onChange={(event) => setField("website", event.target.value)}
                      onBlur={() => onBlur("website")}
                    />
                  </Field>
                </div>

                <Checkbox
                  id={`${uid}-marketing`}
                  className="mt-3"
                  checked={values.marketingConsent}
                  disabled={busy}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      marketingConsent: event.target.checked,
                    }))
                  }
                >
                  {t.consent}
                </Checkbox>

                <div aria-live="polite" className="mt-5">
                  {formError && status === "error" && (
                    <p className="mb-4 flex items-start gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger ring-1 ring-danger/25">
                      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {formError}
                    </p>
                  )}
                  {status === "success" && devMode && (
                    <p className="mb-4 rounded-md bg-lime/10 p-3 font-mono text-[0.75rem] leading-relaxed text-lime ring-1 ring-lime/25">
                      {t.devNotice}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="group/btn relative flex h-14 w-full items-center justify-between rounded-full bg-lime pl-7 pr-2 font-medium text-ink transition-colors duration-300 hover:bg-paper disabled:cursor-progress"
                >
                  <span aria-live="polite">
                    {status === "submitting"
                      ? t.submitting
                      : status === "success"
                        ? t.success.title
                        : t.submit}
                  </span>
                  <span className="grid size-10 place-items-center rounded-full bg-ink text-lime" aria-hidden>
                    {status === "submitting" ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : status === "success" ? (
                      <Check className="size-4" />
                    ) : (
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                    )}
                  </span>
                </button>

                <p className="mt-4 text-[0.75rem] leading-relaxed text-mute">
                  {status === "success" ? (
                    t.success.body
                  ) : (
                    <>
                      {t.privacy.before}{" "}
                      <Link
                        href="/privacy"
                        onClick={onClose}
                        className="text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-paper"
                      >
                        {t.privacy.link}
                      </Link>
                      {t.privacy.after}
                    </>
                  )}
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function trimmed(values: OptinInput): OptinInput {
  return {
    firstName: values.firstName.trim(),
    email: values.email.trim(),
    company: values.company.trim(),
    website: values.website.trim(),
    marketingConsent: values.marketingConsent,
  };
}
