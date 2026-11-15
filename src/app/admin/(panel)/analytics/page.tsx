"use client";

import { useState } from "react";
import { CHANNEL_LABEL, fmtNumber, useApi } from "@/components/admin/api";
import { BarList, VisitorsChart } from "@/components/admin/charts";
import { PERIODS, type Report } from "@/components/admin/report";
import { Card, EmptyState, LoadState, PageHeader, Segmented, StatTile } from "@/components/admin/ui";

const EVENT_ROWS: Array<[string, string]> = [
  ["hero_cta_click", "Clique no CTA do hero"],
  ["optin_modal_open", "Formulário de opt-in aberto"],
  ["optin_submit", "Opt-in submetido"],
  ["vsl_play", "Vídeo iniciado"],
  ["vsl_25_percent", "Vídeo — 25%"],
  ["vsl_50_percent", "Vídeo — 50%"],
  ["vsl_75_percent", "Vídeo — 75%"],
  ["vsl_complete", "Vídeo concluído"],
  ["application_start", "Candidatura iniciada"],
  ["application_submit", "Candidatura submetida"],
  ["strategy_call_click", "Clique para agendar"],
  ["strategy_call_confirmed", "Reunião confirmada"],
];

const regionName = (() => {
  try {
    const names = new Intl.DisplayNames(["pt-PT"], { type: "region" });
    return (code: string) => names.of(code) ?? code;
  } catch {
    return (code: string) => code;
  }
})();

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, loading, error } = useApi<Report>(`/api/admin/overview?days=${days}`);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Medição própria, sem cookies: visitantes únicos por dia, páginas e canais de origem. Não depende de consentimento nem de bloqueadores de pixels."
      >
        <Segmented label="Período" value={days} options={PERIODS} onChange={setDays} />
      </PageHeader>

      {!data ? (
        <LoadState loading={loading} error={error} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Visitantes únicos"
              value={fmtNumber(data.current.visitors)}
              current={data.current.visitors}
              previous={data.previous.visitors}
            />
            <StatTile
              label="Page views"
              value={fmtNumber(data.current.pageviews)}
              current={data.current.pageviews}
              previous={data.previous.pageviews}
            />
            <StatTile
              label="Páginas por visita"
              value={
                data.current.visitors
                  ? (data.current.pageviews / data.current.visitors).toLocaleString("pt-PT", {
                      maximumFractionDigits: 1,
                    })
                  : "—"
              }
              hint="Page views por visitante"
            />
            <StatTile
              label="Opt-ins (MQL)"
              value={fmtNumber(data.current.mql)}
              current={data.current.mql}
              previous={data.previous.mql}
            />
          </div>

          <Card title="Visitantes únicos" hint={`Por dia, últimos ${data.days} dias. Passa o cursor para ver os page views.`}>
            <VisitorsChart series={data.series} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Canais de origem" hint="Visitantes únicos por canal.">
              {data.channels.length ? (
                <BarList
                  unit="visitantes"
                  rows={data.channels.map((c) => ({
                    key: c.channel,
                    label: CHANNEL_LABEL[c.channel] ?? c.channel,
                    value: c.visitors,
                    detail: c.mql ? `${c.mql} MQL` : undefined,
                  }))}
                />
              ) : (
                <EmptyState title="Ainda sem tráfego neste período." />
              )}
            </Card>

            <Card title="Páginas mais vistas" hint="Page views por página.">
              {data.pages.length ? (
                <BarList
                  unit="page views"
                  rows={data.pages.map((p) => ({
                    key: p.path,
                    label: p.path,
                    value: p.pageviews,
                    detail: `${fmtNumber(p.visitors)} visit.`,
                  }))}
                />
              ) : (
                <EmptyState title="Ainda sem page views neste período." />
              )}
            </Card>

            <Card title="Fontes" hint="utm_source ou o site de referência.">
              {data.sources.length ? (
                <BarList
                  unit="visitantes"
                  rows={data.sources.map((s) => ({
                    key: `${s.source}|${s.channel}`,
                    label: s.source,
                    value: s.visitors,
                    detail: CHANNEL_LABEL[s.channel] ?? s.channel,
                  }))}
                />
              ) : (
                <EmptyState
                  title="Sem fontes identificadas."
                  body="Aparecem aqui as visitas com utm_source ou vindas de outro site."
                />
              )}
            </Card>

            <Card title="Campanhas" hint="utm_campaign das visitas.">
              {data.campaigns.length ? (
                <BarList
                  unit="visitantes"
                  rows={data.campaigns.map((c) => ({
                    key: `${c.campaign}|${c.source}`,
                    label: c.campaign,
                    value: c.visitors,
                    detail: c.source,
                  }))}
                />
              ) : (
                <EmptyState
                  title="Sem campanhas identificadas."
                  body="Usa utm_campaign nos links dos anúncios para as veres aqui."
                />
              )}
            </Card>

            <Card title="Dispositivos" hint="Visitantes únicos por tipo de dispositivo.">
              {data.devices.length ? (
                <BarList
                  unit="visitantes"
                  rows={data.devices.map((d) => ({ key: d.device, label: d.device, value: d.visitors }))}
                />
              ) : (
                <EmptyState title="Ainda sem dados." />
              )}
            </Card>

            <Card title="Países" hint="Disponível quando o alojamento envia o país do visitante (Vercel, Cloudflare).">
              {data.countries.length ? (
                <BarList
                  unit="visitantes"
                  rows={data.countries.map((c) => ({
                    key: c.country,
                    label: regionName(c.country),
                    value: c.visitors,
                  }))}
                />
              ) : (
                <EmptyState title="Sem dados de país." body="Em desenvolvimento local o país não é conhecido." />
              )}
            </Card>
          </div>

          <Card title="Eventos do funil" hint="Interações registadas no site neste período.">
            <table className="w-full text-[0.875rem]">
              <thead>
                <tr className="text-left text-[0.75rem] text-mute">
                  <th className="pb-2.5 font-normal">Evento</th>
                  <th className="pb-2.5 text-right font-normal">Total</th>
                  <th className="pb-2.5 text-right font-normal">Visitantes</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {EVENT_ROWS.map(([key, label]) => (
                  <tr key={key} className="border-t border-paper/8">
                    <td className="py-2.5 pr-3">
                      {label}
                      <span className="ml-2 hidden font-mono text-[0.6875rem] text-mute sm:inline">{key}</span>
                    </td>
                    <td className="py-2.5 text-right">{fmtNumber(data.events[key]?.total ?? 0)}</td>
                    <td className="py-2.5 text-right">{fmtNumber(data.events[key]?.visitors ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </>
  );
}
