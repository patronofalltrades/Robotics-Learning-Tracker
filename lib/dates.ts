import { isFridayDate, isValidTimezone } from "./types";

export function zonedDateParts(date: Date, timezone: string) {
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}
export function currentWeek(firstFriday: string | null, now = new Date(), timezone = "America/Los_Angeles") {
  if (!firstFriday) return 1;
  if (!isFridayDate(firstFriday)) throw new Error("Invalid first Friday");
  // Validate the IANA timezone before doing any calendar work.
  if (!isValidTimezone(timezone)) throw new Error("Invalid timezone");
  const today = zonedDateParts(now, timezone); const start = new Date(`${firstFriday}T12:00:00Z`); const current = new Date(`${today.year}-${today.month}-${today.day}T12:00:00Z`);
  const diff = Math.floor((current.getTime() - start.getTime()) / 86400000);
  return Math.min(12, Math.max(1, Math.floor(diff / 7) + 1));
}
export function sessionFor(firstFriday: string | null, now = new Date(), timezone = "America/Los_Angeles") {
  const parts = zonedDateParts(now, timezone); const day = parts.weekday; const week = currentWeek(firstFriday, now, timezone);
  return { week, session: day === "Fri" ? "friday" : day === "Sat" ? "saturday" : "between", dateLabel: new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long", month: "short", day: "numeric" }).format(now) } as const;
}
export function nextFriday(now = new Date(), timezone = "America/Los_Angeles") {
  const today = zonedDateParts(now, timezone); const dayNumber = Number(today.day); const weekday = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" }).format(now); const offset = weekday === "Fri" ? 0 : weekday === "Sat" ? 6 : ({ Sun: 5, Mon: 4, Tue: 3, Wed: 2, Thu: 1 } as Record<string, number>)[weekday] ?? 0;
  const date = new Date(Date.UTC(Number(today.year), Number(today.month) - 1, dayNumber + offset, 12));
  return date.toISOString().slice(0, 10);
}
