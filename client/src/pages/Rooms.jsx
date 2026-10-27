import { useEffect, useState } from "react";
import { api, dayRangeQuery, roomNow, toDateInput } from "../lib/api";
import RoomCard from "../components/RoomCard";
import { Alert, Empty, PageHeader } from "../components/ui";

export default function Rooms() {
  const [rooms, setRooms] = useState(null);
  const [today, setToday] = useState({}); // roomId -> today's bookings
  const [q, setQ] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [error, setError] = useState("");

  // Today's bookings for every room, to show "free / in use" on each card
  useEffect(() => {
    api(`/api/rooms/schedule?${dayRangeQuery(toDateInput(new Date()))}`)
      .then((list) => setToday(Object.fromEntries(list.map((r) => [r.id, r.bookings]))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Small debounce so we don't call the API on every keystroke
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (minCapacity) params.set("minCapacity", minCapacity);
      api(`/api/rooms?${params}`)
        .then(setRooms)
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [q, minCapacity]);

  return (
    <div>
      <PageHeader title="Rooms" subtitle={rooms ? `${rooms.length} rooms` : " "} />

      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <input className="input sm:max-w-xs" placeholder="Search name or building" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input sm:w-44" value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)}>
          <option value="">Any size</option>
          <option value="4">4+ people</option>
          <option value="8">8+ people</option>
          <option value="12">12+ people</option>
          <option value="20">20+ people</option>
        </select>
      </div>

      {error && <Alert>{error}</Alert>}
      {rooms === null ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : rooms.length === 0 ? (
        <Empty>No rooms match that search.</Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => (
            <RoomCard key={r.id} room={r} status={today[r.id] ? roomNow(today[r.id]) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
