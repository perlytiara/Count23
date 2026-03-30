"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/features/i18n";
import { formatTargetDisplay } from "../utils/time";

interface CountdownDisplayProps {
  targetTime: Date;
  onCancel: () => void;
  onPopOut?: () => void;
  pipSupported?: boolean;
  pipActive?: boolean;
}

export function CountdownDisplay({
  targetTime,
  onCancel,
  onPopOut,
  pipSupported,
  pipActive,
}: CountdownDisplayProps) {
  const { t, locale } = useLocale();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <p className="text-sm text-slate-400">
        <span className="text-slate-500">{t.timer.targetLabel}</span>{" "}
        <span className="font-mono font-medium text-slate-200">
          {formatTargetDisplay(targetTime, locale)}
        </span>
      </p>
      <div className="flex items-center gap-2">
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
