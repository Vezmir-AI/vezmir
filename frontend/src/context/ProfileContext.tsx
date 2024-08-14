import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api from '../api';
import { serverResponse, profileUpdate, passwordUpdate, userProfile } from '../types';

interface ProfileContextType {
    user: userProfile,
    updateProfile: (userChange: profileUpdate) => Promise<serverResponse>,
    updatePassword: (passwordChange: passwordUpdate) => Promise<serverResponse>,
    deleteAccount: () => Promise<serverResponse>,
}

const ProfileContext = createContext<ProfileContextType | null>(null);
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<userProfile>({ email: '', first_name: '', last_name: '', preferred_model: '' });
    const getUser = async () => {
        const response = await api.get('/user/me/');
        setUser(response);
    }
    useEffect(() => {
        getUser();
    }, []);

    const updateProfile = async (userChange: profileUpdate) => {
        const data = { "action": "update_info", ...userChange };
        const response = await api.put('/user/me/', data);
        if (response.status === 200) {
            setUser({ ...user, ...response.data });
        }
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
    return <ProfileContext.Provider value={{ user, updateProfile, updatePassword, deleteAccount }}>{children}</ProfileContext.Provider>
}

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}