import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useConversation } from '@/context/ConversationContext';
import { useProfile } from '@/context/ProfileContext';
import ConfirmDeletePopup from './ConfirmDeletePopup'
import { useTheme } from '@/context/ThemeContext';
import { getProviderLogo, getProviderColor } from '../../utils/providerUtils';

const ProfileTab: React.FC = () => {
  const { user, updateProfile, updatePassword, deleteAccount } = useProfile();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { locale } = useTheme();
  const { aiModels } = useConversation();
  const [preferredModel, setPreferredModel] = useState("automatic");
  const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (aiModels.length > 0 && user.preferred_model) {
      setPreferredModel(aiModels.find((model) => model.id == user.preferred_model)?.name || "automatic");
    }
  }, [aiModels, user.preferred_model]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value.slice(0, 128); // Limit to 128 characters
    setPassword(newPassword);
    if (newPassword.length > 0 && newPassword.length < 8) {
      setPasswordError(locale('auth_password_min_length'));
    } else {
      setPasswordError('');
    }
    setPasswordsMatch(newPassword === confirmPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPwd = e.target.value;
    setConfirmPassword(confirmPwd);
    setPasswordsMatch(confirmPwd === '' || confirmPwd === password);
  };


  const handleSubmitProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const model = aiModels.find((model) => model.name === preferredModel);
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
        <div className="xl:px-16 bg-[var(--gray-800)]">
          <main>
            <h1 className="sr-only">{locale("dashboard_account_settings")}</h1>

            {/* Settings forms */}
            <div className="divide-y divide-white/5">
              <div className="max-w-7xl px-4 mt-12 sm:px-6 lg:px-8">
                <h2 className="text-2xl px-2 font-semibold leading-7 text-white mb-4">{locale("dashboard_profile_information")}</h2>
                <p className="mt-1 px-2 text-sm leading-6 text-gray-400 mb-6">
                  {locale("dashboard_profile_information_description")}
                </p>

                {/* PERSONAL INFORMATION */}
                <form className="w-full" onSubmit={handleSubmitProfile}>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                    <div className="sm:col-span-3">
                      <div className="relative">
                        <input
                          id="first-name"
                          name="first-name"
                          type="text"
                          autoComplete="given-name"
                          defaultValue={user.first_name}
                          className="input-field peer"
                          placeholder=" "
                        />
                        <label
                          htmlFor="first-name"
                          className="floating-label"
                        >
                          {locale("dashboard_first_name")}
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <div className="relative">
                        <input
                          id="last-name"
                          name="last-name"
                          type="text"
                          autoComplete="family-name"
                          defaultValue={user.last_name}
                          className="input-field peer bg-gray-700 text-gray-500"
                          placeholder=" "
                        />
                        <label
                          htmlFor="last-name"
                          className="floating-label"
                        >
                          {locale("dashboard_last_name")}
                        </label>
                      </div>
                    </div>

                    <div className="col-span-full">
                      <div className="mb-2 relative">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={user.email}
                          disabled
                          className="input-field peer cursor-not-allowed bg-gray-700 text-gray-500"
                          placeholder=" "
                        />
                        <label
                          htmlFor="email"
                          className="floating-label"
                        >
                          {locale("auth_email_address")}
                        </label>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-xs px-2 leading-5 text-gray-400 italic">{locale("dashboard_email_cannot_be_changed")}</p>
                        {user.email_verified ? (
                          <span className="flex items-center text-green-400">
                            <CheckIcon className="h-5 w-5" />
                            <span className="ml-1 text-xs">{locale("dashboard_email_verified")}</span>
                          </span>
                        ) : (
                          <span className="flex items-center text-red-400">
                            <XMarkIcon className="h-5 w-5" />
                            <span className="ml-1 text-xs">{locale("dashboard_email_not_verified")}</span>
                            <Link to="/resend-verification-email" className="ml-2 mr-2 text-xs text-white underline">{locale("dashboard_resend_verification_email")}</Link>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-full">
                      <h3 className="text-lg px-2 font-semibold leading-7 text-white mb-4">{locale("dashboard_preferred_ai_model")}</h3>
                      <p className="mt-1 px-2 text-sm leading-6 text-gray-400 mb-6">
                      {locale("dashboard_preferred_ai_model_description")}
                      </p>
                      <div className="mb-2 relative">
                        <div className="relative inline-block text-left w-full sm:w-1/2">
                          <div>
                            <button
                              type="button"
                              className="inline-flex justify-between w-full rounded-xl shadow-sm px-3 sm:px-5 text-sm sm:text-lg font-medium text-gray-300 bg-[var(--gray-700)] hover:bg-[var(--gray-600)] focus:outline-none focus:ring-0"
                              onClick={() => setIsOpen(!isOpen)}
                            >
                              <span className="truncate">
                                {aiModels.find(model => model.name === preferredModel)?.display_name || 'Select a model'}
                              </span>
                              <ChevronDownIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                            </button>
                          </div>

                          {isOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-[var(--gray-700)] z-50">
                              <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                {aiModels.map((model) => (
                                  <button
                                    key={model.name}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 bg-[var(--gray-700)] hover:bg-[var(--gray-800)] hover:text-gray-100"
                                    role="menuitem"
                                    onClick={() => {
                                      setPreferredModel(model.name);
                                      setIsOpen(false);
                                    }}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex flex-col relative">
                                        <span className="font-medium">{model.display_name || model.name}</span>
                                        <span className="text-xs text-gray-400">{model.provider}</span>
                                      </div>
                                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getProviderColor(model.provider)}`}>
                                        <img
                                          src={getProviderLogo(model.provider)}
                                          alt={`${model.provider} logo`}
                                          className="w-6 h-6"
                                        />
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="mt-8 px-2 flex">
                    <button
                      type="submit"
                      className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {locale("dashboard_save")}
                    </button>
                  </div>
                </form>
              </div>

              {/* PASSWORD */}
              <div className="max-w-7xl px-4 mt-16 sm:px-6 lg:px-8">
                <h2 className="text-2xl px-2 font-semibold leading-7 text-white mb-4">{locale("dashboard_change_password")}</h2>
                <p className="mt-1 px-2 text-sm leading-6 text-gray-400 mb-6">
                  {locale("dashboard_change_password_description")}
                </p>

                <form className="w-full" onSubmit={handleSubmitPassword}>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="col-span-full">
                      <div className="mb-2 relative">
                        <input
                          id="current-password"
                          name="current_password"
                          type="password"
                          autoComplete="current-password"
                          className="input-field peer"
                          placeholder=" "
                        />
                        <label
                          htmlFor="current-password"
                          className="floating-label"
                        >
                          {locale("dashboard_current_password")}
                        </label>
                      </div>
                    </div>

                    <div className="col-span-full">
                      <div className="mb-2 relative">
                        <input
                          id="new-password"
                          name="new_password"
                          type="password"
                          autoComplete="new-password"
                          className="input-field peer"
                          placeholder=" "
                          onChange={handlePasswordChange}
                        />
                        <label
                          htmlFor="new-password"
                          className="floating-label"
                        >
                          {locale("dashboard_new_password")}
                        </label>
                        {passwordError && <p className="text-[var(--purple)] text-sm mt-1">{passwordError}</p>}
                      </div>
                    </div>

                    <div className="col-span-full">
                      <div className="mb-2 relative">
                        <input
                          id="confirm-password"
                          name="confirm_password"
                          type="password"
                          autoComplete="new-password"
                          className={`input-field peer ${!passwordsMatch ? 'border-[var(--purple)]' : ''}`}
                          placeholder=" "
                          onChange={handleConfirmPasswordChange}
                        />
                        <label
                          htmlFor="confirm-password"
                          className="floating-label"
                        >
                          {locale("dashboard_confirm_password")}
                        </label>
                        {!passwordsMatch && confirmPassword !== '' && (
                          <p className="text-[var(--purple)] text-sm mt-1">{locale('auth_password_not_match')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 px-2 flex">
                    <button
                      type="submit"
                      className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {locale("dashboard_save")}
                    </button>
                  </div>
                </form>
              </div>

              {/* DELETE ACCOUNT */}
              <div className="max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="text-2xl px-2 font-semibold leading-7 text-white mb-4">{locale("dashboard_delete_account")}</h2>
                <p className="mt-1 px-2 text-sm leading-6 text-gray-400 mb-6">
                  {locale("dashboard_delete_account_description")}
                </p>

                <div className="px-2">
                  <button
                    type="submit"
                    onClick={() => {
                      setShowConfirmationDelete(true);
                    }}
                    className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
                  >
                    {locale("dashboard_delete_account")}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
};

export default ProfileTab;
