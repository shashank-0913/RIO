import React from 'react';
import { Home, Heart, Plus, MessageCircle, User } from 'lucide-react';

export type TabType = 'home' | 'saved' | 'sell' | 'chats' | 'profile';

interface MobileBottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  savedCount: number;
  unreadChatsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onChangeTab,
  savedCount,
  unreadChatsCount = 1,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-bg/95 dark:bg-dark-bg/95 backdrop-blur-lg border-t border-dark-border dark:border-dark-border md:hidden safe-area-bottom transition-colors">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center gap-1 w-full py-1 transition-all ${
            currentTab === 'home'
              ? 'text-brand-emerald font-bold'
              : 'text-dark-muted hover:text-dark-text'
          }`}
          aria-label="Home tab"
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Saved (Wishlist) */}
        <button
          onClick={() => onChangeTab('saved')}
          className={`relative flex flex-col items-center justify-center gap-1 w-full py-1 transition-all ${
            currentTab === 'saved'
              ? 'text-brand-emerald font-bold'
              : 'text-dark-muted hover:text-dark-text'
          }`}
          aria-label="Saved tab"
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${currentTab === 'saved' ? 'fill-brand-emerald stroke-[2.5]' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Saved</span>
        </button>

        {/* + Sell (Centered Prominent Action) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => onChangeTab('sell')}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-brand-emerald to-emerald-400 text-white shadow-xl shadow-brand-emerald/40 flex flex-col items-center justify-center border-4 border-dark-bg active:scale-95 transition-transform"
            aria-label="Sell an item"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Chats */}
        <button
          onClick={() => onChangeTab('chats')}
          className={`relative flex flex-col items-center justify-center gap-1 w-full py-1 transition-all ${
            currentTab === 'chats'
              ? 'text-brand-emerald font-bold'
              : 'text-dark-muted hover:text-dark-text'
          }`}
          aria-label="Chats tab"
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 ${currentTab === 'chats' ? 'stroke-[2.5]' : ''}`} />
            {unreadChatsCount > 0 && (
              <span className="absolute -top-1 -right-2 w-2 h-2 bg-brand-amber rounded-full ring-2 ring-dark-bg animate-pulse"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Chats</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center gap-1 w-full py-1 transition-all ${
            currentTab === 'profile'
              ? 'text-brand-emerald font-bold'
              : 'text-dark-muted hover:text-dark-text'
          }`}
          aria-label="Profile tab"
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};

