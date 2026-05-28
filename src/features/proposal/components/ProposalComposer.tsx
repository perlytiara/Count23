"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { parseFutureDatetimeLocal, toDatetimeLocalValue } from "@/features/countdown/utils/time";

interface ProposalComposerProps {
  titleLabel: string;
  titlePlaceholder: string;
  actorLabelText: string;
  actorPlaceholder: string;
  timeLabel: string;
  submitLabel: string;
  futureErrorLabel: string;
  initialTitle?: string;
  initialActor?: string;
  initialTarget?: Date | null;
  onSubmit: (input: { title?: string; actorLabel?: string; targetTime: Date }) => void;
}

export function ProposalComposer({
  titleLabel,
  titlePlaceholder,
  actorLabelText,
  actorPlaceholder,
  timeLabel,
  submitLabel,
  futureErrorLabel,
  initialTitle,
  initialActor,
  initialTarget,
  onSubmit,
}: ProposalComposerProps) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [actorLabel, setActorLabel] = useState(initialActor ?? "");
  const [dateTimeValue, setDateTimeValue] = useState(() =>
    initialTarget ? toDatetimeLocalValue(initialTarget) : toDatetimeLocalValue(new Date(Date.now() + 3_600_000)),
  );
  const [error, setError] = useState<string | null>(null);

  const minValue = useMemo(() => toDatetimeLocalValue(new Date()), []);

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = parseFutureDatetimeLocal(dateTimeValue);
        if (!parsed) {
          setError(futureErrorLabel);
          return;
        }
        setError(null);
        onSubmit({ title, actorLabel, targetTime: parsed });
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
    >
      <label className="text-xs uppercase tracking-wider ui-text-muted">{titleLabel}</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={titlePlaceholder}
        className="rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2 text-sm ui-text-strong outline-none focus:border-blue-400"
      />

      <label className="text-xs uppercase tracking-wider ui-text-muted">{actorLabelText}</label>
      <input
        value={actorLabel}
        onChange={(e) => setActorLabel(e.target.value)}
        placeholder={actorPlaceholder}
        className="rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2 text-sm ui-text-strong outline-none focus:border-blue-400"
      />

      <label className="text-xs uppercase tracking-wider ui-text-muted">{timeLabel}</label>
      <input
        type="datetime-local"
        value={dateTimeValue}
        min={minValue}
        onChange={(e) => {
          setDateTimeValue(e.target.value);
          setError(null);
        }}
        className="rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2 text-sm ui-text-strong outline-none focus:border-blue-400"
      />

      {error && <p className="text-xs text-amber-300">{error}</p>}

      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
      >
        {submitLabel}
      </button>
    </motion.form>
  );
}
