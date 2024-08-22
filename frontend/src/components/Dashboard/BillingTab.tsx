import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import api from '@/api';
import { PaymentMethod } from '@/types';
import { getIssuerLogo } from '@/utils';


const BillingTab: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPM, setLoadingPM] = useState(false);

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
      const { status, message } = await api.post('/billing/me/', { payment_method_id: updatedPaymentMethods[index].id });
      if (status === 'success') {
        setPaymentMethods(updatedPaymentMethods);
        fetchBillingInfo();
      } else {
        console.error(message);
        setPaymentMethods(paymentMethods);
      }
    } catch (error) {
      console.error(error);
      setPaymentMethods(paymentMethods);
    } finally {
      setLoadingPM(false);
    }
  };

  return (
    <div className="bg-gray-900 shadow sm:rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-6 text-white px-4 py-5 sm:px-6">Billing Information</h2>

      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold leading-6 text-white">Your Payment Method</h3>
          <Link
            to="/setup-payment"
            className="inline-flex items-center rounded-md px-3 py-2 bg-[var(--bordeaux)] text-sm font-semibold text-white shadow-sm hover:bg-[var(--bordeaux-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--bordeaux-clear)] focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Add Payment Method
          </Link>
        </div>
        <div id="payment-methods" className="mt-5 space-y-4">
          {loading ? (
            <div className="rounded-md bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 animate-gradient-loading px-6 py-5 sm:flex sm:items-start sm:justify-between">
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