"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/features/i18n";
import { formatTimeLocale } from "../utils/time";
import type { CountdownSession } from "../types";

interface SessionListProps {
  sessions: CountdownSession[];
  onClear: () => void;
}

const STATUS_STYLES = {
  active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export function SessionList({ sessions, onClear }: SessionListProps) {
  const { t, locale } = useLocale();

  const statusLabel = (status: CountdownSession["status"]) => {
    const labels = { active: t.sessions.active, completed: t.sessions.completed, cancelled: t.sessions.cancelled };
    return labels[status];
  };

  if (sessions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        {t.sessions.empty}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t.sessions.title}
        </h3>
        {sessions.some((s) => s.status !== "active") && (
          <button
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {t.sessions.clear}
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {sessions.slice(0, 10).map((session) => (
          <motion.div
            key={session.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3
                       border border-white/5"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-200">
                {formatTimeLocale(new Date(session.targetTime), locale)}
              </span>
              {session.label && (
                <span className="text-xs text-slate-500">{session.label}</span>
              )}
            </div>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${STATUS_STYLES[session.status]}`}>
              {statusLabel(session.status)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
