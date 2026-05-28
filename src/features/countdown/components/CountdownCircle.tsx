"use client";

import { motion } from "framer-motion";
import type { CountdownState } from "../types";
import { padTwo } from "../utils/time";

interface CountdownCircleProps {
  state: CountdownState;
  labels: { day: string; days: string; hours: string; minutes: string; seconds: string };
  showMilliseconds?: boolean;
  progressPercent?: number;
  targetLabel?: string;
  targetDisplay?: string;
}

const RADIUS = 116;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE) * 2;
const CENTER = SIZE / 2;

function getColor(progress: number): string {
  if (progress < 0.6) return "#3b82f6";
  if (progress < 0.85) return "#eab308";
  return "#ef4444";
}

function getGlowColor(progress: number): string {
  if (progress < 0.6) return "rgba(59, 130, 246, 0.3)";
  if (progress < 0.85) return "rgba(234, 179, 8, 0.3)";
  return "rgba(239, 68, 68, 0.4)";
}

export function CountdownCircle({
  state,
  labels,
  showMilliseconds = true,
  progressPercent,
  targetLabel,
  targetDisplay,
}: CountdownCircleProps) {
  const { days, hours, minutes, seconds, milliseconds, progress, isComplete } = state;
  const offset = CIRCUMFERENCE * (1 - progress);
  const color = isComplete ? "#22c55e" : getColor(progress);
  const glow = isComplete ? "rgba(34, 197, 94, 0.4)" : getGlowColor(progress);
  const isUrgent = progress > 0.85 && !isComplete;
  const pct = progressPercent ?? Math.round(progress * 100);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className={`-rotate-90 ${isUrgent ? "animate-pulse-glow" : ""}`}
          style={{ filter: `drop-shadow(0 0 20px ${glow})` }}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="rgba(148, 163, 184, 0.08)"
            strokeWidth={STROKE}
          />

          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            initial={false}
            animate={{ strokeDashoffset: offset, stroke: color }}
            transition={{ duration: 0.3, ease: "linear" }}
          />

          {isUrgent && (
            <motion.circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth={STROKE + 4}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              opacity={0.15}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          {days > 0 && (
            <div className="mb-0.5 max-w-[85%] truncate rounded-full border border-white/20 bg-white/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ui-text-body">
              {days} {days === 1 ? labels.day : labels.days}
            </div>
          )}
          <div
            className="flex max-w-[88%] items-baseline justify-center gap-px tabular-nums"
            style={{ fontSize: "clamp(1.35rem, 5.2vw, 2.1rem)" }}
          >
            <span className="font-bold leading-none tracking-tight" style={{ color }}>
              {padTwo(hours)}
            </span>
            <span className="font-light leading-none ui-text-muted">:</span>
            <span className="font-bold leading-none tracking-tight" style={{ color }}>
              {padTwo(minutes)}
            </span>
            <span className="font-light leading-none ui-text-muted">:</span>
            <span className="font-bold leading-none tracking-tight" style={{ color }}>
              {padTwo(seconds)}
            </span>
          </div>

          {showMilliseconds && (
            <div className="mt-0.5 font-mono text-xs ui-text-muted">.{padTwo(milliseconds)}</div>
          )}

          <div className="mt-1.5 flex max-w-full gap-3 text-[8px] uppercase tracking-widest ui-text-muted">
            <span>{labels.hours}</span>
            <span>{labels.minutes}</span>
            <span>{labels.seconds}</span>
          </div>
        </div>
      </div>

      {(targetDisplay || progressPercent !== undefined) && (
        <div className="w-full max-w-xs space-y-1.5 px-2">
          {targetDisplay && (
            <p className="text-center text-xs ui-text-muted">
              {targetLabel && <span className="mr-1">{targetLabel}</span>}
              <span className="font-mono ui-text-body">{targetDisplay}</span>
            </p>
          )}
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
