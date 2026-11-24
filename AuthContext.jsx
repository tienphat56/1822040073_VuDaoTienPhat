import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  const logout = useCallback(() => { localStorage.removeItem('eduspace_token'); setUser(null); }, []);
  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener('auth-expired', expire);
    if (localStorage.getItem('eduspace_token')) api('/auth/me').then(x => setUser(x.user)).catch(logout).finally(() => setLoading(false));
    else setLoading(false);
    return () => window.removeEventListener('auth-expired', expire);
  }, [logout]);
  const login = async (email, password) => { const result = await api('/auth/login', { method: 'POST', body: { email, password } }); localStorage.setItem('eduspace_token', result.token); setUser(result.user); return result; };
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
