import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../routes/auth';
import { useTheme } from '../hooks/theme';
import { 
  LayoutDashboard, 
  MonitorOff, 
  Smile, 
  Bell, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Compass,
  Sparkles
} from 'lucide-react';

export default function MainLayout() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Log Screen Time', path: '/log-screen', icon: MonitorOff },
    { name: 'Offline Activity', path: '/log-offline', icon: Compass },
    { name: 'Mood Tracker', path: '/mood', icon: Smile },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-theme-sec text-theme-text flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-theme-card border-b border-theme-border z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-theme-primary rounded-xl text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight text-theme-text">Focus</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-theme-text-sec hover:bg-theme-sec transition cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar navigation */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-theme-card border-r border-theme-border flex flex-col justify-between p-4 z-40 transform transition-transform duration-300 ease-in-out 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex flex-col gap-6">
          {/* Logo / Brand */}
          <div className="hidden md:flex items-center gap-3 px-2 py-1">
            <div className="p-2 bg-theme-primary rounded-xl text-white shadow-md shadow-theme-primary/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-theme-text">Focus</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group premium-btn
                    ${isActive 
                      ? 'bg-theme-primary text-white shadow-lg shadow-theme-primary/25 scale-[1.02]' 
                      : 'text-theme-text-sec hover:bg-theme-sec hover:text-theme-text hover:translate-x-1'}`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-105" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile section in Sidebar footer */}
        <div className="border-t border-theme-border pt-4 mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-theme-primary to-theme-secondary flex items-center justify-center text-white font-bold font-display shadow-inner">
              {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-theme-text truncate">
                {profile?.display_name || 'Focus User'}
              </p>
              <p className="text-xs text-theme-text-sec truncate">
                Offline champion
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-theme-error hover:bg-red-50 dark:hover:bg-red-950/20 transition group cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-theme-error group-hover:translate-x-0.5 transition" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile layout */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/50 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Main content pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-theme-card/80 backdrop-blur-md border-b border-theme-border sticky top-0 z-30 shadow-sm">
          <div>
            <h1 className="text-lg font-bold font-display text-theme-text p-0 m-0">
              Wellness Dashboard
            </h1>
            <p className="text-xs text-theme-text-sec mt-0.5">
              Build Better Digital Habits
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-theme-border text-theme-text-sec hover:bg-theme-sec hover:text-theme-text hover:scale-[1.05] active:scale-[0.95] transition-all duration-200 shadow-sm cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" /> : <Moon className="w-5 h-5 text-theme-primary" />}
            </button>

            {/* Profile widget */}
            <Link 
              to="/settings"
              className="flex items-center gap-2 hover:bg-theme-sec/80 transition-all duration-200 border border-theme-border rounded-xl p-1.5 pr-3 bg-theme-sec hover:scale-[1.02] active:scale-[0.98] premium-btn"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-theme-primary to-theme-secondary text-white font-bold flex items-center justify-center text-xs shadow-inner">
                {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'F'}
              </div>
              <span className="text-xs font-semibold text-theme-text-sec">
                {profile?.display_name || 'My Profile'}
              </span>
            </Link>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto">
          {/* Mobile Theme Switcher bar */}
          <div className="md:hidden flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-theme-border text-sm text-theme-text-sec hover:bg-theme-sec transition cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-theme-primary" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
