import React, { createContext, useState, useContext, ReactNode } from 'react';
import { GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import api from '@/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hasAccessToken: () => boolean;
  googleLogin: (response: CredentialResponse) => void;
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const accessToken = localStorage.getItem('accessToken');
    return !!accessToken;
  });

  const login = (newAccessToken: string, newRefreshToken: string) => {
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    setIsAuthenticated(true);
  };

  const googleLogin = async (credentials: CredentialResponse) => {
    const { credential } = credentials;
    const { access, refresh } = await api.post('/auth/google/', { credential });
    login(access, refresh);
  };

  const logout = async () => {
    const refresh_token = localStorage.getItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    if (refresh_token) {
      await api.post('/auth/logout/', { refresh: refresh_token });
    }
  };

  const hasAccessToken = () => {
    return !!localStorage.getItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, hasAccessToken, googleLogin }}>
      <GoogleOAuthProvider clientId={clientId}>
        {children}
      </GoogleOAuthProvider>
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
