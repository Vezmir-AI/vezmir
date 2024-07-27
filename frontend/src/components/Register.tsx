import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocalize } from '../hooks';
import { useContext } from 'react';
import { ThemeContext, isDark } from '../UI/Theme/ThemeContext';
import ThemeSelector from '../UI/Theme/ThemeSelector';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useContext(ThemeContext);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!username) {
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
      const response = await api.post('/auth/register/', { username, password });
      const { access, refresh } = response;
      login(access, refresh);
      navigate('/dashboard');
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
    setUsername(email);
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
      navigate('/dashboard');
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
        <div className="absolute bottom-0 left-0 md:m-4">
          <ThemeSelector />
        </div>
        <h1
          className="mb-4 text-center text-3xl font-bold text-gray-700 dark:text-white"
        >
          {useLocalize('com_auth_create_account')}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-2 relative">
            <div className="relative">
              <input
                type="text"
                id="email"
                value={username}
                autoComplete="email"
                aria-label={useLocalize('com_auth_email')}
                onChange={handleEmailChange}
                className="webkit-dark-styles peer block w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3.5 pb-3.5 pt-4 text-sm text-gray-900 focus:border-[#a02d1f] focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-[#a02d1f]"
                placeholder=" "
              />
              <label
                htmlFor="email"
                className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-3 text-sm text-gray-500 duration-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-3 peer-focus:text-[#a02d1f] dark:bg-gray-900 dark:text-gray-400 dark:peer-focus:text-[#a02d1f] rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
              >
                {useLocalize('com_auth_email_address')}
              </label>
            </div>
            {emailError && <p className="text-[#892619] text-sm mt-1">{emailError}</p>}
          </div>
          <div className="mb-2 relative">
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                autoComplete="new-password"
                aria-label={useLocalize('com_auth_password')}
                onChange={handlePasswordChange}
                className="webkit-dark-styles peer block w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3.5 pb-3.5 pt-4 text-sm text-gray-900 focus:border-[#a02d1f] focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-[#a02d1f]"
                placeholder=" "
              />
              <label
                htmlFor="password"
                className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-3 text-sm text-gray-500 duration-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-3 peer-focus:text-[#a02d1f] dark:bg-gray-900 dark:text-gray-400 dark:peer-focus:text-[#a02d1f] rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
              >
                {useLocalize('com_auth_password')}
              </label>
            </div>
            {passwordError && <p className="text-[#892619] text-sm mt-1">{passwordError}</p>}
          </div>
          <div className="mb-2 relative">
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                autoComplete="new-password"
                aria-label={useLocalize('com_auth_confirm_password')}
                onChange={handleConfirmPasswordChange}
                className={`webkit-dark-styles peer block w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3.5 pb-3.5 pt-4 text-sm text-gray-900 focus:border-[#a02d1f] focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-[#a02d1f] ${!passwordsMatch ? 'border-[#892619]' : ''}`}
                placeholder=" "
              />
              <label
                htmlFor="confirmPassword"
                className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-3 text-sm text-gray-500 duration-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-3 peer-focus:text-[#a02d1f] dark:bg-gray-900 dark:text-gray-400 dark:peer-focus:text-[#a02d1f] rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
              >
                {useLocalize('com_auth_password_confirm')}
              </label>
            </div>
            {confirmPasswordError && <p className="text-[#892619] text-sm mt-1">{confirmPasswordError}</p>}
          </div>
          {!passwordsMatch && confirmPassword !== '' && (
            <p className="text-[#892619] text-sm mb-2">{useLocalize('com_auth_password_not_match')}</p>
          )}
          <button
            type="submit"
            className="w-full transform rounded-md bg-[#892619] px-4 py-3 tracking-wide text-white transition-colors duration-200 hover:bg-[#a02d1f] focus:bg-[#a02d1f] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:hover:bg-[#892619]"
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
          <a href="/login" aria-label="Login" className="p-1 text-[#892619] hover:text-[#a02d1f]">
            {useLocalize('com_auth_login')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;