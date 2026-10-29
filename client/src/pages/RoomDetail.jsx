import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, combine, dayRangeQuery, fmtDate, fmtTime, minutesLabel, overlaps, toDateInput } from "../lib/api";
import BookingForm from "../components/BookingForm";
import { Alert } from "../components/ui";

const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 08:00 - 19:00 slots

/** "09:30" -> "10:30" */
const plusHour = (t) => {
  const [h, m] = t.split(":").map(Number);
  return minutesLabel(Math.min(h * 60 + m + 60, 23 * 60 + 45));
};

// Remount when the room changes (e.g. switching to a suggested free room) so all state starts fresh
export default function RoomDetailPage() {
  const { id } = useParams();
  return <RoomDetail key={id} id={id} />;
}

function RoomDetail({ id }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Title / people / notes typed in another room's form, carried over when switching room
  const draft = useLocation().state?.draft;
  // ?date=&start= come from the Schedule board, &end= from a suggested room
  const [date, setDate] = useState(params.get("date") || toDateInput(new Date()));
  const startParam = params.get("start");
  const endParam = params.get("end");
  const [slot, setSlot] = useState({
    start: startParam || "09:00",
    end: endParam || (startParam ? plusHour(startParam) : "10:00"),
    key: 0,
  });
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api(`/api/rooms/${id}?${dayRangeQuery(date)}`)
      .then(setRoom)
      .catch((e) => setError(e.message));
  }, [id, date]);

  useEffect(load, [load]);

  if (error) return <Alert>{error}</Alert>;
  if (!room) return <p className="text-sm text-stone-500">Loading…</p>;

  const now = new Date();
  const pickHour = (h) => setSlot({ start: minutesLabel(h * 60), end: minutesLabel(h * 60 + 60), key: Date.now() });

  return (
    <div>
      <Link to="/rooms" className="text-sm text-stone-500 hover:text-stone-900">← Rooms</Link>

      <div className="mt-3 mb-6 border-b border-stone-200 pb-5">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h1 className="text-2xl font-semibold">{room.name}</h1>
          <span className="text-stone-500">{room.location}</span>
        </div>
        <p className="mt-1 text-sm text-stone-600">
          Seats {room.capacity}
          {room.equipment.length > 0 && <> · {room.equipment.join(", ")}</>}
        </p>
        {room.description && <p className="mt-2 max-w-2xl text-sm text-stone-500">{room.description}</p>}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">{fmtDate(combine(date, "12:00"))}</h2>
            <input type="date" className="input w-auto" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </div>

          {/* One row per hour; booked rows show who has the room */}
          <ul className="card divide-y divide-stone-100">
            {HOURS.map((h) => {
              const start = combine(date, minutesLabel(h * 60));
              const end = new Date(start.getTime() + 3600_000);
              const booking = room.bookings.find((b) => new Date(b.startTime) < end && new Date(b.endTime) > start);
              const past = end <= now;
              const selected = slot.start === minutesLabel(h * 60);
              return (
                <li key={h} className="flex items-center gap-4 px-4 py-2 text-sm">
                  <span className="w-12 font-mono text-xs text-stone-400">{minutesLabel(h * 60)}</span>
                  {booking ? (
                    <span className="flex-1 truncate rounded bg-brand-50 px-2 py-1 text-brand-800">
                      {booking.title}
                      <span className="text-brand-700/70"> · {fmtTime(booking.startTime)}–{fmtTime(booking.endTime)} · {booking.user?.name}</span>
                    </span>
                  ) : past ? (
                    <span className="flex-1 text-stone-300">—</span>
                  ) : (
                    <button
                      onClick={() => pickHour(h)}
                      className={`flex-1 rounded px-2 py-1 text-left ${selected ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"}`}
                    >
                      {selected ? "Selected" : "Free"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card h-fit p-5">
          <h2 className="mb-4 font-semibold">New booking</h2>
          <BookingForm
            key={`${slot.key}-${date}`}
            maxCapacity={room.capacity}
            initial={{
              roomId: room.id,
              title: draft?.title ?? "",
              description: draft?.description ?? "",
              attendees: draft?.attendees ?? 1,
              date,
              start: slot.start,
              end: slot.end,
            }}
            warnIf={(s, e) => overlaps(room.bookings, s, e) && "That time overlaps an existing booking."}
            onPickRoom={(r, v) =>
              navigate(`/rooms/${r.id}?date=${v.date}&start=${v.start}&end=${v.end}`, {
                state: { draft: { title: v.title, description: v.description, attendees: v.attendees } },
              })
            }
            onSaved={() => navigate("/bookings?created=1")}
          />
        </section>
      </div>
    </div>
  );
}
