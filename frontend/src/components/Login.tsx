import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocalize } from '../hooks';
import { ThemeContext, isDark } from '../UI/Theme/ThemeContext';
//import ThemeSelector from '../UI/Theme/ThemeSelector';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '@/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, hasAccessToken } = useAuth();
  const { theme } = useContext(ThemeContext);

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
    console.log(response);
  };
  const errorMessage = () => {
    console.error('Google login error occurred');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 rounded-lg">
        <div className="mt-24 h-36 w-full bg-cover mb-8">
          <img
            src={isDark(theme) ? "/assets/white.svg" : "/assets/black.svg"}
            className="h-full w-full object-contain"
            alt="Logo"
          />
        </div>
        {/* <div className="absolute bottom-0 left-0 md:m-4">
          <ThemeSelector />
        </div> */}
        <p
          className="mb-4 text-center text-4xl font-extrabold text-gray-700 dark:text-white"
        >
          {useLocalize('com_auth_welcome_back')}
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
              aria-label={useLocalize('com_auth_email')}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field peer"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="floating-label"
            >
              {useLocalize('com_auth_email_address')}
            </label>
          </div>
          <div className="mb-2 relative">
            <input
              type="password"
              id="password"
              value={password}
              autoComplete="current-password"
              aria-label={useLocalize('com_auth_password')}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="floating-label"
            >
              {useLocalize('com_auth_password')}
            </label>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bordeaux-hover)] focus:ring-opacity-50"
          >
            {useLocalize('com_auth_login')}
          </button>
        </form>
        <div className="relative mt-6 flex w-full items-center justify-center border border-t border-gray-300 uppercase dark:border-gray-600">
          <div className="absolute bg-[var(--background-dark)] px-3 text-xs text-white dark:text-white">
            {useLocalize('com_auth_or')}
          </div>
        </div>
        <div className="mt-4 w-full">
          <GoogleLogin
            onSuccess={responseMessage}
            onError={errorMessage}
          />
        </div>
        <p className="my-4 text-center text-sm font-light text-gray-700 dark:text-white">
          {' '}
          {useLocalize('com_auth_no_account')}{' '}
          <a href="/register" className="p-1 text-[var(--bordeaux-clear)]">
            {useLocalize('com_auth_sign_up')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;