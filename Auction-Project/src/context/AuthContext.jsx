import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getProfile } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const res = await getProfile();
        if (!cancelled) setUser(res.data.user || res.data);
      } catch {
        localStorage.removeItem("token");
        if (!cancelled) setToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadUser();
    return () => { cancelled = true; };
  }, [token]);

  const login = useCallback(async (credentials) => {
    const res = await apiLogin(credentials);
    const { token: t, user: u } = res.data;
    localStorage.setItem("token", t);
    setToken(t);
    setUser(u);
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await apiRegister(data);
    const { token: t, user: u } = res.data;
    localStorage.setItem("token", t);
    setToken(t);
    setUser(u);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
