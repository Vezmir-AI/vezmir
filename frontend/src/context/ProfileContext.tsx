import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api from '@/api';
import { serverResponse, profileUpdate, passwordUpdate, userProfile, userUsage, usageData } from '@/types';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

interface ProfileContextType {
    user: userProfile,
    usage: userUsage,
    profileComplete: boolean,
    updateProfile: (userChange: profileUpdate) => Promise<serverResponse>,
    updatePassword: (passwordChange: passwordUpdate) => Promise<serverResponse>,
    deleteAccount: () => Promise<serverResponse>,
    getMoneySpent: () => void,
    getMoneyUsage: (startDate: string, endDate: string) => void,
    getTokenUsage: (startDate: string, endDate: string | null) => void,
}

const ProfileContext = createContext<ProfileContextType | null>(null);
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<userProfile>({ email: '', first_name: '', last_name: '', preferred_model: '', email_verified: false, stripe_payment_method_id: '', balance: 0 });
    const [usage, setUsage] = useState<userUsage>({});
    const [profileComplete, setProfileComplete] = useState(false);
    const { isAuthenticated } = useAuth();
    const { setShowCompleteProfileModal } = useTheme();

    const getUser = async () => {
        const response = await api.get('/user/me/');
        setUser(response);
    }
    useEffect(() => {
        if (isAuthenticated) {
            getUser();
        } else {
            setUser({ email: '', first_name: '', last_name: '', preferred_model: '', email_verified: false, stripe_payment_method_id: '', balance: 0 });
        }
    }, [isAuthenticated]);

    useEffect(() => {
        setProfileComplete(!!user.first_name && !!user.last_name && !!user.preferred_model && !!user.email_verified && !!user.stripe_payment_method_id);
        setShowCompleteProfileModal(!profileComplete);
    }, [user]);

    const updateProfile = async (userChange: profileUpdate) => {
        const data = { "action": "update_info", ...userChange };
        const response = await api.put('/user/me/', data);
        setUser({ ...user, ...response });
        return response;
    }

    const updatePassword = async (passwordChange: passwordUpdate) => {
        const data = { "action": "change_password", ...passwordChange };
        const response = await api.put('/user/me/', data);
        return response;
    }

    const deleteAccount = async () => {
        const response = await api.delete('/user/me/');
        return response;
    }

    const getMoneySpent= () => {
        api.get('/user/usage/money_spent/').then(({ money_spent }) => {
            setUsage({ ...usage, money_spent });
        });
    }

    const getMoneyUsage = (startDate: string, endDate: string) => {
        api.get('/user/usage/money_usage/', { start_date: startDate, end_date: endDate }).then(({ money_usage }) => {
            setUsage(prevUsage => {
                const newMoneyUsage = [...(prevUsage.money_usage || [])];
                money_usage.forEach((newEntry: usageData) => {
                    const index = newMoneyUsage.findIndex(entry => entry.date === newEntry.date);
                    if (index !== -1) {
                        newMoneyUsage[index] = newEntry;
                    } else {
                        newMoneyUsage.push(newEntry);
                    }
                });
                return { ...prevUsage, money_usage: newMoneyUsage };
            });
        });
    }

    const getTokenUsage = (startDate: string, endDate: string | null = null) => {
        api.get('/user/usage/token_usage/', { start_date: startDate, ...(endDate && { end_date: endDate }) }).then(({ token_usage }) => {
            setUsage(prevUsage => {
                const newTokenUsage = [...(prevUsage.token_usage || [])];
                token_usage.forEach((newEntry: usageData) => {
                    const index = newTokenUsage.findIndex(entry => entry.date === newEntry.date);
                    if (index !== -1) {
                        newTokenUsage[index] = newEntry;
                    } else {
                        newTokenUsage.push(newEntry);
                    }
                });
                return { ...prevUsage, token_usage: newTokenUsage };
            });
        });
    }

    return <ProfileContext.Provider value={{
        user,
        profileComplete,
        updateProfile,
        updatePassword,
        deleteAccount,
        usage,
        getMoneySpent,
        getMoneyUsage,
        getTokenUsage
    }}>
        {children}
    </ProfileContext.Provider>
}

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}