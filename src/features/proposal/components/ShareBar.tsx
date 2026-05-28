"use client";

import { useState } from "react";

interface ShareBarProps {
  shareUrl: string;
  copyLabel: string;
  copiedLabel: string;
  nativeShareLabel: string;
}

function displayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const hash = parsed.hash ? parsed.hash.slice(0, 18) + "…" : "";
    return `${parsed.host}${parsed.pathname}${hash}`;
  } catch {
    return url.length > 42 ? `${url.slice(0, 42)}…` : url;
  }
}

export function ShareBar({ shareUrl, copyLabel, copiedLabel, nativeShareLabel }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex w-full max-w-md items-center gap-1.5 rounded-lg border border-white/15 bg-black/25 py-1 pl-2.5 pr-1">
      <p
        className="min-w-0 flex-1 truncate font-mono text-[11px] leading-tight ui-text-muted"
        title={shareUrl}
      >
        {displayUrl(shareUrl)}
      </p>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-white/10"
        style={{ background: copied ? "rgba(34,197,94,0.25)" : "rgba(59,130,246,0.35)" }}
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
              // ignore cancellation
            }
          }}
          className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ui-text-muted transition-colors hover:bg-white/10 hover:ui-text-body"
          aria-label={nativeShareLabel}
        >
          ↗
        </button>
      )}
    </div>
  );
}
