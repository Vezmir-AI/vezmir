import OpenAILogo from '@/assets/openai.svg';
import AnthropicLogo from '@/assets/anthropic.svg';
import React from '@/assets/react.svg';

export const getProviderLogo = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case 'openai':
      return OpenAILogo;
    case 'anthropic':
      return AnthropicLogo;
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
    default:
      return 'bg-gray-600 text-white';
  }
};
