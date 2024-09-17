import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import Alert from '@/components/Layout/Alert';
import CompleteProfileModal from '@/components/Layout/CompleteProfileModal';
import SideBar from '@/components/Layout/SideBar';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { notifications, showCompleteProfileModal, useMediaQuery } = useTheme();
  const [needLayout, setNeedLayout] = useState(true);
  const [showCPM, setShowCPM] = useState(false);
  const [justLoggedInOrRegistered, setJustLoggedInOrRegistered] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const currentPath = location.pathname;
    setNeedLayout(currentPath === "/" || currentPath.startsWith("/chat") || currentPath.startsWith("/dashboard"));

    if (currentPath === "/") {
      if (justLoggedInOrRegistered) {
        setShowCPM(showCompleteProfileModal);
        setJustLoggedInOrRegistered(false);
      }
    } else if (currentPath === "/login" || currentPath === "/register") {
      setJustLoggedInOrRegistered(true);
    }
  }, [location, showCompleteProfileModal, justLoggedInOrRegistered])


  return (
    <>
      <div className="fixed top-0 right-0 z-50 flex flex-col items-end space-y-2 p-4">
        {notifications.map((notification, index) => (
          <Alert key={index} notification={notification} />
        ))}
      </div>
      {needLayout ? (
        <>
          <CompleteProfileModal open={showCPM} setOpen={setShowCPM} />
          <div className="flex h-screen relative">
            <SideBar />
            <main className={`flex-1 overflow-y-auto w-full ${isMobile ? 'absolute inset-0' : 'lg:w-auto'}`}>
              {children}
            </main>
          </div>
        </>
      ) : (
        children
      )}
    </>
  );
};

export default AppLayout;
