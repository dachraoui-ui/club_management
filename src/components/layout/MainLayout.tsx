import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    // Handle dynamic routes
    if (location.pathname.startsWith('/members/')) return 'Member Details';
    if (location.pathname.startsWith('/teams/')) return 'Team Details';
    if (location.pathname.startsWith('/trainings/')) return 'Training Details';
    if (location.pathname.startsWith('/events/')) return 'Event Details';
    return pageTitles[location.pathname] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Navbar title={getTitle()} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
