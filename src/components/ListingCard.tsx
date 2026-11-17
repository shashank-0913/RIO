import React from 'react';
import { Heart, ShieldCheck, MapPin, Clock, Sparkles } from 'lucide-react';
import { Listing } from '../types';
import { formatIndianCurrency, calculateDiscount } from '../lib/formatters';

interface ListingCardProps {
  listing: Listing;
  isWishlisted: boolean;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  onSelect: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isWishlisted,
  onToggleWishlist,
  onSelect,
}) => {
  const discount = calculateDiscount(listing.price, listing.originalPrice);

  const getConditionColor = (condition: Listing['condition']) => {
    switch (condition) {
      case 'Brand New':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Like New':
        return 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30';
      case 'Gently Used':
        return 'bg-brand-amber/10 text-brand-amber border-brand-amber/30';
      case 'Minor Wear':
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const isBoosted = listing.isFeatured || listing.is_boosted;

  return (
    <div
      onClick={() => onSelect(listing)}
      className={`group relative bg-dark-card border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-brand-emerald/5 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isBoosted
          ? 'border-brand-amber/60 ring-1 ring-brand-amber/30 hover:border-brand-amber'
          : 'border-dark-border hover:border-brand-emerald/50'
      }`}
    >
      {/* Top Media & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-dark-cardElevated">
        <img
          src={listing.images[0]}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {/* Condition Tag */}
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${getConditionColor(
                listing.condition
              )}`}
            >
              {listing.condition}
            </span>

            {/* Featured / Boosted Badge */}
            {isBoosted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-sm">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={(e) => onToggleWishlist(listing.id, e)}
            className={`p-2 rounded-full backdrop-blur-md transition-all pointer-events-auto active:scale-90 ${
              isWishlisted
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60 border border-white/20'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isWishlisted ? 'Saved' : 'Save item'}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isWishlisted ? 'fill-rose-500 scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* Bottom Badges on Image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Verified Seller Pill */}
          {listing.seller.isVerified && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 backdrop-blur-md text-brand-emerald border border-brand-emerald/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Seller</span>
            </div>
          )}

          {/* Negotiable Tag */}
          {listing.isNegotiable && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/40">
              Negotiable
            </span>
          )}
        </div>
      </div>

      {/* Body Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Price & Discount */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-extrabold text-white tracking-tight">
              {formatIndianCurrency(listing.price)}
            </span>
            {listing.originalPrice && (
              <span className="text-xs text-dark-muted line-through">
                {formatIndianCurrency(listing.originalPrice)}
              </span>
            )}
            {discount && (
              <span className="text-[10px] font-bold text-brand-emerald">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xs font-semibold text-dark-text group-hover:text-brand-emerald transition-colors line-clamp-2 leading-snug">
            {listing.title}
          </h3>
        </div>

        {/* Footer Meta: Locality, Distance, Time */}
        <div className="pt-2 border-t border-dark-border/60 flex items-center justify-between text-[11px] text-dark-muted">
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="w-3 h-3 text-brand-emerald shrink-0" />
            <span className="truncate">{listing.locality}, {listing.city}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-dark-muted" />
            <span>{listing.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
