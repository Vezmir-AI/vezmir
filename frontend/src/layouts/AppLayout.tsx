import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '@/components/SideBar';

const AppLayout: React.FC = () => {  
  return (
    <div className="flex h-screen">
      <SideBar/>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;