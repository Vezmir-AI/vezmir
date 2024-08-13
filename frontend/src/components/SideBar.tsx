import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  ChartPieIcon,
  XMarkIcon,
  ChevronLeftIcon,
  UserIcon,
  CreditCardIcon,
  ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext';
import NewChatButton from './Chat/NewChat';
import ChatHistory from './Chat/ChatHistory';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function SideBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    if (isDashboard) {
      setIsCollapsed(false);
      setShowSettings(true);
    }
  }, [isDashboard]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (location.pathname.startsWith('/dashboard') &&
        settingsRef.current && !settingsRef.current.contains(event.target as Node) &&
        profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location.pathname]);

  const handleMouseEnter = () => {
    if (!isDashboard) {
      setShowSettings(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isDashboard) {
      setShowSettings(false);
    }
  };

  const settings = [
    { id: 1, name: 'Profile', action: () => { navigate('/dashboard/profile') }, icon: UserIcon },
    { id: 2, name: 'Usage', action: () => { navigate('/dashboard/usage') }, icon: ChartPieIcon },
    { id: 3, name: 'Billing', action: () => { navigate('/dashboard/billing') }, icon: CreditCardIcon },
    { id: 4, name: 'Logout', action: () => { logout() }, icon: ArrowRightEndOnRectangleIcon },
  ]

  return (
    <>
      <div>
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                  </button>
                </div>
              </TransitionChild>
              {/* Sidebar component for mobile */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                <div className="flex h-16 shrink-0 items-center">
                  <img
                    alt="Your Company"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                    className="h-8 w-auto"
                  />
                </div>
                <nav className="flex flex-1 flex-col">
                  <NewChatButton />
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ChatHistory />
                    </li>
                    <li>
                      <div className="text-xs font-semibold leading-6 text-gray-400">Settings</div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {settings.map((option) => (
                          <li key={option.name}>
                            <button
                              onClick={option.action}
                              className={classNames(
                                'text-gray-400 hover:bg-gray-800 hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full',
                              )}
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                <option.icon className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <span className="truncate">{option.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Collapsible sidebar for desktop */}
        <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col ${isCollapsed ? 'lg:w-16' : 'lg:w-72'} transition-all duration-300`}>
          {isCollapsed ? (
            <div className="flex h-16 shrink-0 items-center justify-center">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
              <div className="flex h-16 shrink-0 items-center justify-between">
                <img
                  alt="vezmir-logo"
                  src="/assets/white.svg"
                  className="h-8 w-auto"
                />
                {!isDashboard && (
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
              <nav className="flex flex-1 flex-col">
                <NewChatButton />
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ChatHistory />
                  </li>
                  <li className="mt-auto pr-2">
                    <div
                      ref={profileRef}
                      className={`relative rounded-md -mx-6 ${showSettings ? 'bg-gray-800' : ''}`}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800 cursor-pointer">
                        <img
                          alt=""
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          className="h-8 w-8 rounded-full bg-gray-800"
                        />
                        <span className="sr-only">Your profile</span>
                        <span aria-hidden="true">Tom Cook</span>
                      </div>
                      {showSettings && (
                        <div
                          ref={settingsRef}
                          className="absolute bottom-full left-0 w-full bg-gray-800 py-2"
                        >
                          <div className="text-xs font-semibold leading-6 text-gray-400 px-6 mb-2">Settings</div>
                          <ul role="list">
                            {settings.map((option) => (
                              <li key={option.name}>
                                <button
                                  onClick={option.action}
                                  className={classNames(
                                    'text-gray-400 hover:bg-gray-700 hover:text-white',
                                    'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full px-6',
                                  )}
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                    <option.icon className="h-4 w-4" aria-hidden="true" />
                                  </span>
                                  <span className="truncate">{option.name}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        <div className={`py-10 ${isCollapsed ? 'lg:pl-16' : 'lg:pl-72'} transition-all duration-300`}>
          <div className="px-4 sm:px-6 lg:px-8"></div>
        </div>
      </div>
    </>
  )
}