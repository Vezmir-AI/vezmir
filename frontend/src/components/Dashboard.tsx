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
      <p>Welcome to your dashboard! Antoine est homo</p>
      <button onClick={goToChat}>Go to Chat</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;