"use client";

import {
  Captions,
  CaptionsOff,
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings2,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { Logo } from "@/components/ui/logo";
import { images } from "@/config/images";
import { integrations } from "@/config/integrations";
import { content } from "@/content";
import { track, type FunnelEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const t = content.vsl.player;

const MILESTONES: Array<[number, FunnelEvent]> = [
  [0.25, "vsl_25_percent"],
  [0.5, "vsl_50_percent"],
  [0.75, "vsl_75_percent"],
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * Case study video player.
 *
 * Every control is wired to the underlying <video> element. When no source
 * is configured the component renders a clearly labelled setup poster and
 * no controls at all — it never shows controls that do nothing.
 */
export function VideoPlayer() {
  const { src, captions, captionsLang, captionsLabel } = integrations.video;

  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number | null>(null);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [failed, setFailed] = useState(false);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2600);
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setFailed(true));
    else video.pause();
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(Math.max(0, time), video.duration);
    setCurrent(video.currentTime);
  }, []);

  const changeVolume = useCallback((next: number) => {
    const video = videoRef.current;
    if (!video) return;
    const value = Math.min(1, Math.max(0, next));
    video.volume = value;
    video.muted = value === 0;
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.6;
  }, []);

  const toggleCaptions = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.textTracks.length === 0) return;
    const next = video.textTracks[0].mode !== "showing";
    video.textTracks[0].mode = next ? "showing" : "hidden";
    setCaptionsOn(next);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current as WebkitVideo | null;
    if (!wrap || !video) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (wrap.requestFullscreen) void wrap.requestFullscreen().catch(() => undefined);
    // iOS Safari only supports fullscreen on the <video> element itself.
    else video.webkitEnterFullscreen?.();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Let native controls (sliders, buttons) keep their own keys.
    const target = event.target as HTMLElement;
    const onSlider = target instanceof HTMLInputElement;
    const onButton = target instanceof HTMLButtonElement;
    const video = videoRef.current;
    if (!video) return;

    switch (event.key) {
      case " ":
      case "k":
        if (onButton && event.key === " ") return;
        event.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        if (onSlider) return;
        event.preventDefault();
        seekTo(video.currentTime + 10);
        break;
      case "ArrowLeft":
        if (onSlider) return;
        event.preventDefault();
        seekTo(video.currentTime - 10);
        break;
      case "m":
        toggleMute();
        break;
      case "c":
        toggleCaptions();
        break;
      case "f":
        toggleFullscreen();
        break;
      default:
        return;
    }
    revealControls();
  };

  /* ── No source configured: honest setup placeholder ───────── */
  if (!src) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-surface ring-1 ring-paper/12">
        <Image
          src={images.caseStudy.src}
          alt=""
          fill
          preload
          sizes="(min-width: 1536px) 1440px, 100vw"
          className="object-cover opacity-45"
          style={{ objectPosition: images.caseStudy.position }}
        />
        <div className="absolute inset-0 bg-ink-deep/55" />
        <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8 lg:p-12">
          <div className="flex items-center justify-between">
            <Logo className="text-lg sm:text-xl" />
            <span className="type-eyebrow text-paper/60 max-sm:hidden">{t.posterKicker}</span>
          </div>
          <div className="mx-auto w-full max-w-xl rounded-md border border-dashed border-lime/50 bg-ink-deep/80 p-5 text-center backdrop-blur-sm sm:p-8">
            <Settings2 className="mx-auto size-6 text-lime" strokeWidth={1.5} aria-hidden />
            <p className="mt-4 text-[1.125rem] font-medium tracking-[-0.02em] sm:text-[1.375rem]">
              {t.notConfiguredTitle}
            </p>
            <p className="mt-2 font-mono text-[0.6875rem] leading-relaxed text-mute sm:text-[0.75rem]">
              {t.notConfiguredBody}
            </p>
          </div>
          <p className="max-w-[18ch] text-[clamp(1.125rem,2.6vw,2.5rem)] font-medium leading-none tracking-[-0.04em] max-sm:hidden">
            {t.posterTitle}
          </p>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const showControls = controlsVisible || !playing;

  return (
    <div
      ref={wrapRef}
      role="group"
      aria-label={t.posterTitle}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={revealControls}
      onTouchStart={revealControls}
      onFocus={revealControls}
      className={cn(
        "group/player relative w-full overflow-hidden bg-black ring-1 ring-paper/12",
        fullscreen ? "h-full" : "aspect-video rounded-md",
        playing && !showControls && "cursor-none",
      )}
    >
      <video
        ref={videoRef}
        className="size-full object-contain"
        src={src}
        playsInline
        preload="metadata"
        crossOrigin={captions ? "anonymous" : undefined}
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          track("vsl_play", {}, { once: true });
          revealControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          setCurrent(video.currentTime);
          if (video.duration > 0) {
            const ratio = video.currentTime / video.duration;
            for (const [threshold, name] of MILESTONES) {
              if (ratio >= threshold) track(name, {}, { once: true });
            }
          }
        }}
        onProgress={(event) => {
          const video = event.currentTarget;
          if (video.buffered.length > 0 && video.duration > 0) {
            setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
          }
        }}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setMuted(event.currentTarget.muted);
        }}
        onEnded={() => {
          track("vsl_complete", {}, { once: true });
          setPlaying(false);
          setControlsVisible(true);
        }}
        onError={() => setFailed(true)}
      >
        {captions && (
          <track kind="captions" src={captions} srcLang={captionsLang} label={captionsLabel} />
        )}
      </video>

      {/* Poster until first play */}
      {!started && !failed && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={t.play}
          className="group/poster absolute inset-0 text-left"
        >
          <Image
            src={images.caseStudy.src}
            alt=""
            fill
            preload
            sizes="(min-width: 1536px) 1440px, 100vw"
            className="object-cover"
            style={{ objectPosition: images.caseStudy.position }}
          />
          <span className="absolute inset-0 bg-[linear-gradient(to_top,rgb(7_10_17/0.9),rgb(7_10_17/0.25)_50%,rgb(7_10_17/0.4))]" />
          <span className="absolute left-5 top-5 sm:left-8 sm:top-8">
            <Logo className="text-lg sm:text-xl" />
          </span>
          <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center sm:size-28">
            <span className="motion-decor ring-pulse absolute inset-0 rounded-full border border-lime/60" />
            <span className="absolute inset-0 rounded-full bg-lime transition-transform duration-500 ease-(--ease-expo) group-hover/poster:scale-110" />
            <Play className="relative ml-1 size-7 fill-ink text-ink sm:size-9" aria-hidden />
          </span>
          <span className="absolute inset-x-5 bottom-5 sm:inset-x-8 sm:bottom-8 lg:inset-x-12 lg:bottom-12">
            <span className="type-eyebrow block text-paper/60">{t.posterKicker}</span>
            <span className="mt-3 block max-w-[16ch] text-[clamp(1.25rem,3.2vw,3rem)] font-medium leading-[0.98] tracking-[-0.04em]">
              {t.posterTitle}
            </span>
          </span>
        </button>
      )}

      {failed && (
        <div role="alert" className="absolute inset-0 grid place-items-center bg-ink-deep p-8 text-center">
          <p className="max-w-[40ch] text-[1rem] leading-relaxed text-paper/80">{t.error}</p>
        </div>
      )}

      {/* Controls */}
      {started && !failed && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-2 pt-12 transition-opacity duration-300 sm:px-5 sm:pb-3",
            showControls ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="relative flex h-5 items-center">
            <div className="pointer-events-none absolute inset-x-0 h-1 overflow-hidden rounded-full bg-paper/20">
              <div className="absolute inset-y-0 left-0 bg-paper/25" style={{ width: `${buffered}%` }} />
              <div className="absolute inset-y-0 left-0 bg-lime" style={{ width: `${progress}%` }} />
            </div>
            <input
              type="range"
              aria-label={t.seek}
              aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={(event) => seekTo(Number(event.target.value))}
              className="vsl-seek absolute inset-x-0 h-5 w-full cursor-pointer opacity-0"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime shadow-[0_0_0_3px_rgb(0_0_0/0.35)]"
              style={{ left: `${progress}%` }}
            />
          </div>

          <div className="mt-1 flex items-center gap-1 text-paper sm:gap-2">
            <ControlButton label={playing ? t.pause : t.play} onClick={togglePlay}>
              {playing ? <Pause className="size-[1.125rem] fill-current" /> : <Play className="size-[1.125rem] fill-current" />}
            </ControlButton>

            <ControlButton label={muted || volume === 0 ? t.unmute : t.mute} onClick={toggleMute}>
              {muted || volume === 0 ? <VolumeX className="size-[1.125rem]" /> : <Volume2 className="size-[1.125rem]" />}
            </ControlButton>
            <input
              type="range"
              aria-label={t.volume}
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => changeVolume(Number(event.target.value))}
              className="range hidden w-20 sm:block"
              style={{ "--fill": `${(muted ? 0 : volume) * 100}%` } as CSSProperties}
            />

            <span className="ml-2 font-mono text-[0.75rem] tabular-nums text-paper/85">
              {formatTime(current)} <span className="text-paper/45">/ {formatTime(duration)}</span>
            </span>

            <span className="flex-1" />

            {captions && (
              <ControlButton
                label={captionsOn ? t.captionsOff : t.captionsOn}
                pressed={captionsOn}
                onClick={toggleCaptions}
              >
                {captionsOn ? <Captions className="size-[1.125rem] text-lime" /> : <CaptionsOff className="size-[1.125rem]" />}
              </ControlButton>
            )}
            <ControlButton label={fullscreen ? t.exitFullscreen : t.fullscreen} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize className="size-[1.125rem]" /> : <Maximize className="size-[1.125rem]" />}
            </ControlButton>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-full transition-colors hover:bg-paper/15"
    >
      {children}
    </button>
  );
}
