import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jkn21_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('jkn21_token', res.data.token);
    localStorage.setItem('jkn21_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('jkn21_token', res.data.token);
    localStorage.setItem('jkn21_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('jkn21_token');
    localStorage.removeItem('jkn21_user');
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('jkn21_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthCtx.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}
