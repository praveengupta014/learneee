import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // "Stay logged in": verify token and restore session on page load
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("learniee_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
      return res.data.user;
    } catch {
      localStorage.removeItem("learniee_token");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("learniee_token", res.data.token);
    setUser(res.data.user);
    showToast(`Welcome back, ${res.data.user.name.split(" ")[0]}!`, "success");
    return res.data.user;
  };

  const signup = async (payload) => {
    const res = await api.post("/auth/signup", payload);
    localStorage.setItem("learniee_token", res.data.token);
    setUser(res.data.user);
    showToast("Account created successfully!", "success");
    return res.data.user;
  };

  const updateProfile = async (payload) => {
    const res = await api.put("/auth/profile", payload);
    setUser(res.data.user);
    showToast("Profile updated successfully!", "success");
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("learniee_token");
    setUser(null);
    showToast("Logged out successfully", "info");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        updateProfile,
        refreshUser,
        logout,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

