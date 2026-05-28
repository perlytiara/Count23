"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface HistoryItem {
  id: string;
  action: string;
  byline: string;
  proposedLocal: string;
  at: string;
}

interface ProposalHistoryProps {
  title: string;
  showLabel: string;
  hideLabel: string;
  items: HistoryItem[];
}

export function ProposalHistory({ title, showLabel, hideLabel, items }: ProposalHistoryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card w-full p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider ui-text-muted">{title}</h3>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-full border border-white/20 bg-white/[0.08] px-3 py-1 text-xs ui-text-body hover:bg-white/[0.14]"
        >
          {open ? hideLabel : showLabel}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {items.map((item) => (
              <li key={item.id} className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2">
                <p className="text-xs font-semibold ui-text-strong">{item.action}</p>
                <p className="text-xs ui-text-muted">{item.byline}</p>
                <p className="text-sm font-mono ui-text-body">{item.proposedLocal}</p>
                <p className="text-[11px] ui-text-dim">{item.at}</p>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
