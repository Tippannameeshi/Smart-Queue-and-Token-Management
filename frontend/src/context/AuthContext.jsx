import { useState } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContextValue';

function getStoredUser() {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const storeSession = (res) => {
    const { token, user: userData } = res.data;
    localStorage.setItem('jwt', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    return storeSession(res);
  };

  const register = async (payload) => {
    const res = await authService.register(payload);
    return storeSession(res);
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}
