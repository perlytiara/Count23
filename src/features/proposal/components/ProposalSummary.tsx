"use client";

interface ProposalSummaryProps {
  title: string;
  statusLabel: string;
  statusValue: string;
  meetingLabel: string;
  viewerLabel: string;
  originLabel: string;
  meetingValue: string;
  viewerValue: string;
  originValue: string;
  pendingLabel?: string;
  pendingValue?: string;
}

export function ProposalSummary({
  title,
  statusLabel,
  statusValue,
  meetingLabel,
  viewerLabel,
  originLabel,
  meetingValue,
  viewerValue,
  originValue,
  pendingLabel,
  pendingValue,
}: ProposalSummaryProps) {
  return (
    <div className="glass-card w-full p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold ui-text-strong">{title}</h2>
        <span className="rounded-full border border-white/20 bg-white/[0.08] px-2.5 py-1 text-[10px] uppercase tracking-wider ui-text-body">
          {statusLabel}: {statusValue}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider ui-text-muted">{meetingLabel}</p>
          <p className="font-mono text-sm ui-text-strong">{meetingValue}</p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider ui-text-muted">{viewerLabel}</p>
          <p className="font-mono text-sm ui-text-strong">{viewerValue}</p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/[0.08] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider ui-text-muted">{originLabel}</p>
          <p className="font-mono text-sm ui-text-strong">{originValue}</p>
        </div>
      </div>
      {pendingLabel && pendingValue && (
        <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-amber-200">{pendingLabel}</p>
          <p className="font-mono text-sm text-amber-100">{pendingValue}</p>
        </div>
      )}
    </div>
  );
}
