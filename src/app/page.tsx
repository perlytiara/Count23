"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CountdownCircle,
  TimeInput,
  CountdownDisplay,
  SessionList,
  SuccessAnimation,
  useCountdown,
  usePictureInPicture,
  useSession,
} from "@/features/countdown";
import { formatRemaining } from "@/features/countdown/utils/time";
import { NotificationToggle, useNotifications } from "@/features/notifications";
import { LocaleContext, getMessages, type Locale } from "@/features/i18n";
import { SettingsPanel, useSettings } from "@/features/settings";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { InstallPrompt } from "@/components/InstallPrompt";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  const t = useMemo(() => getMessages(locale), [locale]);
  const { settings, setTheme, setShowMilliseconds } = useSettings();
  const {
    sessions,
    hydrated,
    createSession,
    completeSession,
    cancelSession,
    clearHistory,
    getActiveSessions,
    removeSession,
    updateSessionTarget,
  } = useSession();
  const { permission, supported, requestPermission, sendNotification } = useNotifications();
  const pip = usePictureInPicture(targetDate);

  const activeSessions = getActiveSessions();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const selectedSession =
    selectedSessionId && activeSessions.some((s) => s.id === selectedSessionId)
      ? activeSessions.find((s) => s.id === selectedSessionId) ?? activeSessions[0]
      : activeSessions[0] ?? null;

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("count23_locale", l);
  }, []);

  useEffect(() => {
    setLocaleState(getInitialLocale());
    setMounted(true);

    if ("serviceWorker" in navigator) {
      const base = document.querySelector("link[rel='manifest']")?.getAttribute("href")?.replace("manifest.json", "") ?? "/";
      navigator.serviceWorker.register(`${base}sw.js`).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const actives = getActiveSessions();
    const stillActive = actives.filter((s) => new Date(s.targetTime).getTime() > Date.now());
    actives.forEach((s) => {
      if (new Date(s.targetTime).getTime() <= Date.now()) completeSession(s.id);
    });
    if (stillActive.length > 0 && !selectedSessionId) {
      setSelectedSessionId(stillActive[0].id);
    }
  }, [hydrated]);

  useEffect(() => {
    if (!selectedSession) {
      setTargetDate(null);
      setTotalDuration(0);
      return;
    }
    const target = new Date(selectedSession.targetTime);
    if (target.getTime() <= Date.now()) {
      completeSession(selectedSession.id);
      const next = getActiveSessions().filter((s) => s.id !== selectedSession.id)[0];
      setSelectedSessionId(next?.id ?? null);
      return;
    }
    setTargetDate(target);
    setTotalDuration(selectedSession.totalDuration);
  }, [selectedSession?.id]);

  const liveNotificationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!(targetDate && !showComplete) || permission !== "granted" || !("serviceWorker" in navigator)) {
      if (liveNotificationInterval.current) {
        clearInterval(liveNotificationInterval.current);
        liveNotificationInterval.current = null;
      }
      if (!(targetDate && !showComplete)) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.getNotifications().then((list) => list.filter((n) => n.tag === "count23-live").forEach((n) => n.close()));
        });
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: "COUNTDOWN_CANCEL" });
        }
      }
      return;
    }

    const LIVE_TAG = "count23-live";
    const updateLiveNotification = () => {
      const remaining = targetDate.getTime() - Date.now();
      if (remaining <= 0) return;
      const body = `${formatRemaining(remaining)} left`;
      navigator.serviceWorker.ready
        .then((reg) =>
          reg.getNotifications().then((existing) => {
            const found = existing.find((n) => n.tag === LIVE_TAG);
            if (found) found.close();
            return reg.showNotification("Count23", {
              body,
              tag: LIVE_TAG,
              icon: "/icons/icon-192.svg",
              badge: "/icons/icon-192.svg",
              renotify: false,
              requireInteraction: true,
              silent: true,
            } as NotificationOptions);
          })
        )
        .catch(() => {});
    };

    updateLiveNotification();
    liveNotificationInterval.current = setInterval(updateLiveNotification, 1000);

    return () => {
      if (liveNotificationInterval.current) {
        clearInterval(liveNotificationInterval.current);
        liveNotificationInterval.current = null;
      }
    };
  }, [targetDate, showComplete, permission]);

  const handleComplete = useCallback(() => {
    setShowComplete(true);
    if (selectedSession) {
      completeSession(selectedSession.id);
      const next = getActiveSessions().filter((s) => s.id !== selectedSession.id)[0];
      setSelectedSessionId(next?.id ?? null);
    }
    sendNotification("Count23", t.notifications.completed);

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "COUNTDOWN_COMPLETE",
        title: "Count23",
        body: t.notifications.completed,
      });
    }
  }, [selectedSession, completeSession, getActiveSessions, sendNotification, t]);

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
    (target: Date) => {
      const duration = target.getTime() - Date.now();
      if (duration <= 0) return;
      setShowComplete(false);
      setShowAddForm(false);
      const session = createSession(target, duration);
      setSelectedSessionId(session.id);
      setTargetDate(target);
      setTotalDuration(duration);

      if (permission === "default") requestPermission();
    },
    [createSession, permission, requestPermission],
  );

  const handleCancel = useCallback(
    (sessionId?: string) => {
      const id = sessionId ?? selectedSession?.id;
      if (id) {
        cancelSession(id);
        if (id === selectedSessionId) {
          const next = getActiveSessions().filter((s) => s.id !== id)[0];
          setSelectedSessionId(next?.id ?? null);
        }
      }
      if (!sessionId || sessionId === selectedSessionId) {
        setTargetDate(null);
        setTotalDuration(0);
        setShowComplete(false);
      }
    },
    [selectedSession?.id, selectedSessionId, cancelSession, getActiveSessions],
  );

  const handleReset = useCallback(() => {
    setTargetDate(null);
    setTotalDuration(0);
    setShowComplete(false);
  }, []);

  const handleEditSession = useCallback(
    (id: string, nextTarget: Date) => {
      updateSessionTarget(id, nextTarget);
      if (id === selectedSessionId) {
        const duration = nextTarget.getTime() - Date.now();
        if (duration > 0) {
          setTargetDate(nextTarget);
          setTotalDuration(duration);
          setShowComplete(false);
        }
      }
    },
    [updateSessionTarget, selectedSessionId],
  );

  if (!mounted) return null;

  const isActive = targetDate !== null && !showComplete;

  return (
    <LocaleContext value={{ locale, setLocale, t }}>
      <div className="flex min-h-dvh min-h-[100dvh] flex-col overflow-x-hidden touch-pan-y">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 shrink-0">
          <h1 className="text-lg font-bold text-gradient sm:text-xl md:text-2xl">Count23</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
            >
              {t.settings.open}
            </button>
            <NotificationToggle
              permission={permission}
              supported={supported}
              onRequest={requestPermission}
            />
            <InstallPrompt />
            <LocaleSwitcher />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pb-8">
          <AnimatePresence mode="wait">
            {showComplete ? (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SuccessAnimation onReset={handleReset} />
              </motion.div>
            ) : isActive ? (
              <motion.div
                key="countdown"
                className="flex w-full flex-col items-center gap-5 sm:gap-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="glass-card glow-blue w-full max-w-xl p-6 sm:p-10">
                  <CountdownCircle
                    state={state}
                    labels={{
                      days: t.timer.days,
                      hours: t.timer.hours,
                      minutes: t.timer.minutes,
                      seconds: t.timer.seconds,
                    }}
                    showMilliseconds={settings.showMilliseconds}
                  />
                </div>
                <CountdownDisplay
                  targetTime={targetDate}
                  state={state}
                  totalDuration={totalDuration}
                  onCancel={() => handleCancel()}
                  onPopOut={pip.enterPiP}
                  pipSupported={pip.isSupported}
                  pipActive={pip.isActive}
                />
              </motion.div>
            ) : (
              <motion.div
                key="input"
                className="flex w-full flex-col items-center gap-6 sm:gap-8"
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

                <div className="glass-card w-full max-w-xl p-7 sm:p-10">
                  <TimeInput onStart={handleStart} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {hydrated && sessions.length > 0 && (
            <motion.div
              className="mt-6 w-full max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card p-5">
                <SessionList
                  sessions={sessions}
                  activeSessions={activeSessions}
                  selectedSessionId={selectedSessionId}
                  onSelectSession={setSelectedSessionId}
                  onCancelSession={handleCancel}
                  onEditSession={handleEditSession}
                  onClearHistory={clearHistory}
                  onRemoveSession={removeSession}
                  onAddTimer={() => setShowAddForm(true)}
                />
              </div>
            </motion.div>
          )}

          {showAddForm && isActive && (
            <motion.div
              className="mt-4 w-full max-w-2xl glass-card p-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">{t.timer.addAnother}</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  {t.timer.cancel}
                </button>
              </div>
              <TimeInput onStart={handleStart} />
            </motion.div>
          )}
        </main>

        <footer className="pb-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-[10px] text-slate-600 shrink-0">
          Count23 &middot; {new Date().getFullYear()}
        </footer>

        <SettingsPanel
          open={showSettings}
          settings={settings}
          labels={{
            title: t.settings.title,
            close: t.settings.close,
            theme: t.settings.theme,
            showMilliseconds: t.settings.showMilliseconds,
            themes: {
              midnight: t.settings.themeMidnight,
              ocean: t.settings.themeOcean,
              sunset: t.settings.themeSunset,
              forest: t.settings.themeForest,
            },
          }}
          onClose={() => setShowSettings(false)}
          onThemeChange={setTheme}
          onShowMillisecondsChange={setShowMilliseconds}
        />
      </div>
    </LocaleContext>
  );
}
