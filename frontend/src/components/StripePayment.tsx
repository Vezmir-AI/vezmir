import * as React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { useCallback } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SetupForm: React.FC = () => {
    const navigate = useNavigate();

    const handlePaymentSetup = async (result: { error?: { message: string } }) => {
        if (result.error) {
            console.error(result.error);
        } else {
            try {
                await api.post('/api/billing/save-payment-method/');
                navigate('/dashboard');
            } catch (error) {
                console.error('Error saving payment method:', error);
            }
        }
    };

    const fetchClientSecret = useCallback(async () => {
        try {
            const response = await api.post('/billing/create-checkout-session/', {
                mode: 'setup',
                success_url: window.location.origin + '/payment-success',
            });
            return response.clientSecret;
        } catch (error) {
            console.error('Error fetching client secret:', error);
            throw error;
        }
    }, []);

    const options = { fetchClientSecret };

    return (
        <div id="checkout" className="h-full w-full flex items-center justify-center bg-white p-4 sm:p-6 md:p-8">
            <div className="mx-auto w-full max-w-4xl">
                <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={options}
                >
                    <EmbeddedCheckout className="w-full" />
                </EmbeddedCheckoutProvider>
            </div>
        </div>
    )
}

export default SetupForm;