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
  const [chatLayout, setChatLayout] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState(false);
  const [showCPM, setShowCPM] = useState(false);
  const [justLoggedInOrRegistered, setJustLoggedInOrRegistered] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    setChatLayout(currentPath === "/" || currentPath.startsWith("/chat"));
    setDashboardLayout(currentPath.startsWith("/dashboard"));

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

  useEffect(() => {
    setNeedLayout(chatLayout || dashboardLayout);
  }, [chatLayout, dashboardLayout]);

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
            <main className="flex-1">
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