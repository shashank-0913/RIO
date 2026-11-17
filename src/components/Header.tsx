import React from 'react';
import { MapPin, Sun, Moon, Bell, ChevronDown, PlusCircle, LogIn } from 'lucide-react';
import { CityType, RadiusType, UserProfile } from '../types';

interface HeaderProps {
  selectedCity: CityType;
  selectedLocality: string;
  selectedRadius: RadiusType;
  onOpenCityModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenSellModal: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  selectedLocality,
  selectedRadius,
  onOpenCityModal,
  isDarkMode,
  onToggleTheme,
  onOpenNotifications,
  unreadNotificationsCount,
  onOpenSellModal,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-dark-bg/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-dark-border dark:border-dark-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Logo & Location */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          {/* Logo "RIO by Vink" */}
          <div className="flex items-center gap-2 shrink-0 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-white dark:text-white font-['Space_Grotesk',sans-serif]">
                RIO
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald ml-0.5 group-hover:scale-150 transition-transform"></span>
            </div>
            
            {/* "by Vink" badge */}
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30">
              by Vink
            </span>
          </div>

          {/* City / Locality Selector */}
          <button
            onClick={onOpenCityModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-dark-border bg-dark-card/60 hover:bg-dark-cardElevated hover:border-brand-emerald/50 transition-all text-left text-xs max-w-[200px] sm:max-w-[280px]"
            title="Change City and Search Radius"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-dark-text truncate leading-tight">
                {selectedCity}
              </div>
              <div className="text-[10px] text-dark-muted truncate">
                {selectedLocality !== 'All Localities' ? `${selectedLocality} • ` : ''}
                <span className="text-brand-amber font-medium">{selectedRadius}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-dark-muted shrink-0 ml-0.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle (Dark Mode / Paper-White) */}
          <button
            onClick={onToggleTheme}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-dark-border bg-dark-card/60 hover:bg-dark-cardElevated text-dark-muted hover:text-dark-text transition-all flex items-center gap-1.5"
            title={isDarkMode ? 'Switch to Paper-White Light Mode' : 'Switch to Warm-Charcoal Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-brand-amber" />
                <span className="text-xs font-medium hidden sm:inline text-dark-text">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-brand-emerald" />
                <span className="text-xs font-medium hidden sm:inline text-dark-text">Dark</span>
              </>
            )}
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl border border-dark-border bg-dark-card/60 hover:bg-dark-cardElevated text-dark-muted hover:text-dark-text transition-all"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-emerald text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile or Sign In */}
          {currentUser ? (
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl border border-dark-border bg-dark-card/60 hover:border-brand-emerald/50 transition-all text-xs"
              title="Open your profile & dashboard"
            >
              <img
                src={
                  currentUser.avatar_url ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                }
                alt={currentUser.full_name}
                className="w-6 h-6 rounded-full object-cover border border-brand-emerald"
              />
              <span className="font-semibold text-dark-text hidden sm:inline max-w-[100px] truncate">
                {currentUser.full_name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald hover:bg-brand-emerald hover:text-white transition-all text-xs font-bold"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Sell Button (Desktop CTA) */}
          <button
            onClick={onOpenSellModal}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-emeraldDark text-white font-bold text-xs tracking-wide uppercase shadow-lg shadow-brand-emerald/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Sell Item</span>
          </button>
        </div>
      </div>
    </header>
  );
};
