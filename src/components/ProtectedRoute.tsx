import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check authentication on every route change
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuth(authenticated);
      setIsChecking(false);
      
      if (!authenticated) {
        // Clear any cached data when not authenticated
        // This prevents showing stale data when using back button
        window.history.pushState(null, '', window.location.href);
      }
    };

    checkAuth();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        setIsAuth(false);
      }
    };

    // Prevent back navigation to protected pages after logout
    const handlePopState = () => {
      if (!authService.isAuthenticated()) {
        window.location.replace('/');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);

  // Show nothing while checking (prevents flash)
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuth) {
    // Replace history to prevent back navigation
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

