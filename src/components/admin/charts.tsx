"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fmtDate, fmtFull, fmtNumber, fmtPercent } from "@/components/admin/api";
import { cn } from "@/lib/cn";

/* Chart roles on the admin surface (#151d2b). One accent hue; the grid and
   axis text stay recessive. */
const ACCENT = "var(--color-lime)";
const GRID = "rgb(245 246 242 / 0.08)";
const AXIS_TEXT = "rgb(152 165 181)";
const SURFACE = "var(--color-surface)";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Round an axis maximum up to a clean number and return 4 ticks. */
function niceTicks(max: number) {
  if (max <= 4) return [0, 1, 2, 3, 4].slice(0, Math.max(max, 1) + 1);
  const rough = max / 4;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? rough;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

export type DayPoint = { day: string; visitors: number; pageviews: number };

/** Unique visitors per day: one 2px line, a light wash, crosshair + tooltip. */
export function VisitorsChart({ series }: { series: DayPoint[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const height = 260;
  const pad = { top: 16, right: 16, bottom: 28, left: 40 };
  const innerW = Math.max(width - pad.left - pad.right, 10);
  const innerH = height - pad.top - pad.bottom;

  const ticks = niceTicks(Math.max(...series.map((d) => d.visitors), 1));
  const yMax = ticks[ticks.length - 1] || 1;
  const x = (i: number) => pad.left + (series.length > 1 ? (i / (series.length - 1)) * innerW : innerW / 2);
  const y = (value: number) => pad.top + innerH - (value / yMax) * innerH;

  const line = series.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.visitors).toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const every = Math.max(1, Math.ceil(series.length / Math.max(Math.floor(innerW / 72), 2)));
  const last = series.length - 1;
  const point = hover === null ? null : series[hover];
  const date = (day: string) => fmtDate(Date.parse(`${day}T12:00:00Z`));

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`Visitantes únicos por dia, de ${date(series[0].day)} a ${date(series[last].day)}`}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - rect.left - pad.left) / innerW;
            setHover(Math.min(last, Math.max(0, Math.round(ratio * last))));
          }}
          onPointerLeave={() => setHover(null)}
          className="block touch-pan-y"
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke={GRID} />
              <text
                x={pad.left - 10}
                y={y(tick)}
                dy="0.32em"
                textAnchor="end"
                fontSize="11"
                fill={AXIS_TEXT}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {fmtNumber(tick)}
              </text>
            </g>
          ))}
          {series.map((d, i) =>
            i % every === 0 ? (
              <text key={d.day} x={x(i)} y={height - 6} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>
                {date(d.day)}
              </text>
            ) : null,
          )}

          <path d={area} fill={ACCENT} opacity={0.1} />
          <path d={line} fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke="rgb(245 246 242 / 0.25)" />
          )}
          <circle
            cx={x(hover ?? last)}
            cy={y(series[hover ?? last].visitors)}
            r={5}
            fill={ACCENT}
            stroke={SURFACE}
            strokeWidth={2}
          />
        </svg>
      )}

      {point && hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 w-40 rounded-lg bg-ink-deep p-3 text-[0.75rem] shadow-xl ring-1 ring-paper/15"
          style={{ left: Math.min(Math.max(x(hover) - 80, 0), Math.max(width - 160, 0)) }}
        >
          <p className="text-mute">{fmtDate(Date.parse(`${point.day}T12:00:00Z`), { weekday: "short", day: "numeric", month: "short" })}</p>
          <p className="mt-2 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-paper/80">
              <span className="size-2 rounded-full bg-lime" aria-hidden />
              Visitantes
            </span>
            <span className="font-medium tabular-nums">{fmtFull(point.visitors)}</span>
          </p>
          <p className="mt-1 flex items-center justify-between gap-3">
            <span className="pl-3.5 text-paper/80">Page views</span>
            <span className="font-medium tabular-nums">{fmtFull(point.pageviews)}</span>
          </p>
        </div>
      )}

      {/* A table ignores height/overflow, so the wrapper carries sr-only. */}
      <div className="sr-only">
      <table>
        <caption>Visitantes únicos e page views por dia</caption>
        <thead>
          <tr>
            <th>Dia</th>
            <th>Visitantes</th>
            <th>Page views</th>
          </tr>
        </thead>
        <tbody>
          {series.map((d) => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{d.visitors}</td>
              <td>{d.pageviews}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export type FunnelStage = { key: string; label: string; hint: string; value: number };

/**
 * The funnel as figures. Stage volumes differ by orders of magnitude, so
 * each stage shows its count and a meter of how much of the previous stage
 * reached it, rather than bars on one shared scale.
 */
export function FunnelFigure({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.value ?? 0;
  return (
    <ol className="grid gap-3 lg:grid-cols-4 lg:gap-0">
      {stages.map((stage, i) => {
        const previous = i > 0 ? stages[i - 1].value : 0;
        const rate = i > 0 && previous > 0 ? stage.value / previous : null;
        return (
          <li key={stage.key} className="relative flex lg:pr-9 lg:last:pr-0">
            <div className="flex-1 rounded-lg bg-ink p-4 ring-1 ring-paper/8 sm:p-5">
              <p className="flex items-center justify-between gap-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-mute">
                <span>
                  0{i + 1} · {stage.hint}
                </span>
              </p>
              <p className="mt-3 text-[0.9375rem] text-paper/85">{stage.label}</p>
              <p className="mt-1 text-[2.25rem] font-medium leading-none tracking-[-0.045em]">
                {fmtNumber(stage.value)}
              </p>

              <div className="mt-5">
                <div
                  className="h-2 overflow-hidden rounded-full bg-lime/15"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={i === 0 ? 100 : Math.round((rate ?? 0) * 100)}
                  aria-label={i === 0 ? `${stage.label}: topo do funil` : `${stage.label}: conversão da etapa anterior`}
                >
                  <div
                    className="h-full rounded-full bg-lime"
                    style={{ width: `${i === 0 ? 100 : Math.max((rate ?? 0) * 100, rate ? 2 : 0)}%` }}
                  />
                </div>
                <p className="mt-2.5 text-[0.75rem] leading-snug text-mute">
                  {i === 0 ? (
                    "Topo do funil"
                  ) : rate === null ? (
                    "Sem dados na etapa anterior"
                  ) : (
                    <>
                      <span className="font-medium text-paper">{fmtPercent(rate)}</span> da etapa anterior
                      {top > 0 && i > 1 && <> · {fmtPercent(stage.value / top)} do topo</>}
                    </>
                  )}
                </p>
              </div>
            </div>
            {i < stages.length - 1 && (
              <span
                className="absolute right-0 top-1/2 hidden size-9 -translate-y-1/2 place-items-center text-mute lg:grid"
                aria-hidden
              >
                <ChevronRight className="size-4" />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export type BarRow = { key: string; label: string; value: number; detail?: string };

/** Ranked horizontal bars, one hue, value at the end of each row. */
export function BarList({ rows, unit, max }: { rows: BarRow[]; unit: string; max?: number }) {
  const top = max ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="flex flex-col gap-3.5" aria-label={unit}>
      {rows.map((row) => (
        <li key={row.key} title={`${row.label}: ${fmtFull(row.value)} ${unit}`}>
          <div className="flex items-baseline justify-between gap-4 text-[0.875rem]">
            <span className="min-w-0 truncate">
              {row.label}
              {row.detail && <span className="ml-2 text-[0.75rem] text-mute">{row.detail}</span>}
            </span>
            <span className="shrink-0 font-medium tabular-nums">{fmtFull(row.value)}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-paper/6">
            <div
              className={cn("h-full rounded-full bg-paper/45", row.value === 0 && "hidden")}
              style={{ width: `${Math.max((row.value / top) * 100, 1.5)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
