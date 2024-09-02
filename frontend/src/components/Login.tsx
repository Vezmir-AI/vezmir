import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '@/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, hasAccessToken, googleLogin } = useAuth();
  const { locale } = useTheme();

  useEffect(() => {
    if (hasAccessToken()) {
      navigate('/');
    }
  }, [hasAccessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login/', { email, password });
      const { access, refresh } = response;
      login(access, refresh);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      //   console.log(error.response.data);
    }
  };

  const responseMessage = (response: CredentialResponse) => {
    googleLogin(response);
    navigate('/');
  };
  const errorMessage = () => {
    console.error('Google login error occurred');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="max-w-md p-6 rounded-lg">
        <div className="mt-24 h-36 w-full bg-cover mb-8">
          <img
            src={"/assets/white.svg"}
            className="h-full w-full object-contain"
            alt="Logo"
          />
        </div>
        <p
          className="mb-4 text-center text-4xl font-extrabold text-gray-700 dark:text-white"
        >
          {locale('com_auth_welcome_back')}
        </p>

        <form
          className="mt-6"
          aria-label="Login form"
          onSubmit={handleSubmit}>
          <div className="mb-2 relative">
            <input
              type="text"
              id="email"
              value={email}
              autoComplete="email"
              aria-label={locale('com_auth_email')}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field peer"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="floating-label"
            >
              {locale('com_auth_email_address')}
            </label>
          </div>
          <div className="mb-2 relative">
            <input
              type="password"
              id="password"
              value={password}
              autoComplete="current-password"
              aria-label={locale('com_auth_password')}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="floating-label"
            >
              {locale('com_auth_password')}
            </label>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bordeaux-hover)] focus:ring-opacity-50"
          >
            {locale('com_auth_login')}
          </button>
        </form>
        <div className="relative mt-6 flex w-full items-center justify-center border border-t border-gray-300 uppercase dark:border-gray-600">
          <div className="absolute bg-[var(--black)] px-3 text-xs text-white dark:text-white">
            {locale('com_auth_or')}
          </div>
        </div>
        <div className="mt-4 w-full">
          <GoogleLogin
            onSuccess={responseMessage}
            onError={errorMessage}
            width={350}
          />
        </div>
        <p className="my-4 text-center text-sm font-light text-gray-700 dark:text-white">
          {' '}
          {locale('com_auth_no_account')}{' '}
          <Link to="/register" className="p-1 text-[var(--bordeaux-clear)]">
          {/* <a href="https://docs.google.com/forms/d/e/1FAIpQLSfzyV-GXIeiBWBkDuV2rNGQCfue6wJPSXAIFP2rx_w78N8fWA/viewform" className="p-1 text-[var(--bordeaux-clear)]"> */}
          {locale('com_auth_sign_up')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
