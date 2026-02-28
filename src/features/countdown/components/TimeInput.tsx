"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/features/i18n";

interface TimeInputProps {
  onStart: (time: string) => void;
}

export function TimeInput({ onStart }: TimeInputProps) {
  const { t } = useLocale();
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    onStart(value);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4"
    >
      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
        {t.timer.setTarget}
      </label>

      <input
        type="time"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        className="w-48 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center
                   text-2xl font-mono text-white outline-none transition-all
                   focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                   [&::-webkit-calendar-picker-indicator]:invert"
      />

      <motion.button
        type="submit"
        disabled={!value}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white
                   shadow-lg shadow-blue-500/20 transition-colors
                   hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t.timer.start}
      </motion.button>
    </motion.form>
  );
}
