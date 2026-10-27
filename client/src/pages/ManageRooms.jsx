import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { Alert, Field, Modal, PageHeader } from "../components/ui";

const EMPTY = { name: "", location: "", capacity: 4, equipment: "", description: "", imageUrl: "", isActive: true };

export default function ManageRooms() {
  const [rooms, setRooms] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | room object
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const load = useCallback(() => {
    api("/api/rooms?all=1").then(setRooms).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  function openForm(room) {
    setFormError("");
    setForm(
      room === "new"
        ? EMPTY
        : { ...room, equipment: room.equipment.join(", "), description: room.description ?? "", imageUrl: room.imageUrl ?? "" }
    );
    setEditing(room);
  }

  async function save(e) {
    e.preventDefault();
    setFormError("");
    const body = {
      name: form.name,
      location: form.location,
      capacity: Number(form.capacity),
      equipment: form.equipment.split(",").map((s) => s.trim()).filter(Boolean),
      description: form.description,
      imageUrl: form.imageUrl,
      isActive: form.isActive,
    };
    try {
      if (editing === "new") await api("/api/rooms", { method: "POST", body });
      else await api(`/api/rooms/${editing.id}`, { method: "PUT", body });
      setEditing(null);
      load();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function remove(room) {
    if (!confirm(`Delete room "${room.name}"? Its bookings will be deleted too.`)) return;
    try {
      await api(`/api/rooms/${room.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <div>
      <PageHeader
        title="Edit rooms"
        subtitle="Add, change or remove rooms. Turn a room off to hide it from booking without deleting it."
        action={<button onClick={() => openForm("new")} className="btn-primary">Add room</button>}
      />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-stone-200 text-left text-xs text-stone-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Location</th>
              <th className="px-4 py-2.5 font-medium">Seats</th>
              <th className="px-4 py-2.5 font-medium">Bookable</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rooms?.map((r) => (
              <tr key={r.id} className={r.isActive ? "" : "text-stone-400"}>
                <td className="px-4 py-3">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-stone-500">{r.equipment.join(", ")}</p>
                </td>
                <td className="px-4 py-3">{r.location}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.capacity}</td>
                <td className="px-4 py-3">{r.isActive ? "Yes" : "No"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button onClick={() => openForm(r)} className="mr-3 text-sm text-stone-600 hover:text-stone-900 hover:underline">Edit</button>
                  <button onClick={() => remove(r)} className="text-sm text-red-700 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms === null && <p className="p-4 text-sm text-stone-500">Loading…</p>}
      </div>

      {editing && (
        <Modal title={editing === "new" ? "Add room" : `Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            {formError && <Alert>{formError}</Alert>}
            <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
              <Field label="Name" htmlFor="rname">
                <input id="rname" className="input" value={form.name} onChange={set("name")} required maxLength={50} />
              </Field>
              <Field label="Seats" htmlFor="rcap">
                <input id="rcap" type="number" min={1} max={500} className="input" value={form.capacity} onChange={set("capacity")} required />
              </Field>
            </div>
            <Field label="Location" htmlFor="rloc">
              <input id="rloc" className="input" value={form.location} onChange={set("location")} required maxLength={100} placeholder="Building A, Floor 2" />
            </Field>
            <Field label="Equipment" htmlFor="req" hint="(separate with commas)">
              <input id="req" className="input" value={form.equipment} onChange={set("equipment")} placeholder="Projector, TV, Whiteboard" />
            </Field>
            <Field label="Photo URL" htmlFor="rimg" hint="(optional)">
              <input id="rimg" className="input" value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://…" />
            </Field>
            <Field label="Description" htmlFor="rdesc" hint="(optional)">
              <textarea id="rdesc" rows={2} className="input" value={form.description} onChange={set("description")} maxLength={500} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={set("isActive")} className="accent-brand-700" />
              People can book this room
            </label>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
