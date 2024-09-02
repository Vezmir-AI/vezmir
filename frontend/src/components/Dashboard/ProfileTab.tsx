import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useConversation } from '@/context/ConversationContext';
import { useProfile } from '@/context/ProfileContext';
import ConfirmDeletePopup from './ConfirmDeletePopup'

const ProfileTab: React.FC = () => {
  const { user, updateProfile, updatePassword, deleteAccount } = useProfile();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { aiModels } = useConversation();
  const [preferredModel, setPreferredModel] = useState("automatic");
  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);

  useEffect(() => {
    if (aiModels.length > 0 && user.preferred_model) {
      setPreferredModel(aiModels.find((model) => model.id == user.preferred_model)?.name || "automatic");
    }
  }, [aiModels, user.preferred_model]);


  const handleSubmitProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const model = aiModels.find((model) => model.name == e.currentTarget['preferred-model'].value);
    const data = {
      first_name: e.currentTarget['first-name'].value,
      last_name: e.currentTarget['last-name'].value,
      preferred_model: model?.id
    }
    updateProfile(data);
  }

  const handleSubmitPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      old_password: e.currentTarget['current-password'].value,
      new_password: e.currentTarget['new-password'].value
    };
    // TODO: handle responses ==> feedback to user
    updatePassword(data).then((response) => {
      if (response.status === "success") {
        // empty the form
        e.currentTarget.reset();
        // setPasswordUpdateSuccess(true);
      } else {
        // setPasswordUpdateError(response.message);
      }
    });
  }

  // function props to pass to the confirm delete popup
  const handleConfirmDelete = (confirmed: boolean) => {
    setShowConfirmationDelete(false);
    if (confirmed) {
      deleteAccount();
      logout();
      navigate("/");
    }
  }

  return (
    <>
      <div>
        {/* Will show when the delete account button is clicked */}
        <ConfirmDeletePopup
          open={showConfirmationDelete}
          setOpen={setShowConfirmationDelete}
          onConfirm={handleConfirmDelete}
        />
        <div className="xl:px-16">
          <main>
            <h1 className="sr-only">Account Settings</h1>

            {/* Settings forms */}
            <div className="divide-y divide-white/5">
              <div className="max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="text-base font-semibold leading-7 text-white">Personal Information</h2>
                <p className="mt-1 text-sm leading-6 text-gray-400 mb-6">
                  Update your personal information associated with your account.
                </p>

                {/* PERSONAL INFORMATION */}
                <form className="w-full" onSubmit={handleSubmitProfile}>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                    <div className="sm:col-span-3">
                      <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-white">
                        First name
                      </label>
                      <div className="mt-2">
                        <input
                          id="first-name"
                          name="first-name"
                          type="text"
                          autoComplete="given-name"
                          defaultValue={user.first_name}
                          className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-white">
                        Last name
                      </label>
                      <div className="mt-2">
                        <input
                          id="last-name"
                          name="last-name"
                          type="text"
                          autoComplete="family-name"
                          defaultValue={user.last_name}
                          className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <div className="flex items-center">

                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                          Email address
                        </label>
                        {user.email_verified ? (
                          <span className="ml-2 flex items-center text-green-400">
                            <CheckIcon className="h-5 w-5" />
                            <span className="ml-1 text-xs">Email verified</span>
                          </span>
                        ) : (
                          <span className="ml-2 flex items-center text-red-400">
                            <XMarkIcon className="h-5 w-5" />
                            <span className="ml-1 text-xs">Email not verified</span>
                            <Link to="/resend-verification-email" className="ml-2 text-xs text-white underline">Resend verification email</Link>
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={user.email}
                          disabled
                          className="block w-full rounded-md border-0 bg-gray-700 py-1.5 text-gray-500 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 cursor-not-allowed px-3"
                        />
                      </div>
                      <p className="mt-2 text-xs leading-5 text-gray-400 italic">Email cannot be changed.</p>
                    </div>

                    <div className="col-span-full">
                      <label htmlFor="preferred-model" className="block text-sm font-medium leading-6 text-white">
                        Preferred AI Model
                      </label>
                      <div className="mt-2">
                        {user ? (
                          <div className="relative">
                            <select
                              id="preferred-model"
                              name="preferred_model"
                              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-3 pr-10 appearance-none"
                              value={preferredModel}
                              onChange={(e) => {
                                setPreferredModel(e.target.value);
                              }}
                            >
                              {aiModels.map((model) => (
                                <option key={model.id} value={model.name}>
                                  {model.display_name}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                              <ChevronDownIcon className="h-4 w-4" />
                            </div>
                          </div>
                        ) : (
                          <div className="animate-pulse bg-white/5 h-9 rounded-md"></div>
                        )}
                      </div>
                      <div className="mt-2 flex">
                        <p className="mt-2 text-xs leading-5 text-gray-400 italic">This will be the default model used in new chats.</p>
                        <span className="ml-2" />
                        <p className="mt-2 text-xs leading-5 text-[var(--bordeaux-clear)] italic">
                          The Automatic model refers to the last model used in the conversation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex">
                    <button
                      type="submit"
                      className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>

              {/* PASSWORD */}
              <div className="max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="text-base font-semibold leading-7 text-white">Change password</h2>
                <p className="mt-1 text-sm leading-6 text-gray-400 mb-6">
                  Update your password associated with your account.
                </p>

                <form className="w-full" onSubmit={handleSubmitPassword}>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="col-span-full">
                      <label htmlFor="current-password" className="block text-sm font-medium leading-6 text-white">
                        Current password
                      </label>
                      <div className="mt-2">
                        <input
                          id="current-password"
                          name="current_password"
                          type="password"
                          autoComplete="current-password"
                          className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label htmlFor="new-password" className="block text-sm font-medium leading-6 text-white">
                        New password
                      </label>
                      <div className="mt-2">
                        <input
                          id="new-password"
                          name="new_password"
                          type="password"
                          autoComplete="new-password"
                          className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
                        />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-white">
                        Confirm password
                      </label>
                      <div className="mt-2">
                        <input
                          id="confirm-password"
                          name="confirm_password"
                          type="password"
                          autoComplete="new-password"
                          className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex">
                    <button
                      type="submit"
                      className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>

              {/* DELETE ACCOUNT */}
              <div className="max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="text-base font-semibold leading-7 text-white">Delete account</h2>
                <p className="mt-1 text-sm leading-6 text-gray-400 mb-6">
                  No longer want to use our service? You can delete your account here.
                  All information related to this account will be deleted permanently in 30 days. You can revert this action in the meantime.
                </p>

                <button
                  type="submit"
                  onClick={() => {
                    setShowConfirmationDelete(true);
                  }}
                  className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
                >
                  Yes, delete my account
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
};

export default ProfileTab;
