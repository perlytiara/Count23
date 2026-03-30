"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/features/i18n";
import {
  getTargetDate,
  toDatetimeLocalValue,
  parseFutureDatetimeLocal,
} from "../utils/time";

type InputMode = "quick" | "datetime";

const DRAFT_KEY = "count23_input_draft";

interface TimeInputProps {
  onStart: (target: Date) => void;
}

export function TimeInput({ onStart }: TimeInputProps) {
  const { t } = useLocale();
  const [mode, setMode] = useState<InputMode>("datetime");
  const [timeValue, setTimeValue] = useState("");
  const [datetimeValue, setDatetimeValue] = useState("");
  const [minLocal, setMinLocal] = useState(() => toDatetimeLocalValue(new Date()));
  const [error, setError] = useState<string | null>(null);

  const refreshMin = useCallback(() => {
    setMinLocal(toDatetimeLocalValue(new Date()));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        mode?: InputMode;
        timeValue?: string;
        datetimeValue?: string;
      };
      if (parsed.mode === "quick" || parsed.mode === "datetime") setMode(parsed.mode);
      if (typeof parsed.timeValue === "string") setTimeValue(parsed.timeValue);
      if (typeof parsed.datetimeValue === "string") setDatetimeValue(parsed.datetimeValue);
    } catch {
      // Ignore malformed draft and keep defaults.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        mode,
        timeValue,
        datetimeValue,
      }),
    );
  }, [mode, timeValue, datetimeValue]);

  const addQuickOffset = useCallback(
    (hours: number) => {
      const target = new Date(Date.now() + hours * 3_600_000);
      setDatetimeValue(toDatetimeLocalValue(target));
      setMode("datetime");
      setError(null);
    },
    [setDatetimeValue],
  );

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

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => addQuickOffset(1)}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10"
        >
          +1h
        </button>
        <button
          type="button"
          onClick={() => addQuickOffset(3)}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10"
        >
          +3h
        </button>
        <button
          type="button"
          onClick={() => addQuickOffset(12)}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10"
        >
          +12h
        </button>
        <button
          type="button"
          onClick={() => addQuickOffset(24)}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10"
        >
          +1d
        </button>
      </div>

      {mode === "quick" ? (
        <input
          type="time"
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          required
          className="w-52 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center
                     text-xl font-mono text-white outline-none transition-all sm:text-2xl
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
          className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center
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
