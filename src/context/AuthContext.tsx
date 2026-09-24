'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, LoginCredentials, AuthContextType } from '@/types/auth';
import authService from '@/services/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Restore user session on initial load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to restore auth state from localStorage:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Protected route check
  useEffect(() => {
    if (isLoading) return;

    const isPublicPath = pathname === '/login';
    const isAuthenticated = Boolean(token && user);

    if (!isAuthenticated && !isPublicPath) {
      router.push('/login');
    } else if (isAuthenticated && isPublicPath) {
      router.push('/products');
    }
  }, [isLoading, token, user, pathname, router]);

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await authService.login(credentials);
      const authToken = data.accessToken || data.token || '';

      if (!authToken) {
        throw new Error('No authentication token received from API.');
      }
      
      setUser(data);
      setToken(authToken);

      // Save token and user details to localStorage
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user_data', JSON.stringify(data));

      router.push('/products');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Invalid username or password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  }, [router]);

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
