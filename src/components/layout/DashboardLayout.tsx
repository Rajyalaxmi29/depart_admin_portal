import { ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useSubmissionWindow } from '@/hooks/useSubmissionWindow';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const submissionWindow = useSubmissionWindow();
  const unlockDateLabel = submissionWindow.unlockAtIso
    ? new Date(submissionWindow.unlockAtIso).toLocaleDateString()
    : 'Not configured';
  const closeDateLabel = submissionWindow.closeAtIso
    ? new Date(submissionWindow.closeAtIso).toLocaleDateString()
    : 'Not configured';
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="min-h-screen flex flex-col bg-secondary/30 relative">
      {submissionWindow.isNearingClose && (
        <div
          className={cn(
            'pointer-events-none fixed inset-0 z-[70] border-4 border-red-500/80 shadow-[inset_0_0_0_4px_rgba(239,68,68,0.35)]',
            submissionWindow.isCriticalClose ? 'animate-pulse' : ''
          )}
          aria-hidden="true"
        />
      )}
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((s) => !s)}
      />
      <AppHeader onMenuClick={() => setSidebarOpen(true)} sidebarCollapsed={sidebarCollapsed} onLogout={() => setSidebarOpen(false)} />

      {/* Increased top padding so page headings have more gap from the fixed header */}
      <main className={sidebarCollapsed ? 'pt-20 min-h-screen lg:ml-20' : 'pt-20 min-h-screen lg:ml-64'}>
        <div className="p-4 sm:p-6">
          {!submissionWindow.isLoading && (
            <div
              className={cn(
                'mb-4 rounded-lg border px-4 py-3 text-sm',
                submissionWindow.isClosed
                  ? 'border-destructive/30 bg-destructive/5 text-destructive'
                  : submissionWindow.isBeforeWindow
                    ? 'border-border bg-card text-foreground'
                    : submissionWindow.isNearingClose
                      ? 'border-destructive/30 bg-destructive/5 text-destructive'
                      : 'border-border bg-card text-foreground'
              )}
            >
              {submissionWindow.isClosed ? (
                <p className="font-medium">Submission window is closed (closed on {closeDateLabel}).</p>
              ) : submissionWindow.isBeforeWindow ? (
                <p className="font-medium">
                  Submission opens in {submissionWindow.unlockCountdown} (unlock date: {unlockDateLabel}).
                </p>
              ) : (
                <p className="font-medium">
                  Submission closes in {submissionWindow.closeCountdown} (close date: {closeDateLabel}).
                </p>
              )}
            </div>
          )}
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
