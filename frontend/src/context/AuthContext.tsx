import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '../api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const login = (newAccessToken: string, newRefreshToken: string) => {
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    const refresh_token = localStorage.getItem('refreshToken');
    if (refresh_token) {
        api.post('/api/auth/logout/', { refresh: refresh_token });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
  };

  const getAccessToken = () => accessToken;

  const refreshAccessToken = async () => {
    try {
      const response = await api.post('/api/auth/login/refresh/', { refresh: refreshToken });
      const newAccessToken = response.data.access;
      setAccessToken(newAccessToken);
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh access token', error);
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getAccessToken, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
