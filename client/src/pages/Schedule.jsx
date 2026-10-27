import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { addDays, api, combine, dayRangeQuery, fmtDate, fmtTime, minutesLabel, toDateInput } from "../lib/api";
import { Alert, PageHeader } from "../components/ui";

const DAY_START = 8 * 60; // 08:00, in minutes
const DAY_END = 20 * 60; // 20:00
const STEP = 30; // one cell = 30 minutes
const SLOTS = Array.from({ length: (DAY_END - DAY_START) / STEP }, (_, i) => DAY_START + i * STEP);

/** Daily availability board: rows = rooms, columns = half-hour slots */
export default function Schedule() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const date = params.get("date") || toDateInput(new Date());
  const [rooms, setRooms] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setRooms(null);
    api(`/api/rooms/schedule?${dayRangeQuery(date)}`)
      .then(setRooms)
      .catch((e) => setError(e.message));
  }, [date]);

  const setDate = (d) => setParams(d === toDateInput(new Date()) ? {} : { date: d });
  const now = new Date();

  function cellInfo(room, m) {
    const start = combine(date, minutesLabel(m));
    const end = combine(date, minutesLabel(m + STEP));
    const booking = room.bookings.find((b) => new Date(b.startTime) < end && new Date(b.endTime) > start);
    return { booking, past: end <= now };
  }

  function book(room, m) {
    navigate(`/rooms/${room.id}?date=${date}&start=${minutesLabel(m)}`);
  }

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle={fmtDate(combine(date, "12:00"))}
        action={
          <div className="flex items-center gap-2">
            <button className="btn-secondary px-2.5" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">←</button>
            <button className="btn-secondary" onClick={() => setDate(toDateInput(new Date()))}>Today</button>
            <button className="btn-secondary px-2.5" onClick={() => setDate(addDays(date, 1))} aria-label="Next day">→</button>
            <input type="date" className="input w-auto" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </div>
        }
      />

      {error && <Alert>{error}</Alert>}

      <div className="mb-3 flex flex-wrap gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-stone-300 bg-white" /> Free — click to book</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-brand-600" /> Booked</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-stone-200" /> Past</span>
      </div>

      {rooms === null ? (
        <p className="text-sm text-stone-500">Loading…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] table-fixed border-collapse text-xs">
            <thead>
              <tr className="text-stone-500">
                <th className="sticky left-0 z-10 w-36 border-b border-stone-200 bg-white px-3 py-2 text-left font-medium">Room</th>
                {SLOTS.map((m) => (
                  <th key={m} className="overflow-visible whitespace-nowrap border-b border-stone-200 py-2 text-left font-normal">
                    {m % 60 === 0 ? <span className="pl-1 font-mono">{minutesLabel(m)}</span> : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b border-stone-100 last:border-0">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2">
                    <Link to={`/rooms/${room.id}`} className="font-medium text-stone-800 hover:text-brand-700">{room.name}</Link>
                    <div className="text-stone-400">{room.capacity} seats</div>
                  </td>
                  {SLOTS.map((m) => {
                    const { booking, past } = cellInfo(room, m);
                    const hourEdge = m % 60 === 0 ? "border-l border-stone-200" : "border-l border-stone-100";
                    if (booking) {
                      // No side padding so consecutive half-hours join into one bar
                      return (
                        <td key={m} className="px-0 py-0.5">
                          <div
                            className="h-9 bg-brand-600"
                            title={`${booking.title} · ${fmtTime(booking.startTime)}–${fmtTime(booking.endTime)} · ${booking.user.name}`}
                          />
                        </td>
                      );
                    }
                    return (
                      <td key={m} className={`${hourEdge} p-0.5`}>
                        {past ? (
                          <div className="h-9 rounded-sm bg-stone-100" />
                        ) : (
                          <button
                            onClick={() => book(room, m)}
                            className="block h-9 w-full rounded-sm hover:bg-brand-100"
                            title={`Book ${room.name} at ${minutesLabel(m)}`}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rooms && <DayList rooms={rooms} />}
    </div>
  );
}

/** Plain list of the day's bookings under the board (easier to read on phones) */
function DayList({ rooms }) {
  const all = rooms
    .flatMap((r) => r.bookings.map((b) => ({ ...b, roomName: r.name })))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return (
    <div className="mt-8">
      <h2 className="mb-2 text-sm font-semibold text-stone-700">Bookings this day ({all.length})</h2>
      {all.length === 0 ? (
        <p className="text-sm text-stone-500">Nothing booked yet.</p>
      ) : (
        <ul className="card divide-y divide-stone-100 text-sm">
          {all.map((b) => (
            <li key={b.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 px-4 py-2.5">
              <span className="w-24 font-mono text-xs text-stone-500">{fmtTime(b.startTime)}–{fmtTime(b.endTime)}</span>
              <span className="w-24 font-medium">{b.roomName}</span>
              <span className="flex-1 text-stone-700">{b.title}</span>
              <span className="text-stone-400">{b.user.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
