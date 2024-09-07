import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import {
  Bars3Icon,
  ChevronLeftIcon,
  ArrowLeftEndOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import NewChatButton from '../Chat/NewChatButton';
import ChatHistory from '../Chat/ChatHistory';

export default function SideBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userName, setUserName] = useState('')
  const [textSize, setTextSize] = useState('sm')
  const { logout } = useAuth();
  const { user } = useProfile()
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    if (isDashboard) {
      setIsCollapsed(false);
    }
    setUserName([user?.first_name, user?.last_name].join(' ').trim())
    if (!user.first_name && !user.last_name) {
      setUserName("Your Profile")
    }
    setTextSize(userName.length > 10 ? 'xs' : 'sm')
  }, [isDashboard, user]);


  return (
    <>
      <div>
        {/* Mobile sidebar */}
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex h-full">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <div className="flex h-full flex-col bg-[var(--gray-900)] px-6 pb-2 ring-1 ring-white/10">
                <div className="flex-shrink-0">
                  <div className="flex h-16 items-center justify-between">
                    <Link to="/">
                      <img
                        alt="vezmir-logo"
                        src="/assets/white.svg"
                        className="h-8 w-auto cursor-pointer"
                      />
                    </Link>
                    <button type="button" onClick={() => setSidebarOpen(false)} className="p-2 rounded-md bg-[var(--gray-700)] hover:bg-[var(--gray-600)] text-gray-400 hover:text-white">
                      <span className="sr-only">Close sidebar</span>
                      <ChevronLeftIcon aria-hidden="true" className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-2 mb-4">
                    <NewChatButton />
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                  <ChatHistory />
                </div>
                <div className="flex-shrink-0 mt-auto pr-2">
                  <div
                    ref={profileRef}
                    className="relative rounded-lg shadow-md bg-[var(--gray-800)] hover:bg-[var(--gray-700)] transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-x-4 px-4 py-3">
                      <div onClick={() => navigate('/dashboard/profile')} className="flex items-center gap-x-4 flex-grow">
                        <CogIcon className="h-8 w-8 text-gray-400" />
                        <div className="flex flex-col">
                          <span className={`text-${textSize} font-semibold text-white`}>{userName}</span>
                          <span className="sr-only">Your profile</span>
                        </div>
                      </div>
                      <div className="ml-auto p-2 rounded-lg">
                        <ArrowLeftEndOnRectangleIcon
                          className="h-5 w-5 text-gray-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            logout();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Collapsible sidebar for desktop */}
        <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col ${isCollapsed ? 'lg:w-16' : 'lg:w-72'} transition-all duration-300`}>
          {isCollapsed ? (
            <div className="flex h-16 shrink-0 items-center justify-center mt-2 ml-3">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-md text-gray-400 bg-[var(--gray-700)] hover:bg-[var(--gray-600)]"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-[var(--gray-900)] px-3">
              <div className="flex-shrink-0">
                <div className="flex h-16 items-center justify-between mt-1 px-2">
                  <Link to="/">
                    <img
                      alt="vezmir-logo"
                      src="/assets/white.svg"
                      className="h-8 w-auto cursor-pointer"
                    />
                  </Link>
                  {!isDashboard && (
                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="p-2 rounded-md text-gray-400 bg-[var(--gray-700)] hover:bg-[var(--gray-600)] mt-2"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                  )}
                </div>
                <div className="mt-2 mb-4 px-3">
                  <NewChatButton />
                </div>
              </div>
              <div className="flex-grow overflow-y-auto hide-scrollbar">
                <ChatHistory />
              </div>
              <div className="flex-shrink-0 mt-auto pr-2">
                <div
                  ref={profileRef}
                  className="relative rounded-lg shadow-md bg-[var(--gray-800)] transition-colors duration-200"
                >
                  <div className="flex items-center gap-x-4 px-2 py-3 hover:bg-[var(--gray-700)] rounded-lg">
                    <div
                      onClick={() => navigate('/dashboard/profile')}
                      className="flex items-center gap-x-4 flex-grow cursor-pointer"
                    >
                      <CogIcon className="h-8 w-8 text-gray-400" />
                      <span aria-hidden="true" className={`text-${textSize} font-semibold text-white`}>{userName}</span>
                      <span className="sr-only">Your profile</span>
                    </div>
                    <div
                      className="p-2 overflow-hidden rounded-lg hover:bg-[var(--gray-800)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        logout();
                      }}
                    >
                      <ArrowLeftEndOnRectangleIcon
                        className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile toggle button */}
        <div className={`sticky top-0 z-40 flex items-center gap-x-6 ${isDashboard ? 'bg-[var(--gray-900)]' : 'bg-[var(--gray-800)]'} px-4 py-4 shadow-sm sm:px-6 lg:hidden`}>
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden bg-[var(--gray-700)] hover:bg-[var(--gray-600)]">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop sidebar buffer for layout, do not remove */}
        <div className={`py-10 ${isCollapsed ? 'lg:pl-4' : 'lg:pl-60'} ${isDashboard ? '' : 'bg-[var(--gray-800)]'} hidden sm:block sm:h-full transition-all duration-0`}>
          <div className="px-4 sm:px-6 lg:px-8"></div>
        </div>
      </div >
    </>
  )
}
