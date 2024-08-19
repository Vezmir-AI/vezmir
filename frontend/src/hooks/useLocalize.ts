import englishTranslations from '@/localization/languages/Eng';

export default function useLocalize(key: string): string {
  return englishTranslations[key as keyof typeof englishTranslations] || key;
}