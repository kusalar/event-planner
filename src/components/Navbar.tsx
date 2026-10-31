'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEventContext } from '@/context/EventContext';
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
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
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

  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              value={userProfile.currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Profile Avatar / Quick Link */}
            <Link
              href="/auth"
              className="flex items-center space-x-1.5 pl-1"
              title={`Signed in as ${userProfile.name}`}
            >
              <div className="w-8 h-8 rounded-full ring-2 ring-violet-500/30 overflow-hidden bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
                {userProfile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{userProfile.name.charAt(0)}</span>
                )}
              </div>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
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
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-3 py-2">
              <span className="text-xs text-slate-500">AI Mode:</span>
              <span className={`text-xs font-semibold ${isLiveAiAvailable ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isLiveAiAvailable ? 'Live Gemini 2.5' : 'Demo Mode (Curated)'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

