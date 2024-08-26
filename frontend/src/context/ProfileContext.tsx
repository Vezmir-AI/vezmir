import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api from '@/api';
import { serverResponse, profileUpdate, passwordUpdate, userProfile, userUsage } from '@/types';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

interface ProfileContextType {
    user: userProfile,
    usage: userUsage,
    profileComplete: boolean,
    updateProfile: (userChange: profileUpdate) => Promise<serverResponse>,
    updatePassword: (passwordChange: passwordUpdate) => Promise<serverResponse>,
    deleteAccount: () => Promise<serverResponse>,
    getMoneySaved: () => void,
    getMoneyUsage: (startDate: string, endDate: string) => void,
    getTokenUsage: (startDate: string, endDate: string | null) => void,
}

const ProfileContext = createContext<ProfileContextType | null>(null);
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<userProfile>({ email: '', first_name: '', last_name: '', preferred_model: '', email_verified: false, stripe_payment_method_id: '' });
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
            setUser({ email: '', first_name: '', last_name: '', preferred_model: '', email_verified: false, stripe_payment_method_id: '' });
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

    const getMoneySaved = () => {
        api.get('/user/usage/money_saved/').then(({ money_spent }) => {
            setUsage({ ...usage, money_spent });
        });
    }

    const getMoneyUsage = (startDate: string, endDate: string | null = null) => {
        const prevUsage = usage.money_usage ?? [];
        api.get('/user/usage/money_usage/', { start_date: startDate, ...(endDate && { end_date: endDate }) }).then(({ money_usage }) => {
            setUsage({ ...usage, money_usage: [...prevUsage, ...money_usage] });
        });
    }

    const getTokenUsage = (startDate: string, endDate: string | null = null) => {
        const prevUsage = usage.token_usage ?? [];
        api.get('/user/usage/token_usage/', { start_date: startDate, ...(endDate && { end_date: endDate }) }).then(({ token_usage }) => {
            setUsage({ ...usage, token_usage: [...prevUsage, ...token_usage] });
        });
    }

    return <ProfileContext.Provider value={{
        user,
        profileComplete,
        updateProfile,
        updatePassword,
        deleteAccount,
        usage,
        getMoneySaved,
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