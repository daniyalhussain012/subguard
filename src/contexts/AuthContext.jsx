import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com';

// Decode JWT payload without verifying signature (verification happens server-side)
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch { return null; }
}

function isTokenValid(token) {
  if (!token) return false;
  const p = parseJwt(token);
  if (!p) return false;
  if (p.exp && p.exp * 1000 < Date.now()) return false; // expired
  return true;
}

export function AuthProvider({ children }) {
  const [token] = useState(() => {
    const t = localStorage.getItem('subguard_token');
    return isTokenValid(t) ? t : null;
  });
  // If we have a valid JWT, show dashboard immediately — don't block on /auth/me
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('subguard_token');
    if (!isTokenValid(t)) return null;
    const p = parseJwt(t);
    return p ? { id: p.userId } : null; // minimal user from JWT
  });
  const [loading, setLoading] = useState(false); // never block — we trust the JWT

  useEffect(() => {
    if (token) fetchUser(); // load full profile in background
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUser(await res.json()); // replace minimal user with full profile
      } else if (res.status === 401) {
        logout(); // token rejected — log out
      }
      // other errors (5xx, network): keep the minimal user, stay logged in
    } catch { /* network error — stay logged in with minimal user */ }
  };

  const loginWithGoogle = () => { window.location.href = `${API_URL}/auth/login/google`; };

  const handleAuthCallback = (t) => {
    if (!isTokenValid(t)) { logout(); return; }
    localStorage.setItem('subguard_token', t);
    const p = parseJwt(t);
    setUser(p ? { id: p.userId } : null); // instant auth, no spinner
    // token state is read-only so we just reload to pick up new token
    window.location.href = '/';
  };

  const logout = () => {
    localStorage.removeItem('subguard_token');
    setUser(null);
  };

  const refreshUser = async () => { if (token) await fetchUser(); };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      loginWithGoogle, handleAuthCallback, logout, refreshUser,
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
