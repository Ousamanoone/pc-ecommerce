import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

export const DAISYUI_THEMES = [
  'dark',
  'light',
  'night',
  'synthwave',
  'cyberpunk',
  'dracula',
  'luxury',
  'forest',
  'aqua',
  'halloween',
  'black',
  'dim',
  'sunset',
  'coffee',
  'business',
  'nord',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'retro',
  'valentine',
  'garden',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'cmyk',
  'autumn',
  'acid',
  'lemonade',
  'winter',
];

export interface SocialSettings {
  facebookUrl: string;
  messengerUrl: string;
  zaloUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  hotline: string;
  supportEmail: string;
  showFloatingSocial: boolean;
}

interface ThemeContextType {
  theme: string;
  setTheme: (newTheme: string) => void;
  previewTheme: (tempTheme: string | null) => void;
  toggleTheme: () => void;
  socialSettings: SocialSettings;
  refreshSocialSettings: () => Promise<void>;
}

const defaultSocial: SocialSettings = {
  facebookUrl: 'https://facebook.com',
  messengerUrl: 'https://m.me',
  zaloUrl: 'https://zalo.me',
  tiktokUrl: '',
  youtubeUrl: '',
  hotline: '1900 6868',
  supportEmail: 'support@gearstore.com',
  showFloatingSocial: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<string>(() => {
    return localStorage.getItem('gearstore_theme') || 'dark';
  });

  const [socialSettings, setSocialSettings] = useState<SocialSettings>(defaultSocial);

  const applyDomTheme = (targetTheme: string) => {
    document.documentElement.setAttribute('data-theme', targetTheme);
    document.body.setAttribute('data-theme', targetTheme);
  };

  useEffect(() => {
    applyDomTheme(theme);
    localStorage.setItem('gearstore_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    applyDomTheme(newTheme);
    localStorage.setItem('gearstore_theme', newTheme);
  };

  // Xem trước màu nền ngay khi rê chuột qua từng dòng theme
  const previewTheme = (tempTheme: string | null) => {
    applyDomTheme(tempTheme || theme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const refreshSocialSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setSocialSettings({ ...defaultSocial, ...res.data });
      }
    } catch {
      // Giữ nguyên mặc định nếu chưa có mạng
    }
  };

  useEffect(() => {
    refreshSocialSettings();
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        previewTheme,
        toggleTheme,
        socialSettings,
        refreshSocialSettings,
      }}
    >
      <div data-theme={theme} className="min-h-screen bg-base-100 text-base-content transition-colors duration-200">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};