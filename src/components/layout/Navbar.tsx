import { useState } from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface NavbarProps {
  title: string;
}

// Search items for quick navigation
const searchItems = [
  { name: 'Dashboard', path: '/dashboard', category: 'Pages' },
  { name: 'Members', path: '/members', category: 'Pages' },
  { name: 'Add Member', path: '/members/new', category: 'Actions' },
  { name: 'Teams', path: '/teams', category: 'Pages' },
  { name: 'Create Team', path: '/teams/new', category: 'Actions' },
  { name: 'Trainings', path: '/trainings', category: 'Pages' },
  { name: 'Schedule Training', path: '/trainings/new', category: 'Actions' },
  { name: 'Events', path: '/events', category: 'Pages' },
  { name: 'Create Event', path: '/events/new', category: 'Actions' },
  { name: 'Finance', path: '/finance', category: 'Pages' },
  { name: 'Statistics', path: '/statistics', category: 'Pages' },
  { name: 'Settings', path: '/settings', category: 'Pages' },
];

export function Navbar({ title }: NavbarProps) {
  const { settings } = useSettings();
  const { firstName, lastName, avatar } = settings.profile;
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Get initials for avatar fallback
  const getInitials = () => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || 'AD';
  };

  const handleLogout = () => {
    // Clear any stored auth tokens
    localStorage.removeItem('authToken');
    // Navigate to login page
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search... (Ctrl+K)"
              className="w-64 pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
              onClick={() => setSearchOpen(true)}
              readOnly
            />
          </div>

          {/* Mobile Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <span className="font-medium">New member registration</span>
                <span className="text-xs text-muted-foreground">John Doe just joined the club</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <span className="font-medium">Training reminder</span>
                <span className="text-xs text-muted-foreground">Football practice starts in 1 hour</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <span className="font-medium">Payment received</span>
                <span className="text-xs text-muted-foreground">$150 membership fee from Sarah J.</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="w-8 h-8">
                  {avatar && <AvatarImage src={avatar} alt={firstName} />}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block font-medium">{firstName || 'Admin'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{firstName} {lastName}</p>
                  <p className="text-xs text-muted-foreground">{settings.profile.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="cursor-pointer"
              >
                <Search className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search Command Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search for pages, actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {searchItems.filter(item => item.category === 'Pages').map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => {
                  navigate(item.path);
                  setSearchOpen(false);
                }}
              >
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            {searchItems.filter(item => item.category === 'Actions').map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => {
                  navigate(item.path);
                  setSearchOpen(false);
                }}
              >
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
