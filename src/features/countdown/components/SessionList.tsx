"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/features/i18n";
import { formatTimeLocale, formatRemaining } from "../utils/time";
import type { CountdownSession } from "../types";

interface SessionListProps {
  sessions: CountdownSession[];
  activeSessions: CountdownSession[];
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCancelSession: (sessionId: string) => void;
  onClearHistory: () => void;
  onRemoveSession: (id: string) => void;
  onAddTimer: () => void;
}

const STATUS_STYLES = {
  active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export function SessionList({
  sessions,
  activeSessions,
  selectedSessionId,
  onSelectSession,
  onCancelSession,
  onClearHistory,
  onRemoveSession,
  onAddTimer,
}: SessionListProps) {
  const { t, locale } = useLocale();

  const historySessions = sessions.filter((s) => s.status !== "active");
  const hasHistory = historySessions.length > 0;

  const statusLabel = (status: CountdownSession["status"]) => {
    const labels = { active: t.sessions.active, completed: t.sessions.completed, cancelled: t.sessions.cancelled };
    return labels[status];
  };

  if (sessions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        {t.sessions.empty}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t.sessions.title}
        </h3>
        {activeSessions.length > 0 && (
          <button
            type="button"
            onClick={onAddTimer}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            + {t.sessions.addTimer}
          </button>
        )}
      </div>

      {activeSessions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            {t.sessions.active}
          </span>
          <AnimatePresence mode="popLayout">
            {activeSessions.map((session) => {
              const target = new Date(session.targetTime);
              const remaining = Math.max(0, target.getTime() - Date.now());
              const isSelected = session.id === selectedSessionId;
              return (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  onClick={() => onSelectSession(session.id)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border cursor-pointer transition-colors
                    ${isSelected ? "bg-blue-500/20 border-blue-500/40" : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06]"}`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {formatTimeLocale(target, locale)}
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {formatRemaining(remaining)} left
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${STATUS_STYLES.active}`}>
                      {isSelected ? "•" : ""} {t.sessions.active}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelSession(session.id);
                      }}
                      className="rounded-lg px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                      aria-label={t.timer.cancel}
                    >
                      {t.timer.cancel}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {hasHistory && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              {t.sessions.completed} / {t.sessions.cancelled}
            </span>
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {t.sessions.clear}
            </button>
          </div>
          <AnimatePresence mode="popLayout">
            {historySessions.slice(0, 15).map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-2.5 border border-white/5"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm text-slate-300">
                    {formatTimeLocale(new Date(session.targetTime), locale)}
                  </span>
                  {session.label && (
                    <span className="text-xs text-slate-500 truncate">{session.label}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${STATUS_STYLES[session.status]}`}>
                    {statusLabel(session.status)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveSession(session.id)}
                    className="rounded px-2 py-0.5 text-[10px] text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    aria-label={t.sessions.remove}
                  >
                    {t.sessions.remove}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
