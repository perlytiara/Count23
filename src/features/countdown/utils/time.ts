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

export function msToTimeComponents(ms: number) {
  if (ms <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
  }

  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const milliseconds = Math.floor((ms % 1_000) / 10);

  return { hours, minutes, seconds, milliseconds };
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

/** Format remaining ms as "2h 15m 33s" or "15m 33s" for notifications. */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return "0s";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}
