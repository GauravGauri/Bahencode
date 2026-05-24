'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '@/lib/api';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('behencode_token') || localStorage.getItem('behencode_admin_token');
    const savedUser = localStorage.getItem('behencode_user') || localStorage.getItem('behencode_admin_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        // Clear corrupt state
        localStorage.removeItem('behencode_token');
        localStorage.removeItem('behencode_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      
      if (response.data?.success && response.data?.token) {
        const loggedInUser: User = {
          _id: response.data._id || response.data.user?._id,
          username: response.data.username || response.data.user?.username,
          email: response.data.email || response.data.user?.email,
          role: response.data.role || response.data.user?.role || 'user',
        };
        const jwtToken = response.data.token;

        // Store standard session details
        localStorage.setItem('behencode_token', jwtToken);
        localStorage.setItem('behencode_user', JSON.stringify(loggedInUser));

        // For backward compatibility with the existing Admin Dashboard code, set admin keys too
        if (loggedInUser.role === 'admin') {
          localStorage.setItem('behencode_admin_token', jwtToken);
          localStorage.setItem('behencode_admin_user', JSON.stringify(loggedInUser));
        }

        setToken(jwtToken);
        setUser(loggedInUser);
        setIsLoading(false);
        return loggedInUser;
      } else {
        throw new Error(response.data?.message || 'Login failed.');
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.response?.data?.message || error.message || 'Server connection error.');
    }
  };

  const register = async (username: string, email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await API.post('/auth/register', {
        username,
        email,
        password,
        role: 'user', // Always register as 'user' from main website signup
      });

      if (response.data?.success && response.data?.token) {
        const registeredUser: User = {
          _id: response.data._id || response.data.user?._id,
          username: response.data.username || response.data.user?.username,
          email: response.data.email || response.data.user?.email,
          role: response.data.role || response.data.user?.role || 'user',
        };
        const jwtToken = response.data.token;

        localStorage.setItem('behencode_token', jwtToken);
        localStorage.setItem('behencode_user', JSON.stringify(registeredUser));

        setToken(jwtToken);
        setUser(registeredUser);
        setIsLoading(false);
        return registeredUser;
      } else {
        throw new Error(response.data?.message || 'Registration failed.');
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.response?.data?.message || error.message || 'Server connection error.');
    }
  };

  const logout = () => {
    localStorage.removeItem('behencode_token');
    localStorage.removeItem('behencode_user');
    localStorage.removeItem('behencode_admin_token');
    localStorage.removeItem('behencode_admin_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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
