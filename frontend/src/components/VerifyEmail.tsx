import React, { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "@/api"

const VerifyEmail: React.FC = () => {
    const [isVerified, setIsVerified] = useState(false)
    const [error, setError] = useState("")
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        const token = searchParams.get("token")
        if (token) {
            verifyEmail(token)
        } else {
            setError("No token provided")
        }
    }, [searchParams])

    const verifyEmail = async (token: string) => {
        api.post("/user/verify-email/", { token }).then((response) => {
            if (response.message === "email_verified_successfully") {
                setIsVerified(true)
                setTimeout(() => navigate("/dashboard"), 3000)
            }
        }).catch((error) => {
            console.error(error)
            if (error.message) {
                const errorMessage = error.message;
                switch (errorMessage) {
                    case 'token_is_required':
                        setError('Verification token is required.');
                        break;
                    case 'invalid_verification_token':
                        setError('Invalid verification token.');
                        break;
                    case 'email_already_verified':
                        setIsVerified(true);
                        setTimeout(() => navigate("/dashboard"), 3000);
                        break;
                    case 'token_has_expired':
                        setError('Verification token has expired.');
                        break;
                    default:
                        setError(`Failed to verify email: ${errorMessage}. Please try again.`);
                }
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
        })
    }

    return (
        <div className="verify-email-container">
            {isVerified ? (
                <div className="success-message">
                    <h2>Email Verified Successfully!</h2>
                    <p>Your email has been successfully verified. You can now use all features of our platform.</p>
                    <p>Redirecting to dashboard...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <h2>Verification Error</h2>
                    <p>{error}</p>
                    <p>Please check your email for a valid verification link or <a className="underline" href="/resend-verification-email">request a new one</a>.</p>
                </div>
            ) : (
                <div className="loading-message">
                    <p>Verifying your email...</p>
                </div>
            )}
        </div>
    )
}

export default VerifyEmail;
