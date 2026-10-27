import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-stone-900">
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="5" fill="#22573a" />
        <rect x="8" y="8" width="5" height="16" fill="#fff" />
        <rect x="19" y="8" width="5" height="16" fill="#fff" />
        <rect x="13" y="14" width="6" height="4" fill="#fff" />
      </svg>
      Huddle
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the page changes
  useEffect(() => setOpen(false), [pathname]);

  const links = user
    ? [
        { to: "/schedule", label: "Schedule" },
        { to: "/rooms", label: "Rooms" },
        { to: "/bookings", label: "My bookings" },
        ...(user.role === "ADMIN"
          ? [
              { to: "/admin", label: "Admin", end: true },
              { to: "/admin/rooms", label: "Edit rooms" },
            ]
          : []),
      ]
    : [];

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  // Desktop: underline the active link. Mobile: shaded row.
  const deskClass = ({ isActive }) =>
    `border-b-2 px-1 py-5 text-sm ${isActive ? "border-brand-600 font-medium text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900"}`;
  const mobileClass = ({ isActive }) =>
    `block rounded px-3 py-2 text-sm ${isActive ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600"}`;

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-5 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={deskClass}>{l.label}</NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Link to="/profile" className="text-sm text-stone-600 hover:text-stone-900">
                {user.name}
                {user.role === "ADMIN" && <span className="ml-1.5 text-xs text-stone-400">(admin)</span>}
              </Link>
              <button onClick={handleLogout} className="text-sm text-stone-500 hover:text-stone-900">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-stone-600 hover:text-stone-900">Log in</Link>
              <Link to="/register" className="btn-primary py-1.5">Sign up</Link>
            </>
          )}
        </div>

        <button className="rounded px-2 py-1 text-sm text-stone-600 hover:bg-stone-100 md:hidden" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200 px-4 py-3 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={mobileClass}>{l.label}</NavLink>
          ))}
          <div className="mt-2 border-t border-stone-100 pt-2">
            {user ? (
              <>
                <NavLink to="/profile" className={mobileClass}>Profile ({user.name})</NavLink>
                <button onClick={handleLogout} className="block w-full rounded px-3 py-2 text-left text-sm text-stone-600">Log out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={mobileClass}>Log in</NavLink>
                <NavLink to="/register" className={mobileClass}>Sign up</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
