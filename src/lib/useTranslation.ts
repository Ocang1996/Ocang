import { useTheme } from './ThemeContext';
import translations from './translations';
import { Language } from './theme';

export function useTranslation() {
  const { language } = useTheme();
  
  // Get translation function for current language
  const t = (key: keyof typeof translations.id) => {
    const currentLanguage = language as Language;
    return translations[currentLanguage][key];
  };
  
  return { t };
} 