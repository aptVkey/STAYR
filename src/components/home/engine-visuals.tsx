"use client";

import { Monitor, Smartphone } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { images } from "@/config/images";
import { content } from "@/content";
import { cn } from "@/lib/cn";

const { creative, conversion, media } = content.system.engines;

/** `compact` = phone layout: the stage is narrow and taller than it is wide. */
export type VisualProps = { progress: MotionValue<number>; compact?: boolean };

/* ════════════════════════════════════════════════════════════
   ENGINE 01 — one creative becoming formats and languages
   ════════════════════════════════════════════════════════════ */

// Final resting slots, as % of the stage (left, top, width) + aspect ratio.
const SLOTS = [
  { left: 3, top: 16, width: 25, aspect: "9 / 16", from: 0.12, to: 0.5, rotate: -5, type: 1 },
  { left: 31, top: 6, width: 30, aspect: "1 / 1", from: 0, to: 0.4, rotate: 0, type: 0.82 },
  { left: 66, top: 10, width: 30, aspect: "4 / 5", from: 0.22, to: 0.62, rotate: 5, type: 0.9 },
  { left: 31, top: 55, width: 37, aspect: "16 / 9", from: 0.32, to: 0.74, rotate: 3, type: 0.58 },
] as const;
const SLOTS_COMPACT = [
  { left: 0, top: 9, width: 31, aspect: "9 / 16", from: 0.12, to: 0.5, rotate: -5, type: 1 },
  { left: 34, top: 0, width: 34, aspect: "1 / 1", from: 0, to: 0.4, rotate: 0, type: 0.82 },
  { left: 71, top: 5, width: 29, aspect: "4 / 5", from: 0.22, to: 0.62, rotate: 5, type: 0.9 },
  { left: 34, top: 38, width: 66, aspect: "16 / 9", from: 0.32, to: 0.74, rotate: 3, type: 0.5 },
] as const;
const MASTER = { left: 27, top: 12, width: 46 };

function FormatCard({
  progress,
  index,
  compact,
}: VisualProps & { index: number }) {
  const slot = (compact ? SLOTS_COMPACT : SLOTS)[index];
  const format = creative.visual.formats[index];
  const isMaster = index === 1;
  const range = [slot.from, slot.to];

  const left = useTransform(progress, range, [`${MASTER.left + (isMaster ? 0 : 8)}%`, `${slot.left}%`]);
  const top = useTransform(progress, range, [`${MASTER.top + (isMaster ? 0 : 10)}%`, `${slot.top}%`]);
  const width = useTransform(progress, range, [`${isMaster ? MASTER.width : slot.width}%`, `${slot.width}%`]);
  const opacity = useTransform(progress, [slot.from, slot.from + 0.12], [isMaster ? 1 : 0, 1]);
  const rotate = useTransform(progress, range, [slot.rotate, 0]);
  const labelOpacity = useTransform(progress, [slot.to - 0.08, slot.to + 0.1], [0, 1]);
  const masterLabelOpacity = useTransform(progress, [0, 0.14], [1, 0]);

  return (
    <motion.figure
      className="@container absolute overflow-hidden rounded-[3px] bg-surface-2 shadow-[0_24px_60px_-18px_rgb(0_0_0/0.75)] ring-1 ring-paper/10"
      style={{ left, top, width, opacity, rotate, aspectRatio: slot.aspect, zIndex: isMaster ? 2 : 1 }}
    >
      <Image
        src={index % 2 === 0 ? images.creativeAlt.src : images.creative.src}
        alt=""
        fill
        sizes="(min-width: 1024px) 45vw, 120vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/90 via-ink-deep/15 to-ink-deep/25" />

      <motion.figcaption
        className="absolute left-[6cqw] top-[6cqw] flex items-center gap-[2.5cqw] rounded-full bg-ink-deep/70 px-[4cqw] py-[2cqw] font-mono text-[max(4.2cqw,7px)] uppercase tracking-[0.1em] text-paper backdrop-blur-sm"
        style={{ opacity: labelOpacity }}
      >
        <span className="text-lime">{format.ratio}</span>
        <span className="opacity-50">·</span>
        <span>{format.lang}</span>
      </motion.figcaption>

      {isMaster && (
        <motion.span
          className="absolute left-[6cqw] top-[6cqw] rounded-full bg-lime px-[4cqw] py-[2cqw] font-mono text-[max(3.6cqw,8px)] uppercase tracking-[0.1em] text-ink"
          style={{ opacity: masterLabelOpacity }}
        >
          {creative.visual.master}
        </motion.span>
      )}

      <div className="absolute inset-x-[6cqw] bottom-[6cqw]">
        <p
          className="font-mono uppercase tracking-[0.16em] text-paper/70"
          style={{ fontSize: `max(${3.4 * slot.type}cqw, 6px)` }}
        >
          {creative.visual.hotel}
        </p>
        <p
          className="accent-serif leading-[0.98] text-paper"
          style={{ fontSize: `max(${9.5 * slot.type}cqw, 10px)`, marginTop: `${2 * slot.type}cqw` }}
        >
          {format.line}
        </p>
        <span
          className="inline-block rounded-full bg-paper font-medium text-ink"
          style={{
            fontSize: `max(${3.8 * slot.type}cqw, 6px)`,
            marginTop: `${4 * slot.type}cqw`,
            padding: `${2.2 * slot.type}cqw ${5 * slot.type}cqw`,
          }}
        >
          {creative.visual.cta} →
        </span>
      </div>
    </motion.figure>
  );
}

export function CreativeVisual({ progress, compact }: VisualProps) {
  const captionOpacity = useTransform(progress, [0.7, 0.9], [0, 1]);

  return (
    <div className="relative size-full">
      {SLOTS.map((_, i) => (
        <FormatCard key={i} index={i} progress={progress} compact={compact} />
      ))}

      <motion.dl
        className={cn(
          "absolute space-y-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-mute",
          compact ? "inset-x-0 bottom-0 sm:hidden" : "bottom-[4%] right-[3%] w-[26%] min-w-[7.5rem]",
        )}
        style={{ opacity: captionOpacity }}
      >
        {creative.visual.formats.map((format) => (
          <div key={format.ratio} className="flex justify-between gap-3 border-t border-paper/12 pt-2">
            <dt className="text-paper/80">{format.ratio}</dt>
            <dd className="text-right normal-case tracking-normal">{format.place}</dd>
          </div>
        ))}
      </motion.dl>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ENGINE 02 — a landing page morphing from desktop to mobile
   ════════════════════════════════════════════════════════════ */

export function ConversionVisual({ progress }: VisualProps) {
  const v = conversion.visual;
  const [mobile, setMobile] = useState(false);
  const [step, setStep] = useState(0);

  useMotionValueEvent(progress, "change", (p) => {
    setMobile(p > 0.5);
    setStep(p < 0.3 ? 0 : p < 0.72 ? 1 : 2);
  });

  const width = useTransform(progress, [0.18, 0.68], ["100%", "38%"]);
  const radius = useTransform(progress, [0.18, 0.68], [8, 26]);
  const pathFill = useTransform(progress, [0.05, 0.9], [0, 1]);

  return (
    <div className="flex size-full flex-col">
      {/* Device indicator */}
      <div className="mb-4 flex items-center justify-between font-mono text-[0.625rem] uppercase tracking-[0.16em] text-mute">
        <span className={cn("flex items-center gap-2 transition-colors duration-300", !mobile && "text-lime")}>
          <Monitor className="size-3.5" aria-hidden /> {v.desktop}
        </span>
        <span className="mx-4 h-px flex-1 bg-paper/12" aria-hidden />
        <span className={cn("flex items-center gap-2 transition-colors duration-300", mobile && "text-lime")}>
          {v.mobile} <Smartphone className="size-3.5" aria-hidden />
        </span>
      </div>

      {/* Browser / phone frame */}
      <div className="flex min-h-0 flex-1 justify-center">
        <motion.div
          className="flex h-full min-w-[11.5rem] flex-col overflow-hidden bg-ink-deep shadow-[0_30px_80px_-24px_rgb(0_0_0/0.8)] ring-1 ring-paper/15"
          style={{ width, borderRadius: radius }}
        >
          <div className="flex h-8 shrink-0 items-center gap-1.5 border-b border-paper/10 px-3">
            <span className="size-1.5 rounded-full bg-paper/25" />
            <span className="size-1.5 rounded-full bg-paper/25" />
            <span className="size-1.5 rounded-full bg-paper/25" />
            <span className="ml-2 truncate rounded-full bg-paper/8 px-3 py-0.5 font-mono text-[0.5625rem] text-mute">
              {v.url}
            </span>
          </div>

          <div className="@container min-h-0 flex-1 overflow-hidden bg-paper text-ink">
            <div className="relative h-[56%] @lg:h-[64%]">
              <Image
                src={images.landing.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-ink/35" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 text-paper @lg:p-5">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em]">
                  {v.hotel}
                </span>
                <span className="hidden gap-5 text-[0.625rem] text-paper/80 @lg:flex">
                  <span>Rooms</span>
                  <span>Dining</span>
                  <span>Offers</span>
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 text-paper @lg:p-5">
                <p className="accent-serif max-w-[14ch] text-[1.375rem] leading-[1] @lg:text-[2.125rem]">
                  {v.headline}
                </p>
                <p className="mt-1.5 max-w-[30ch] text-[0.625rem] leading-snug text-paper/80 @lg:text-[0.75rem]">
                  {v.sub}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-ink/10 @lg:grid-cols-[1fr_1fr_0.8fr_1.3fr]">
              {[v.checkIn, v.checkOut, v.guests].map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "bg-paper px-3 py-2 @lg:px-4 @lg:py-3",
                    i === 2 && "hidden @lg:block",
                  )}
                >
                  <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-slate">
                    {label}
                  </p>
                  <span className="mt-1.5 block h-1.5 w-12 rounded-full bg-ink/15" />
                </div>
              ))}
              <div className="relative col-span-2 bg-ink p-2 @lg:col-span-1">
                <span
                  className={cn(
                    "relative flex h-full min-h-8 items-center justify-center rounded-[3px] bg-lime px-3 text-[0.6875rem] font-medium text-ink transition-shadow duration-500",
                    step === 2 && "shadow-[0_0_0_4px_rgb(217_255_112/0.3)]",
                  )}
                >
                  {v.button}
                </span>
              </div>
            </div>

            <ul className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-3 text-[0.625rem] text-slate @lg:px-5">
              {v.points.map((point) => (
                <li key={point} className="flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-ink/40" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            {/* Below-the-fold content, suggested rather than drawn */}
            <div className="grid grid-cols-2 gap-2 px-3 @lg:grid-cols-3 @lg:gap-3 @lg:px-5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn("space-y-1.5", i === 2 && "hidden @lg:block")}>
                  <span className="block aspect-[4/3] rounded-[2px] bg-ink/8" />
                  <span className="block h-1.5 w-2/3 rounded-full bg-ink/12" />
                  <span className="block h-1.5 w-1/3 rounded-full bg-ink/8" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Path from the ad to the booking engine */}
      <div className="relative mt-6">
        <div className="absolute inset-x-0 top-[0.3125rem] h-px bg-paper/12" aria-hidden />
        <motion.div
          className="absolute inset-x-0 top-[0.3125rem] h-px origin-left bg-lime"
          style={{ scaleX: pathFill }}
          aria-hidden
        />
        <ol className="relative flex justify-between">
          {v.path.map((label, i) => (
            <li
              key={label}
              className={cn(
                "flex flex-col gap-2.5",
                i === 1 && "items-center",
                i === 2 && "items-end",
              )}
            >
              <span
                className={cn(
                  "size-[0.6875rem] rounded-full ring-4 ring-surface transition-colors duration-300",
                  step >= i ? "bg-lime" : "bg-surface-2 outline outline-1 outline-paper/25",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "font-mono text-[0.625rem] uppercase tracking-[0.14em] transition-colors duration-300",
                  step >= i ? "text-paper" : "text-mute",
                )}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ENGINE 03 — three channels working as one system
   ════════════════════════════════════════════════════════════ */

const W = 640;
const H = 520;
const CENTER = { x: 320, y: 285 };
const NODES = [
  { x: 320, y: 62, from: 0.04, labelClass: "left-[59%] text-left", labelTop: 62 - 30 },
  { x: 96, y: 436, from: 0.2, labelClass: "left-0 text-left", labelTop: 436 - 122 },
  { x: 544, y: 436, from: 0.36, labelClass: "right-0 text-right", labelTop: 436 - 122 },
] as const;

function ChannelLink({
  progress,
  index,
}: VisualProps & { index: number }) {
  const node = NODES[index];
  const d = `M${node.x},${node.y} L${CENTER.x},${CENTER.y}`;
  const pathLength = useTransform(progress, [node.from + 0.06, node.from + 0.34], [0, 1]);
  const pulseOpacity = useTransform(progress, [node.from + 0.3, node.from + 0.4], [0, 1]);

  return (
    <g>
      <path d={d} stroke="rgb(245 246 242 / 0.1)" strokeWidth="1" />
      <motion.path d={d} stroke="var(--color-lime)" strokeWidth="1.25" style={{ pathLength }} />
      <motion.circle r="3.5" fill="var(--color-lime)" className="motion-decor" style={{ opacity: pulseOpacity }}>
        <animateMotion dur="2.8s" begin={`${index * 0.9}s`} repeatCount="indefinite" path={d} />
      </motion.circle>
    </g>
  );
}

function ChannelNode({
  progress,
  index,
  compact,
}: VisualProps & { index: number }) {
  const node = NODES[index];
  const channel = media.visual.channels[index];
  const opacity = useTransform(progress, [node.from, node.from + 0.12], [0, 1]);
  const scale = useTransform(progress, [node.from, node.from + 0.16], [0.7, 1]);

  return (
    <>
      <motion.span
        className="absolute grid w-[13%] min-w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-surface-2 font-mono text-[clamp(0.8rem,1.3vw,1.125rem)] text-paper ring-1 ring-paper/25"
        style={{
          left: `${(node.x / W) * 100}%`,
          top: `${(node.y / H) * 100}%`,
          opacity,
          scale,
          aspectRatio: "1",
        }}
        aria-hidden
      >
        {channel.name.charAt(0)}
      </motion.span>
      <motion.div
        className={cn("absolute w-[36%] max-w-[13rem]", node.labelClass)}
        style={{
          // On phones the side labels sit under their nodes, clear of the lines.
          top: `${((compact && index > 0 ? node.y + 44 : node.labelTop) / H) * 100}%`,
          opacity,
        }}
      >
        <p className="text-[0.8125rem] font-medium tracking-[-0.01em] sm:text-[0.9375rem]">
          {channel.name}
        </p>
        {!compact && (
          <p className="mt-1 text-[0.6875rem] leading-snug text-mute sm:text-[0.75rem]">
            {channel.role}
          </p>
        )}
      </motion.div>
    </>
  );
}

export function MediaVisual({ progress, compact }: VisualProps) {
  const ringLength = useTransform(progress, [0.62, 0.95], [0, 1]);
  const coreScale = useTransform(progress, [0.3, 0.6], [0.6, 1]);
  const coreOpacity = useTransform(progress, [0.3, 0.5], [0, 1]);
  const captionOpacity = useTransform(progress, [0.78, 0.95], [0, 1]);
  const triangle = `M${NODES[0].x},${NODES[0].y} L${NODES[2].x},${NODES[2].y} L${NODES[1].x},${NODES[1].y} Z`;

  return (
    <div className="flex size-full flex-col">
    <div className="grid min-h-0 flex-1 place-items-center" style={{ containerType: "size" }}>
    <div
      className="relative"
      style={{ width: `min(100cqw, calc(100cqh * ${W / H}))`, aspectRatio: `${W} / ${H}` }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" fill="none" aria-hidden>
        {/* Ambient orbit */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r="150"
          stroke="rgb(245 246 242 / 0.14)"
          strokeDasharray="2 9"
          className="motion-decor orbit-slow"
        />
        <circle cx={CENTER.x} cy={CENTER.y} r="92" stroke="rgb(245 246 242 / 0.08)" />

        {/* Shared audiences + learnings between the channels */}
        <motion.path
          d={triangle}
          stroke="rgb(245 246 242 / 0.35)"
          strokeWidth="1"
          style={{ pathLength: ringLength }}
        />

        {NODES.map((_, i) => (
          <ChannelLink key={i} index={i} progress={progress} />
        ))}
      </svg>

      {/* Core */}
      <motion.div
        className="absolute grid w-[19%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime text-ink shadow-[0_0_80px_0_rgb(217_255_112/0.25)]"
        style={{
          left: `${(CENTER.x / W) * 100}%`,
          top: `${(CENTER.y / H) * 100}%`,
          scale: coreScale,
          opacity: coreOpacity,
          aspectRatio: "1",
        }}
      >
        <span className="px-2 text-center text-[clamp(0.5625rem,0.95vw,0.8125rem)] font-medium leading-[1.1] tracking-[-0.02em]">
          {media.visual.center}
        </span>
      </motion.div>

      {NODES.map((_, i) => (
        <ChannelNode key={i} index={i} progress={progress} compact={compact} />
      ))}

      {!compact && (
        <motion.p
          className="absolute inset-x-[6%] bottom-0 text-center font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.14em] text-mute"
          style={{ opacity: captionOpacity }}
        >
          {media.visual.centerSub}
        </motion.p>
      )}
    </div>
    </div>

    {/* Phones: roles move out of the diagram into a legend */}
    {compact && (
      <motion.ul className="mt-3 shrink-0 border-t border-paper/12" style={{ opacity: captionOpacity }}>
        {media.visual.channels.map((channel) => (
          <li
            key={channel.name}
            className="grid grid-cols-[5.25rem_1fr] gap-3 border-b border-paper/12 py-2 text-[0.75rem] leading-snug"
          >
            <span className="font-medium">{channel.name}</span>
            <span className="text-mute">{channel.role}</span>
          </li>
        ))}
      </motion.ul>
    )}
    </div>
  );
}
