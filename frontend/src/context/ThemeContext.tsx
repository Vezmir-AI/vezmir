import React, { createContext, useState, useEffect, useContext } from 'react';
import { serverResponse } from '../types';

import Eng from '@/localization/languages/Eng';
import Fr from '@/localization/languages/Fr';

type LanguageModule = typeof Eng;

const languageModules: { [key: string]: LanguageModule } = {
  en: Eng,
  fr: Fr,
};

interface ThemeContextType {
    locale: (key: string) => string;
    notifications: serverResponse[];
    showCompleteProfileModal: boolean;
    setShowCompleteProfileModal: (show: boolean) => void;
    removeNotification: (message: string) => void;
    useMediaQuery: (query: string) => boolean;
    isPageVisible: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<serverResponse[]>([]);
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
    const [translations, setTranslations] = useState<LanguageModule>(Eng);
    const [isPageVisible, setIsPageVisible] = useState(!document.hidden);

    const useMediaQuery = (query: string): boolean => {
        const [matches, setMatches] = useState(false);

        useEffect(() => {
            const media = window.matchMedia(query);
            if (media.matches !== matches) {
                setMatches(media.matches);
            }
            const listener = () => setMatches(media.matches);
            media.addEventListener('change', listener);
            return () => media.removeEventListener('change', listener);
        }, [matches, query]);

        return matches;
    };

    useEffect(() => {
        const handleNotification = (event: CustomEvent<{ message: string; status: "success" | "error" }>) => {
            const { message, status } = event.detail;
            setNotifications(prevNotifications => [...prevNotifications, { message, status }]);
        };

        const handleVisibilityChange = () => setIsPageVisible(!document.hidden);

        window.addEventListener('notification', handleNotification as EventListener);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Detect user's language
        const userLanguage = navigator.language.split('-')[0];
        const selectedLanguage = languageModules[userLanguage] || Eng;
        setTranslations(selectedLanguage);

        return () => {
            window.removeEventListener('notification', handleNotification as EventListener);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const locale = (key: string) => {
        return translations[key as keyof LanguageModule] || key;
    }

    const removeNotification = (message: string) => {
        setNotifications(prevNotifications => prevNotifications.filter(notification => notification.message !== message));
    }

    return (
        <ThemeContext.Provider value={{
            locale,
            notifications,
            showCompleteProfileModal,
            setShowCompleteProfileModal,
            removeNotification,
            useMediaQuery,
            isPageVisible
        }}>
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
