import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com';
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('subguard_token'));
  useEffect(() => { if (token) { fetchUser(); } else { setLoading(false); } }, [token]);
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setUser(await res.json()); } else { logout(); }
    } catch { logout(); } finally { setLoading(false); }
  };
  const loginWithGoogle = () => { window.location.href = `${API_URL}/auth/login/google`; };
  const handleAuthCallback = (t) => { localStorage.setItem('subguard_token', t); setLoading(true); setToken(t); };
  const logout = () => { localStorage.removeItem('subguard_token'); setToken(null); setUser(null); };
  const refreshUser = async () => { if (token) await fetchUser(); };
  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, handleAuthCallback, logout, refreshUser, isAuthenticated: !!user, isPremium: user?.plan === 'premium' }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
