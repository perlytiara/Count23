"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/features/i18n";

interface NotificationToggleProps {
  permission: NotificationPermission;
  supported: boolean;
  onRequest: () => void;
}

export function NotificationToggle({ permission, supported, onRequest }: NotificationToggleProps) {
  const { t } = useLocale();

  if (!supported) return null;

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-medium text-emerald-400">{t.notifications.enabled}</span>
      </div>
    );
  }

  if (permission === "denied") return null;

  return (
    <motion.button
      onClick={onRequest}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5
                 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {t.notifications.enable}
    </motion.button>
  );
}
