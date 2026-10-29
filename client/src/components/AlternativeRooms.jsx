import { useEffect, useState } from "react";
import { api, dayRangeQuery, freeRooms } from "../lib/api";

/**
 * Shown when the chosen room is already taken: lists other rooms that are free
 * for the same time and big enough. onPick(room) switches the booking to that room.
 */
export default function AlternativeRooms({ date, start, end, attendees, roomId, bookingId, onPick }) {
  const [rooms, setRooms] = useState(null);
  const [failed, setFailed] = useState(false);

  // Fresh data every time this box appears (someone may have just booked)
  useEffect(() => {
    let alive = true;
    setRooms(null);
    setFailed(false);
    api(`/api/rooms/schedule?${dayRangeQuery(date)}`)
      .then((list) => alive && setRooms(list))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [date]);

  if (failed) return null;
  if (!rooms) return <p className="text-xs text-stone-500">Looking for other free rooms…</p>;

  const free = freeRooms(rooms, { start, end, attendees, excludeRoomId: roomId, excludeBookingId: bookingId });

  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs font-medium text-stone-700">
        {free.length > 0
          ? "These rooms are free at that time:"
          : `No other room for ${attendees}+ people is free at that time. Try another time.`}
      </p>
      {free.length > 0 && (
        <ul className="mt-2 space-y-1">
          {free.slice(0, 4).map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onPick(r)}
                className="flex w-full items-baseline justify-between gap-3 rounded px-2 py-1.5 text-left text-sm hover:bg-white"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-stone-500"> · {r.location}</span>
                </span>
                <span className="shrink-0 text-xs text-brand-700">{r.capacity} seats · Use this →</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
