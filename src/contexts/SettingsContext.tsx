import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface ClubBranding {
  clubName: string;
  clubLogo: string | null;
  primaryColor: string;
  accentColor: string;
  sidebarColor: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  marketing: boolean;
  events: boolean;
  payments: boolean;
  trainings: boolean;
  members: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
}

export interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string | null;
}

export interface SettingsState {
  branding: ClubBranding;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  profile: AdminProfile;
}

interface SettingsContextType {
  settings: SettingsState;
  updateBranding: (branding: Partial<ClubBranding>) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  updateAppearance: (appearance: Partial<AppearanceSettings>) => void;
  updateProfile: (profile: Partial<AdminProfile>) => void;
  resetToDefaults: () => void;
  applyThemeColors: () => void;
}

// Default settings
const defaultSettings: SettingsState = {
  branding: {
    clubName: 'SportClub',
    clubLogo: null,
    primaryColor: '#1e3a5f', // Navy blue
    accentColor: '#10b981', // Green
    sidebarColor: '#172a46', // Dark navy
  },
  notifications: {
    email: true,
    push: true,
    marketing: false,
    events: true,
    payments: true,
    trainings: true,
    members: true,
  },
  appearance: {
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false,
    animationsEnabled: true,
  },
  profile: {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@sportclub.com',
    phone: '+1 234 567 8900',
    bio: '',
    avatar: null,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper to convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Helper to create CSS HSL string
function toHSLString(hex: string): string {
  const { h, s, l } = hexToHSL(hex);
  return `${h} ${s}% ${l}%`;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('clubSettings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('clubSettings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme (light/dark) on change
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.appearance.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', settings.appearance.theme === 'dark');
    }
  }, [settings.appearance.theme]);

  // Apply custom colors
  const applyThemeColors = () => {
    const root = document.documentElement;
    const { primaryColor, accentColor, sidebarColor } = settings.branding;

    // Apply primary color
    root.style.setProperty('--primary', toHSLString(primaryColor));
    
    // Apply accent color
    root.style.setProperty('--accent', toHSLString(accentColor));
    root.style.setProperty('--success', toHSLString(accentColor));
    root.style.setProperty('--ring', toHSLString(accentColor));
    root.style.setProperty('--sidebar-primary', toHSLString(accentColor));
    root.style.setProperty('--sidebar-ring', toHSLString(accentColor));
    root.style.setProperty('--chart-1', toHSLString(accentColor));

    // Apply sidebar color
    root.style.setProperty('--sidebar-background', toHSLString(sidebarColor));
    
    // Calculate lighter/darker variants for sidebar
    const sidebarHSL = hexToHSL(sidebarColor);
    root.style.setProperty('--sidebar-accent', `${sidebarHSL.h} ${sidebarHSL.s}% ${Math.min(sidebarHSL.l + 8, 100)}%`);
    root.style.setProperty('--sidebar-border', `${sidebarHSL.h} ${sidebarHSL.s}% ${Math.min(sidebarHSL.l + 10, 100)}%`);
  };

  // Apply colors on mount and when branding changes
  useEffect(() => {
    const root = document.documentElement;
    const { primaryColor, accentColor, sidebarColor } = settings.branding;

    // Apply primary color
    root.style.setProperty('--primary', toHSLString(primaryColor));
    
    // Apply accent color
    root.style.setProperty('--accent', toHSLString(accentColor));
    root.style.setProperty('--success', toHSLString(accentColor));
    root.style.setProperty('--ring', toHSLString(accentColor));
    root.style.setProperty('--sidebar-primary', toHSLString(accentColor));
    root.style.setProperty('--sidebar-ring', toHSLString(accentColor));
    root.style.setProperty('--chart-1', toHSLString(accentColor));

    // Apply sidebar color
    root.style.setProperty('--sidebar-background', toHSLString(sidebarColor));
    
    // Calculate lighter/darker variants for sidebar
    const sidebarHSL = hexToHSL(sidebarColor);
    root.style.setProperty('--sidebar-accent', `${sidebarHSL.h} ${sidebarHSL.s}% ${Math.min(sidebarHSL.l + 8, 100)}%`);
    root.style.setProperty('--sidebar-border', `${sidebarHSL.h} ${sidebarHSL.s}% ${Math.min(sidebarHSL.l + 10, 100)}%`);
  }, [settings.branding]);

  // Update favicon when logo changes
  useEffect(() => {
    if (settings.branding.clubLogo) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = settings.branding.clubLogo;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = settings.branding.clubLogo;
        document.head.appendChild(newLink);
      }
    }
  }, [settings.branding.clubLogo]);

  // Update page title when club name changes
  useEffect(() => {
    document.title = `${settings.branding.clubName} - Club Management`;
  }, [settings.branding.clubName]);

  const updateBranding = (branding: Partial<ClubBranding>) => {
    setSettings((prev) => ({
      ...prev,
      branding: { ...prev.branding, ...branding },
    }));
  };

  const updateNotifications = (notifications: Partial<NotificationSettings>) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...notifications },
    }));
  };

  const updateAppearance = (appearance: Partial<AppearanceSettings>) => {
    setSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...appearance },
    }));
  };

  const updateProfile = (profile: Partial<AdminProfile>) => {
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    // Reset CSS variables
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--success');
    root.style.removeProperty('--ring');
    root.style.removeProperty('--sidebar-primary');
    root.style.removeProperty('--sidebar-ring');
    root.style.removeProperty('--sidebar-background');
    root.style.removeProperty('--sidebar-accent');
    root.style.removeProperty('--sidebar-border');
    root.style.removeProperty('--chart-1');
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateBranding,
        updateNotifications,
        updateAppearance,
        updateProfile,
        resetToDefaults,
        applyThemeColors,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
