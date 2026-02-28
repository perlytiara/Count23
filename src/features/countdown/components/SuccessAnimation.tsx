"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/features/i18n";

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 500,
    y: -(Math.random() * 400 + 100),
    rotation: Math.random() * 720 - 360,
    scale: Math.random() * 0.6 + 0.4,
    color: ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#ec4899"][
      Math.floor(Math.random() * 6)
    ],
    delay: Math.random() * 0.3,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            rotate: p.rotation,
            scale: p.scale,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.8, delay: p.delay, ease: "easeOut" }}
          style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

export function SuccessAnimation({ onReset }: { onReset: () => void }) {
  const { t } = useLocale();

  return (
    <motion.div
      className="flex flex-col items-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Confetti />

      <motion.div
        className="relative flex h-64 w-64 items-center justify-center rounded-full sm:h-72 sm:w-72"
        style={{ boxShadow: "0 0 60px rgba(34, 197, 94, 0.3)" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      >
        <svg viewBox="0 0 300 300" width="100%" height="100%">
          <circle cx="150" cy="150" r="140" fill="none" stroke="#22c55e" strokeWidth="8" />
          <motion.path
            d="M 90 155 L 130 195 L 210 110"
            fill="none"
            stroke="#22c55e"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <motion.p
        className="text-2xl font-bold text-emerald-400"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {t.timer.completed}
      </motion.p>

      <motion.button
        onClick={onReset}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white
                   shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-500"
      >
        {t.timer.reset}
      </motion.button>
    </motion.div>
  );
}
