import OpenAILogo from '@/assets/openai.svg';
import AnthropicLogo from '@/assets/anthropic.svg';
import React from '@/assets/react.svg';
import GoogleLogo from '@/assets/google.svg';

export const getProviderLogo = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case 'openai':
      return OpenAILogo;
    case 'anthropic':
      return AnthropicLogo;
    case 'google':
      return GoogleLogo;
    default:
      return React;
  }
};

export const getProviderColor = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case 'openai':
      return 'bg-[#00B48C] text-white';
    case 'anthropic':
      return 'bg-[#D4A27F] text-white';
    case 'google':
      return 'bg-[#4285F4] text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};
