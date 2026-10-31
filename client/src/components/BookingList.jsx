import { useState } from "react";
import { api, fmtTime, toDateInput, toTimeInput } from "../lib/api";
import BookingForm from "./BookingForm";
import { Alert, Empty, Modal, StatusBadge } from "./ui";

/** Same weekday and time as the original: at least one week later, and moved forward until it is in the future */
function nextOccurrence(startTime) {
  const d = new Date(startTime);
  const now = new Date();
  do d.setDate(d.getDate() + 7);
  while (d <= now);
  return d;
}

/** List of bookings with Edit / Cancel / Book again actions. showUser = admin view */
export default function BookingList({ bookings, rooms, showUser, onChange }) {
  const [editing, setEditing] = useState(null);
  const [rebooking, setRebooking] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function cancel(b) {
    if (!confirm(`Cancel "${b.title}"?`)) return;
    setError("");
    try {
      await api(`/api/bookings/${b.id}`, { method: "DELETE" });
      onChange();
    } catch (e) {
      setError(e.message);
    }
  }

  if (bookings.length === 0) return <Empty>Nothing here.</Empty>;

  return (
    <div>
      {error && <div className="mb-3"><Alert>{error}</Alert></div>}
      {success && <div className="mb-3"><Alert type="success">{success}</Alert></div>}
      <ul className="card divide-y divide-stone-100">
        {bookings.map((b) => {
          const editable = b.status === "CONFIRMED" && new Date(b.startTime) > new Date();
          const canRebook = !showUser && rooms?.length > 0;
          const start = new Date(b.startTime);
          return (
            <li key={b.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
              <div className="flex w-full items-start gap-4 sm:w-auto sm:flex-1">
                <div className="w-12 shrink-0 text-center leading-tight">
                  <div className="text-xs uppercase text-stone-400">{start.toLocaleString("en", { month: "short" })}</div>
                  <div className="text-xl font-semibold">{start.getDate()}</div>
                  <div className="text-[11px] text-stone-400">{start.toLocaleString("en", { weekday: "short" })}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{b.title}</h3>
                    <StatusBadge status={b.status} endTime={b.endTime} />
                  </div>
                  <p className="mt-0.5 text-sm text-stone-600">
                    <span className="font-mono text-xs">{fmtTime(b.startTime)}–{fmtTime(b.endTime)}</span>
                    <span className="text-stone-300"> | </span>
                    {b.room?.name}
                    <span className="text-stone-300"> | </span>
                    {b.attendees} {b.attendees === 1 ? "person" : "people"}
                  </p>
                  {showUser && b.user && (
                    <p className="text-xs text-stone-500">
                      Booked by {b.user.name}{b.user.department ? `, ${b.user.department}` : ""}
                    </p>
                  )}
                </div>
              </div>
              {(editable || canRebook) && (
                <div className="flex gap-2 sm:shrink-0">
                  {canRebook && (
                    <button
                      onClick={() => { setSuccess(""); setRebooking(b); }}
                      className="btn-secondary flex-1 py-1.5 whitespace-nowrap sm:flex-none"
                    >
                      Book again
                    </button>
                  )}
                  {editable && (
                    <>
                      <button onClick={() => setEditing(b)} className="btn-secondary flex-1 py-1.5 sm:flex-none">Edit</button>
                      <button onClick={() => cancel(b)} className="btn-danger flex-1 py-1.5 sm:flex-none">Cancel</button>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {editing && (
        <Modal title="Edit booking" onClose={() => setEditing(null)}>
          <BookingForm
            bookingId={editing.id}
            rooms={rooms}
            initial={{
              roomId: editing.roomId,
              title: editing.title,
              description: editing.description ?? "",
              attendees: editing.attendees,
              date: toDateInput(new Date(editing.startTime)),
              start: toTimeInput(new Date(editing.startTime)),
              end: toTimeInput(new Date(editing.endTime)),
            }}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              onChange();
            }}
          />
        </Modal>
      )}

      {rebooking && (() => {
        const start = nextOccurrence(rebooking.startTime);
        const end = new Date(start.getTime() + (new Date(rebooking.endTime) - new Date(rebooking.startTime)));
        // The original room may have been closed since; fall back to the first bookable room
        const roomId = rooms.some((r) => r.id === rebooking.roomId) ? rebooking.roomId : rooms[0].id;
        return (
          <Modal title="Book again" onClose={() => setRebooking(null)}>
            {roomId !== rebooking.roomId && (
              <div className="mb-4">
                <Alert>{rebooking.room?.name ?? "The original room"} is no longer bookable. Pick another room.</Alert>
              </div>
            )}
            <BookingForm
              rooms={rooms}
              initial={{
                roomId,
                title: rebooking.title,
                description: rebooking.description ?? "",
                attendees: rebooking.attendees,
                date: toDateInput(start),
                start: toTimeInput(start),
                end: toTimeInput(end),
              }}
              onCancel={() => setRebooking(null)}
              onSaved={(saved) => {
                setRebooking(null);
                setSuccess(`Booked "${saved.title}" for ${new Date(saved.startTime).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}. It's in your Upcoming tab.`);
                onChange();
              }}
            />
          </Modal>
        );
      })()}
    </div>
  );
}
