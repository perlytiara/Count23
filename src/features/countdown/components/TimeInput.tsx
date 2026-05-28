"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/features/i18n";
import {
  defaultDatetimeLocalValue,
  toDatetimeLocalValue,
  parseDatetimeLocal,
  parseFutureDatetimeLocal,
} from "../utils/time";

const DRAFT_KEY = "count23_input_draft";

interface TimeInputProps {
  onStart: (target: Date) => void;
}

export function TimeInput({ onStart }: TimeInputProps) {
  const { t } = useLocale();
  const [datetimeValue, setDatetimeValue] = useState(defaultDatetimeLocalValue);
  const [minLocal, setMinLocal] = useState(() => toDatetimeLocalValue(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refreshMin = useCallback(() => {
    setMinLocal(toDatetimeLocalValue(new Date()));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { datetimeValue?: string };
        if (typeof parsed.datetimeValue === "string" && parseDatetimeLocal(parsed.datetimeValue)) {
          setDatetimeValue(parsed.datetimeValue);
        }
      } catch {
        // Keep default today value.
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ datetimeValue }));
  }, [datetimeValue, hydrated]);

  const addQuickOffset = useCallback((hours: number) => {
    const base = parseDatetimeLocal(datetimeValue) ?? new Date();
    const next = new Date(base.getTime() + hours * 3_600_000);
    setDatetimeValue(toDatetimeLocalValue(next));
    setError(null);
  }, [datetimeValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!datetimeValue) return;
    const target = parseFutureDatetimeLocal(datetimeValue);
    if (!target) {
      setError(t.timer.errorPast);
      return;
    }
    onStart(target);
  };

  if (!hydrated) return null;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex w-full max-w-md flex-col items-center justify-center gap-5"
    >
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
        aria-label={t.timer.pickDateTime}
        className="w-full rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-4 text-center
                   text-xl font-mono text-white outline-none transition-all sm:text-2xl
                   focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                   [&::-webkit-calendar-picker-indicator]:cursor-pointer
                   [&::-webkit-calendar-picker-indicator]:invert"
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        {([1, 3, 12, 24] as const).map((hours) => (
          <button
            key={hours}
            type="button"
            onClick={() => addQuickOffset(hours)}
            className="rounded-full border border-white/20 bg-white/[0.08] px-3 py-1.5 text-xs font-medium ui-text-body transition-colors hover:bg-white/[0.14]"
          >
            {hours === 24 ? "+1d" : `+${hours}h`}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-amber-300" role="alert">
          {error}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={!datetimeValue}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full max-w-xs rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white
                   shadow-lg shadow-blue-500/25 transition-colors
                   hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t.timer.start}
      </motion.button>
    </motion.form>
  );
}
