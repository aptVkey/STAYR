"use client";

import Link from "next/link";
import { useState } from "react";
import { CHANNEL_LABEL, fmtEuro, fmtNumber, fmtPercent, useApi } from "@/components/admin/api";
import { FunnelFigure, VisitorsChart } from "@/components/admin/charts";
import { PERIODS, type Report } from "@/components/admin/report";
import { Card, EmptyState, LoadState, PageHeader, Segmented, StatTile } from "@/components/admin/ui";

export default function OverviewPage() {
  const [days, setDays] = useState(30);
  const { data, loading, error } = useApi<Report>(`/api/admin/overview?days=${days}`);

  return (
    <>
      <PageHeader title="Visão geral" description="O funil completo, do primeiro page view ao cliente fechado.">
        <Segmented label="Período" value={days} options={PERIODS} onChange={setDays} />
      </PageHeader>

      {!data ? (
        <LoadState loading={loading} error={error} />
      ) : (
        <>
          {data.hasDemo && (
            <p className="rounded-lg bg-lime/10 px-4 py-3 font-mono text-[0.75rem] leading-relaxed text-lime ring-1 ring-lime/25">
              Dados de demonstração presentes — os números abaixo não são reais. Remove-os com{" "}
              <code>npm run demo:clear</code>.
            </p>
          )}

          <Card
            title="Funil"
            hint="Page views → opt-in no case study (MQL) → reunião agendada (SQL) → cliente fechado."
            action={
              <Link href="/admin/crm" className="text-[0.8125rem] text-mute underline underline-offset-4 hover:text-paper">
                Abrir CRM
              </Link>
            }
          >
            <FunnelFigure
              stages={[
                { key: "pageviews", label: "Page views", hint: "Tráfego", value: data.current.pageviews },
                { key: "mql", label: "Opt-ins do case study", hint: "MQL", value: data.current.mql },
                { key: "sql", label: "Reuniões agendadas", hint: "SQL", value: data.current.sql },
                { key: "customers", label: "Clientes fechados", hint: "Conversão", value: data.current.customers },
              ]}
            />
          </Card>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Visitantes únicos"
              value={fmtNumber(data.current.visitors)}
              current={data.current.visitors}
              previous={data.previous.visitors}
            />
            <StatTile
              label="Visitante → MQL"
              value={data.current.visitors ? fmtPercent(data.current.mql / data.current.visitors) : "—"}
              hint="Opt-ins por visitante único"
            />
            <StatTile
              label="MQL → Cliente"
              value={data.current.mql ? fmtPercent(data.current.customers / data.current.mql) : "—"}
              hint="Clientes por opt-in"
            />
            <StatTile
              label="Receita fechada"
              value={fmtEuro(data.current.revenue)}
              current={data.current.revenue}
              previous={data.previous.revenue}
              hint="Valor dos negócios ganhos"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Card title="Visitantes únicos" hint={`Por dia, últimos ${data.days} dias.`}>
              <VisitorsChart series={data.series} />
            </Card>

            <Card
              title="Canais de origem"
              hint="De onde vêm os visitantes e os leads."
              action={
                <Link
                  href="/admin/analytics"
                  className="text-[0.8125rem] text-mute underline underline-offset-4 hover:text-paper"
                >
                  Ver tudo
                </Link>
              }
            >
              {data.channels.length === 0 ? (
                <EmptyState title="Ainda sem tráfego neste período." />
              ) : (
                <table className="w-full text-[0.875rem]">
                  <thead>
                    <tr className="text-left text-[0.75rem] text-mute">
                      <th className="pb-2.5 font-normal">Canal</th>
                      <th className="pb-2.5 text-right font-normal">Visit.</th>
                      <th className="pb-2.5 text-right font-normal">MQL</th>
                      <th className="pb-2.5 text-right font-normal">SQL</th>
                      <th className="pb-2.5 text-right font-normal">Clientes</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {data.channels.map((c) => (
                      <tr key={c.channel} className="border-t border-paper/8">
                        <td className="py-2.5 pr-3">{CHANNEL_LABEL[c.channel] ?? c.channel}</td>
                        <td className="py-2.5 text-right">{fmtNumber(c.visitors)}</td>
                        <td className="py-2.5 text-right">{c.mql}</td>
                        <td className="py-2.5 text-right">{c.sql}</td>
                        <td className="py-2.5 text-right">{c.customers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
