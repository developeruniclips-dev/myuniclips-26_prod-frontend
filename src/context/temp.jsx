// src/context/temp.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

// Helper to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if token expires in less than 5 minutes
    return payload.exp * 1000 < Date.now() + 5 * 60 * 1000;
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from sessionStorage (clears when browser closes)
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Check if token is still valid
      if (parsed?.token && !isTokenExpired(parsed.token)) {
        return parsed;
      }
      // Clear expired token
      sessionStorage.removeItem('user');
    }
    // Also clear any old localStorage data
    localStorage.removeItem('user');
    return null;
  });
  const [loading, setLoading] = useState(false);

  // Check token validity on mount and periodically
  useEffect(() => {
    const checkToken = () => {
      if (user?.token && isTokenExpired(user.token)) {
        console.log("Token expired, logging out");
        logout();
      }
    };

    // Check immediately
    checkToken();

    // Check every minute
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [user?.token]);

  // Save user to sessionStorage whenever it changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/login`, {
        email,
        password,
      });

      const userData = {
        ...res.data.user,
        roles: res.data.roles,
        token: res.data.token,
      };

      setUser(userData);

      setLoading(false);
      return { ok: true, user: { ...res.data.user, roles: res.data.roles } };
    } catch (err) {
      setLoading(false);
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || err.response?.data?.error;

      // Map HTTP status codes to user-friendly messages
      let friendlyMessage;
      if (serverMsg) {
        friendlyMessage = serverMsg;
      } else if (status === 429) {
        friendlyMessage = "Too many login attempts. Please wait a few minutes and try again.";
      } else if (status === 401) {
        friendlyMessage = "Incorrect email or password. Please try again.";
      } else if (status === 403) {
        friendlyMessage = "Your account has been locked. Please contact support or reset your password.";
      } else if (status === 500) {
        friendlyMessage = "Something went wrong on our end. Please try again later.";
      } else if (!err.response) {
        friendlyMessage = "Unable to connect to the server. Please check your internet connection.";
      } else {
        friendlyMessage = "An unexpected error occurred. Please try again.";
      }

      return { ok: false, message: friendlyMessage };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    localStorage.removeItem('user'); // Also clear any old localStorage data
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
