"use client";

import { motion } from "framer-motion";
import type { CountdownState } from "../types";
import { padTwo } from "../utils/time";

interface CountdownCircleProps {
  state: CountdownState;
  labels: { hours: string; minutes: string; seconds: string };
}

const RADIUS = 140;
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

export function CountdownCircle({ state, labels }: CountdownCircleProps) {
  const { hours, minutes, seconds, milliseconds, progress, isComplete } = state;
  const offset = CIRCUMFERENCE * (1 - progress);
  const color = isComplete ? "#22c55e" : getColor(progress);
  const glow = isComplete ? "rgba(34, 197, 94, 0.4)" : getGlowColor(progress);
  const isUrgent = progress > 0.85 && !isComplete;

  return (
    <div className="relative flex items-center justify-center">
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

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-1 tabular-nums">
          <span className="text-5xl font-bold tracking-tight sm:text-6xl" style={{ color }}>
            {padTwo(hours)}
          </span>
          <span className="text-3xl font-light text-slate-500 sm:text-4xl">:</span>
          <span className="text-5xl font-bold tracking-tight sm:text-6xl" style={{ color }}>
            {padTwo(minutes)}
          </span>
          <span className="text-3xl font-light text-slate-500 sm:text-4xl">:</span>
          <span className="text-5xl font-bold tracking-tight sm:text-6xl" style={{ color }}>
            {padTwo(seconds)}
          </span>
        </div>

        <div className="mt-1 font-mono text-lg text-slate-500">
          .{padTwo(milliseconds)}
        </div>

        <div className="mt-3 flex gap-6 text-[10px] uppercase tracking-widest text-slate-500">
          <span>{labels.hours}</span>
          <span>{labels.minutes}</span>
          <span>{labels.seconds}</span>
        </div>
      </div>
    </div>
  );
}
