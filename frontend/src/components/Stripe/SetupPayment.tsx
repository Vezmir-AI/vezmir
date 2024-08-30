import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from '@stripe/react-stripe-js';
import api from '@/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SetupForm: React.FC = () => {

    const fetchClientSecret = useCallback(async () => {
        try {
            const { clientSecret } = await api.post('/billing/create-checkout-session/', {});
            return clientSecret;
        } catch (error) {
            console.error('Error fetching client secret:', error);
            throw error;
        }
    }, []);

    const options = { fetchClientSecret };

    return (
        <div id="checkout" className="h-full w-full flex items-center justify-center p-4 pt-16 sm:p-6 md:p-8">
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
