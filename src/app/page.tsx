"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CountdownCircle,
  TimeInput,
  CountdownDisplay,
  SessionList,
  SuccessAnimation,
  useCountdown,
  useSession,
} from "@/features/countdown";
import { NotificationToggle, useNotifications } from "@/features/notifications";
import { LocaleContext, getMessages, type Locale } from "@/features/i18n";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { InstallPrompt } from "@/components/InstallPrompt";
import { getTargetDate } from "@/features/countdown/utils/time";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("count23_locale");
  if (saved === "fr" || saved === "en") return saved;
  return navigator.language.startsWith("fr") ? "fr" : "en";
}

export default function HomePage() {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  const t = useMemo(() => getMessages(locale), [locale]);
  const { sessions, hydrated, createSession, completeSession, cancelSession, clearHistory, getActiveSession } = useSession();
  const { permission, supported, requestPermission, sendNotification } = useNotifications();

  const activeSession = getActiveSession();

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("count23_locale", l);
  }, []);

  useEffect(() => {
    setLocaleState(getInitialLocale());
    setMounted(true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const active = getActiveSession();
    if (active) {
      const target = new Date(active.targetTime);
      if (target.getTime() > Date.now()) {
        setTargetDate(target);
        setTotalDuration(active.totalDuration);
      } else {
        completeSession(active.id);
      }
    }
  }, [hydrated, getActiveSession, completeSession]);

  const handleComplete = useCallback(() => {
    setShowComplete(true);
    if (activeSession) completeSession(activeSession.id);
    sendNotification("Count23", t.notifications.completed);

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "COUNTDOWN_COMPLETE",
        title: "Count23",
        body: t.notifications.completed,
      });
    }
  }, [activeSession, completeSession, sendNotification, t]);

  const handleMilestone = useCallback(
    (label: string) => {
      const body = label === "5min" ? t.notifications.fiveMin : t.notifications.oneMin;
      sendNotification("Count23", body);
    },
    [sendNotification, t],
  );

  const state = useCountdown({
    targetTime: targetDate,
    totalDuration,
    onComplete: handleComplete,
    onMilestone: handleMilestone,
  });

  const handleStart = useCallback(
    (timeString: string) => {
      const target = getTargetDate(timeString);
      const duration = target.getTime() - Date.now();
      setTargetDate(target);
      setTotalDuration(duration);
      setShowComplete(false);
      createSession(target, duration);

      if (permission === "default") requestPermission();
    },
    [createSession, permission, requestPermission],
  );

  const handleCancel = useCallback(() => {
    if (activeSession) cancelSession(activeSession.id);
    setTargetDate(null);
    setTotalDuration(0);
    setShowComplete(false);
  }, [activeSession, cancelSession]);

  const handleReset = useCallback(() => {
    setTargetDate(null);
    setTotalDuration(0);
    setShowComplete(false);
  }, []);

  if (!mounted) return null;

  const isActive = targetDate !== null && !showComplete;

  return (
    <LocaleContext value={{ locale, setLocale, t }}>
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <h1 className="text-lg font-bold text-gradient sm:text-xl">Count23</h1>
          <div className="flex items-center gap-2">
            <NotificationToggle
              permission={permission}
              supported={supported}
              onRequest={requestPermission}
            />
            <InstallPrompt />
            <LocaleSwitcher />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
          <AnimatePresence mode="wait">
            {showComplete ? (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SuccessAnimation onReset={handleReset} />
              </motion.div>
            ) : isActive ? (
              <motion.div
                key="countdown"
                className="flex flex-col items-center gap-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="glass-card glow-blue p-6 sm:p-10">
                  <CountdownCircle
                    state={state}
                    labels={{
                      hours: t.timer.hours,
                      minutes: t.timer.minutes,
                      seconds: t.timer.seconds,
                    }}
                  />
                </div>
                <CountdownDisplay targetTime={targetDate} onCancel={handleCancel} />
              </motion.div>
            ) : (
              <motion.div
                key="input"
                className="flex flex-col items-center gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    {t.app.title}
                  </h2>
                  <p className="text-sm text-slate-400">{t.app.tagline}</p>
                </div>

                <div className="glass-card p-8 sm:p-10">
                  <TimeInput onStart={handleStart} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {hydrated && sessions.length > 0 && (
            <motion.div
              className="mt-8 w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card p-5">
                <SessionList sessions={sessions} onClear={clearHistory} />
              </div>
            </motion.div>
          )}
        </main>

        <footer className="pb-4 text-center text-[10px] text-slate-600">
          Count23 &middot; {new Date().getFullYear()}
        </footer>
      </div>
    </LocaleContext>
  );
}
