import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useLocalize } from '@/hooks';
import { ThemeContext, isDark } from '@/UI/Theme/ThemeContext';
import ThemeSelector from '@/UI/Theme/ThemeSelector';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const navigate = useNavigate();
  const { login, hasAccessToken } = useAuth();
  const { theme } = useContext(ThemeContext);

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
      setEmailError(useLocalize('com_auth_email_required'));
      hasError = true;
    }

    if (!password) {
      setPasswordError(useLocalize('com_auth_password_required'));
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(useLocalize('com_auth_password_required'));
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
      setEmailError(useLocalize('com_auth_email_pattern'));
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value.slice(0, 128); // Limit to 128 characters
    setPassword(newPassword);
    if (newPassword.length > 0 && newPassword.length < 8) {
      setPasswordError(useLocalize('com_auth_password_min_length'));
    } else {
      setPasswordError('');
    }
    setPasswordsMatch(newPassword === confirmPassword);
  };

  const responseMessage = async (response: CredentialResponse) => {
    console.log(response);
    try {
      // Send the Google credential to your backend
      const backendResponse = await api.post('/api/auth/google/', { credential: response.credential });
      const { access, refresh } = backendResponse;
      login(access, refresh);
      navigate('/');
    } catch (error) {
      console.error('Google Sign-In failed', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const errorMessage = () => {
    console.error('Error occurred during Google register');
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
        <h1
          className="mb-4 text-center text-4xl font-bold text-gray-700 dark:text-white"
        >
          {useLocalize('com_auth_create_account')}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-2 relative">
            <input
              type="text"
              id="email"
              value={email}
              autoComplete="email"
              aria-label={useLocalize('com_auth_email')}
              onChange={handleEmailChange}
              className="input-field peer"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="floating-label"
            >
              {useLocalize('com_auth_email_address')}
            </label>
            {emailError && <p className="text-[var(--bordeaux)] text-sm mt-1">{emailError}</p>}
          </div>
          <div className="mb-2 relative">
            <input
              type="password"
              id="password"
              value={password}
              autoComplete="new-password"
              aria-label={useLocalize('com_auth_password')}
              onChange={handlePasswordChange}
              className="input-field peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="floating-label"
            >
              {useLocalize('com_auth_password')}
            </label>
            {passwordError && <p className="text-[var(--bordeaux)] text-sm mt-1">{passwordError}</p>}
          </div>
          <div className="mb-2 relative">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              autoComplete="new-password"
              aria-label={useLocalize('com_auth_confirm_password')}
              onChange={handleConfirmPasswordChange}
              className={`input-field peer ${!passwordsMatch ? 'border-[var(--bordeaux)]' : ''}`}
              placeholder=" "
            />
            <label
              htmlFor="confirmPassword"
              className="floating-label"
            >
              {useLocalize('com_auth_password_confirm')}
            </label>
            {confirmPasswordError && <p className="text-[var(--bordeaux)] text-sm mt-1">{confirmPasswordError}</p>}
          </div>
          {!passwordsMatch && confirmPassword !== '' && (
            <p className="text-[var(--bordeaux)] text-sm mb-2">{useLocalize('com_auth_password_not_match')}</p>
          )}
          <button
            type="submit"
            className="w-full transform rounded-md bg-[var(--bordeaux)] px-4 py-3 tracking-wide text-white transition-colors duration-200 hover:bg-[var(--bordeaux-hover)] focus:bg-[var(--bordeaux-hover)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:hover:bg-[var(--bordeaux)]"
            disabled={!passwordsMatch || confirmPassword === ''}
          >
            {useLocalize('com_auth_register')}
          </button>
        </form>
        <p className="my-4 text-center text-sm font-light text-gray-700 dark:text-white">
  {useLocalize('com_auth_or_sign_up_with')}
</p>
        <div className="mt-2 w-full">
          <GoogleLogin
            onSuccess={responseMessage}
            onError={errorMessage}
          />
        </div>
        <p className="my-4 text-center text-sm font-light text-gray-700 dark:text-white">
          {useLocalize('com_auth_already_have_account')}{' '}
          <a href="/login" aria-label="Login" className="p-1 text-[var(--bordeaux-clear)]">
            {useLocalize('com_auth_login')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;