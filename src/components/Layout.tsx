
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Star } from "lucide-react";
import { getProfile, getRemainingStars } from "@/lib/localStorage";

interface LayoutProps {
  children: ReactNode;
  currentPage?: "home";
}

const Layout = ({ children, currentPage }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = getProfile();
  const remainingStars = getRemainingStars();

  // Don't show navigation on quiz pages
  const isQuizPage = location.pathname.includes('/quiz') || location.pathname.includes('/results');

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      {!isQuizPage && (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-inter font-bold gradient-text">
                Acres
              </h1>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4">
              {/* Stars */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-xl border border-primary/20">
                <Star className="w-5 h-5 text-primary fill-primary animate-pulse-glow" />
                <div className="flex flex-col">
                  <span className="text-primary font-bold text-sm">{profile.stars.toLocaleString()}</span>
                  <span className="text-primary/60 text-xs">{remainingStars} left today</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
