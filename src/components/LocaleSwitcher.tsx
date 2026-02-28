"use client";

import { motion } from "framer-motion";
import { useLocale, type Locale } from "@/features/i18n";

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  const options: Locale[] = ["en", "fr"];

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setLocale(opt)}
          className="relative px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors"
        >
          {locale === opt && (
            <motion.div
              layoutId="locale-indicator"
              className="absolute inset-0 rounded-full bg-blue-500/20 border border-blue-500/30"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <span className={`relative z-10 ${locale === opt ? "text-blue-400" : "text-slate-400 hover:text-slate-200"}`}>
            {opt}
          </span>
        </button>
      ))}
    </div>
  );
}
