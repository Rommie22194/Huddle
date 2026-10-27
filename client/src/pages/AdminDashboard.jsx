import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import BookingList from "../components/BookingList";
import { Alert, PageHeader } from "../components/ui";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomFilter, setRoomFilter] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api("/api/admin/stats").then(setStats).catch((e) => setError(e.message));
    api("/api/bookings?scope=all").then(setBookings).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
    api("/api/rooms").then(setRooms).catch(() => {});
  }, [load]);

  const max = Math.max(1, ...(stats?.usage.map((u) => u.count) ?? []));
  const numbers = stats
    ? [
        ["Active rooms", stats.rooms],
        ["Users", stats.users],
        ["Upcoming", stats.upcoming],
        ["Cancelled", stats.cancelled],
      ]
    : [];
  const shown = (bookings ?? []).filter((b) => !roomFilter || b.roomId === roomFilter);
  const csvUrl = `/api/admin/bookings.csv${roomFilter ? `?roomId=${roomFilter}` : ""}`;

  return (
    <div>
      <PageHeader title="Admin" subtitle="Usage and all bookings" />
      {error && <Alert>{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <dl className="card grid grid-cols-2 divide-x divide-y divide-stone-100 sm:grid-cols-4 lg:grid-cols-2">
          {numbers.map(([label, value]) => (
            <div key={label} className="p-4">
              <dt className="text-xs text-stone-500">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {stats && (
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-semibold">Confirmed bookings per room</h2>
            <div className="space-y-2">
              {stats.usage.map((u) => (
                <div key={u.name} className="grid grid-cols-[80px_1fr_28px] items-center gap-3 text-sm">
                  <span className="truncate text-stone-600">{u.name}</span>
                  <div className="h-2 rounded-sm bg-stone-100">
                    <div className="h-2 rounded-sm bg-brand-600" style={{ width: `${(u.count / max) * 100}%` }} />
                  </div>
                  <span className="text-right font-mono text-xs">{u.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">All bookings</h2>
        <div className="flex gap-2">
          <select className="input w-auto" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
            <option value="">All rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {/* Plain link: the browser downloads the file, cookie is sent automatically */}
          <a href={csvUrl} className="btn-secondary" download>Export CSV</a>
        </div>
      </div>
      {bookings === null ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : (
        <BookingList bookings={shown} rooms={rooms} showUser onChange={load} />
      )}
    </div>
  );
}
