import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const goToChat = () => {
    navigate('/chat');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <button onClick={goToChat}>Go to Chat</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => navigate('/resend-verification-email')}>Resend Verification Email</button>
    </div>
  );
};

export default Dashboard;