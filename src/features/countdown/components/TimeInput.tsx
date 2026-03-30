"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/features/i18n";
import {
  getTargetDate,
  toDatetimeLocalValue,
  parseFutureDatetimeLocal,
} from "../utils/time";

type InputMode = "quick" | "datetime";

interface TimeInputProps {
  onStart: (target: Date) => void;
}

export function TimeInput({ onStart }: TimeInputProps) {
  const { t } = useLocale();
  const [mode, setMode] = useState<InputMode>("quick");
  const [timeValue, setTimeValue] = useState("");
  const [datetimeValue, setDatetimeValue] = useState("");
  const [minLocal, setMinLocal] = useState(() => toDatetimeLocalValue(new Date()));
  const [error, setError] = useState<string | null>(null);

  const refreshMin = useCallback(() => {
    setMinLocal(toDatetimeLocalValue(new Date()));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "quick") {
      if (!timeValue) return;
      onStart(getTargetDate(timeValue));
      return;
    }

    if (!datetimeValue) return;
    const target = parseFutureDatetimeLocal(datetimeValue);
    if (!target) {
      setError(t.timer.errorPast);
      return;
    }
    onStart(target);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4"
    >
      <div
        className="flex w-full max-w-sm flex-wrap justify-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
        role="group"
        aria-label={t.timer.modeGroupLabel}
      >
        <button
          type="button"
          onClick={() => {
            setMode("quick");
            setError(null);
          }}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
            mode === "quick"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.timer.modeQuick}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("datetime");
            setError(null);
            refreshMin();
          }}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
            mode === "datetime"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.timer.modePickDate}
        </button>
      </div>

      <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
        {mode === "quick" ? t.timer.setTarget : t.timer.pickDateTime}
      </label>

      {mode === "quick" ? (
        <input
          type="time"
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          required
          className="w-48 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center
                     text-2xl font-mono text-white outline-none transition-all
                     focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                     [&::-webkit-calendar-picker-indicator]:invert"
        />
      ) : (
        <input
          type="datetime-local"
          value={datetimeValue}
          min={minLocal}
          onFocus={refreshMin}
          onChange={(e) => {
            setDatetimeValue(e.target.value);
            setError(null);
          }}
          required
          className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center
                     text-lg font-mono text-white outline-none transition-all
                     focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                     [&::-webkit-calendar-picker-indicator]:invert"
        />
      )}

      {error && (
        <p className="text-center text-sm text-amber-400" role="alert">
          {error}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={mode === "quick" ? !timeValue : !datetimeValue}
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
