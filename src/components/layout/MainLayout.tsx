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

// Custom hook to detect mobile viewport
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

export function MainLayout() {
  const { settings, updateAppearance } = useSettings();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(settings.appearance.sidebarCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Sync sidebar collapsed state with settings
  useEffect(() => {
    setSidebarCollapsed(settings.appearance.sidebarCollapsed);
  }, [settings.appearance.sidebarCollapsed]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileMenuOpen]);

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

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
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
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={handleMobileMenuClose}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        isMobile={isMobile}
        isOpen={mobileMenuOpen}
        onClose={handleMobileMenuClose}
      />

      <div
        className={cn(
          'transition-all',
          settings.appearance.animationsEnabled ? 'duration-300' : 'duration-0',
          // Only apply margin on desktop
          !isMobile && (sidebarCollapsed ? 'ml-16' : 'ml-64')
        )}
      >
        <Navbar
          title={getTitle()}
          onMenuClick={handleMobileMenuToggle}
          isMobile={isMobile}
        />
        <main className={cn(
          "p-4 md:p-6",
          settings.appearance.compactMode && "p-3 md:p-4"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
