import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard! Antoine est homo</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
