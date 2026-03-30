"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/features/i18n";
import {
  formatTimeLocale,
  formatRemaining,
  formatTargetDisplay,
  parseFutureDatetimeLocal,
  toDatetimeLocalValue,
} from "../utils/time";
import type { CountdownSession } from "../types";

interface SessionListProps {
  sessions: CountdownSession[];
  activeSessions: CountdownSession[];
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCancelSession: (sessionId: string) => void;
  onEditSession: (id: string, target: Date) => void;
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
  onEditSession,
  onClearHistory,
  onRemoveSession,
  onAddTimer,
}: SessionListProps) {
  const { t, locale } = useLocale();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const historySessions = sessions.filter((s) => s.status !== "active");
  const hasHistory = historySessions.length > 0;

  const statusLabel = (status: CountdownSession["status"]) => {
    const labels = { active: t.sessions.active, completed: t.sessions.completed, cancelled: t.sessions.cancelled };
    return labels[status];
  };

  if (sessions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-300">
        {t.sessions.empty}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {t.sessions.title}
        </h3>
        {activeSessions.length > 0 && (
          <button
            type="button"
            onClick={onAddTimer}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10"
          >
            + {t.sessions.addTimer}
          </button>
        )}
      </div>

      {activeSessions.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-300">
            {t.sessions.active}
          </span>
          <AnimatePresence mode="popLayout">
            {activeSessions.map((session) => {
              const target = new Date(session.targetTime);
              const remaining = Math.max(0, target.getTime() - Date.now());
              const isSelected = session.id === selectedSessionId;
              const isEditing = editingId === session.id;
              return (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  onClick={() => onSelectSession(session.id)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-500/20 border-blue-500/40" : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block text-base font-semibold text-slate-100 truncate">
                        {formatTargetDisplay(target, locale)}
                      </span>
                      <span className="text-xs text-slate-200 tabular-nums">
                        {formatRemaining(remaining)} left
                      </span>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${STATUS_STYLES.active}`}>
                      {isSelected ? "• " : ""}
                      {t.sessions.active}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(session.id);
                        setEditValue(toDatetimeLocalValue(target));
                        setEditError(null);
                      }}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                    >
                      {t.sessions.edit}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelSession(session.id);
                      }}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-colors"
                      aria-label={t.timer.cancel}
                    >
                      {t.timer.cancel}
                    </button>
                  </div>

                  {isEditing && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3" onClick={(e) => e.stopPropagation()}>
                      <label className="mb-2 block text-[11px] uppercase tracking-wider text-slate-300">{t.sessions.editTarget}</label>
                      <input
                        type="datetime-local"
                        value={editValue}
                        min={toDatetimeLocalValue(new Date())}
                        onChange={(e) => {
                          setEditValue(e.target.value);
                          setEditError(null);
                        }}
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500/50"
                      />
                      {editError && <p className="mt-2 text-xs text-amber-400">{editError}</p>}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const parsed = parseFutureDatetimeLocal(editValue);
                            if (!parsed) {
                              setEditError(t.timer.errorPast);
                              return;
                            }
                            onEditSession(session.id, parsed);
                            setEditingId(null);
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          {t.sessions.save}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditError(null);
                          }}
                          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                        >
                          {t.settings.close}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {hasHistory && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-300">
              {t.sessions.completed} / {t.sessions.cancelled}
            </span>
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-slate-300 hover:text-slate-100 transition-colors"
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
                  <span className="text-sm text-slate-200">
                    {formatTimeLocale(new Date(session.targetTime), locale)}
                  </span>
                  {session.label && (
                    <span className="text-xs text-slate-300 truncate">{session.label}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${STATUS_STYLES[session.status]}`}>
                    {statusLabel(session.status)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveSession(session.id)}
                    className="rounded px-2 py-0.5 text-[10px] text-slate-300 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
