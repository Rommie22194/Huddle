import { useEffect } from "react";

export function Alert({ type = "error", children }) {
  const style =
    type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-brand-200 bg-brand-50 text-brand-800";
  return <div className={`rounded-md border px-3 py-2 text-sm ${style}`}>{children}</div>;
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border border-stone-200 bg-white sm:max-w-lg sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded px-2 py-1 text-sm text-stone-500 hover:bg-stone-100" aria-label="Close">
            Close
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ children }) {
  return <div className="rounded-lg border border-dashed border-stone-300 px-6 py-10 text-center text-sm text-stone-500">{children}</div>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status, endTime }) {
  if (status === "CANCELLED") return <span className="badge bg-stone-100 text-stone-500 line-through">Cancelled</span>;
  if (new Date(endTime) < new Date()) return <span className="badge bg-stone-100 text-stone-600">Done</span>;
  return (
    <span className="badge bg-brand-50 text-brand-700">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
      Confirmed
    </span>
  );
}

export function Field({ label, htmlFor, hint, children }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label} {hint && <span className="font-normal text-stone-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
