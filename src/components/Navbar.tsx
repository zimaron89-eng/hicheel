import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  LayoutDashboard,
  CheckSquare,
  Moon,
  Sun,
  Database,
  User as UserIcon,
  LogIn,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'plans' | 'tasks';
  onSelectView: (view: 'dashboard' | 'plans' | 'tasks') => void;
  onOpenPrismaSchema: () => void;
  onOpenProfile: () => void;
  plansCount: number;
  openTasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenPrismaSchema,
  onOpenProfile,
  plansCount,
  openTasksCount,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('planplatform_darkmode');
      if (saved !== null) return saved === 'true';
      return true; // Default to Elegant Dark
    }
    return true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('planplatform_darkmode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('planplatform_darkmode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-[#0a0a0b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => onSelectView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-950/40">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight text-white">
                  PlanCraft
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  Prototype
                </span>
              </div>
              <span className="text-[10px] text-gray-500 block -mt-0.5">
                Personal Plan Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#161618] border border-gray-800">
            <button
              id="nav-tab-dashboard"
              onClick={() => onSelectView('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-gray-800/70 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Metrics</span>
            </button>

            <button
              id="nav-tab-plans"
              onClick={() => onSelectView('plans')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'plans'
                  ? 'bg-gray-800/70 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Personal Plans</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-gray-800 text-gray-300 font-bold border border-gray-700">
                {plansCount}
              </span>
            </button>

            <button
              id="nav-tab-tasks"
              onClick={() => onSelectView('tasks')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'tasks'
                  ? 'bg-gray-800/70 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Task Management</span>
              {openTasksCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                  {openTasksCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Status indicator pill matching design */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Secure Session</span>
            </div>

            {/* Prisma ORM Model Showcase Button */}
            <button
              id="btn-nav-prisma"
              onClick={onOpenPrismaSchema}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161618] hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-medium border border-gray-800 transition-colors cursor-pointer"
              title="Inspect Prisma Schema & Next.js Backend Layer"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Prisma Schema</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="btn-toggle-darkmode"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-800"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Auth / Profile Button */}
            {isAuthenticated && user ? (
              <button
                id="btn-user-profile"
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-xl bg-[#161618] hover:bg-gray-800 text-xs font-medium text-white transition-colors cursor-pointer border border-gray-800"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-500/40"
                />
                <span className="hidden lg:inline truncate max-w-[110px]">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                id="btn-open-auth"
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-800 space-y-2 animate-in fade-in slide-in-from-top-2 bg-[#161618] px-2 rounded-b-2xl mt-1">
            <button
              onClick={() => {
                onSelectView('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                currentView === 'dashboard'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard & Metrics</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectView('plans');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                currentView === 'plans'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Personal Plans</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-800 font-bold border border-gray-700">
                {plansCount}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectView('tasks');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                currentView === 'tasks'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                <span>Task Management</span>
              </div>
              {openTasksCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                  {openTasksCount}
                </span>
              )}
            </button>

            <div className="pt-2 border-t border-gray-800 flex items-center justify-between gap-2 px-1">
              <button
                onClick={() => {
                  onOpenPrismaSchema();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-gray-800 text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-700"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Prisma Schema
              </button>
              {isAuthenticated && user && (
                <button
                  onClick={() => {
                    onOpenProfile();
                    setMobileMenuOpen(false);
                  }}
                  className="py-1.5 px-3 rounded-lg bg-gray-800 text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-700"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Profile
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
