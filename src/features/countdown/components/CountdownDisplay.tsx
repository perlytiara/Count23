"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/features/i18n";
import { formatTimeLocale } from "../utils/time";

interface CountdownDisplayProps {
  targetTime: Date;
  onCancel: () => void;
}

export function CountdownDisplay({ targetTime, onCancel }: CountdownDisplayProps) {
  const { t, locale } = useLocale();

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm text-slate-400">
        <span className="text-slate-500">{t.timer.targetLabel}</span>{" "}
        <span className="font-mono font-medium text-slate-200">
          {formatTimeLocale(targetTime, locale)}
        </span>
      </p>
      <motion.button
        onClick={onCancel}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-1.5
                   text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
      >
        {t.timer.cancel}
      </motion.button>
    </div>
  );
}
