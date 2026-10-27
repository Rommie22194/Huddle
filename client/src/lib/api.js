/** fetch wrapper: sends/receives JSON and throws Error(message) on non-2xx */
export async function api(url, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error ?? `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const pad = (n) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DD" in the browser's local time */
export const toDateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Date -> "HH:mm" in local time */
export const toTimeInput = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** "YYYY-MM-DD" + "HH:mm" (local) -> Date */
export const combine = (date, time) => new Date(`${date}T${time}:00`);

/** minutes since midnight -> "HH:mm" */
export const minutesLabel = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

/** "YYYY-MM-DD" shifted by n days */
export function addDays(date, n) {
  const d = combine(date, "12:00");
  d.setDate(d.getDate() + n);
  return toDateInput(d);
}

/** Query string for a whole local day: from=...&to=... */
export function dayRangeQuery(date) {
  const from = combine(date, "00:00");
  const to = new Date(from.getTime() + 24 * 3600_000);
  return `from=${from.toISOString()}&to=${to.toISOString()}`;
}

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export const fmtTime = (d) => new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/** Does [start, end) overlap any booking? */
export const overlaps = (bookings, start, end) =>
  bookings.some((b) => new Date(b.startTime) < end && new Date(b.endTime) > start);

/** Short status text for a room right now, based on today's bookings */
export function roomNow(bookings, now = new Date()) {
  const current = bookings.find((b) => new Date(b.startTime) <= now && new Date(b.endTime) > now);
  if (current) return { free: false, text: `In use until ${fmtTime(current.endTime)}` };
  const next = bookings.find((b) => new Date(b.startTime) > now);
  return { free: true, text: next ? `Free until ${fmtTime(next.startTime)}` : "Free for the rest of the day" };
}
