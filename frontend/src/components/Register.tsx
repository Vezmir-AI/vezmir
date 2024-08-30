import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const navigate = useNavigate();
  const { login, hasAccessToken, googleLogin } = useAuth();
  const { locale } = useTheme();

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useEffect(() => {
    if (hasAccessToken()) {
      navigate('/');
    }
  }, [hasAccessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!email) {
      setEmailError(locale('com_auth_email_required'));
      hasError = true;
    }

    if (!password) {
      setPasswordError(locale('com_auth_password_required'));
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(locale('com_auth_password_required'));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    try {
      const response = await api.post('/auth/register/', { email, password });
      const { access, refresh } = response;
      login(access, refresh);
      navigate('/');
    } catch (error) {
      console.error('Register failed', error);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPwd = e.target.value;
    setConfirmPassword(confirmPwd);
    setPasswordsMatch(confirmPwd === '' || confirmPwd === password);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmail(email);
    if (email && !isValidEmail(email)) {
      setEmailError(locale('com_auth_email_pattern'));
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value.slice(0, 128); // Limit to 128 characters
    setPassword(newPassword);
    if (newPassword.length > 0 && newPassword.length < 8) {
      setPasswordError(locale('com_auth_password_min_length'));
    } else {
      setPasswordError('');
    }
    setPasswordsMatch(newPassword === confirmPassword);
  };

  const responseMessage = async (response: CredentialResponse) => {
    googleLogin(response);
    navigate('/');
  };

  const errorMessage = () => {
    console.error('Error occurred during Google register');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="max-w-md p-6 rounded-lg">
        <div className="mt-24 h-36 w-full bg-cover mb-8">
          <img
            src="/assets/white.svg"
            className="h-full w-full object-contain"
            alt="Logo"
          />
        </div>
        <h1
          className="mb-4 text-center text-4xl font-bold text-gray-700 dark:text-white"
        >
          {locale('com_auth_create_account')}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-2 relative">
            <input
              type="text"
              id="email"
              value={email}
              autoComplete="email"
              aria-label={locale('com_auth_email')}
              onChange={handleEmailChange}
              className="input-field peer"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="floating-label"
            >
              {locale('com_auth_email_address')}
            </label>
            {emailError && <p className="text-[var(--bordeaux)] text-sm mt-1">{emailError}</p>}
          </div>
          <div className="mb-2 relative">
            <input
              type="password"
              id="password"
              value={password}
              autoComplete="new-password"
              aria-label={locale('com_auth_password')}
              onChange={handlePasswordChange}
              className="input-field peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="floating-label"
            >
              {locale('com_auth_password')}
            </label>
            {passwordError && <p className="text-[var(--bordeaux)] text-sm mt-1">{passwordError}</p>}
          </div>
          <div className="mb-2 relative">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              autoComplete="new-password"
              aria-label={locale('com_auth_confirm_password')}
              onChange={handleConfirmPasswordChange}
              className={`input-field peer ${!passwordsMatch ? 'border-[var(--bordeaux)]' : ''}`}
              placeholder=" "
            />
            <label
              htmlFor="confirmPassword"
              className="floating-label"
            >
              {locale('com_auth_password_confirm')}
            </label>
            {confirmPasswordError && <p className="text-[var(--bordeaux)] text-sm mt-1">{confirmPasswordError}</p>}
          </div>
          {!passwordsMatch && confirmPassword !== '' && (
            <p className="text-[var(--bordeaux)] text-sm mb-2">{locale('com_auth_password_not_match')}</p>
          )}
          <button
            type="submit"
            className="w-full transform rounded-md bg-[var(--bordeaux)] px-4 py-3 tracking-wide text-white transition-colors duration-200 hover:bg-[var(--bordeaux-hover)] focus:bg-[var(--bordeaux-hover)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:hover:bg-[var(--bordeaux)]"
            disabled={!passwordsMatch || confirmPassword === ''}
          >
            {locale('com_auth_register')}
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
            text="signup_with"
          />
        </div>
        <p className="my-4 text-center text-sm font-light text-gray-700 dark:text-white">
          {locale('com_auth_already_have_account')}{' '}
          <a href="/login" aria-label="Login" className="p-1 text-[var(--bordeaux-clear)]">
            {locale('com_auth_login')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
