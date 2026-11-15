"use client";

import { CalendarClock, Download, Plus, Search } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import {
  api,
  CHANNEL_LABEL,
  fmtDate,
  fmtDateTime,
  fmtEuro,
  STAGE_HINT,
  STAGE_LABEL,
  useApi,
} from "@/components/admin/api";
import { ContactDrawer, type ContactRow } from "@/components/admin/contact-drawer";
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
} from "@/components/admin/ui";
import { cn } from "@/lib/cn";

const STAGES = ["mql", "sql", "customer", "lost"] as const;

export default function CrmPage() {
  const { data, loading, error, reload } = useApi<{ ok: boolean; contacts: ContactRow[] }>("/api/admin/contacts");
  const [view, setView] = useState<"pipeline" | "list">("pipeline");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const contacts = useMemo(() => {
    const all = data?.contacts ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((c) => [c.name, c.email, c.company, c.source, c.campaign].some((v) => v.toLowerCase().includes(q)));
  }, [data, search]);

  const move = async (id: string, stage: string) => {
    const contact = data?.contacts.find((c) => c.id === id);
    if (!contact || contact.stage === stage) return;
    await api(`/api/admin/contacts/${id}`, { method: "PATCH", body: { stage } });
    reload();
  };

  return (
    <>
      <PageHeader
        title="CRM"
        description="Cada opt-in, candidatura e reunião cria ou atualiza um contacto. Arrasta entre colunas para mudar de etapa."
      >
        <a
          href="/api/admin/contacts?format=csv"
          download
          className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[0.875rem] font-medium ring-1 ring-paper/20 hover:ring-paper/60"
        >
          <Download className="size-4" aria-hidden />
          Exportar CSV
        </a>
        <AdminButton onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden />
          Novo contacto
        </AdminButton>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" aria-hidden />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Procurar por nome, email, empresa…"
            aria-label="Procurar contactos"
            className="bg-surface pl-9"
          />
        </div>
        <Segmented
          label="Vista"
          value={view}
          onChange={setView}
          options={[
            { value: "pipeline", label: "Pipeline" },
            { value: "list", label: "Lista" },
          ]}
        />
      </div>

      {adding && (
        <NewContact
          onClose={() => setAdding(false)}
          onCreated={(id) => {
            setAdding(false);
            reload();
            setOpenId(id);
          }}
        />
      )}

      {!data ? (
        <LoadState loading={loading} error={error} />
      ) : data.contacts.length === 0 ? (
        <EmptyState
          title="Ainda não há contactos."
          body="Assim que alguém fizer opt-in no case study, se candidatar ou agendar uma reunião, aparece aqui."
        />
      ) : view === "pipeline" ? (
        <div className="-mx-4 overflow-x-auto px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
          <div className="grid min-w-[60rem] grid-cols-4 gap-3 lg:min-w-0">
            {STAGES.map((stage) => {
              const items = contacts.filter((c) => c.stage === stage);
              const value = items.reduce((sum, c) => sum + c.dealValue, 0);
              return (
                <section
                  key={stage}
                  aria-label={STAGE_LABEL[stage]}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(stage);
                  }}
                  onDragLeave={() => setDragOver((current) => (current === stage ? null : current))}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOver(null);
                    void move(event.dataTransfer.getData("text/plain"), stage);
                  }}
                  className={cn(
                    "flex max-h-[calc(100dvh-17rem)] min-h-64 flex-col rounded-xl bg-surface/60 p-3 ring-1 transition-shadow",
                    dragOver === stage ? "ring-2 ring-lime" : "ring-paper/8",
                  )}
                >
                  <header className="flex items-baseline justify-between gap-2 px-1.5 pb-3 pt-1">
                    <div>
                      <h2 className="text-[0.9375rem] font-medium">
                        {STAGE_LABEL[stage]}
                        <span className="ml-2 font-normal tabular-nums text-mute">{items.length}</span>
                      </h2>
                      <p className="text-[0.6875rem] text-mute">{STAGE_HINT[stage]}</p>
                    </div>
                    {value > 0 && <span className="text-[0.75rem] tabular-nums text-mute">{fmtEuro(value)}</span>}
                  </header>
                  <ul className="-mx-1 flex flex-col gap-2 overflow-y-auto px-1 pb-1 pt-px">
                    {items.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          draggable
                          onDragStart={(event) => event.dataTransfer.setData("text/plain", c.id)}
                          onClick={() => setOpenId(c.id)}
                          className="w-full cursor-grab rounded-lg bg-ink p-3.5 text-left ring-1 ring-paper/8 transition-shadow hover:ring-paper/30 active:cursor-grabbing"
                        >
                          <p className="truncate text-[0.9375rem] font-medium tracking-[-0.01em]">
                            {c.name || c.email}
                          </p>
                          <p className="mt-0.5 truncate text-[0.8125rem] text-mute">{c.company || c.email}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <Badge tone="blue">{CHANNEL_LABEL[c.channel] ?? c.channel}</Badge>
                            {c.dealValue > 0 && <Badge>{fmtEuro(c.dealValue)}</Badge>}
                            {c.nextCall && (
                              <Badge tone="lime">
                                <CalendarClock className="size-3" aria-hidden />
                                {fmtDate(c.nextCall, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </Badge>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[46rem] text-[0.875rem]">
            <thead>
              <tr className="text-left text-[0.75rem] text-mute">
                <th className="px-5 py-3.5 font-normal">Contacto</th>
                <th className="px-3 py-3.5 font-normal">Etapa</th>
                <th className="px-3 py-3.5 font-normal">Canal</th>
                <th className="px-3 py-3.5 text-right font-normal">Valor</th>
                <th className="px-5 py-3.5 text-right font-normal">Entrada</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setOpenId(c.id)}
                  className="cursor-pointer border-t border-paper/8 hover:bg-paper/[0.03]"
                >
                  <td className="px-5 py-3">
                    <button type="button" className="text-left" onClick={() => setOpenId(c.id)}>
                      <span className="block font-medium">{c.name || c.email}</span>
                      <span className="block text-[0.8125rem] text-mute">
                        {[c.company, c.email].filter(Boolean).join(" · ")}
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={c.stage === "customer" ? "lime" : c.stage === "lost" ? "danger" : "neutral"}>
                      {STAGE_LABEL[c.stage]}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-paper/80">{CHANNEL_LABEL[c.channel] ?? c.channel}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{c.dealValue ? fmtEuro(c.dealValue) : "—"}</td>
                  <td className="px-5 py-3 text-right text-mute">{fmtDateTime(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {openId && <ContactDrawer key={openId} id={openId} onClose={() => setOpenId(null)} onChanged={reload} />}
    </>
  );
}

function NewContact({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [values, setValues] = useState({ name: "", email: "", company: "", stage: "mql" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await api<{ ok?: boolean; id?: string; error?: string }>("/api/admin/contacts", {
      method: "POST",
      body: values,
    });
    setBusy(false);
    if (result.ok && result.data.id) onCreated(result.data.id);
    else if (result.data.error === "exists" && result.data.id) onCreated(result.data.id);
    else setError(result.data.error === "email" ? "Indica um email válido." : "Não foi possível criar o contacto.");
  };

  return (
    <Card title="Novo contacto" hint="Para leads que chegaram fora do site (referências, eventos, LinkedIn).">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_9rem_auto] lg:items-end">
        <Labeled label="Nome" htmlFor="new-name">
          <Input id="new-name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
        </Labeled>
        <Labeled label="Email" htmlFor="new-email">
          <Input
            id="new-email"
            type="email"
            required
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
        </Labeled>
        <Labeled label="Hotel / empresa" htmlFor="new-company">
          <Input
            id="new-company"
            value={values.company}
            onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
          />
        </Labeled>
        <Labeled label="Etapa" htmlFor="new-stage">
          <select
            id="new-stage"
            value={values.stage}
            onChange={(e) => setValues((v) => ({ ...v, stage: e.target.value }))}
            className="h-10 w-full appearance-none rounded-lg bg-ink px-3 text-[0.9375rem] ring-1 ring-paper/12 focus:outline-none focus:ring-2 focus:ring-lime"
          >
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABEL[stage]}
              </option>
            ))}
          </select>
        </Labeled>
        <div className="flex gap-2">
          <AdminButton type="submit" busy={busy}>
            Criar
          </AdminButton>
          <AdminButton variant="ghost" onClick={onClose}>
            Cancelar
          </AdminButton>
        </div>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-[0.8125rem] text-danger">
          {error}
        </p>
      )}
    </Card>
  );
}
