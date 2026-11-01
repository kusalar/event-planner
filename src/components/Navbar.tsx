'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEventContext } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { SignOutModal } from '@/components/SignOutModal';
import { Toast } from '@/components/Toast';
import { UserMenu } from '@/components/layout/UserMenu';
import { CurrencyCode } from '@/types';
import {
  Sparkles,
  Calendar,
  Wallet,
  Clock,
  Users,
  MessageSquare,
  Lightbulb,
  Settings,
  PlusCircle,
  ChevronDown,
  Moon,
  Sun,
  Zap,
  Menu,
  X,
  UserCheck,
  LogOut,
  LogIn,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentEvent,
    events,
    switchEvent,
    userProfile,
    theme,
    setTheme,
    setCurrency,
    isLiveAiAvailable,
  } = useEventContext();
  const { user, isAuthenticated, isDemoMode, signOut } = useAuth();

  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleOpenSignOutModal = () => {
    setMobileMenuOpen(false);
    setIsSignOutModalOpen(true);
  };

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      setIsSignOutModalOpen(false);
      setToastType('success');
      setToastMessage('You have successfully signed out.');
      router.replace('/auth?signedOut=true');
    } catch (err) {
      console.error('Sign-out error:', err);
      setToastType('error');
      setToastMessage('An error occurred during sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Calendar },
    { name: 'AI Generator', href: '/create', icon: Sparkles },
    { name: 'Budget', href: '/budget', icon: Wallet },
    { name: 'Timeline', href: '/timeline', icon: Clock },
    { name: 'Vendors', href: '/vendors', icon: Users },
    { name: 'AI Assistant', href: '/chat', icon: MessageSquare },
    { name: 'Ideas Studio', href: '/ideas', icon: Lightbulb },
    { name: 'Guests', href: '/guests', icon: UserCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent">
                  EVENTORA<span className="text-violet-600 dark:text-violet-300 font-bold text-xs ml-1 px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80">AI</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase text-slate-500 dark:text-slate-300 font-semibold -mt-1 hidden sm:inline">
                  Smart Event Planner
                </span>
              </div>
            </Link>

            {/* Event Switcher Dropdown (visible if not on landing/auth) */}
            {currentEvent && pathname !== '/' && pathname !== '/auth' && (
              <div className="relative ml-2 sm:ml-4">
                <button
                  onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
                  aria-label="Select active event plan"
                  aria-expanded={eventDropdownOpen}
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 max-w-[190px] sm:max-w-[240px]"
                >
                  <span className="truncate">{currentEvent.title}</span>
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                </button>

                {eventDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-xl shadow-2xl glass-card py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      Switch Event Plan
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {events.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => {
                            switchEvent(evt.id);
                            setEventDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors ${
                            evt.id === currentEvent.id
                              ? 'bg-violet-50 dark:bg-violet-950/60 font-semibold text-violet-700 dark:text-violet-300'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="truncate">{evt.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {evt.location} • {new Date(evt.date).toLocaleDateString()}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 px-2 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href="/create"
                        onClick={() => setEventDropdownOpen(false)}
                        className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Plan New Event with AI</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Status Badge */}
            <div
              title={isLiveAiAvailable ? 'Live Gemini AI model enabled' : 'Demo Mode (Curated intelligence active. Add key in Settings for Live AI)'}
              className={`hidden sm:flex items-center space-x-1 text-[11px] font-semibold px-2 py-1 rounded-full border ${
                isLiveAiAvailable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>{isLiveAiAvailable ? 'Live Gemini' : 'Demo Mode'}</span>
            </div>

            {/* Currency Selector */}
            <select
              id="navbar-currency-select"
              aria-label="Select regional currency"
              value={userProfile.currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 min-h-[40px] font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Desktop Auth / Profile Area */}
            <div className="hidden sm:block">
              <UserMenu />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl shadow-xl space-y-1 animate-in fade-in">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Auth & Sign Out Section */}
            {isAuthenticated ? (
              <div className="pt-3 pb-1 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="px-3 py-1 flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {(userProfile.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate text-left text-xs">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {userProfile.name || 'Verified User'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Active</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenSignOutModal}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/50 transition-colors shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : isDemoMode ? (
              <div className="pt-3 pb-1 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="px-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Exploring in Demo Sandbox Mode
                </div>
                <button
                  type="button"
                  onClick={handleOpenSignOutModal}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-900/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Demo Sandbox</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 pb-1 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/25 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </Link>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-3 py-2">
              <span className="text-xs text-slate-500">AI Mode:</span>
              <span className={`text-xs font-semibold ${isLiveAiAvailable ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isLiveAiAvailable ? 'Live Gemini 2.5' : 'Demo Mode (Curated)'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        isSigningOut={isSigningOut}
      />

      {/* Confirmation Toast */}
      <Toast
        message={toastMessage || ''}
        isVisible={Boolean(toastMessage)}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </header>
  );
};

