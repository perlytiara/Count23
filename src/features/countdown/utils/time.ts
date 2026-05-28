export function getTargetDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

/** Value for `input type="datetime-local"` min (local). */
export function toDatetimeLocalValue(d: Date): string {
  const y = d.getFullYear();
  const m = padTwo(d.getMonth() + 1);
  const day = padTwo(d.getDate());
  const h = padTwo(d.getHours());
  const min = padTwo(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

/**
 * Parse `datetime-local` value (YYYY-MM-DDTHH:mm) as local time.
 * Returns null if invalid or not strictly in the future.
 */
export function parseFutureDatetimeLocal(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const day = Number(m[3]);
  const h = Number(m[4]);
  const min = Number(m[5]);
  if ([y, mo, day, h, min].some((n) => Number.isNaN(n))) return null;
  const d = new Date(y, mo - 1, day, h, min, 0, 0);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getTime() <= Date.now()) return null;
  return d;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function msToTimeComponents(ms: number) {
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
  }

  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const milliseconds = Math.floor((ms % 1_000) / 10);

  return { days, hours, minutes, seconds, milliseconds };
}

export function padTwo(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatTimeLocale(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: locale === "en",
  }).format(date);
}

/** Short date + time when target is not today (local calendar). */
export function formatTargetDisplay(date: Date, locale: string): string {
  const now = new Date();
  if (isSameCalendarDay(date, now)) {
    return formatTimeLocale(date, locale);
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Format remaining ms as "2h 15m 33s" or "15m 33s" for notifications. */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return "0s";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

export function formatDurationLong(ms: number, locale: string): string {
  const { days, hours, minutes, seconds } = msToTimeComponents(ms);
  const unit = new Intl.NumberFormat(locale);
  const parts: string[] = [];
  if (days > 0) parts.push(`${unit.format(days)}d`);
  if (hours > 0 || days > 0) parts.push(`${unit.format(hours)}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${unit.format(minutes)}m`);
  parts.push(`${unit.format(seconds)}s`);
  return parts.join(" ");
}

export function formatDateTimeInZone(date: Date, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function formatDateTimeWithZoneLabel(date: Date, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
    timeZoneName: "short",
  }).format(date);
}

export function getLocalTimeZoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
