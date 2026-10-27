import { useState } from "react";
import { useAuth } from "../context/auth";
import { api } from "../lib/api";
import { Alert, Field, PageHeader } from "../components/ui";

export default function Profile() {
  const { user, setUser } = useAuth();

  return (
    <div className="max-w-xl">
      <PageHeader title="Profile" subtitle={user.email} />
      <ProfileForm user={user} onSaved={setUser} />
      <PasswordForm />
    </div>
  );
}

function ProfileForm({ user, onSaved }) {
  const [form, setForm] = useState({ name: user.name, department: user.department ?? "" });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      onSaved(await api("/api/auth/profile", { method: "PUT", body: form }));
      setMsg({ type: "success", text: "Saved." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <h2 className="font-semibold">Your details</h2>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <Field label="Name" htmlFor="pname">
        <input id="pname" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
      </Field>
      <Field label="Department" htmlFor="pdept" hint="(optional)">
        <input id="pdept" className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
      </Field>
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-400">Role: {user.role.toLowerCase()}</span>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const empty = { currentPassword: "", newPassword: "", confirm: "" };
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    if (form.newPassword !== form.confirm) return setMsg({ type: "error", text: "The two new passwords don't match." });

    setSaving(true);
    try {
      await api("/api/auth/password", {
        method: "PUT",
        body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      setForm(empty);
      setMsg({ type: "success", text: "Password changed." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-5">
      <h2 className="font-semibold">Change password</h2>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <Field label="Current password" htmlFor="cur">
        <input id="cur" type="password" className="input" value={form.currentPassword} onChange={set("currentPassword")} required autoComplete="current-password" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" htmlFor="new">
          <input id="new" type="password" className="input" value={form.newPassword} onChange={set("newPassword")} required minLength={8} autoComplete="new-password" />
        </Field>
        <Field label="Repeat new password" htmlFor="rep">
          <input id="rep" type="password" className="input" value={form.confirm} onChange={set("confirm")} required minLength={8} autoComplete="new-password" />
        </Field>
      </div>
      <p className="text-xs text-stone-500">8+ characters, with at least one letter and one number.</p>
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-secondary">{saving ? "Saving…" : "Change password"}</button>
      </div>
    </form>
  );
}
