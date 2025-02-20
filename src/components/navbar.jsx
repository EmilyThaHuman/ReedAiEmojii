import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GalleryVerticalEnd, Settings, LogOut, ImageIcon, Sparkles } from 'lucide-react';
import useAuthStore from '@/lib/store/auth-store';
import { signOut } from '@/lib/supabase';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const subscription = useAuthStore((state) => state.subscription);
  const getAvailableCredits = useAuthStore((state) => state.getAvailableCredits);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await signOut();
    logout();
    navigate('/');
  };

  // Don't show navbar on landing page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline-block">AI Emoji Generator</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/generate"
              className={`transition-colors hover:text-foreground/80 ${
                location.pathname === '/generate' ? 'text-foreground' : 'text-foreground/60'
              }`}
            >
              Generate
            </Link>
            <Link
              to="/gallery"
              className={`transition-colors hover:text-foreground/80 ${
                location.pathname === '/gallery' ? 'text-foreground' : 'text-foreground/60'
              }`}
            >
              <span className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Gallery
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center justify-end gap-4">
          {isAuthenticated && subscription && (
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                {getAvailableCredits()} generations left
                {subscription.plan !== 'Free' && (
                  <span className="text-muted-foreground ml-1">
                    ({subscription.plan} Plan)
                  </span>
                )}
              </span>
            </div>
          )}
          <ThemeToggle />
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
} 