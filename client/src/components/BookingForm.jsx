import { useState } from "react";
import { api, combine } from "../lib/api";
import AlternativeRooms from "./AlternativeRooms";
import { Alert, Field } from "./ui";

/**
 * Create or edit a booking.
 * initial = { roomId, title, description, attendees, date: "YYYY-MM-DD", start: "HH:mm", end: "HH:mm" }
 * bookingId -> edit mode, rooms -> show a room dropdown
 * warnIf(start, end) -> optional message shown live under the time fields
 * onPickRoom(room, values) -> called when the user picks a suggested free room
 *   (default, used in the edit modal: just switch the room in this form)
 */
export default function BookingForm({ initial, bookingId, rooms, maxCapacity, warnIf, onPickRoom, onSaved, onCancel }) {
  const [v, setV] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [taken, setTaken] = useState(false); // server answered 409 for the current values

  const set = (k) => (e) => {
    setTaken(false);
    setV({ ...v, [k]: k === "attendees" ? Number(e.target.value) : e.target.value });
  };

  const startTime = combine(v.date, v.start);
  const endTime = combine(v.date, v.end);
  const validRange = v.date && v.start && v.end && !isNaN(startTime) && endTime > startTime;
  const warning = warnIf && validRange ? warnIf(startTime, endTime) : null;
  const showAlternatives = validRange && (Boolean(warning) || taken);

  function pickRoom(room) {
    setError("");
    setTaken(false);
    if (onPickRoom) onPickRoom(room, v);
    else setV({ ...v, roomId: room.id });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    // Quick client-side checks (the server validates again)
    if (endTime <= startTime) return setError("End time must be after start time");
    if (startTime < new Date()) return setError("Cannot book in the past");

    setSaving(true);
    try {
      const body = {
        roomId: v.roomId,
        title: v.title,
        description: v.description,
        attendees: v.attendees,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };
      const saved = bookingId
        ? await api(`/api/bookings/${bookingId}`, { method: "PUT", body })
        : await api("/api/bookings", { method: "POST", body });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
      if (err.status === 409) setTaken(true);
    } finally {
      setSaving(false);
    }
  }

  const capacity = rooms?.find((r) => r.id === v.roomId)?.capacity ?? maxCapacity;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}

      {rooms && (
        <Field label="Room" htmlFor="room">
          <select id="room" className="input" value={v.roomId} onChange={set("roomId")}>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({r.capacity} seats)</option>
            ))}
          </select>
        </Field>
      )}

      <Field label="What's the meeting?" htmlFor="title">
        <input id="title" className="input" value={v.title} onChange={set("title")} required maxLength={100} placeholder="Sprint planning" />
      </Field>

      <Field label="Date" htmlFor="date">
        <input id="date" type="date" className="input" value={v.date} onChange={set("date")} required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="From" htmlFor="start">
          <input id="start" type="time" step={900} className="input" value={v.start} onChange={set("start")} required />
        </Field>
        <Field label="To" htmlFor="end">
          <input id="end" type="time" step={900} className="input" value={v.end} onChange={set("end")} required />
        </Field>
      </div>
      {warning && <p className="-mt-2 text-xs text-amber-700">{warning}</p>}
      {showAlternatives && (
        <AlternativeRooms
          date={v.date}
          start={startTime}
          end={endTime}
          attendees={Math.max(1, v.attendees || 1)}
          roomId={v.roomId}
          bookingId={bookingId}
          onPick={pickRoom}
        />
      )}

      <Field label="People" htmlFor="attendees" hint={capacity ? `(room fits ${capacity})` : ""}>
        <input id="attendees" type="number" min={1} max={capacity} className="input" value={v.attendees} onChange={set("attendees")} required />
      </Field>

      <Field label="Notes" htmlFor="description" hint="(optional)">
        <textarea id="description" rows={2} className="input" value={v.description} onChange={set("description")} maxLength={500} />
      </Field>

      <div className="flex gap-2 pt-1">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>}
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? "Saving…" : bookingId ? "Save changes" : "Book room"}
        </button>
      </div>
    </form>
  );
}
