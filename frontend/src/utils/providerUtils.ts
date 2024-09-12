import OpenAILogo from '@/assets/openai.svg';
import AnthropicLogo from '@/assets/anthropic.svg';
import GoogleLogo from '@/assets/google.svg';
import VezmirLogo from '@/assets/vezmir.svg';
import PPLXLogo from '@/assets/pplx.svg';

export const getProviderLogo = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case 'openai':
      return OpenAILogo;
    case 'anthropic':
      return AnthropicLogo;
    case 'google':
      return GoogleLogo;
    case 'perplexity':
      return PPLXLogo;
    default:
      return VezmirLogo;
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
    case 'perplexity':
      return 'bg-[#2aaac9] text-white';
    default:
      return 'bg-[var(--purple-clear)] text-white';
  }
};
