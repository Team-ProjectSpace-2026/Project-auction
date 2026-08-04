import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  getProfile,
  logout as apiLogout,
} from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const res = await getProfile();
        if (!cancelled) setUser(res.data.user);
      } catch {
        // Not authenticated - clear invalid token if any
        if (!cancelled) {
          localStorage.removeItem("token");
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await apiLogin(credentials);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await apiRegister(data);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const value = { user, loading, login, register, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
