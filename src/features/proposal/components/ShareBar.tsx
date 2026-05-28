"use client";

import { useState } from "react";

interface ShareBarProps {
  shareUrl: string;
  copyLabel: string;
  copiedLabel: string;
  nativeShareLabel: string;
}

export function ShareBar({ shareUrl, copyLabel, copiedLabel, nativeShareLabel }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="glass-card w-full p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            } catch {
              setCopied(false);
            }
          }}
          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
        {canNativeShare && (
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.share({ url: shareUrl });
              } catch {
                // ignore cancellation errors
              }
            }}
            className="rounded-lg border border-white/20 bg-white/[0.08] px-3 py-2 text-xs font-semibold ui-text-body hover:bg-white/[0.14]"
          >
            {nativeShareLabel}
          </button>
        )}
      </div>
      <p className="mt-2 break-all rounded-xl border border-white/15 bg-black/20 px-3 py-2 font-mono text-[11px] ui-text-muted">
        {shareUrl}
      </p>
    </div>
  );
}
