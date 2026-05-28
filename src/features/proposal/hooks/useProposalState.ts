"use client";

import { useCallback, useMemo, useState } from "react";
import type { ProposalDerivedState, ProposalState } from "../types";
import { createEvent, withEvent } from "../utils/linkState";

function sortByCreatedAt(a: { createdAt: string }, b: { createdAt: string }) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function deriveState(state: ProposalState): ProposalDerivedState {
  const events = [...state.events].sort(sortByCreatedAt);
  const latestConfirmIndex = [...events]
    .map((e, idx) => ({ e, idx }))
    .filter((entry) => entry.e.type === "confirm")
    .map((entry) => entry.idx)
    .at(-1);
  const latestConfirm = latestConfirmIndex !== undefined ? events[latestConfirmIndex] : null;
  const latestPropose = events.filter((e) => e.type === "propose").at(-1) ?? null;
  const pendingProposal =
    latestPropose && (latestConfirmIndex === undefined || events.indexOf(latestPropose) > latestConfirmIndex)
      ? latestPropose
      : null;
  const effectiveTimeUtc = (latestConfirm ?? latestPropose)?.proposedTimeUtc ?? null;
  const now = Date.now();
  const isFinished = effectiveTimeUtc ? new Date(effectiveTimeUtc).getTime() <= now : false;

  return {
    effectiveTimeUtc,
    confirmedTimeUtc: latestConfirm?.proposedTimeUtc ?? null,
    pendingProposalTimeUtc: pendingProposal?.proposedTimeUtc ?? null,
    hasPendingSuggestion: pendingProposal !== null,
    isConfirmed: latestConfirm !== null && pendingProposal === null,
    isFinished,
    latestEventAt: events.at(-1)?.createdAt ?? null,
  };
}

export function useProposalState(initialState: ProposalState) {
  const [proposal, setProposal] = useState<ProposalState>(initialState);

  const derived = useMemo(() => deriveState(proposal), [proposal]);

  const updateTitle = useCallback((title: string) => {
    setProposal((prev) => ({
      ...prev,
      title: title.trim() || undefined,
      lastUpdatedAt: new Date().toISOString(),
    }));
  }, []);

  const appendPropose = useCallback((proposedTimeUtc: string, actorTimeZone: string, actorLabel?: string) => {
    setProposal((prev) => withEvent(prev, createEvent("propose", proposedTimeUtc, actorTimeZone, actorLabel)));
  }, []);

  const appendConfirm = useCallback(
    (actorTimeZone: string, actorLabel?: string) => {
      setProposal((prev) => {
        const current = deriveState(prev);
        const target = current.pendingProposalTimeUtc ?? current.effectiveTimeUtc;
        if (!target) return prev;
        return withEvent(prev, createEvent("confirm", target, actorTimeZone, actorLabel));
      });
    },
    [],
  );

  return {
    proposal,
    setProposal,
    derived,
    updateTitle,
    appendPropose,
    appendConfirm,
  };
}
