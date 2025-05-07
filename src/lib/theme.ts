// Tema warna untuk dashboard yang clean dan profesional

export const theme = {
  // Warna utama
  primary: {
    main: '#10B981',    // Emerald 500 - warna utama
    light: '#34D399',   // Emerald 400 - warna yang lebih terang
    dark: '#059669',    // Emerald 600 - warna yang lebih gelap
  },
  secondary: {
    main: '#6EE7B7',    // Emerald 300 - untuk elemen interaktif, highlight
    light: '#A7F3D0',   // Emerald 200 - secondary yang lebih terang
    dark: '#34D399',    // Emerald 400 - secondary yang lebih gelap
  },
  accent: {
    main: '#10B981',    // Emerald 500 - untuk alert, notifikasi
    light: '#6EE7B7',   // Emerald 300 - accent yang lebih terang
    dark: '#059669',    // Emerald 600 - accent yang lebih gelap
  },
  success: {
    main: '#10B981',    // Emerald 500 - untuk data positif, approval
    light: '#6EE7B7',   // Emerald 300 - success yang lebih terang
    dark: '#059669',    // Emerald 600 - success yang lebih gelap
  },
  
  // Warna netral
  neutral: {
    white: '#FFFFFF',      // Putih - untuk background utama
    lightGray: '#F9FAFB',  // Abu-abu sangat terang - untuk panel/card
    border: '#D1FAE5',     // Emerald 100 - untuk border
    text: {
      primary: '#064E3B',    // Emerald 900 - untuk teks utama
      secondary: '#065F46',  // Emerald 800 - untuk teks sekunder
      caption: '#047857',    // Emerald 700 - untuk caption/keterangan
    }
  },
  
  // Set warna untuk grafik
  chart: {
    categoryColors: [
      '#10B981',  // Emerald 500
      '#34D399',  // Emerald 400
      '#6EE7B7',  // Emerald 300
      '#A7F3D0',  // Emerald 200
      '#064E3B',  // Emerald 900
      '#059669',  // Emerald 600
    ],
    
    // Monokromatik untuk visualisasi data dalam satu kategori
    monochrome: {
      blue: ['#059669', '#10B981', '#34D399', '#6EE7B7'],
      green: ['#064E3B', '#065F46', '#047857', '#10B981'],
      red: ['#059669', '#10B981', '#34D399', '#6EE7B7'],
    }
  },
  
  // Shadow dan efek
  effects: {
    shadow: '0 2px 4px rgba(5, 150, 105, 0.1)',  // Shadow ringan untuk card dengan warna emerald
    hover: 'rgba(16, 185, 129, 0.1)',         // Warna emerald transparan untuk hover
  }
};

// Language settings
export type Language = 'id' | 'en';

// Font size settings
export type FontSize = 'kecil' | 'sedang' | 'besar';

// Font size mapping in pixels or rem
export const fontSizes = {
  kecil: {
    base: '0.875rem',     // 14px
    heading: '1.125rem',  // 18px
    small: '0.75rem'      // 12px
  },
  sedang: {
    base: '1rem',         // 16px
    heading: '1.25rem',   // 20px
    small: '0.875rem'     // 14px
  },
  besar: {
    base: '1.125rem',     // 18px
    heading: '1.5rem',    // 24px
    small: '1rem'         // 16px
  }
};

// Fungsi bantuan untuk chart
export const getChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            family: 'Intro, sans-serif',
            size: 12
          },
          color: theme.neutral.text.primary
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: theme.primary.main,
        bodyColor: theme.neutral.text.primary,
        borderColor: theme.neutral.border,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        boxShadow: theme.effects.shadow
      }
    },
    scales: {
      x: {
        grid: {
          color: '#F1F5F9'
        },
        ticks: {
          color: theme.neutral.text.secondary
        }
      },
      y: {
        grid: {
          color: '#F1F5F9'
        },
        ticks: {
          color: theme.neutral.text.secondary
        }
      }
    }
  };
};

// Theme types
export type ThemeType = 'light' | 'dark' | 'system';

/**
 * Apply theme to the document
 */
export function applyTheme(theme: ThemeType): void {
  // Remove existing theme first
  document.documentElement.classList.remove('dark');
  
  if (theme === 'dark') {
    // Apply dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else if (theme === 'light') {
    // Apply light mode (no 'dark' class)
    localStorage.setItem('theme', 'light');
  } else {
    // System preference
    localStorage.setItem('theme', 'system');
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }
}

/**
 * Apply language setting
 */
export function applyLanguage(language: Language): void {
  localStorage.setItem('language', language);
  document.documentElement.setAttribute('lang', language);
}

/**
 * Get current language from localStorage
 */
export function getCurrentLanguage(): Language {
  const savedLanguage = localStorage.getItem('language') as Language;
  return savedLanguage === 'en' ? 'en' : 'id'; // Default to Indonesian
}

/**
 * Apply font size
 */
export function applyFontSize(size: FontSize): void {
  // Remove existing font size classes
  document.documentElement.classList.remove('text-kecil', 'text-sedang', 'text-besar');
  
  // Add the new font size class
  document.documentElement.classList.add(`text-${size}`);
  localStorage.setItem('fontSize', size);
  
  // Set CSS variables for font sizes
  const sizes = fontSizes[size];
  document.documentElement.style.setProperty('--font-size-base', sizes.base);
  document.documentElement.style.setProperty('--font-size-heading', sizes.heading);
  document.documentElement.style.setProperty('--font-size-small', sizes.small);
}

/**
 * Get current font size from localStorage
 */
export function getCurrentFontSize(): FontSize {
  const savedFontSize = localStorage.getItem('fontSize') as FontSize;
  
  if (['kecil', 'sedang', 'besar'].includes(savedFontSize)) {
    return savedFontSize;
  }
  
  return 'sedang'; // Default to medium size
}

/**
 * Get current theme from localStorage
 */
export function getCurrentTheme(): ThemeType {
  const savedTheme = localStorage.getItem('theme') as ThemeType;
  
  if (['light', 'dark', 'system'].includes(savedTheme)) {
    return savedTheme;
  }
  
  return 'system';
}

/**
 * Check if dark mode is currently active
 */
export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

/**
 * Initialize theme system listener for system theme changes
 */
export function initThemeListener(): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (event: MediaQueryListEvent) => {
    const currentTheme = getCurrentTheme();
    
    if (currentTheme === 'system') {
      if (event.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handleChange);
}

/**
 * Toggle between light and dark mode
 */
export function toggleTheme(): void {
  const currentTheme = getCurrentTheme();
  
  if (currentTheme === 'light' || (currentTheme === 'system' && !isDarkMode())) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
}

/**
 * Initialize all UI settings on app startup
 */
export function initializeTheme(): void {
  // Initialize theme
  const savedTheme = getCurrentTheme();
  applyTheme(savedTheme);
  
  // Initialize language
  const savedLanguage = getCurrentLanguage();
  applyLanguage(savedLanguage);
  
  // Initialize font size
  const savedFontSize = getCurrentFontSize();
  applyFontSize(savedFontSize);
} 