import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocalize } from '../hooks';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/user/balance/', { username, password });
      const { access, refresh } = response.data;
      login(access, refresh);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      //   console.log(error.response.data);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 rounded-lg shadow-md">
        <div className="mt-24 h-36 w-full bg-cover mb-8">
          <img
            src={"/assets/white.svg"}
            className="h-full w-full object-contain"
            alt="Logo"
          />
        </div>
        <h1
          className="mb-4 text-center text-3xl font-bold text-white"
        >
          {useLocalize('com_auth_welcome_back')}
        </h1>

        <form
          className="mt-6"
          aria-label="Login form"
          onSubmit={handleSubmit}>
          <div className="mb-2 relative">
            <input
              type="text"
              id="email"
              value={username}
              autoComplete="email"
              aria-label={useLocalize('com_auth_email')}
              onChange={(e) => setUsername(e.target.value)}
              className="webkit-dark-styles peer block w-full appearance-none rounded-md border bg-transparent px-3.5 pb-3.5 pt-4 text-sm focus:outline-none focus:ring-0 border-gray-600 text-white focus:border-[#a02d1f]"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-3 text-sm duration-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-3 bg-gray-900 text-gray-400 peer-focus:text-[#a02d1f] rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
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
              className="webkit-dark-styles peer block w-full appearance-none rounded-md border bg-transparent px-3.5 pb-3.5 pt-4 text-sm focus:outline-none focus:ring-0 border-gray-600 text-white focus:border-[#a02d1f]"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-3 text-sm duration-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-3 bg-gray-900 text-gray-400 peer-focus:text-[#a02d1f] rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
            >
              {useLocalize('com_auth_password')}
            </label>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-[#892619] rounded-md hover:bg-[#a02d1f] focus:outline-none focus:ring-2 focus:ring-[#a02d1f] focus:ring-opacity-50"
          >
            {useLocalize('com_auth_login')}
          </button>
        </form>
        <p className="my-4 text-center text-sm font-light text-white">
          {' '}
          {useLocalize('com_auth_no_account')}{' '}
          <a href="/register" className="p-1 text-[#892619] hover:text-[#a02d1f]">
            {useLocalize('com_auth_sign_up')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
