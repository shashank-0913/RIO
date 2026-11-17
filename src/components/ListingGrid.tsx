import React from 'react';
import { Listing } from '../types';
import { ListingCard } from './ListingCard';
import { SkeletonCard } from './SkeletonCard';
import { Sparkles, SearchX } from 'lucide-react';

interface ListingGridProps {
  listings: Listing[];
  wishlistIds: string[];
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  onSelectListing: (listing: Listing) => void;
  onResetFilters: () => void;
  isWishlistView?: boolean;
  isLoading?: boolean;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  wishlistIds,
  onToggleWishlist,
  onSelectListing,
  onResetFilters,
  isWishlistView = false,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-dark-cardElevated rounded animate-pulse" />
          <div className="h-4 w-20 bg-dark-cardElevated rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center text-dark-muted">
          <SearchX className="w-8 h-8 text-brand-amber" />
        </div>
        <h3 className="text-lg font-bold text-dark-text mb-1">
          {isWishlistView ? 'No saved listings yet' : 'No matching items found'}
        </h3>
        <p className="text-xs text-dark-muted mb-6 leading-relaxed">
          {isWishlistView
            ? 'Tap the heart icon on any listing to bookmark it and compare later.'
            : 'Try searching with different keywords, expanding your city radius, or resetting category filters.'}
        </p>
        <button
          onClick={onResetFilters}
          className="px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-brand-emerald/20"
        >
          {isWishlistView ? 'Browse All Listings' : 'Reset All Filters'}
        </button>
      </div>
    );
  }

  // Highlight featured listings in bento-grid
  return (
    <div className="space-y-4">
      {/* Feed Sub-header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-emerald" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-dark-muted">
            {isWishlistView ? 'Saved Wishlist' : 'Verified Marketplace Feed'}
          </h2>
        </div>
        <span className="text-xs text-dark-muted">
          Showing <span className="font-semibold text-dark-text">{listings.length}</span> items
        </span>
      </div>

      {/* Responsive Grid: 1 col on xs mobile, 2 col on sm, 3 col on md/lg, 4 col on xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isWishlisted={wishlistIds.includes(listing.id)}
            onToggleWishlist={onToggleWishlist}
            onSelect={onSelectListing}
          />
        ))}
      </div>
    </div>
  );
};
