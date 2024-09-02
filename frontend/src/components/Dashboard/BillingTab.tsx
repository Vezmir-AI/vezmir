import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import api from '@/api';
import { PaymentMethod } from '@/types';
import { getIssuerLogo } from '@/utils';
import { useProfile } from '@/context/ProfileContext';

const BillingTab: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPM, setLoadingPM] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const { user } = useProfile();

  const fetchBillingInfo = async () => {
    try {
      const { payment_methods } = await api.get('/billing/me/');
      setPaymentMethods(payment_methods);
    } catch (error) {
      console.error('Error fetching billing info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const balance = typeof user.balance === 'string' ? parseFloat(user.balance) : user.balance ?? 0;
    setUserBalance(balance);
  }, [user]);

  useEffect(() => {
    fetchBillingInfo();
    setLoadingPM(false);
  }, []);

  const selectPM = async (index: number) => {
    setLoadingPM(true);
    const updatedPaymentMethods = [...paymentMethods];
    updatedPaymentMethods.forEach((method, i) => {
      method.selected = i === index;
    });
    setPaymentMethods(updatedPaymentMethods);
    try {
      await api.post('/billing/me/', { payment_method_id: updatedPaymentMethods[index].id });
      setPaymentMethods(updatedPaymentMethods);
      fetchBillingInfo();
    } catch (error) {
      console.error(error);
      setPaymentMethods(paymentMethods);
    } finally {
      setLoadingPM(false);
    }
  };

  return (
    <div className="bg-[var(--gray-800)] shadow sm:rounded-lg text-[var(--white)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--white)] px-4 py-5 sm:px-6">Billing Information</h2>

      <div className="px-4 py-5 sm:p-6">
        {/* Balance Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold leading-6 text-[var(--white)] mb-4">Your Balance</h3>
          <p className="text-sm text-gray-400 my-2">
            Balance is added manually for the beta. <br />
            <span className="font-bold text-xs text-[var(--bordeaux-clear)]">For new balance requests, please contact <a href="mailto:beta@vezmir.com" className="text-[var(--bordeaux-clear)] underline">beta@vezmir.com</a>.</span>
          </p>

          {loading ? (
            <div className="bg-gray-700 h-10 w-32 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl font-bold">${userBalance.toFixed(2)}</div>
          )}
        </div>

        {/* Payment Method Section */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold leading-6 text-[var(--white)]">Your Payment Methods</h3>
          <Link
            to="/setup-payment"
            className="inline-flex items-center rounded-md px-3 py-2 bg-[var(--bordeaux)] text-sm font-semibold text-[var(--white)] shadow-sm hover:bg-[var(--bordeaux-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--bordeaux-clear)] focus:ring-offset-2 focus:ring-offset-[var(--gray-800)]"
          >
            Add Payment Method
          </Link>
        </div>
        <div id="payment-methods" className="mt-5 space-y-4">
          {loading ? (
            <div className="rounded-md bg-gradient-to-r from-[var(--gray-800)] via-[var(--gray-600)] to-[var(--gray-800)] animate-gradient-loading px-6 py-5 sm:flex sm:items-start sm:justify-between">
              <div className="sm:flex sm:items-start">
                <div className="bg-gray-800 p-1 rounded w-10 h-10"></div>
                <div className="mt-3 sm:ml-4 sm:mt-0">
                  <div className="text-sm font-medium text-gray-400 w-32 h-4"></div>
                  <div className="mt-1 text-sm text-gray-400 sm:flex sm:items-center">
                    <div className="w-24 h-4"></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:ml-6 sm:mt-0 sm:flex-shrink-0 space-x-2">
                <div className="inline-flex items-center rounded-md px-3 py-2 bg-gray-800 w-20 h-8"></div>
              </div>
            </div>
          ) : (
            paymentMethods.length > 0 ? (
              paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className={[
                    'rounded-md bg-gray-800 px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors duration-200',
                    method.selected ? loadingPM ? 'border-2 border-gray-400' : 'border-2 border-green-500' : ''
                  ].join(' ')}
                  onClick={() => selectPM(index)}
                >
                  <div className="flex items-center w-full">
                    <div className="bg-white p-1 rounded w-10 h-10 flex-shrink-0 mr-4">
                      <img src={getIssuerLogo(method.brand)} alt={method.brand} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-medium text-white">{method.brand.toUpperCase()} ending with {method.last4}</div>
                      <div className="mt-1 text-sm text-gray-400 flex items-center">
                        <div>Expires {method.exp_month.toString().padStart(2, '0')}/{method.exp_year.toString().slice(-2)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {method.selected && (
                      <CheckCircleIcon className={`h-6 w-6 text-${loadingPM ? 'gray-400' : 'green-500'}`} />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md bg-gray-800 px-6 py-5 text-center">
                <p className="text-sm text-gray-400">No payment method found.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingTab;
