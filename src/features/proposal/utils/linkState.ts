import type { ProposalEvent, ProposalEventType, ProposalState } from "../types";

const PARAM_KEY = "p";
const CURRENT_VERSION = 1;

function toBase64Url(s: string): string {
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(s: string): string {
  const normalized = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return decodeURIComponent(escape(atob(normalized + pad)));
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

function normalizeEvent(raw: unknown): ProposalEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const type = obj.type;
  if (type !== "propose" && type !== "confirm") return null;
  if (!isIsoDate(obj.createdAt) || !isIsoDate(obj.proposedTimeUtc)) return null;
  if (typeof obj.actorTimeZone !== "string" || obj.actorTimeZone.length === 0) return null;
  if (typeof obj.id !== "string" || obj.id.length === 0) return null;

  return {
    id: obj.id,
    type,
    proposedTimeUtc: obj.proposedTimeUtc,
    actorTimeZone: obj.actorTimeZone,
    actorLabel: typeof obj.actorLabel === "string" ? obj.actorLabel : undefined,
    createdAt: obj.createdAt,
  };
}

export function validateProposalState(raw: unknown): ProposalState | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.version !== CURRENT_VERSION) return null;
  if (typeof obj.meetingId !== "string" || obj.meetingId.length < 6) return null;
  if (typeof obj.baseTimeZone !== "string" || obj.baseTimeZone.length === 0) return null;
  if (!isIsoDate(obj.createdAt) || !isIsoDate(obj.lastUpdatedAt)) return null;
  if (!Array.isArray(obj.events) || obj.events.length === 0) return null;
  const events = obj.events.map(normalizeEvent).filter((e): e is ProposalEvent => e !== null);
  if (events.length === 0) return null;

  return {
    version: CURRENT_VERSION,
    meetingId: obj.meetingId,
    title: typeof obj.title === "string" ? obj.title : undefined,
    baseTimeZone: obj.baseTimeZone,
    createdAt: obj.createdAt,
    lastUpdatedAt: obj.lastUpdatedAt,
    events,
  };
}

export function encodeProposalState(state: ProposalState): string {
  return toBase64Url(JSON.stringify(state));
}

export function decodeProposalState(encoded: string): ProposalState | null {
  try {
    return validateProposalState(JSON.parse(fromBase64Url(encoded)));
  } catch {
    return null;
  }
}

export function parseProposalFromHash(hash: string): ProposalState | null {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(clean);
  const encoded = params.get(PARAM_KEY);
  if (!encoded) return null;
  return decodeProposalState(encoded);
}

export function formatProposalHash(state: ProposalState): string {
  const params = new URLSearchParams();
  params.set(PARAM_KEY, encodeProposalState(state));
  return `#${params.toString()}`;
}

export function buildShareUrl(state: ProposalState, locationLike: Location): string {
  return `${locationLike.origin}${locationLike.pathname}${formatProposalHash(state)}`;
}

export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function createEvent(
  type: ProposalEventType,
  proposedTimeUtc: string,
  actorTimeZone: string,
  actorLabel?: string,
): ProposalEvent {
  return {
    id: crypto.randomUUID(),
    type,
    proposedTimeUtc,
    actorTimeZone,
    actorLabel: actorLabel?.trim() ? actorLabel.trim() : undefined,
    createdAt: new Date().toISOString(),
  };
}

export function createInitialProposalState(input: {
  title?: string;
  proposedTimeUtc: string;
  actorTimeZone: string;
  actorLabel?: string;
}): ProposalState {
  const now = new Date().toISOString();
  const firstEvent = createEvent("propose", input.proposedTimeUtc, input.actorTimeZone, input.actorLabel);
  return {
    version: CURRENT_VERSION,
    meetingId: crypto.randomUUID(),
    title: input.title?.trim() || undefined,
    baseTimeZone: input.actorTimeZone,
    createdAt: now,
    lastUpdatedAt: now,
    events: [firstEvent],
  };
}

export function withEvent(state: ProposalState, event: ProposalEvent): ProposalState {
  return {
    ...state,
    lastUpdatedAt: new Date().toISOString(),
    events: [...state.events, event],
  };
}
