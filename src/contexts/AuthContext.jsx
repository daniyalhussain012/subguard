import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com';

function parseJwt(token) {
  try {
    const b = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b));
  } catch { return null; }
}

function isTokenValid(t) {
  if (!t) return false;
  const p = parseJwt(t);
  if (!p || !p.userId) return false;
  if (p.exp && p.exp * 1000 < Date.now()) return false;
  return true;
}

export function AuthProvider({ children }) {
  const stored = localStorage.getItem('subguard_token');
  const valid = isTokenValid(stored) ? stored : null;
  const [token] = useState(valid);
  const [user, setUser] = useState(() => {
    if (!valid) return null;
    const p = parseJwt(valid);
    return p ? { id: String(p.userId) } : null;
  });

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser({ ...data, id: String(data.id) }); })
      .catch(() => {});
  }, [token]);

  const loginWithGoogle = () => { window.location.href = `${API_URL}/auth/login/google`; };

  const handleAuthCallback = (t) => {
    if (!isTokenValid(t)) { logout(); return; }
    localStorage.setItem('subguard_token', t);
    const p = parseJwt(t);
    if (p) setUser({ id: String(p.userId) });
    window.location.href = '/';
  };

  const logout = () => {
    localStorage.removeItem('subguard_token');
    setUser(null);
    window.location.href = '/login';
  };

  const deleteAccount = async () => {
    if (!token) return { ok: false };
    try {
      const r = await fetch(`${API_URL}/auth/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return { ok: false };
      localStorage.removeItem('subguard_token');
      return { ok: true };
    } catch { return { ok: false }; }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setUser({ ...d, id: String(d.id) }); }
    } catch {}
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading: false,
      loginWithGoogle, handleAuthCallback, logout, refreshUser, deleteAccount,
      isAuthenticated: !!user,
      isPremium: user?.plan === 'premium',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
  }
