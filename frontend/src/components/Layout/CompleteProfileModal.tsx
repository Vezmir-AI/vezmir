import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { CheckIcon, ClockIcon } from '@heroicons/react/20/solid'
import { useProfile } from '@/context/ProfileContext';

interface CompleteProfileModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const { user } = useProfile();
  const [profileSteps, setProfileSteps] = useState<{ action: string, completed: boolean, link: string }[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const profileSteps = [
      { action: "Verify your email address", completed: !!user.email_verified, link: "/dashboard/profile" },
      { action: "Add your first and last name", completed: !!(user.first_name && user.last_name), link: "/dashboard/profile" },
      { action: "Choose your preferred AI model", completed: !!user.preferred_model, link: "/dashboard/profile" },
      { action: "Add a payment method", completed: !!user.stripe_payment_method_id, link: "/dashboard/billing" },
    ];
    const completedSteps = profileSteps.filter(step => step.completed).length;
    setProgress((completedSteps / profileSteps.length) * 100);
    setProfileSteps(profileSteps);
  }, [user]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-[100]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-[100] w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <ClockIcon aria-hidden="true" className="h-6 w-6 text-orange-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                  Complete your profile
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Please complete your profile to use the full features of the platform.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <ul className="mt-4 space-y-2">
                {profileSteps.map((step, index) => (
                  <li key={index} className={`flex items-center justify-between p-2 rounded ${!step.completed ? 'cursor-pointer hover:bg-gray-100' : ''}`} onClick={() => !step.completed && (handleNavigation(step.link))}>
                    <span className={`text-sm ${step.completed ? 'text-gray-700' : 'text-gray-500'}`}>{step.action}</span>
                    {step.completed ? (
                      <CheckIcon aria-hidden="true" className="h-5 w-5 text-green-600 outline outline-green-300 rounded-full bg-green-100" />
                    ) : (
                      <div className="h-5 w-5 rounded-full outline outline-gray-300"></div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Do it later
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default CompleteProfileModal;
