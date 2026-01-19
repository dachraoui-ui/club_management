import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Calendar,
  CalendarDays,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { authService } from '@/services/authService';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Members', path: '/members' },
  { icon: Trophy, label: 'Teams', path: '/teams' },
  { icon: Dumbbell, label: 'Trainings', path: '/trainings' },
  { icon: CalendarDays, label: 'Events', path: '/events' },
  { icon: DollarSign, label: 'Finance', path: '/finance' },
  { icon: BarChart3, label: 'Statistics', path: '/statistics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { settings } = useSettings();
  const { clubName, clubLogo } = settings.branding;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center overflow-hidden">
              {clubLogo ? (
                <img src={clubLogo} alt={clubName} className="w-full h-full object-cover" />
              ) : (
                <Trophy className="w-5 h-5 text-sidebar-primary-foreground" />
              )}
            </div>
            <span className="font-bold text-lg text-sidebar-foreground truncate max-w-[160px]">{clubName}</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center mx-auto overflow-hidden">
            {clubLogo ? (
              <img src={clubLogo} alt={clubName} className="w-full h-full object-cover" />
            ) : (
              <Trophy className="w-5 h-5 text-sidebar-primary-foreground" />
            )}
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground/80'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={async () => {
            try {
              await authService.logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authToken');
            sessionStorage.clear();
            window.history.pushState(null, '', '/');
            window.history.pushState(null, '', '/');
            window.history.go(-1);
            window.location.replace('/');
          }}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full',
            'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <LogOut className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
