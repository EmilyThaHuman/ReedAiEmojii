import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./layouts/layout";
import LandingPage from "./pages/landing";
import LoginPage from "./pages/login";
import OnboardingPage from "./pages/onboarding";
import EmojiGenerator from "./pages/emoji-generator";
import SettingsPage from "./pages/settings";
import GalleryPage from "./pages/gallery";
import useAuthStore from "./lib/store/auth-store";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./lib/supabase";
import { ThemeProvider } from "./components/theme-provider";

function RequireOnboarding({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useAuthStore(
    (state) => state.hasCompletedOnboarding
  );

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function RedirectIfAuthenticated({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useAuthStore(
    (state) => state.hasCompletedOnboarding
  );

  if (isAuthenticated) {
    return (
      <Navigate
        to={hasCompletedOnboarding ? "/generate" : "/onboarding"}
        replace
      />
    );
  }

  return children;
}

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [setUser]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Landing page route */}
          <Route index element={<LandingPage />} />

          {/* All other routes with shared layout */}
          <Route element={<Layout />}>
            <Route
              path="/auth"
              element={
                <RedirectIfAuthenticated>
                  <LoginPage />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/onboarding"
              element={
                <RequireAuth>
                  <OnboardingPage />
                </RequireAuth>
              }
            />
            <Route
              path="/generate"
              element={
                <RequireOnboarding>
                  <EmojiGenerator />
                </RequireOnboarding>
              }
            />
            <Route
              path="/gallery"
              element={
                <RequireOnboarding>
                  <GalleryPage />
                </RequireOnboarding>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireOnboarding>
                  <SettingsPage />
                </RequireOnboarding>
              }
            />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
