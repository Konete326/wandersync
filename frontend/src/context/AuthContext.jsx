import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('wandersync_token') || '');
  const [user, setUser] = useState(() => {
    try {
      const storedToken = localStorage.getItem('wandersync_token');
      const cached = localStorage.getItem('wandersync_user');
      return storedToken && cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetchUserProfile();
          setUser(res.data);
          localStorage.setItem('wandersync_user', JSON.stringify(res.data));
        } catch (error) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    localStorage.setItem('wandersync_token', res.data.token);
    localStorage.setItem('wandersync_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    localStorage.setItem('wandersync_token', res.data.token);
    localStorage.setItem('wandersync_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('wandersync_token');
    localStorage.removeItem('wandersync_user');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
