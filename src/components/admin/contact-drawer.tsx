"use client";

import { CalendarClock, FileText, Flag, MousePointerClick, StickyNote, Trash2, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  api,
  CHANNEL_LABEL,
  fmtDate,
  fmtDateTime,
  fmtEuro,
  STAGE_LABEL,
  useApi,
} from "@/components/admin/api";
import { AdminButton, Badge, Input, Labeled, LoadState, Select } from "@/components/admin/ui";

export type ContactRow = {
  id: string;
  email: string;
  name: string;
  company: string;
  website: string;
  country: string;
  businessType: string;
  properties: string;
  budget: string;
  objective: string;
  stage: string;
  dealValue: number;
  marketingConsent: boolean;
  adConsent: boolean;
  channel: string;
  source: string;
  campaign: string;
  attribution: Record<string, string>;
  createdAt: number;
  updatedAt: number;
  nextCall?: number | null;
  demo?: boolean;
};

type Activity = { id: number; ts: number; type: string; data: Record<string, unknown> };
type Call = { id: string; start: number; end: number; status: string; notes: string };
type Detail = { ok: boolean; contact: ContactRow; activities: Activity[]; bookings: Call[] };

const CALL_STATUS: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Realizada",
  no_show: "Não compareceu",
  cancelled: "Cancelada",
};

const ICON: Record<string, typeof Flag> = {
  optin: MousePointerClick,
  application: FileText,
  booking: CalendarClock,
  booking_status: CalendarClock,
  stage: Flag,
  note: StickyNote,
  created: UserPlus,
};

function describe(activity: Activity) {
  const d = activity.data;
  const s = (key: string) => (typeof d[key] === "string" ? (d[key] as string) : "");
  switch (activity.type) {
    case "optin":
      return { title: "Opt-in no case study", body: s("placement") ? `Origem: ${s("placement")}` : "" };
    case "application":
      return {
        title: "Candidatura a parceria",
        body: [s("budget"), s("objective"), s("message")].filter(Boolean).join(" · "),
      };
    case "booking":
      return {
        title: `Reunião agendada para ${fmtDateTime(Number(d.start))}`,
        body: s("notes"),
      };
    case "booking_status":
      return {
        title: `Reunião de ${fmtDate(Number(d.start))}: ${CALL_STATUS[s("to")] ?? s("to")}`,
        body: "",
      };
    case "stage":
      return {
        title: `Etapa: ${STAGE_LABEL[s("from")] ?? s("from")} → ${STAGE_LABEL[s("to")] ?? s("to")}`,
        body: s("by") === "system" ? "Automático" : "",
      };
    case "note":
      return { title: "Nota", body: s("text") };
    default:
      return { title: "Contacto criado manualmente", body: "" };
  }
}

/** Contact detail: edit, change stage, see the timeline, add notes. */
export function ContactDrawer({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { data, loading, error, reload } = useApi<Detail>(`/api/admin/contacts/${id}`);
  const panel = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Partial<ContactRow>>({});
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const contact = data ? { ...data.contact, ...draft } : null;
  const dirty = Object.keys(draft).length > 0;

  const save = async (patch: Partial<ContactRow>) => {
    setSaving(true);
    await api(`/api/admin/contacts/${id}`, { method: "PATCH", body: patch });
    setDraft({});
    setSaving(false);
    reload();
    onChanged();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    await api(`/api/admin/contacts/${id}/notes`, { method: "POST", body: { text: note } });
    setNote("");
    reload();
  };

  const remove = async () => {
    await api(`/api/admin/contacts/${id}`, { method: "DELETE" });
    onChanged();
    onClose();
  };

  const field = (key: "name" | "company" | "website" | "country", label: string) => (
    <Labeled label={label} htmlFor={`contact-${key}`}>
      <Input
        id={`contact-${key}`}
        value={String(contact?.[key] ?? "")}
        onChange={(event) => setDraft((d) => ({ ...d, [key]: event.target.value }))}
      />
    </Labeled>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-ink-deep/70" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Detalhe do contacto"
        style={{ outline: "none" }}
        className="relative flex h-full w-full max-w-[34rem] flex-col overflow-y-auto bg-surface text-paper shadow-2xl outline-none ring-1 ring-paper/10"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-paper/8 bg-surface px-6 py-5">
          <div className="min-w-0">
            <p className="truncate text-[1.25rem] font-medium tracking-[-0.03em]">
              {contact?.name || contact?.email || "Contacto"}
            </p>
            {contact && (
              <a href={`mailto:${contact.email}`} className="text-[0.8125rem] text-mute hover:text-paper">
                {contact.email}
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 shrink-0 place-items-center rounded-full text-mute ring-1 ring-paper/15 hover:text-paper"
          >
            <X className="size-4" />
          </button>
        </div>

        {!data || !contact ? (
          <div className="px-6">
            <LoadState loading={loading} error={error} />
          </div>
        ) : (
          <div className="flex flex-col gap-8 px-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <Labeled label="Etapa" htmlFor="contact-stage">
                <Select
                  id="contact-stage"
                  value={contact.stage}
                  onChange={(event) => save({ ...draft, stage: event.target.value })}
                >
                  {Object.entries(STAGE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Labeled>
              <Labeled label="Valor do negócio (€)" htmlFor="contact-deal">
                <Input
                  id="contact-deal"
                  type="number"
                  min={0}
                  step={500}
                  value={contact.dealValue || ""}
                  placeholder="0"
                  onChange={(event) => setDraft((d) => ({ ...d, dealValue: Number(event.target.value) || 0 }))}
                />
              </Labeled>
              {field("name", "Nome")}
              {field("company", "Hotel / empresa")}
              {field("website", "Website")}
              {field("country", "País")}
            </div>
            {dirty && (
              <div className="-mt-3 flex gap-2">
                <AdminButton busy={saving} onClick={() => save(draft)}>
                  Guardar alterações
                </AdminButton>
                <AdminButton variant="ghost" onClick={() => setDraft({})}>
                  Cancelar
                </AdminButton>
              </div>
            )}

            <section>
              <h3 className="mb-3 text-[0.8125rem] text-mute">Origem</h3>
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{CHANNEL_LABEL[contact.channel] ?? contact.channel}</Badge>
                {contact.source && <Badge>{contact.source}</Badge>}
                {contact.campaign && <Badge>{contact.campaign}</Badge>}
                {contact.marketingConsent && <Badge tone="lime">Aceita emails de marketing</Badge>}
              </div>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[0.8125rem]">
                <dt className="text-mute">Entrada</dt>
                <dd>{fmtDateTime(contact.createdAt)}</dd>
                {contact.attribution.landing_path && (
                  <>
                    <dt className="text-mute">Página de entrada</dt>
                    <dd className="truncate">{contact.attribution.landing_path}</dd>
                  </>
                )}
                {contact.attribution.referrer && (
                  <>
                    <dt className="text-mute">Referência</dt>
                    <dd className="truncate">{contact.attribution.referrer}</dd>
                  </>
                )}
                {contact.businessType && (
                  <>
                    <dt className="text-mute">Tipo de negócio</dt>
                    <dd>{contact.businessType}</dd>
                  </>
                )}
                {contact.properties && (
                  <>
                    <dt className="text-mute">Propriedades</dt>
                    <dd>{contact.properties}</dd>
                  </>
                )}
                {contact.budget && (
                  <>
                    <dt className="text-mute">Orçamento</dt>
                    <dd>{contact.budget}</dd>
                  </>
                )}
                {contact.objective && (
                  <>
                    <dt className="text-mute">Objetivo</dt>
                    <dd>{contact.objective}</dd>
                  </>
                )}
              </dl>
            </section>

            {data.bookings.length > 0 && (
              <section>
                <h3 className="mb-3 text-[0.8125rem] text-mute">Reuniões</h3>
                <ul className="flex flex-col gap-2">
                  {data.bookings.map((call) => (
                    <li
                      key={call.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-ink px-3.5 py-3 text-[0.875rem] ring-1 ring-paper/8"
                    >
                      <span>{fmtDateTime(call.start)}</span>
                      <Badge tone={call.status === "confirmed" ? "lime" : "neutral"}>
                        {CALL_STATUS[call.status] ?? call.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h3 className="mb-3 text-[0.8125rem] text-mute">Notas e histórico</h3>
              <div className="flex gap-2">
                <Input
                  value={note}
                  placeholder="Adicionar uma nota…"
                  aria-label="Nova nota"
                  onChange={(event) => setNote(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void addNote();
                  }}
                />
                <AdminButton variant="ghost" onClick={addNote} disabled={!note.trim()}>
                  Adicionar
                </AdminButton>
              </div>
              <ol className="mt-5 flex flex-col">
                {data.activities.map((activity) => {
                  const Icon = ICON[activity.type] ?? Flag;
                  const { title, body } = describe(activity);
                  return (
                    <li key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
                      <span className="absolute bottom-0 left-[0.8125rem] top-7 w-px bg-paper/10 last:hidden" aria-hidden />
                      <span className="grid size-[1.6875rem] shrink-0 place-items-center rounded-full bg-ink ring-1 ring-paper/12">
                        <Icon className="size-3.5 text-lime" strokeWidth={1.75} aria-hidden />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[0.875rem]">{title}</p>
                        {body && <p className="mt-1 whitespace-pre-wrap text-[0.8125rem] leading-relaxed text-paper/70">{body}</p>}
                        <p className="mt-1 text-[0.6875rem] text-mute">{fmtDateTime(activity.ts)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="border-t border-paper/8 pt-6">
              {confirmDelete ? (
                <div className="rounded-lg bg-danger/10 p-4 ring-1 ring-danger/25">
                  <p className="text-[0.875rem]">
                    Apagar este contacto, as suas reuniões e o histórico? Não pode ser desfeito.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <AdminButton variant="danger" onClick={remove}>
                      Apagar definitivamente
                    </AdminButton>
                    <AdminButton variant="ghost" onClick={() => setConfirmDelete(false)}>
                      Cancelar
                    </AdminButton>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 text-[0.8125rem] text-mute hover:text-danger"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Apagar contacto (pedido de eliminação de dados)
                </button>
              )}
              {contact.dealValue > 0 && contact.stage === "customer" && (
                <p className="mt-4 text-[0.75rem] text-mute">Negócio fechado: {fmtEuro(contact.dealValue)}</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
