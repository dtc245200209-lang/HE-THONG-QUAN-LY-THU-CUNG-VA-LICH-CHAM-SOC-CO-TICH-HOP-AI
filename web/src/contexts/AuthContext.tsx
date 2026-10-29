'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  roles: { name: string }[];
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);



  const logout = () => {
    Cookies.remove('token', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (token) {
        try {
          const res = await api.get('/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
          Cookies.set('token', token, { expires: 7, path: '/' });
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(res.data));
            localStorage.setItem('token', token);
          }
        } catch (error) {
          console.error("Auth init failed", error);
          if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (!path.startsWith('/shop') && !path.startsWith('/login') && path !== '/') {
              logout();
            }
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set('token', token, { expires: 7, path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
  };


  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
