import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; department: string; role: string }) => Promise<void>;
  logout: () => void;
  quickLoginAs: (role: 'admin' | 'finance_manager' | 'ops_manager' | 'sales_employee') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('nexus_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getProfile()
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => {
        localStorage.removeItem('nexus_token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('nexus_token', res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; department: string; role: string }) => {
    const res = await api.register(data);
    localStorage.setItem('nexus_token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    setUser(null);
  };

  const quickLoginAs = async (role: 'admin' | 'finance_manager' | 'ops_manager' | 'sales_employee') => {
    const map = {
      admin: { email: 'admin@nexus.ai', password: 'Password123!' },
      finance_manager: { email: 'sarah.chen@nexus.ai', password: 'Password123!' },
      ops_manager: { email: 'david.oc@nexus.ai', password: 'Password123!' },
      sales_employee: { email: 'elena.rostova@nexus.ai', password: 'Password123!' },
    };
    const target = map[role];
    await login(target.email, target.password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, quickLoginAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
