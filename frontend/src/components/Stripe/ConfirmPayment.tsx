import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/api"
import { CircularProgress, Typography, Box, Container } from "@mui/material";
import { useTheme } from "@/context/ThemeContext";

const PaymentSuccess: React.FC = () => {
    const { locale } = useTheme();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get("session_id");
    const [success, setSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [countdown, setCountdown] = useState<number>(5);
    useEffect(() => {
        const fetchPaymentMethod = async () => {
            try {
                await api.post("/billing/confirm-checkout-session/", { session_id: sessionId });
                setSuccess(true);
                setCountdown(5);
                const interval = setInterval(() => {
                    setCountdown((prevCountdown) => prevCountdown - 1);
                }, 1000);
                setTimeout(() => {
                    clearInterval(interval);
                    navigate("/dashboard/billing");
                }, 5000);
            } catch (error) {
                console.error("Error confirming payment:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentMethod();
    }, [sessionId, navigate]);

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
                textAlign="center"
            >
                {loading ? (
                    <>
                        <CircularProgress size={60} thickness={4} />
                        <Typography variant="h5" mt={3}>
                            {locale("stripe_confirm_payment_confirming")}
                        </Typography>
                    </>
                ) : success ? (
                    <>
                        <Typography variant="h4" gutterBottom>
                            {locale("stripe_confirm_payment_success")}
                        </Typography>
                        <Typography variant="body1">
                            {locale("stripe_confirm_payment_redirecting")} {countdown} {locale("stripe_confirm_payment_seconds")}...
                        </Typography>
                    </>
                ) : (
                    <Typography variant="h5" color="error">
                        {locale("stripe_confirm_payment_error")}
                    </Typography>
                )}
                <Typography variant="body2" mt={2} color="white">
                    {locale("stripe_confirm_payment_hint")}
                </Typography>
            </Box>
        </Container>
    );
}

export default PaymentSuccess;
