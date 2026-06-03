import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = "https://dwe2psccef7z.meoo.cloud/sb-api";
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc5OTczODE4LCJleHAiOjEzMjkwNjEzODE4fQ.caALNpecwtLlBY752O8D67Xfp8Ou9T_jj0jv2ZXxAHA';

// 获取当前环境的 API 基础 URL
function getApiBase(): string {
  if (typeof window !== 'undefined' && (window as any).MEOO_CONFIG?.meoo_app_access_url) {
    return `${(window as any).MEOO_CONFIG.meoo_app_access_url}/sb-api`;
  }
  return API_BASE;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('nx_token');
    const savedUser = localStorage.getItem('nx_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('nx_token');
        localStorage.removeItem('nx_user');
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${getApiBase()}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '登录失败');
    
    setToken(data.access_token);
    setUser({
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name
    });
    localStorage.setItem('nx_token', data.access_token);
    localStorage.setItem('nx_user', JSON.stringify({
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name
    }));
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const res = await fetch(`${getApiBase()}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password, data: { full_name: fullName } })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '注册失败');
    
    if (data.session) {
      setToken(data.session.access_token);
      setUser({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName
      });
      localStorage.setItem('nx_token', data.session.access_token);
      localStorage.setItem('nx_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName
      }));
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nx_token');
    localStorage.removeItem('nx_user');
    localStorage.removeItem('nx_current_case');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoggedIn: !!token,
      login,
      register,
      logout
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