"use client";

import { ArrowRight, ArrowUpRight, Check, CircleAlert, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { BookingEmbed } from "@/components/funnel/booking-embed";
import { OptinTrigger } from "@/components/funnel/optin-button";
import { textLinkClass } from "@/components/ui/button";
import { Checkbox, Field, SelectInput, TextInput } from "@/components/ui/field";
import { EASE } from "@/components/ui/reveal";
import { content } from "@/content";
import { adContext, newEventId, track } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import {
  hasErrors,
  validateApplication,
  type ApplicationField,
  type ApplicationInput,
  type Errors,
} from "@/lib/validation";

const t = content.apply;
const optin = content.optin;

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: ApplicationInput = {
  fullName: "",
  email: "",
  company: "",
  website: "",
  country: "",
  businessType: "",
  properties: "",
  budget: "",
  objective: "",
  message: "",
  marketingConsent: false,
};

const ORDER: ApplicationField[] = [
  "fullName",
  "email",
  "company",
  "website",
  "country",
  "businessType",
  "properties",
  "budget",
  "objective",
  "message",
];

function trimmed(values: ApplicationInput): ApplicationInput {
  const out = { ...values };
  for (const key of ORDER) out[key] = values[key].trim();
  return out;
}

export function ApplicationForm() {
  const uid = useId();
  const started = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState<ApplicationInput>(EMPTY);
  const [errors, setErrors] = useState<Errors<ApplicationField>>({});
  const [touched, setTouched] = useState<Partial<Record<ApplicationField, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [hp, setHp] = useState("");

  const busy = status === "submitting";
  const id = (field: string) => `${uid}-${field}`;
  const message = (field: ApplicationField) => {
    const code = errors[field];
    return code ? content.validation[code] : undefined;
  };

  const onStart = () => {
    if (started.current) return;
    started.current = true;
    track("application_start", {}, { once: true });
  };

  const setField = (field: ApplicationField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) {
      setErrors((current) => ({
        ...current,
        [field]: validateApplication(trimmed(next))[field],
      }));
    }
  };

  const onBlur = (field: ApplicationField) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({
      ...current,
      [field]: validateApplication(trimmed(values))[field],
    }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    const input = trimmed(values);
    const found = validateApplication(input);
    setErrors(found);
    setTouched(Object.fromEntries(ORDER.map((key) => [key, true])));
    if (hasErrors(found)) {
      const firstInvalid = ORDER.find((key) => found[key]);
      if (firstInvalid) document.getElementById(id(firstInvalid))?.focus();
      return;
    }

    setStatus("submitting");
    setFormError(null);

    const eventId = newEventId();
    try {
      const response = await fetch("/api/application", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...input,
          hp,
          placement: "apply_page",
          locale: "en",
          attribution: getAttribution(),
          ad: adContext(eventId),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        mode?: string;
        fields?: Errors<ApplicationField>;
      };

      if (!response.ok || !data.ok) {
        if (data.error === "validation" && data.fields) setErrors(data.fields);
        setFormError(
          data.error === "not_configured"
            ? optin.errors.notConfigured
            : data.error === "rate_limited"
              ? optin.errors.rateLimited
              : optin.errors.generic,
        );
        setStatus("error");
        return;
      }

      // Categorical, non-identifying context only.
      track(
        "application_submit",
        {
          business_type: input.businessType,
          properties: input.properties,
          budget_range: input.budget,
        },
        { eventId },
      );
      setDevMode(data.mode === "local-dev");
      setStatus("success");
      window.requestAnimationFrame(() => {
        successRef.current?.focus();
        successRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    } catch {
      setFormError(optin.errors.network);
      setStatus("error");
    }
  };

  const text = (
    field: Exclude<ApplicationField, "businessType" | "properties" | "budget" | "objective" | "message">,
    props: React.ComponentProps<"input"> = {},
  ) => (
    <Field id={id(field)} label={t.fields[field].label} error={message(field)}>
      <TextInput
        id={id(field)}
        placeholder={t.fields[field].placeholder}
        value={values[field]}
        error={Boolean(errors[field])}
        disabled={busy}
        required
        onChange={(event) => setField(field, event.target.value)}
        onBlur={() => onBlur(field)}
        {...props}
      />
    </Field>
  );

  const select = (
    field: "businessType" | "properties" | "budget" | "objective",
    hint?: string,
  ) => (
    <Field id={id(field)} label={t.fields[field].label} error={message(field)} hint={hint}>
      <SelectInput
        id={id(field)}
        options={t.options[field]}
        placeholder={t.selectPlaceholder}
        value={values[field]}
        error={Boolean(errors[field])}
        disabled={busy}
        required
        onChange={(event) => {
          setField(field, event.target.value);
          setTouched((current) => ({ ...current, [field]: true }));
        }}
        onBlur={() => onBlur(field)}
      />
    </Field>
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "success" ? (
        <motion.div
          key="success"
          ref={successRef}
          tabIndex={-1}
          className="scroll-mt-28 outline-none"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="type-eyebrow flex items-center gap-3 text-lime">
            <span className="grid size-5 place-items-center rounded-full bg-lime text-ink">
              <Check className="size-3" strokeWidth={2.5} aria-hidden />
            </span>
            {t.success.eyebrow}
          </p>
          <h2 className="type-h2 mt-6">
            {t.success.headline[0]}
            <span className="accent-serif block text-lime">{t.success.headline[1]}</span>
          </h2>
          <p role="status" className="mt-5 max-w-[46ch] leading-relaxed text-paper/75">
            {t.success.body}
          </p>
          {devMode && (
            <p className="mt-5 rounded-md bg-lime/10 p-3 font-mono text-[0.75rem] leading-relaxed text-lime ring-1 ring-lime/25">
              {optin.devNotice}
            </p>
          )}
          <div className="mt-8">
            <BookingEmbed placement="apply_success" />
          </div>
          <OptinTrigger placement="apply_success" className={textLinkClass("mt-8 text-[0.9375rem]")}>
            {t.success.caseStudy}
            <ArrowUpRight className="size-4" aria-hidden />
          </OptinTrigger>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={onSubmit}
          onFocusCapture={onStart}
          noValidate
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
        >
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

          <fieldset className="grid gap-x-8 gap-y-4 sm:grid-cols-2" disabled={busy}>
            <legend className="type-eyebrow mb-6 flex w-full items-center gap-3 text-lime">
              01 <span className="h-px w-8 bg-lime/50" aria-hidden /> You
            </legend>
            {text("fullName", { autoComplete: "name" })}
            {text("email", {
              type: "email",
              inputMode: "email",
              autoComplete: "email",
              autoCapitalize: "none",
              spellCheck: false,
            })}
          </fieldset>

          <fieldset className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2" disabled={busy}>
            <legend className="type-eyebrow mb-6 flex w-full items-center gap-3 text-lime">
              02 <span className="h-px w-8 bg-lime/50" aria-hidden /> Your business
            </legend>
            {text("company", { autoComplete: "organization" })}
            {text("website", {
              inputMode: "url",
              autoComplete: "url",
              autoCapitalize: "none",
              spellCheck: false,
            })}
            {text("country", { autoComplete: "country-name", list: id("countries") })}
            <datalist id={id("countries")}>
              {t.options.countries.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
            {select("businessType")}
            {select("properties")}
          </fieldset>

          <fieldset className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2" disabled={busy}>
            <legend className="type-eyebrow mb-6 flex w-full items-center gap-3 text-lime">
              03 <span className="h-px w-8 bg-lime/50" aria-hidden /> Your objectives
            </legend>
            {select("budget", t.budgetNote)}
            {select("objective")}
            <Field
              id={id("message")}
              label={t.fields.message.label}
              optional={t.fields.message.optional}
              error={message("message")}
              className="sm:col-span-2"
            >
              <textarea
                id={id("message")}
                name={id("message")}
                rows={3}
                maxLength={2000}
                placeholder={t.fields.message.placeholder}
                value={values.message}
                aria-invalid={Boolean(errors.message) || undefined}
                aria-describedby={errors.message ? `${id("message")}-error` : undefined}
                onChange={(event) => setField("message", event.target.value)}
                onBlur={() => onBlur("message")}
                className="field-input resize-y"
              />
            </Field>
          </fieldset>

          <Checkbox
            id={id("marketing")}
            className="mt-4"
            checked={values.marketingConsent}
            disabled={busy}
            onChange={(event) =>
              setValues((current) => ({ ...current, marketingConsent: event.target.checked }))
            }
          >
            {t.consent}
          </Checkbox>

          <div aria-live="polite" className="mt-6">
            {formError && status === "error" && (
              <p className="mb-4 flex items-start gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger ring-1 ring-danger/25">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {formError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={busy}
              className="group/btn flex h-14 items-center justify-between gap-6 rounded-full bg-lime pl-7 pr-2 font-medium text-ink transition-colors duration-300 hover:bg-paper disabled:cursor-progress sm:min-w-[17rem]"
            >
              <span>{busy ? t.submitting : t.submit}</span>
              <span className="grid size-10 place-items-center rounded-full bg-ink text-lime" aria-hidden>
                {busy ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                )}
              </span>
            </button>
            <p className="max-w-[40ch] text-[0.75rem] leading-relaxed text-mute">
              {t.privacy.before}{" "}
              <Link
                href="/privacy"
                className="text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-paper"
              >
                {t.privacy.link}
              </Link>
              {t.privacy.after}
            </p>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
