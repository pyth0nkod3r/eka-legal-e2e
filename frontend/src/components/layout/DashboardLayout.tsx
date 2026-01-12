import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Scale, LayoutDashboard, FolderOpen, Calendar, MessageSquare, FileText, Bell, Settings, LogOut, Menu, X, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { API_BASE_URL } from '@/services/config';
import { Notification } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const getAvatarUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderOpen, label: 'My Cases', href: '/dashboard/cases' },
  { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const loadNotifications = useCallback(async () => {
    const res = await api.notifications.getNotifications();
    if (res.success) setNotifications(res.data);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Listen for notification updates
  useEffect(() => {
    const handleNotificationsUpdate = () => {
      loadNotifications();
    };
    window.addEventListener('notifications-updated', handleNotificationsUpdate);
    return () => window.removeEventListener('notifications-updated', handleNotificationsUpdate);
  }, [loadNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await api.notifications.markAsRead(notif.id);
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
      );
    }
    if (notif.link) {
      setShowNotifications(false);
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await api.notifications.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-sidebar-primary" />
              <span className="font-serif text-xl font-semibold text-sidebar-foreground">Eka Legal</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              return (
                <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:block">
            <h1 className="font-serif text-xl font-semibold text-foreground">
              {navItems.find(item => location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href)))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">{unreadCount}</span>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-lg shadow-lg border animate-scale-in origin-top-right">
                  <div className="p-3 border-b font-medium flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
                    ) : (
                      notifications.slice(0, 5).map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={cn("p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer", !notif.read && "bg-accent/5")}
                        >
                          <div className="flex items-start gap-2">
                            {!notif.read && (
                              <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{notif.title}</div>
                              <div className="text-xs text-muted-foreground">{notif.message}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <img
                src={getAvatarUrl(user?.avatarUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden md:block text-sm">
                <div className="font-medium">{user?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground capitalize">{user?.role || 'Client'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
