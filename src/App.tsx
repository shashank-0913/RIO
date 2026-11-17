import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchAndFilter } from './components/SearchAndFilter';
import { ListingGrid } from './components/ListingGrid';
import { CityModal } from './components/CityModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ChatSystemModal } from './components/ChatSystemModal';
import { ReportModal } from './components/ReportModal';
import { SellModal } from './components/SellModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { ComplianceModal } from './components/ComplianceModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { QuotaPaywallModal } from './components/QuotaPaywallModal';
import { BoostModal } from './components/BoostModal';
import { ProDealerModal } from './components/ProDealerModal';
import { MobileBottomNav, TabType } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

import { MOCK_LISTINGS } from './data/mockListings';
import {
  Listing,
  CategoryType,
  CityType,
  RadiusType,
  SortType,
  NotificationItem,
  UserProfile,
  QuotaStatus,
  ListingStatus,
} from './types';
import { Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { DEMO_USER, fetchLiveListings, signOutUser } from './lib/api';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Price Drop Alert in Visakhapatnam',
    description: 'Apple iPhone 15 Pro 128GB dropped by ₹5,000 in MVP Colony.',
    timestamp: '10m ago',
    isRead: false,
    type: 'price_drop',
  },
  {
    id: 'notif-2',
    title: 'Offer Accepted on Royal Enfield',
    description: 'Seller Sai Krishna responded to your query for Hunter 350.',
    timestamp: '1h ago',
    isRead: false,
    type: 'offer',
  },
  {
    id: 'notif-3',
    title: 'Aadhaar KYC Verified',
    description: 'Your RIO profile is now verified with Trust Shield 🛡️',
    timestamp: 'Yesterday',
    isRead: true,
    type: 'system',
  },
];

export const App: React.FC = () => {
  // Theme state: Warm-Charcoal Dark Mode is default
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Authenticated user state (initialized with demo user for seamless instant testing)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEMO_USER);

  // Listings & Wishlist
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['rio-101', 'rio-104']);

  // Filters & Location
  const [selectedCity, setSelectedCity] = useState<CityType>('Visakhapatnam');
  const [selectedLocality, setSelectedLocality] = useState<string>('All Localities');
  const [selectedRadius, setSelectedRadius] = useState<RadiusType>('10 km');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<SortType>('newest');

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [detailListing, setDetailListing] = useState<Listing | null>(null);
  const [chatListing, setChatListing] = useState<Listing | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [reportListing, setReportListing] = useState<Listing | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [paywallQuota, setPaywallQuota] = useState<QuotaStatus | null>(null);
  const [boostListing, setBoostListing] = useState<Listing | null>(null);
  const [isProDealerModalOpen, setIsProDealerModalOpen] = useState<boolean>(false);

  const [complianceDocKey, setComplianceDocKey] = useState<
    'terms' | 'dpdp' | 'prohibited' | 'grievance' | null
  >(null);

  // Sync theme class to html root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load listings on mount with realistic loading skeleton
  useEffect(() => {
    async function loadData() {
      setIsLoadingListings(true);
      try {
        const liveData = await fetchLiveListings();
        setListings(liveData);
      } catch (err) {
        console.warn('Error loading live listings:', err);
      } finally {
        setTimeout(() => {
          setIsLoadingListings(false);
        }, 400);
      }
    }
    loadData();
  }, []);

  // Filter listings owned by the logged-in user
  const userListings = useMemo(() => {
    if (!currentUser) return [];
    return listings.filter(
      (l) => l.seller_id === currentUser.id || l.seller.id === currentUser.id
    );
  }, [listings, currentUser]);

  // Wishlist toggle handler
  const handleToggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add listing handler
  const handleAddListing = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
    // Notify user
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Listing Published Successfully',
        description: `Your ad "${newListing.title}" is now active in ${newListing.locality}, ${newListing.city}.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'system',
      },
      ...prev,
    ]);
  };

  // Update listing price
  const handleUpdatePrice = (listingId: string, newPrice: number) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, price: newPrice } : l))
    );
  };

  // Update listing status (Mark as sold / reactivate)
  const handleUpdateStatus = (listingId: string, newStatus: ListingStatus) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
    );
  };

  // Delete listing
  const handleDeleteListing = (listingId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId));
  };

  // Handle Paywall slot unlock
  const handleUnlockSlot = () => {
    setPaywallQuota(null);
    setIsSellModalOpen(true);
  };

  // Handle Boost Listing success
  const handleBoostSuccess = (listingId: string, plan: '24h' | '7d') => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, isFeatured: true, is_boosted: true } : l
      )
    );
    setNotifications((prev) => [
      {
        id: `notif-boost-${Date.now()}`,
        title: 'Listing Boost Active 🚀',
        description: `Your listing is now pinned as Featured at the top of the feed for ${
          plan === '24h' ? '24 hours' : '7 days'
        }.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'system',
      },
      ...prev,
    ]);
  };

  // Handle Pro Dealer upgrade
  const handleUpgradeProDealer = () => {
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, is_pro_dealer: true } : null));
    }
    setPaywallQuota(null);
    setNotifications((prev) => [
      {
        id: `notif-pro-${Date.now()}`,
        title: 'RIO Pro Dealer Activated 👑',
        description:
          'Welcome to RIO Pro! Unlimited second-hand listings across all Indian cities and Verified Store Shield active.',
        timestamp: 'Just now',
        isRead: false,
        type: 'system',
      },
      ...prev,
    ]);
  };

  // Sign out
  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Mobile nav tab click handler
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'sell') {
      if (!currentUser) {
        setIsAuthModalOpen(true);
      } else {
        setIsSellModalOpen(true);
      }
    } else if (tab === 'profile') {
      setIsProfileOpen(true);
    } else if (tab === 'chats') {
      if (!currentUser) {
        setIsAuthModalOpen(true);
      } else {
        setIsChatOpen(true);
        setChatListing(null);
      }
    }
  };

  // Filter & Sort computation
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // If on Saved tab, only show wishlisted items
    if (activeTab === 'saved') {
      result = result.filter((item) => wishlistIds.includes(item.id));
    } else {
      // Show active listings on home feed
      result = result.filter((item) => item.status === 'active');
    }

    // Filter by City (unless 'All India' radius selected)
    if (selectedRadius !== 'All India') {
      result = result.filter((item) => item.city === selectedCity);

      // Filter by Locality
      if (selectedLocality !== 'All Localities') {
        result = result.filter((item) => item.locality.includes(selectedLocality));
      }

      // Filter by Radius limit (if 5 km, filter by distanceKm)
      if (selectedRadius === '5 km') {
        result = result.filter((item) => item.distanceKm <= 5.0);
      } else if (selectedRadius === '10 km') {
        result = result.filter((item) => item.distanceKm <= 10.0);
      }
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        const categoryMatch = item.category.toLowerCase().includes(q);
        const localityMatch = item.locality.toLowerCase().includes(q);
        const specsMatch = Object.entries(item.specs).some(
          ([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
        );
        return titleMatch || descMatch || categoryMatch || localityMatch || specsMatch;
      });
    }

    // Sort: Featured / Boosted ads are prioritized at the top of the feed
    result.sort((a, b) => {
      const aBoost = a.isFeatured || a.is_boosted ? 1 : 0;
      const bBoost = b.isFeatured || b.is_boosted ? 1 : 0;

      if (aBoost !== bBoost) {
        return bBoost - aBoost;
      }

      switch (selectedSort) {
        case 'nearest':
          return a.distanceKm - b.distanceKm;
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'newest':
        default:
          return b.viewsCount - a.viewsCount;
      }
    });

    return result;
  }, [
    listings,
    wishlistIds,
    activeTab,
    selectedCity,
    selectedLocality,
    selectedRadius,
    selectedCategory,
    searchQuery,
    selectedSort,
  ]);

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedLocality('All Localities');
    setSelectedRadius('City-wide');
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col transition-colors selection:bg-brand-emerald selection:text-white">
      {/* 1. Top Header */}
      <Header
        selectedCity={selectedCity}
        selectedLocality={selectedLocality}
        selectedRadius={selectedRadius}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
        onOpenSellModal={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setIsSellModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileOpen(true)}
      />

      {/* 2. Search & Category Bar */}
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
        totalResults={filteredListings.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Bento Hero / Locality Highlight Card */}
        {activeTab !== 'saved' && !searchQuery && selectedCategory === 'All' && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-card to-dark-cardElevated border border-dark-border p-5 sm:p-7 shadow-xl">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-brand-amber/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>All-India Trusted Marketplace</span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Buy & Sell in <span className="text-brand-emerald">{selectedCity}</span> with Trust & Speed
                </h1>

                <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
                  Direct peer-to-peer deals with verified sellers. Filtered within{' '}
                  <strong className="text-brand-amber">{selectedRadius}</strong> of {selectedLocality}.
                </p>

                {/* Trust Highlights */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-dark-muted">
                  <span className="flex items-center gap-1.5 font-medium text-dark-text">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                    Aadhaar / Phone KYC
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-dark-text">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                    Free Ad Quota & Pro Dealer Plans
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-dark-text">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                    DPDP 2023 Compliant
                  </span>
                </div>
              </div>

              {/* Quick Action Bento Buttons */}
              <div className="w-full md:w-auto flex flex-row md:flex-col gap-2.5 shrink-0">
                <button
                  onClick={() => setIsCityModalOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-dark-bg/80 border border-dark-border hover:border-brand-emerald/60 transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-brand-emerald/10 text-brand-emerald">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-dark-muted block uppercase font-bold">Active Hub</span>
                      <strong className="text-xs text-dark-text">{selectedCity}</strong>
                    </div>
                  </div>
                  <span className="text-xs text-brand-emerald font-semibold">Change</span>
                </button>

                <button
                  onClick={() => {
                    if (!currentUser) setIsAuthModalOpen(true);
                    else setIsSellModalOpen(true);
                  }}
                  className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-emerald to-brand-emeraldDark hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-emerald/20 transition-all text-center"
                >
                  + Post Free Ad
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Listing Feed Grid */}
        <ListingGrid
          listings={filteredListings}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onSelectListing={(listing) => setDetailListing(listing)}
          onResetFilters={resetAllFilters}
          isWishlistView={activeTab === 'saved'}
          isLoading={isLoadingListings}
        />
      </main>

      {/* 4. Item Detail Modal */}
      <ItemDetailModal
        isOpen={Boolean(detailListing)}
        onClose={() => setDetailListing(null)}
        listing={detailListing}
        isWishlisted={detailListing ? wishlistIds.includes(detailListing.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onOpenChat={(listing) => {
          setDetailListing(null);
          setChatListing(listing);
          setIsChatOpen(true);
        }}
        onOpenReport={(listing) => {
          setDetailListing(null);
          setReportListing(listing);
        }}
      />

      {/* 5. Real-Time In-App Chat System (Split-Pane Desktop & Full-Screen Mobile) */}
      {(isChatOpen || chatListing) && currentUser && (
        <ChatSystemModal
          isOpen={isChatOpen || Boolean(chatListing)}
          onClose={() => {
            setIsChatOpen(false);
            setChatListing(null);
            if (activeTab === 'chats') setActiveTab('home');
          }}
          currentUser={currentUser}
          initialListing={chatListing}
          onUpdateListingStatus={handleUpdateStatus}
        />
      )}

      {/* 6. Report / Grievance Modal */}
      {reportListing && (
        <ReportModal
          isOpen={Boolean(reportListing)}
          onClose={() => setReportListing(null)}
          listing={reportListing}
        />
      )}

      {/* 7. City & Radius Modal */}
      <CityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={(city) => setSelectedCity(city)}
        selectedLocality={selectedLocality}
        onSelectLocality={(loc) => setSelectedLocality(loc)}
        selectedRadius={selectedRadius}
        onSelectRadius={(rad) => setSelectedRadius(rad)}
      />

      {/* 8. Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      />

      {/* 9. Sell Modal (with client-side image compression & category specific fields) */}
      {currentUser && (
        <SellModal
          isOpen={isSellModalOpen}
          onClose={() => setIsSellModalOpen(false)}
          onAddListing={handleAddListing}
          defaultCity={selectedCity}
          currentUser={currentUser}
          userListings={userListings}
          onTriggerPaywall={(status) => {
            setIsSellModalOpen(false);
            setPaywallQuota(status);
          }}
        />
      )}

      {/* 10. Quota Paywall Modal (Unlock Slot or Go Pro) */}
      {paywallQuota && (
        <QuotaPaywallModal
          isOpen={Boolean(paywallQuota)}
          onClose={() => setPaywallQuota(null)}
          quotaStatus={paywallQuota}
          onUnlockSlot={handleUnlockSlot}
          onUpgradeProDealer={handleUpgradeProDealer}
        />
      )}

      {/* 11. Profile & "My Ads" Dashboard Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        selectedCity={selectedCity}
        savedCount={wishlistIds.length}
        userListings={userListings}
        onUpdatePrice={handleUpdatePrice}
        onUpdateStatus={handleUpdateStatus}
        onDeleteListing={handleDeleteListing}
        onOpenSellModal={() => {
          setIsProfileOpen(false);
          if (!currentUser) setIsAuthModalOpen(true);
          else setIsSellModalOpen(true);
        }}
        onOpenBoostModal={(listing) => {
          setIsProfileOpen(false);
          setBoostListing(listing);
        }}
        onOpenProDealerModal={() => {
          setIsProfileOpen(false);
          setIsProDealerModalOpen(true);
        }}
        onOpenAuthModal={() => {
          setIsProfileOpen(false);
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
        onOpenCompliance={(key) => setComplianceDocKey(key)}
      />

      {/* 12. Boost Listing Modal (Razorpay Ready 24h & 7d tiers) */}
      {boostListing && currentUser && (
        <BoostModal
          isOpen={Boolean(boostListing)}
          onClose={() => setBoostListing(null)}
          listing={boostListing}
          currentUser={currentUser}
          onBoostSuccess={handleBoostSuccess}
        />
      )}

      {/* 13. RIO Pro Dealer Upgrade Modal */}
      {isProDealerModalOpen && currentUser && (
        <ProDealerModal
          isOpen={isProDealerModalOpen}
          onClose={() => setIsProDealerModalOpen(false)}
          currentUser={currentUser}
          onUpgradeSuccess={handleUpgradeProDealer}
        />
      )}

      {/* 12. Authentication Modal (Google OAuth & Email/Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />

      {/* 13. Statutory Indian Compliance Modal */}
      {complianceDocKey && (
        <ComplianceModal
          isOpen={Boolean(complianceDocKey)}
          onClose={() => setComplianceDocKey(null)}
          activeDocKey={complianceDocKey}
          onSelectDocKey={(key) => setComplianceDocKey(key)}
        />
      )}

      {/* 14. Indian Statutory Footer */}
      <Footer
        onOpenCompliance={(key) => setComplianceDocKey(key)}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 15. Mobile Bottom Navigation */}
      <MobileBottomNav
        currentTab={activeTab}
        onChangeTab={handleTabChange}
        savedCount={wishlistIds.length}
      />
    </div>
  );
};

export default App;
