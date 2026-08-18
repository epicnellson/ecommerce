import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      localStorage.setItem('sz_session', '1');
      setUser(data);
      return data;
    } catch {
      localStorage.removeItem('sz_session');
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (!localStorage.getItem('sz_session')) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
      } catch {
        localStorage.removeItem('sz_session');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (userData) => {
    localStorage.setItem('sz_session', '1');
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('sz_session');
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
