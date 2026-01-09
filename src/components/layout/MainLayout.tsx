import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/members/new': 'Add Member',
  '/teams': 'Teams',
  '/trainings': 'Trainings',
  '/events': 'Events',
  '/finance': 'Finance',
  '/statistics': 'Statistics',
  '/settings': 'Settings',
};

export function MainLayout() {
  const { settings, updateAppearance } = useSettings();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(settings.appearance.sidebarCollapsed);
  const location = useLocation();

  // Sync sidebar collapsed state with settings
  useEffect(() => {
    setSidebarCollapsed(settings.appearance.sidebarCollapsed);
  }, [settings.appearance.sidebarCollapsed]);

  // Apply compact mode and animations classes to root
  useEffect(() => {
    const root = document.documentElement;
    
    // Compact mode
    if (settings.appearance.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Animations
    if (!settings.appearance.animationsEnabled) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  }, [settings.appearance.compactMode, settings.appearance.animationsEnabled]);

  const handleSidebarToggle = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    // Also update the setting if user manually toggles
    updateAppearance({ sidebarCollapsed: newCollapsed });
  };

  const getTitle = () => {
    // Handle dynamic routes
    if (location.pathname.startsWith('/members/')) return 'Member Details';
    if (location.pathname.startsWith('/teams/')) return 'Team Details';
    if (location.pathname.startsWith('/trainings/')) return 'Training Details';
    if (location.pathname.startsWith('/events/')) return 'Event Details';
    return pageTitles[location.pathname] || 'Dashboard';
  };

  return (
    <div className={cn(
      "min-h-screen bg-background",
      settings.appearance.compactMode && "compact-mode"
    )}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div
        className={cn(
          'transition-all',
          settings.appearance.animationsEnabled ? 'duration-300' : 'duration-0',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Navbar title={getTitle()} />
        <main className={cn(
          "p-6",
          settings.appearance.compactMode && "p-4"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
