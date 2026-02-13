import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  MessageSquare,
  User,
  LogOut,
  GraduationCap,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Problem Statements', path: '/problem-statements' },
  { icon: ClipboardCheck, label: 'Reviews & Approvals', path: '/reviews' },
  { icon: MessageSquare, label: 'Messages / Alerts', path: '/messages' },
  { icon: GraduationCap, label: 'Resources', path: '/resources' },
  { icon: User, label: 'Profile', path: '/profile' },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function AppSidebar({ isOpen, onClose, collapsed = false, onToggleCollapsed }: AppSidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white border-r border-border transition-transform duration-300 lg:z-40 lg:translate-x-0',
          collapsed ? 'w-20' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-border">
          <div className="flex items-center">
            <button
              onClick={() => onToggleCollapsed?.()}
              className="flex items-center gap-3 px-2 py-1 rounded-md"
              aria-label="Toggle collapse"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary overflow-hidden">
                <img
                  src="/incamp-logo.png"
                  alt="inCamp logo"
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <h1 className="text-lg font-bold text-primary">inCamp</h1>
                  <p className="text-xs text-muted-foreground">Admin Portal</p>
                </div>
              )}
            </button>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary lg:hidden"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-[calc(100vh-80px)] py-4">
            <div className="flex-1 px-1 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors',
                      collapsed ? 'justify-center' : '',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>

          {/* Logout */}
          <div className="px-3 mt-auto">
            <button
              onClick={logout}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-3 rounded-md text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : '',
                'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
