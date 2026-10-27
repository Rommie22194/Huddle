import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { AuthContext } from "./auth";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, ask the server who is logged in (the JWT lives in an httpOnly cookie)
  useEffect(() => {
    api("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const u = await api("/api/auth/login", { method: "POST", body: { email, password } });
    setUser(u);
  };

  const register = async (form) => {
    const u = await api("/api/auth/register", { method: "POST", body: form });
    setUser(u);
  };

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>{children}</AuthContext.Provider>
  );
}
