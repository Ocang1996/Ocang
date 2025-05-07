import { Type, Globe } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

/**
 * A component that shows the current language and font size settings
 * Used to give users feedback on their current settings
 */
const SettingsIndicator = () => {
  const { language, fontSize } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-white dark:bg-gray-800 shadow-md rounded-full px-3 py-1.5 text-xs opacity-60 hover:opacity-100 transition-opacity">
      <div className="flex items-center">
        <Globe size={14} className="text-gray-600 dark:text-gray-300 mr-1" />
        <span className="text-gray-700 dark:text-gray-300">
          {language === 'id' ? 'ID' : 'ING'}
        </span>
      </div>
      <div className="h-3 w-px bg-gray-300 dark:bg-gray-600"></div>
      <div className="flex items-center">
        <Type size={14} className="text-gray-600 dark:text-gray-300 mr-1" />
        <span className="text-gray-700 dark:text-gray-300">
          {fontSize === 'kecil' ? (t('settings_font_small') || 'S')[0] : 
           fontSize === 'sedang' ? (t('settings_font_medium') || 'M')[0] : 
           (t('settings_font_large') || 'L')[0]}
        </span>
      </div>
    </div>
  );
};

export default SettingsIndicator; 