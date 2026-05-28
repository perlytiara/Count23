export type ProposalEventType = "propose" | "confirm";

export interface ProposalEvent {
  id: string;
  type: ProposalEventType;
  proposedTimeUtc: string;
  actorTimeZone: string;
  actorLabel?: string;
  createdAt: string;
}

export interface ProposalState {
  version: 1;
  meetingId: string;
  title?: string;
  baseTimeZone: string;
  createdAt: string;
  lastUpdatedAt: string;
  events: ProposalEvent[];
}

export interface ProposalDerivedState {
  effectiveTimeUtc: string | null;
  confirmedTimeUtc: string | null;
  pendingProposalTimeUtc: string | null;
  hasPendingSuggestion: boolean;
  isConfirmed: boolean;
  isFinished: boolean;
  latestEventAt: string | null;
}
