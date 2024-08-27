import { useState, useEffect, MouseEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
    UserIcon,
    ChartPieIcon,
    CreditCardIcon,
    ChevronUpDownIcon,
    CheckIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const DashboardHeader: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const settings = [
        { id: 1, name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
        { id: 2, name: 'Usage', href: '/dashboard/usage', icon: ChartPieIcon },
        { id: 3, name: 'Billing', href: '/dashboard/billing', icon: CreditCardIcon },
    ]

    const currentTab = settings.find(tab => tab.href === location.pathname) || settings[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const menu = document.getElementById('settings-menu');
            const button = document.getElementById('settings-button');
            if (isMenuOpen && menu && !menu.contains(event.target as Node) && !button?.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside as unknown as EventListener);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside as unknown as EventListener);
        };
    }, [isMenuOpen]);

    return (
        <div className="sticky top-0 z-20 bg-[var(--gray-900)] w-auto m-1">
            <div className="md:hidden flex items-center h-14 ">
                <div className="relative flex-grow px-4">
                    <button
                        id="settings-button"
                        type="button"
                        className="relative w-full cursor-default rounded-md bg-[var(--gray-700)] py-1.5 pl-3 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-[var(--gray-600)] focus:bg-[var(--gray-600)] focus:outline-none focus:ring-2 focus:ring-[var(--bordeaux-clear)] sm:text-sm sm:leading-6"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="flex items-center">
                            <currentTab.icon className="h-5 w-5 text-[var(--gray-400)] mr-3" aria-hidden="true" />
                            <span className="block truncate">{currentTab.name}</span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-[var(--gray-400)]" aria-hidden="true" />
                        </span>
                    </button>
                    {isMenuOpen && (
                        <ul
                            className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-[var(--gray-700)] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                            id="settings-menu"
                        >
                            {settings.map((tab) => (
                                <li
                                    key={tab.name}
                                    className={`relative cursor-default select-none py-2 pl-3 pr-9 text-white ${tab === currentTab ? 'bg-[var(--gray-600)]' : ''}`}
                                    onClick={() => {
                                        navigate(tab.href);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <div className="flex items-center">
                                        <tab.icon className="h-5 w-5 text-[var(--gray-400)] mr-3" aria-hidden="true" />
                                        <span className={`block truncate ${tab === currentTab ? 'font-semibold' : 'font-normal'}`}>
                                            {tab.name}
                                        </span>
                                    </div>
                                    {tab === currentTab && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--bordeaux-clear)]">
                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="mx-2 mr-4">
                    <PencilSquareIcon className="w-6 h-6 text-[var(--bordeaux-clear)]" onClick={() => navigate('/')} />
                </div>
            </div>
            <div className="hidden md:block w-full px-4">
                <div className="border-b border-white">
                    <nav aria-label="Tabs" className="flex">
                        {settings.map((tab) => (
                            <Link
                                key={tab.name}
                                to={tab.href}
                                aria-current={tab === currentTab ? 'page' : undefined}
                                className={classNames(
                                    tab === currentTab
                                        ? 'border-white text-[var(--bordeaux-clear)]'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'flex-1 border-b-2 px-1 py-4 text-center text-sm font-medium',
                                )}
                            >
                                {tab.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default DashboardHeader;