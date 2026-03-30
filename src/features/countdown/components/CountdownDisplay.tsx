"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [showDetails, setShowDetails] = useState(false);
  const progressPercent = Math.round(state.progress * 100);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-white/20 bg-white/[0.05] px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-300">{t.timer.targetLabel}</p>
          <p className="font-mono text-sm text-slate-100 sm:text-base">{formatTargetDisplay(targetTime, locale)}</p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/[0.05] px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-300">{t.timer.remaining}</p>
          <p className="font-mono text-sm text-slate-100 sm:text-base">{formatDurationLong(state.totalRemaining, locale)}</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="rounded-full border border-white/20 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-100 transition-colors hover:bg-white/[0.1]"
        >
          {showDetails ? t.timer.hideDetails : t.timer.showDetails}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid gap-2 overflow-hidden sm:grid-cols-2"
          >
            <div className="rounded-xl border border-white/20 bg-white/[0.05] px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-300">{t.timer.progress}</p>
              <p className="font-mono text-sm text-slate-100 sm:text-base">{progressPercent}%</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/[0.05] px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-300">{t.timer.total}</p>
              <p className="font-mono text-sm text-slate-100 sm:text-base">{formatDurationLong(totalDuration, locale)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {pipSupported && onPopOut && (
          <motion.button
            type="button"
            onClick={onPopOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg border border-white/20 bg-white/[0.06] px-3 py-1.5
                       text-xs font-medium text-slate-100 transition-colors hover:bg-white/[0.14]"
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
                     text-xs font-medium text-red-200 transition-colors hover:bg-red-500/20"
        >
          {t.timer.cancel}
        </motion.button>
      </div>
    </div>
  );
}
