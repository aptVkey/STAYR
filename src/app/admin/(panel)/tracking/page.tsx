"use client";

import { useState, type ReactNode } from "react";
import { api, useApi } from "@/components/admin/api";
import { AdminButton, Badge, Card, Input, Labeled, LoadState, PageHeader, Toggle } from "@/components/admin/ui";

type Tracking = {
  meta: { pixelId: string; testEventCode: string; capiTokenHint: string };
  google: {
    gtmId: string;
    ga4Id: string;
    adsId: string;
    labelOptin: string;
    labelApplication: string;
    labelCall: string;
  };
  tiktok: { pixelId: string; testEventCode: string; eventsTokenHint: string };
  advancedMatching: boolean;
};

type TestResult = { ok: boolean; status?: number; detail?: string; error?: string };

export default function TrackingPage() {
  const { data, loading, error, reload } = useApi<{ ok: boolean; tracking: Tracking }>("/api/admin/settings");

  return (
    <>
      <PageHeader
        title="Tracking"
        description="Pixels no browser e APIs de conversão no servidor. Os pixels só carregam depois de o visitante aceitar os cookies; os eventos de servidor só são enviados para quem aceitou."
      />
      {!data ? (
        <LoadState loading={loading} error={error} />
      ) : (
        <TrackingForm key={JSON.stringify(data.tracking)} initial={data.tracking} onSaved={reload} />
      )}
    </>
  );
}

function Status({ on, label }: { on: boolean; label: string }) {
  return <Badge tone={on ? "lime" : "neutral"}>{on ? label : "Por configurar"}</Badge>;
}

function TrackingForm({ initial, onSaved }: { initial: Tracking; onSaved: () => void }) {
  const [value, setValue] = useState(initial);
  const [tokens, setTokens] = useState({ capiToken: "", eventsToken: "" });
  const [clear, setClear] = useState({ capi: false, events: false });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [tests, setTests] = useState<Record<string, TestResult | "sending">>({});

  const patch = <K extends "meta" | "google" | "tiktok">(group: K, key: keyof Tracking[K], next: string) => {
    setMessage(null);
    setValue((v) => ({ ...v, [group]: { ...v[group], [key]: next } }));
  };

  const save = async () => {
    setBusy(true);
    setMessage(null);
    const result = await api<{ ok?: boolean; tracking?: Tracking }>("/api/admin/settings", {
      method: "PUT",
      body: {
        tracking: {
          meta: { ...value.meta, capiToken: tokens.capiToken, clearCapiToken: clear.capi },
          google: value.google,
          tiktok: { ...value.tiktok, eventsToken: tokens.eventsToken, clearEventsToken: clear.events },
          advancedMatching: value.advancedMatching,
        },
      },
    });
    setBusy(false);
    if (!result.ok || !result.data.tracking) {
      setMessage({ ok: false, text: "Não foi possível guardar." });
      return;
    }
    // IDs in an unexpected format are dropped by the server: say so.
    const saved = result.data.tracking;
    const dropped = [
      [value.meta.pixelId, saved.meta.pixelId, "Pixel ID da Meta"],
      [value.google.gtmId, saved.google.gtmId, "ID do GTM"],
      [value.google.ga4Id, saved.google.ga4Id, "ID do GA4"],
      [value.google.adsId, saved.google.adsId, "ID do Google Ads"],
      [value.tiktok.pixelId, saved.tiktok.pixelId, "Pixel ID do TikTok"],
    ]
      .filter(([typed, kept]) => typed.trim() && !kept)
      .map(([, , label]) => label);
    setMessage(
      dropped.length
        ? { ok: false, text: `Guardado, mas com formato inválido e ignorado: ${dropped.join(", ")}.` }
        : { ok: true, text: "Guardado. As alterações ficam ativas no próximo carregamento do site." },
    );
    if (!dropped.length) onSaved();
  };

  const test = async (platform: "meta" | "tiktok") => {
    setTests((t) => ({ ...t, [platform]: "sending" }));
    const result = await api<TestResult>("/api/admin/settings/test", { method: "POST", body: { platform } });
    setTests((t) => ({ ...t, [platform]: result.data }));
  };

  const text = <K extends "meta" | "google" | "tiktok">(
    group: K,
    key: keyof Tracking[K] & string,
    label: string,
    placeholder: string,
    hint?: ReactNode,
  ) => (
    <Labeled label={label} hint={hint} htmlFor={`${group}-${key}`}>
      <Input
        id={`${group}-${key}`}
        value={String(value[group][key] ?? "")}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        onChange={(event) => patch(group, key, event.target.value)}
      />
    </Labeled>
  );

  const token = (
    id: "capiToken" | "eventsToken",
    label: string,
    savedHint: string,
    clearKey: "capi" | "events",
    hint: ReactNode,
  ) => (
    <Labeled label={label} htmlFor={id} hint={hint}>
      <div className="flex gap-2">
        <Input
          id={id}
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={tokens[id]}
          disabled={clear[clearKey]}
          placeholder={
            clear[clearKey] ? "Será removido ao guardar" : savedHint ? `Guardado (${savedHint})` : "Colar o token de acesso"
          }
          onChange={(event) => {
            setMessage(null);
            setTokens((t) => ({ ...t, [id]: event.target.value }));
          }}
        />
        {savedHint && (
          <AdminButton variant="ghost" onClick={() => setClear((c) => ({ ...c, [clearKey]: !c[clearKey] }))}>
            {clear[clearKey] ? "Manter" : "Remover"}
          </AdminButton>
        )}
      </div>
    </Labeled>
  );

  const testBlock = (platform: "meta" | "tiktok", ready: boolean) => {
    const result = tests[platform];
    return (
      <div className="mt-5 border-t border-paper/8 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <AdminButton variant="ghost" busy={result === "sending"} disabled={!ready} onClick={() => test(platform)}>
            Enviar evento de teste
          </AdminButton>
          <p className="text-[0.75rem] text-mute">
            {ready
              ? "Envia um evento “Lead” com as credenciais guardadas."
              : "Guarda o Pixel ID e o token para poderes testar."}
          </p>
        </div>
        {result && result !== "sending" && (
          <div
            role="status"
            className={`mt-3 rounded-lg p-3 text-[0.8125rem] ring-1 ${
              result.ok ? "bg-lime/10 text-lime ring-lime/25" : "bg-danger/10 text-danger ring-danger/25"
            }`}
          >
            <p className="font-medium">
              {result.ok ? "A plataforma aceitou o evento." : "A plataforma recusou o evento."}
              {result.status ? ` (HTTP ${result.status})` : ""}
            </p>
            {result.detail && (
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[0.6875rem] opacity-90">
                {result.detail}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Meta Ads"
          hint="Pixel no browser + Conversions API (CAPI) no servidor, de-duplicados pelo mesmo event_id."
          action={
            <div className="flex gap-1.5">
              <Status on={Boolean(initial.meta.pixelId)} label="Pixel ativo" />
              <Status on={Boolean(initial.meta.pixelId && initial.meta.capiTokenHint)} label="CAPI ativa" />
            </div>
          }
        >
          <div className="grid gap-4">
            {text("meta", "pixelId", "Pixel ID", "123456789012345", "Gestor de Eventos → Origens de dados → o teu pixel.")}
            {token(
              "capiToken",
              "Token de acesso da Conversions API",
              initial.meta.capiTokenHint,
              "capi",
              "Gestor de Eventos → Definições → API de Conversões → Gerar token de acesso. Fica guardado só no servidor.",
            )}
            {text(
              "meta",
              "testEventCode",
              "Código de evento de teste (opcional)",
              "TEST12345",
              "Enquanto estiver preenchido, todos os eventos de servidor vão para “Testar eventos”. Apaga-o antes de lançar campanhas.",
            )}
          </div>
          {testBlock("meta", Boolean(initial.meta.pixelId && initial.meta.capiTokenHint))}
        </Card>

        <Card
          title="TikTok Ads"
          hint="Pixel no browser + Events API no servidor, de-duplicados pelo mesmo event_id."
          action={
            <div className="flex gap-1.5">
              <Status on={Boolean(initial.tiktok.pixelId)} label="Pixel ativo" />
              <Status on={Boolean(initial.tiktok.pixelId && initial.tiktok.eventsTokenHint)} label="Events API ativa" />
            </div>
          }
        >
          <div className="grid gap-4">
            {text("tiktok", "pixelId", "Pixel ID", "C4A1B2C3D4E5F6G7H8I9", "TikTok Ads Manager → Ferramentas → Eventos → Web Events.")}
            {token(
              "eventsToken",
              "Token de acesso da Events API",
              initial.tiktok.eventsTokenHint,
              "events",
              "Nas definições do pixel → Events API → Gerar token de acesso. Fica guardado só no servidor.",
            )}
            {text(
              "tiktok",
              "testEventCode",
              "Código de evento de teste (opcional)",
              "TEST12345",
              "Enquanto estiver preenchido, os eventos de servidor aparecem só em “Test Events”.",
            )}
          </div>
          {testBlock("tiktok", Boolean(initial.tiktok.pixelId && initial.tiktok.eventsTokenHint))}
        </Card>

        <Card
          title="Google"
          hint="Google Analytics 4 e Google Ads com uma conversão por etapa do funil."
          className="xl:col-span-2"
          action={
            <div className="flex gap-1.5">
              <Status on={Boolean(initial.google.ga4Id || initial.google.gtmId)} label="Analytics ativo" />
              <Status on={Boolean(initial.google.adsId)} label="Ads ativo" />
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {text("google", "ga4Id", "GA4 — ID de medição", "G-XXXXXXXXXX")}
            {text("google", "adsId", "Google Ads — ID de conversão", "AW-1234567890")}
            {text(
              "google",
              "gtmId",
              "Google Tag Manager (opcional)",
              "GTM-XXXXXXX",
              "Se preencheres, o GTM passa a gerir todas as tags e os IDs diretos (GA4, Ads, Meta, TikTok) deixam de ser carregados pelo site.",
            )}
            {text(
              "google",
              "labelOptin",
              "Conversão: opt-in no case study (MQL)",
              "AbC-D_efGhIjKlMnOp",
              "A etiqueta que vem depois da barra em send_to.",
            )}
            {text("google", "labelCall", "Conversão: reunião agendada (SQL)", "AbC-D_efGhIjKlMnOp")}
            {text("google", "labelApplication", "Conversão: candidatura submetida", "AbC-D_efGhIjKlMnOp")}
          </div>
        </Card>

        <Card title="Correspondência avançada" className="xl:col-span-2">
          <Toggle
            checked={value.advancedMatching}
            onChange={(checked) => {
              setMessage(null);
              setValue((v) => ({ ...v, advancedMatching: checked }));
            }}
            label="Enviar o email do lead (com hash SHA-256) nos eventos de servidor"
            description="Melhora a atribuição na Meta e no TikTok. É uma partilha de dados pessoais pseudonimizados com essas plataformas: só é feita para visitantes que aceitaram os cookies de publicidade e deve constar da tua política de privacidade. Desligado, os eventos de servidor levam apenas IP, browser e os identificadores de clique."
          />
        </Card>
      </div>

      <div className="sticky bottom-4 z-20 flex flex-wrap self-start items-center gap-4 rounded-full bg-surface-2 py-2 pl-2 pr-5 shadow-xl ring-1 ring-paper/12">
        <AdminButton busy={busy} onClick={save}>
          Guardar tracking
        </AdminButton>
        <p role="status" className={`text-[0.8125rem] ${message?.ok === false ? "text-danger" : "text-lime"}`}>
          {message?.text ?? ""}
        </p>
      </div>

      <Card title="Que eventos são enviados">
        <table className="w-full text-[0.875rem]">
          <thead>
            <tr className="text-left text-[0.75rem] text-mute">
              <th className="pb-2.5 font-normal">Momento no funil</th>
              <th className="pb-2.5 font-normal">Meta</th>
              <th className="pb-2.5 font-normal">TikTok</th>
              <th className="pb-2.5 font-normal">Google Ads</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Opt-in no case study (MQL)", "Lead", "Lead", "Conversão “opt-in”"],
              ["Candidatura submetida", "SubmitApplication", "SubmitApplication", "Conversão “candidatura”"],
              ["Reunião agendada (SQL)", "Schedule", "Schedule", "Conversão “reunião”"],
              ["Cliente fechado no CRM", "Purchase (só servidor)", "Purchase (só servidor)", "—"],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-paper/8">
                {row.map((cell, i) => (
                  <td key={i} className={`py-2.5 pr-3 ${i ? "font-mono text-[0.75rem] text-paper/80" : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
