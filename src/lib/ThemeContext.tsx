import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ThemeType, 
  Language, 
  FontSize, 
  applyTheme, 
  applyLanguage, 
  applyFontSize,
  getCurrentTheme, 
  getCurrentLanguage, 
  getCurrentFontSize,
  initThemeListener,
  isDarkMode
} from './theme';

export type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  profilePhoto: string | null;
  updateProfilePhoto: (photoUrl: string | null) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check system preference and localStorage
  const getInitialTheme = (): ThemeType => {
    const storedTheme = localStorage.getItem('theme') as ThemeType;
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      return storedTheme;
    }
    return 'system'; // Default to system
  };

  const getInitialLanguage = (): Language => {
    const storedLanguage = localStorage.getItem('language') as Language;
    // Juga cek pengaturan di app_settings jika tersedia
    try {
      const appSettings = localStorage.getItem('app_settings');
      if (appSettings) {
        const settings = JSON.parse(appSettings);
        if (settings?.appearance?.language) {
          return settings.appearance.language === 'en' ? 'en' : 'id';
        }
      }
    } catch (error) {
      console.error('Error getting language from app_settings:', error);
    }
    return storedLanguage === 'en' ? 'en' : 'id'; // Default to Indonesian
  };

  const getInitialFontSize = (): FontSize => {
    const storedFontSize = localStorage.getItem('fontSize') as FontSize;
    if (['kecil', 'sedang', 'besar'].includes(storedFontSize)) {
      return storedFontSize;
    }
    return 'sedang'; // Default to medium size
  };

  // Get initial profile photo from localStorage
  const getInitialProfilePhoto = (): string | null => {
    return localStorage.getItem('profilePhoto');
  };
  
  const [isDark, setIsDark] = useState<boolean>(isDarkMode());
  const [theme, setThemeState] = useState<ThemeType>(getInitialTheme());
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());
  const [fontSize, setFontSizeState] = useState<FontSize>(getInitialFontSize());
  const [profilePhoto, setProfilePhoto] = useState<string | null>(getInitialProfilePhoto());
  
  // Update document class when dark mode changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  
  // Update theme when theme state changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
    setIsDark(isDarkMode());
  }, [theme]);
  
  // Update language when language changes
  useEffect(() => {
    // Simpan ke localStorage
    localStorage.setItem('language', language);
    
    // Juga update di app_settings jika tersedia
    try {
      const appSettings = localStorage.getItem('app_settings');
      if (appSettings) {
        const settings = JSON.parse(appSettings);
        if (settings.appearance) {
          settings.appearance.language = language;
          localStorage.setItem('app_settings', JSON.stringify(settings));
        }
      }
    } catch (error) {
      console.error('Error updating language in app_settings:', error);
    }
    
    // Terapkan bahasa ke dokumen
    applyLanguage(language);
  }, [language]);
  
  // Update font size when fontSize changes
  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);
  
  // Toggle dark/light mode
  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return isDark ? 'light' : 'dark';
    });
  };
  
  // Set theme directly
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };
  
  // Toggle language between Indonesian and English
  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'id' ? 'en' : 'id');
  };
  
  // Set language directly
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  
  // Set font size directly
  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };
  
  // Update profile photo
  const updateProfilePhoto = (photoUrl: string | null) => {
    setProfilePhoto(photoUrl);
    if (photoUrl) {
      localStorage.setItem('profilePhoto', photoUrl);
    } else {
      localStorage.removeItem('profilePhoto');
    }
  };
  
  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      toggleTheme,
      theme,
      setTheme,
      language,
      toggleLanguage,
      setLanguage,
      fontSize,
      setFontSize,
      profilePhoto,
      updateProfilePhoto
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 