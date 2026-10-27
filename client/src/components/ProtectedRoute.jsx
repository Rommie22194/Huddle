import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";

/** Wrap routes that need login (and optionally admin role) */
export default function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="text-sm text-stone-500">Loading…</p>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/schedule" replace />;
  return <Outlet />;
}
