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
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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
