import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

/** Access { user, loading, login, register, logout } from any component */
export const useAuth = () => useContext(AuthContext);
