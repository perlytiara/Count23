"use client";

import { useState, useEffect, useCallback } from "react";
import type { CountdownSession } from "../types";

const STORAGE_KEY = "count23_sessions";

function loadSessions(): CountdownSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: CountdownSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useSession() {
  const [sessions, setSessions] = useState<CountdownSession[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSessions(loadSessions());
    setHydrated(true);
  }, []);

  const persist = useCallback((updated: CountdownSession[]) => {
    setSessions(updated);
    saveSessions(updated);
  }, []);

  const createSession = useCallback(
    (targetTime: Date, totalDuration: number, label?: string): CountdownSession => {
      const session: CountdownSession = {
        id: crypto.randomUUID(),
        targetTime: targetTime.toISOString(),
        createdAt: new Date().toISOString(),
        totalDuration,
        label,
        status: "active",
      };
      const updated = [session, ...sessions];
      persist(updated);
      return session;
    },
    [sessions, persist],
  );

  const completeSession = useCallback(
    (id: string) => {
      persist(sessions.map((s) => (s.id === id ? { ...s, status: "completed" as const } : s)));
    },
    [sessions, persist],
  );

  const cancelSession = useCallback(
    (id: string) => {
      persist(sessions.map((s) => (s.id === id ? { ...s, status: "cancelled" as const } : s)));
    },
    [sessions, persist],
  );

  const clearHistory = useCallback(() => {
    persist(sessions.filter((s) => s.status === "active"));
  }, [sessions, persist]);

  const getActiveSession = useCallback((): CountdownSession | null => {
    return sessions.find((s) => s.status === "active") ?? null;
  }, [sessions]);

  const getActiveSessions = useCallback((): CountdownSession[] => {
    return sessions.filter((s) => s.status === "active");
  }, [sessions]);

  const removeSession = useCallback(
    (id: string) => {
      persist(sessions.filter((s) => s.id !== id));
    },
    [sessions, persist],
  );

  const updateSessionTarget = useCallback(
    (id: string, nextTarget: Date) => {
      const now = Date.now();
      const nextDuration = nextTarget.getTime() - now;
      if (nextDuration <= 0) return;
      persist(
        sessions.map((s) =>
          s.id === id
            ? {
                ...s,
                targetTime: nextTarget.toISOString(),
                totalDuration: nextDuration,
              }
            : s,
        ),
      );
    },
    [sessions, persist],
  );

  return {
    sessions,
    hydrated,
    createSession,
    completeSession,
    cancelSession,
    clearHistory,
    getActiveSession,
    getActiveSessions,
    removeSession,
    updateSessionTarget,
  };
}
