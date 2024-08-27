import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import Alert from '@/components/Layout/Alert';
import CompleteProfileModal from '@/components/Layout/CompleteProfileModal';
import SideBar from '@/components/Layout/SideBar';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { notifications, showCompleteProfileModal } = useTheme();
  const [needLayout, setNeedLayout] = useState(true);
  const [showCPM, setShowCPM] = useState(false);
  const [justLoggedInOrRegistered, setJustLoggedInOrRegistered] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    setNeedLayout(currentPath === "/" || currentPath.startsWith("/chat") || currentPath.startsWith("/dashboard"));

    // Check if user just logged in or registered
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
      <div className="absolute top-0 right-0 z-50 flex flex-col space-y-2 p-4">
        {notifications.map((notification, index) => (
          <Alert key={index} notification={notification} />
        ))}
      </div>
      {needLayout ? (
        <>
          <CompleteProfileModal open={showCPM} setOpen={setShowCPM} />
          <div className="flex h-screen">
            <SideBar />
            <main className="flex-1 overflow-y-auto relative">
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