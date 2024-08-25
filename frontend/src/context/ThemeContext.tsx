import React, { createContext, useState, useEffect, useContext } from 'react';
import englishTranslations from '@/localization/languages/Eng';
import { serverResponse } from '../types';

interface ThemeContextType {
    locale: (key: string) => string;
    notifications: serverResponse[];
    showCompleteProfileModal: boolean;
    setShowCompleteProfileModal: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<serverResponse[]>([]);
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

    useEffect(() => {
        const handleNotification = (event: CustomEvent<{ message: string; status: "success" | "error" }>) => {
            const { message, status } = event.detail;
            setNotifications(prevNotifications => [...prevNotifications, { message, status }]);
        };

        window.addEventListener('notification', handleNotification as EventListener);

        return () => {
            window.removeEventListener('notification', handleNotification as EventListener);
        };
    }, []);

    const locale = (key: string) => {
        return englishTranslations[key as keyof typeof englishTranslations] || key;
    }

    return (
        <ThemeContext.Provider value={{ locale, notifications, showCompleteProfileModal, setShowCompleteProfileModal }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}