import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on page load ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then((res) => setUser(res.data.user))
        .catch(() => {
          // Token invalid or expired — clear it
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  // Sends credentials, stores JWT, sets user state, returns user object
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;

    if (!token) throw new Error('No token received from server');

    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  // ── Register ──────────────────────────────────────────────────────────────
  // Creates account ONLY — does NOT log the user in, does NOT store token
  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data.user; // caller shows success screen, then redirects to /login
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
