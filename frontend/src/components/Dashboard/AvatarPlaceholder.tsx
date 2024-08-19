import React, { useState, useEffect } from 'react';
import { useProfile } from '@/context/ProfileContext';


const AvatarPlaceholder: React.FC = () => {
    const [initials, setInitials] = useState('');
    const { user } = useProfile();

    useEffect(() => {
        setInitials(user.first_name && user.last_name ? user.first_name[0].toUpperCase() + user.last_name[0].toUpperCase() : 'AI')
    }, [user])

    return (
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
            <div className="w-full h-full bg-gray-500 text-white text-lg font-semibold flex items-center justify-center">
                {initials}
            </div>
        </div>
    )
};

export default AvatarPlaceholder;