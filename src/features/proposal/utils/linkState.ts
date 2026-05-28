import type { ProposalEvent, ProposalEventType, ProposalState } from "../types";

const PARAM_KEY = "s";
const LEGACY_PARAM_KEY = "p";
const CURRENT_VERSION = 1;
const MAX_ENCODED_EVENTS = 6;

type CompactEvent = [number, string, string, number, string?];

interface CompactProposalPayload {
  v: 1;
  m: string;
  b: number;
  c: string;
  u: string;
  t?: string;
  z: string[];
  e: CompactEvent[];
}

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

function toBase36Ms(iso: string): string {
  return new Date(iso).getTime().toString(36);
}

function fromBase36Ms(value: string): string | null {
  const ms = Number.parseInt(value, 36);
  if (Number.isNaN(ms)) return null;
  const iso = new Date(ms).toISOString();
  return isIsoDate(iso) ? iso : null;
}

function compactMeetingId(id: string): string {
  return id.replace(/-/g, "");
}

function expandMeetingId(id: string): string {
  if (id.length !== 32) return id;
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
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
  const zones: string[] = [];
  const zoneToIndex = new Map<string, number>();

  const getZoneIndex = (tz: string) => {
    const existing = zoneToIndex.get(tz);
    if (existing !== undefined) return existing;
    const next = zones.length;
    zones.push(tz);
    zoneToIndex.set(tz, next);
    return next;
  };

  const compact: CompactProposalPayload = {
    v: 1,
    m: compactMeetingId(state.meetingId),
    b: getZoneIndex(state.baseTimeZone),
    c: toBase36Ms(state.createdAt),
    u: toBase36Ms(state.lastUpdatedAt),
    t: state.title?.trim() || undefined,
    z: zones,
    e: state.events.slice(-MAX_ENCODED_EVENTS).map((event) => [
      event.type === "confirm" ? 1 : 0,
      toBase36Ms(event.proposedTimeUtc),
      toBase36Ms(event.createdAt),
      getZoneIndex(event.actorTimeZone),
      event.actorLabel?.trim().slice(0, 40) || undefined,
    ]),
  };

  return toBase64Url(JSON.stringify(compact));
}

function decodeCompactProposalState(raw: unknown): ProposalState | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.v !== 1) return null;
  if (typeof obj.m !== "string" || obj.m.length < 6) return null;
  if (typeof obj.b !== "number") return null;
  if (typeof obj.c !== "string" || typeof obj.u !== "string") return null;
  if (!Array.isArray(obj.z) || obj.z.length === 0 || !Array.isArray(obj.e) || obj.e.length === 0) return null;

  const zones = obj.z.filter((z): z is string => typeof z === "string" && z.length > 0);
  if (zones.length === 0) return null;
  if (obj.b < 0 || obj.b >= zones.length) return null;

  const createdAt = fromBase36Ms(obj.c);
  const lastUpdatedAt = fromBase36Ms(obj.u);
  if (!createdAt || !lastUpdatedAt) return null;

  const events: ProposalEvent[] = [];
  for (const rawEvent of obj.e) {
    if (!Array.isArray(rawEvent) || rawEvent.length < 4) return null;
    const [typeCode, proposedRaw, createdRaw, zoneIndex, actorLabelRaw] = rawEvent;
    if ((typeCode !== 0 && typeCode !== 1) || typeof proposedRaw !== "string" || typeof createdRaw !== "string") {
      return null;
    }
    if (typeof zoneIndex !== "number" || zoneIndex < 0 || zoneIndex >= zones.length) return null;

    const proposedTimeUtc = fromBase36Ms(proposedRaw);
    const eventCreatedAt = fromBase36Ms(createdRaw);
    if (!proposedTimeUtc || !eventCreatedAt) return null;

    events.push({
      id: crypto.randomUUID(),
      type: typeCode === 1 ? "confirm" : "propose",
      proposedTimeUtc,
      actorTimeZone: zones[zoneIndex],
      actorLabel: typeof actorLabelRaw === "string" && actorLabelRaw.trim() ? actorLabelRaw.trim() : undefined,
      createdAt: eventCreatedAt,
    });
  }

  return {
    version: 1,
    meetingId: expandMeetingId(obj.m),
    title: typeof obj.t === "string" && obj.t.trim() ? obj.t.trim() : undefined,
    baseTimeZone: zones[obj.b],
    createdAt,
    lastUpdatedAt,
    events,
  };
}

export function decodeProposalState(encoded: string): ProposalState | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
    return decodeCompactProposalState(parsed) ?? validateProposalState(parsed);
  } catch {
    return null;
  }
}

export function parseProposalFromHash(hash: string): ProposalState | null {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(clean);
  const encoded = params.get(PARAM_KEY) ?? params.get(LEGACY_PARAM_KEY);
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
