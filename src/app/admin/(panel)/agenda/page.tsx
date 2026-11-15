"use client";

import { ExternalLink, Plus, X } from "lucide-react";
import { useState } from "react";
import { api, fmtDate, fmtTime, useApi } from "@/components/admin/api";
import {
  AdminButton,
  Badge,
  Card,
  EmptyState,
  Input,
  Labeled,
  LoadState,
  PageHeader,
  Segmented,
  Select,
  Toggle,
} from "@/components/admin/ui";

type Call = {
  id: string;
  start: number;
  end: number;
  status: string;
  notes: string;
  visitorTz: string;
  contact: { name: string; email: string; company: string };
};

type BookingSettings = {
  enabled: boolean;
  timezone: string;
  durationMin: number;
  bufferMin: number;
  minNoticeHours: number;
  maxDaysAhead: number;
  weekly: Record<string, Array<[string, string]>>;
  meetingLink: string;
};

const STATUS: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Realizada",
  no_show: "Não compareceu",
  cancelled: "Cancelada",
};
const WEEKDAYS: Array<[string, string]> = [
  ["1", "Segunda"],
  ["2", "Terça"],
  ["3", "Quarta"],
  ["4", "Quinta"],
  ["5", "Sexta"],
  ["6", "Sábado"],
  ["7", "Domingo"],
];
const TIMEZONES = [
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Berlin",
  "Atlantic/Azores",
  "Atlantic/Madeira",
  "America/Sao_Paulo",
  "America/New_York",
  "UTC",
];

export default function AgendaPage() {
  const calls = useApi<{ ok: boolean; now: number; bookings: Call[] }>("/api/admin/bookings");
  const settings = useApi<{ ok: boolean; booking: BookingSettings }>("/api/admin/settings");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const now = calls.data?.now ?? 0;
  const all = calls.data?.bookings ?? [];
  const upcoming = all.filter((c) => c.end >= now && c.status === "confirmed").sort((a, b) => a.start - b.start);
  const past = all.filter((c) => !(c.end >= now && c.status === "confirmed"));
  const shown = tab === "upcoming" ? upcoming : past;

  const setStatus = async (id: string, status: string) => {
    await api(`/api/admin/bookings/${id}`, { method: "PATCH", body: { status } });
    calls.reload();
  };

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Reuniões de estratégia marcadas no site. Cada marcação cria o contacto no CRM e passa-o a SQL."
      >
        <a
          href="/book"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[0.875rem] font-medium ring-1 ring-paper/20 hover:ring-paper/60"
        >
          <ExternalLink className="size-4" aria-hidden />
          Página de marcação
        </a>
      </PageHeader>

      <Card
        title="Reuniões"
        action={
          <Segmented
            label="Reuniões"
            value={tab}
            onChange={setTab}
            options={[
              { value: "upcoming", label: `Próximas (${upcoming.length})` },
              { value: "past", label: "Anteriores" },
            ]}
          />
        }
      >
        {!calls.data ? (
          <LoadState loading={calls.loading} error={calls.error} />
        ) : shown.length === 0 ? (
          <EmptyState
            title={tab === "upcoming" ? "Sem reuniões marcadas." : "Sem reuniões anteriores."}
            body={tab === "upcoming" ? "As novas marcações aparecem aqui assim que são confirmadas." : undefined}
          />
        ) : (
          <ul className="flex flex-col">
            {shown.map((call) => (
              <li
                key={call.id}
                className="flex flex-col gap-3 border-t border-paper/8 py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="w-44 shrink-0">
                  <p className="text-[0.9375rem] font-medium capitalize">
                    {fmtDate(call.start, { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                  <p className="text-[0.8125rem] tabular-nums text-mute">
                    {fmtTime(call.start)}–{fmtTime(call.end)}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.9375rem]">
                    {call.contact.name || call.contact.email}
                    {call.contact.company && <span className="text-mute"> · {call.contact.company}</span>}
                  </p>
                  <p className="truncate text-[0.8125rem] text-mute">
                    <a href={`mailto:${call.contact.email}`} className="hover:text-paper">
                      {call.contact.email}
                    </a>
                    {call.notes && <> · “{call.notes}”</>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {call.status !== "confirmed" && (
                    <Badge tone={call.status === "completed" ? "lime" : "neutral"}>{STATUS[call.status]}</Badge>
                  )}
                  <Select
                    aria-label={`Estado da reunião com ${call.contact.name || call.contact.email}`}
                    value={call.status}
                    onChange={(event) => setStatus(call.id, event.target.value)}
                    className="h-9 w-44 text-[0.8125rem]"
                  >
                    {Object.entries(STATUS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {!settings.data ? (
        <LoadState loading={settings.loading} error={settings.error} />
      ) : (
        <Availability key={JSON.stringify(settings.data.booking)} initial={settings.data.booking} onSaved={settings.reload} />
      )}
    </>
  );
}

function Availability({ initial, onSaved }: { initial: BookingSettings; onSaved: () => void }) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const zones = TIMEZONES.includes(value.timezone) ? TIMEZONES : [value.timezone, ...TIMEZONES];

  const set = <K extends keyof BookingSettings>(key: K, next: BookingSettings[K]) => {
    setSaved(false);
    setValue((v) => ({ ...v, [key]: next }));
  };
  const setRanges = (day: string, ranges: Array<[string, string]>) =>
    set("weekly", { ...value.weekly, [day]: ranges });

  const save = async () => {
    setBusy(true);
    const result = await api("/api/admin/settings", { method: "PUT", body: { booking: value } });
    setBusy(false);
    if (result.ok) {
      setSaved(true);
      onSaved();
    }
  };

  const number = (key: "durationMin" | "bufferMin" | "minNoticeHours" | "maxDaysAhead", label: string, hint: string) => (
    <Labeled label={label} hint={hint} htmlFor={`booking-${key}`}>
      <Input
        id={`booking-${key}`}
        type="number"
        min={0}
        value={value[key]}
        onChange={(event) => set(key, Number(event.target.value))}
      />
    </Labeled>
  );

  return (
    <Card
      title="Disponibilidade"
      hint="Define quando aceitas reuniões. Os visitantes veem os horários no fuso horário deles."
    >
      <div className="flex flex-col gap-7">
        <Toggle
          checked={value.enabled}
          onChange={(checked) => set("enabled", checked)}
          label="Agendamento no site ativo"
          description="Desligado, o site deixa de mostrar horários. Um link externo em NEXT_PUBLIC_BOOKING_URL tem sempre prioridade."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Labeled label="Fuso horário" htmlFor="booking-tz" className="lg:col-span-1">
            <Select id="booking-tz" value={value.timezone} onChange={(event) => set("timezone", event.target.value)}>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </Select>
          </Labeled>
          {number("durationMin", "Duração (min)", "15 a 120")}
          {number("bufferMin", "Intervalo (min)", "Entre reuniões")}
          {number("minNoticeHours", "Antecedência (h)", "Mínima para marcar")}
          {number("maxDaysAhead", "Janela (dias)", "Até quando se pode marcar")}
        </div>

        <Labeled
          label="Link da reunião (Google Meet, Zoom…)"
          htmlFor="booking-link"
          hint="Mostrado ao visitante na confirmação e incluído no convite de calendário. Tem de começar por https://"
        >
          <Input
            id="booking-link"
            type="url"
            placeholder="https://meet.google.com/…"
            value={value.meetingLink}
            onChange={(event) => set("meetingLink", event.target.value)}
          />
        </Labeled>

        <div>
          <p className="mb-3 text-[0.8125rem] text-mute">Horário semanal</p>
          <ul className="flex flex-col">
            {WEEKDAYS.map(([day, label]) => {
              const ranges = value.weekly[day] ?? [];
              return (
                <li key={day} className="flex flex-col gap-2 border-t border-paper/8 py-3 sm:flex-row sm:items-center sm:gap-6">
                  <p className="w-24 shrink-0 text-[0.9375rem]">{label}</p>
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {ranges.length === 0 && <span className="text-[0.8125rem] text-mute">Indisponível</span>}
                    {ranges.map(([from, to], i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-ink py-1 pl-1 pr-1.5 ring-1 ring-paper/10">
                        <input
                          type="time"
                          aria-label={`${label}: início do período ${i + 1}`}
                          value={from}
                          onChange={(event) =>
                            setRanges(day, ranges.map((r, j) => (j === i ? [event.target.value, r[1]] : r)))
                          }
                          className="h-8 rounded bg-transparent px-1.5 text-[0.875rem] tabular-nums [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-lime"
                        />
                        <span className="text-mute">–</span>
                        <input
                          type="time"
                          aria-label={`${label}: fim do período ${i + 1}`}
                          value={to}
                          onChange={(event) =>
                            setRanges(day, ranges.map((r, j) => (j === i ? [r[0], event.target.value] : r)))
                          }
                          className="h-8 rounded bg-transparent px-1.5 text-[0.875rem] tabular-nums [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-lime"
                        />
                        <button
                          type="button"
                          aria-label={`Remover período ${i + 1} de ${label}`}
                          onClick={() => setRanges(day, ranges.filter((_, j) => j !== i))}
                          className="grid size-7 place-items-center rounded text-mute hover:text-danger"
                        >
                          <X className="size-3.5" />
                        </button>
                      </span>
                    ))}
                    {ranges.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setRanges(day, [...ranges, ["09:00", "12:00"]])}
                        className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[0.8125rem] text-mute hover:text-paper"
                      >
                        <Plus className="size-3.5" aria-hidden />
                        Período
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <AdminButton busy={busy} onClick={save}>
            Guardar disponibilidade
          </AdminButton>
          <span role="status" className="text-[0.8125rem] text-lime">
            {saved ? "Guardado." : ""}
          </span>
        </div>
      </div>
    </Card>
  );
}
