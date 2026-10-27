import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import BookingList from "../components/BookingList";
import { Alert, PageHeader } from "../components/ui";

const TABS = ["Upcoming", "Past", "Cancelled"];

export default function MyBookings() {
  const [params] = useSearchParams();
  const [bookings, setBookings] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [tab, setTab] = useState("Upcoming");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api("/api/bookings").then(setBookings).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
    api("/api/rooms").then(setRooms).catch(() => {});
  }, [load]);

  const now = new Date();
  const inTab = (b, t) => {
    if (t === "Cancelled") return b.status === "CANCELLED";
    if (b.status === "CANCELLED") return false;
    return t === "Upcoming" ? new Date(b.endTime) >= now : new Date(b.endTime) < now;
  };
  const filtered = (bookings ?? []).filter((b) => inTab(b, tab));
  if (tab === "Upcoming") filtered.reverse(); // soonest first

  return (
    <div>
      <PageHeader title="My bookings" action={<Link to="/schedule" className="btn-primary">Book a room</Link>} />

      {params.has("created") && <div className="mb-4"><Alert type="success">Booked. It's in your upcoming list below.</Alert></div>}
      {error && <Alert>{error}</Alert>}

      <div className="mb-4 flex gap-5 border-b border-stone-200 text-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2 ${tab === t ? "border-brand-600 font-medium text-stone-900" : "border-transparent text-stone-500 hover:text-stone-800"}`}
          >
            {t}
            {bookings && <span className="ml-1.5 text-xs text-stone-400">{bookings.filter((b) => inTab(b, t)).length}</span>}
          </button>
        ))}
      </div>

      {bookings === null ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : (
        <BookingList bookings={filtered} rooms={rooms} onChange={load} />
      )}
    </div>
  );
}
