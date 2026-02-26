'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('vikas_token');
      const savedUser = localStorage.getItem('vikas_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const persist = (tok, usr) => {
    localStorage.setItem('vikas_token', tok);
    localStorage.setItem('vikas_user', JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    persist(res.data.token, res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}!`);
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    persist(res.data.token, res.data.user);
    toast.success('Account created successfully!');
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch { /* ignore */ }
    localStorage.removeItem('vikas_token');
    localStorage.removeItem('vikas_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      const usr = res.data.user;
      localStorage.setItem('vikas_user', JSON.stringify(usr));
      setUser(usr);
    } catch { /* token expired */ logout(); }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, isAdmin: user?.role === 'admin', isStoreAdmin: user?.role === 'store_admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
