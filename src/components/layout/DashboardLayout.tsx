import { ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close sidebar when user logs out to avoid leaving an open sidebar
  // (useful for mobile overlay and predictable UI after logout)
  useEffect(() => {
    if (!isAuthenticated) setSidebarOpen(false);
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((s) => !s)}
      />
      <AppHeader onMenuClick={() => setSidebarOpen(true)} sidebarCollapsed={sidebarCollapsed} onLogout={() => setSidebarOpen(false)} />

      {/* Increased top padding so page headings have more gap from the fixed header */}
      <main className={sidebarOpen ? (sidebarCollapsed ? 'pt-20 min-h-screen lg:ml-20' : 'pt-20 min-h-screen lg:ml-64') : 'pt-20 min-h-screen lg:ml-0'}>
        <div className="p-4 sm:p-6">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
