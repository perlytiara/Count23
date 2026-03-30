"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/features/i18n";
import type { CountdownState } from "../types";
import { formatDurationLong, formatTargetDisplay } from "../utils/time";

interface CountdownDisplayProps {
  targetTime: Date;
  state: CountdownState;
  totalDuration: number;
  onCancel: () => void;
  onPopOut?: () => void;
  pipSupported?: boolean;
  pipActive?: boolean;
}

export function CountdownDisplay({
  targetTime,
  state,
  totalDuration,
  onCancel,
  onPopOut,
  pipSupported,
  pipActive,
}: CountdownDisplayProps) {
  const { t, locale } = useLocale();
  const progressPercent = Math.round(state.progress * 100);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">{t.timer.targetLabel}</p>
          <p className="font-mono text-sm text-slate-200 sm:text-base">{formatTargetDisplay(targetTime, locale)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">{t.timer.remaining}</p>
          <p className="font-mono text-sm text-slate-200 sm:text-base">{formatDurationLong(state.totalRemaining, locale)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">{t.timer.progress}</p>
          <p className="font-mono text-sm text-slate-200 sm:text-base">{progressPercent}%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">{t.timer.total}</p>
          <p className="font-mono text-sm text-slate-200 sm:text-base">{formatDurationLong(totalDuration, locale)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {pipSupported && onPopOut && (
          <motion.button
            type="button"
            onClick={onPopOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg border border-slate-500/30 bg-slate-500/10 px-3 py-1.5
                       text-xs font-medium text-slate-300 transition-colors hover:bg-slate-500/20"
            aria-label={t.timer.popOut}
          >
            {pipActive ? t.timer.popOutActive : t.timer.popOut}
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-1.5
                     text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
        >
          {t.timer.cancel}
        </motion.button>
      </div>
    </div>
  );
}
