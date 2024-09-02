import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api';
interface ErrorResponse {
    message: string
}

const ResendVerificationEmail: React.FC = () => {
    const navigate = useNavigate();
    const [message, setMessage] = React.useState<string>('');
    const [error, setError] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    useEffect(() => {
        const resendVerificationEmail = async () => {
            try {
                await api.post("/user/resend-verification-email/");
                setMessage('Verification email has been resent. Please check your inbox.');
            } catch (error) {
                const errorResponse = error as ErrorResponse;
                setError(errorResponse.message);
            } finally {
                setIsLoading(false);
            }
        };
        resendVerificationEmail();
    }, []);
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-2xl font-bold">Resend Verification Email</h2>
            {isLoading ? <p>Loading...</p> : (
                <>
                    {message && <p className="text-[var(--bordeaux-clear)]">{message}</p>}
                    {error && <p className="text-red-500">Failed to resend verification email: {error}</p>}
                    <button className="mt-4 text-white" onClick={() => navigate('/')}>To Chat</button>
                </>
            )}
        </div>
    )
}

export default ResendVerificationEmail;
