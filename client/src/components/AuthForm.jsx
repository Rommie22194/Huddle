import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/auth";
import { Alert, Field } from "./ui";

export default function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "", department: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) await register(form);
      else await login(form.email, form.password);
      // Only allow internal redirects
      const next = params.get("next");
      navigate(next && next.startsWith("/") && !next.startsWith("//") ? next : "/schedule");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-sm py-4 sm:py-10">
      <h1 className="text-xl font-semibold">{isRegister ? "Create an account" : "Log in"}</h1>
      <p className="mt-1 text-sm text-stone-500">
        {isRegister ? "Use your work email." : "Welcome back."}
      </p>

      <form onSubmit={onSubmit} className="card mt-5 space-y-4 p-5">
        {error && <Alert>{error}</Alert>}
        {isRegister && (
          <Field label="Full name" htmlFor="name">
            <input id="name" className="input" value={form.name} onChange={set("name")} required minLength={2} />
          </Field>
        )}
        <Field label="Email" htmlFor="email">
          <input id="email" type="email" className="input" value={form.email} onChange={set("email")} required autoComplete="email" />
        </Field>
        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={set("password")}
            required
            minLength={isRegister ? 8 : 1}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
          {isRegister && <p className="mt-1 text-xs text-stone-500">8+ characters, with at least one letter and one number.</p>}
        </Field>
        {isRegister && (
          <Field label="Department" htmlFor="department" hint="(optional)">
            <input id="department" className="input" value={form.department} onChange={set("department")} />
          </Field>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Please wait…" : isRegister ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-stone-500">
        {isRegister ? "Already registered? " : "New here? "}
        <Link to={isRegister ? "/login" : "/register"} className="font-medium text-brand-700 underline-offset-2 hover:underline">
          {isRegister ? "Log in" : "Create an account"}
        </Link>
      </p>

      {!isRegister && (
        <div className="mt-8 border-t border-stone-200 pt-4 font-mono text-xs leading-relaxed text-stone-500">
          <p className="mb-1 font-sans font-medium text-stone-700">Test accounts</p>
          <p>user@mrbs.com &nbsp;/ User@1234</p>
          <p>admin@mrbs.com / Admin@1234</p>
        </div>
      )}
    </div>
  );
}
