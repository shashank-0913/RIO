import React, { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  ShieldCheck,
  MapPin,
  Clock,
  MessageCircle,
  AlertTriangle,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Listing } from '../types';
import { formatIndianCurrency, calculateDiscount } from '../lib/formatters';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  isWishlisted: boolean;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  onOpenChat: (listing: Listing) => void;
  onOpenReport: (listing: Listing) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  listing,
  isWishlisted,
  onToggleWishlist,
  onOpenChat,
  onOpenReport,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !listing) return null;

  const discount = calculateDiscount(listing.price, listing.originalPrice);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl min-h-screen sm:min-h-0 sm:max-h-[90vh] bg-dark-card border border-dark-border sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Sticky Top Bar on Modal */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-3.5 sm:p-4 bg-dark-card/95 backdrop-blur-md border-b border-dark-border">
          <div className="flex items-center gap-2 truncate pr-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30">
              {listing.category}
            </span>
            <h3 className="text-sm font-bold text-dark-text truncate hidden sm:inline">
              {listing.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-dark-border bg-dark-cardElevated hover:text-brand-emerald text-dark-muted transition-colors relative"
              title="Share listing"
              aria-label="Share listing"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 text-[10px] bg-brand-emerald text-white px-2 py-0.5 rounded shadow">
                  Copied!
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={(e) => onToggleWishlist(listing.id, e)}
              className={`p-2 rounded-xl border transition-all ${
                isWishlisted
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-500'
                  : 'border-dark-border bg-dark-cardElevated text-dark-muted hover:text-rose-500'
              }`}
              title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              aria-label={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-dark-border bg-dark-cardElevated text-dark-muted hover:text-dark-text transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 p-4 sm:p-6">
            {/* Left Column: Image Gallery (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-dark-border">
                <img
                  src={listing.images[activeImageIndex]}
                  alt={`${listing.title} photo ${activeImageIndex + 1}`}
                  className="w-full h-full object-contain sm:object-cover"
                />

                {/* Left/Right Carousel Nav */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all backdrop-blur-xs"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all backdrop-blur-xs"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter Badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold bg-black/70 backdrop-blur-md text-white">
                  {activeImageIndex + 1} / {listing.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-brand-emerald scale-95 shadow-md shadow-brand-emerald/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Item Description */}
              <div className="pt-4 border-t border-dark-border space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-dark-muted">
                  Description
                </h4>
                <p className="text-xs sm:text-sm text-dark-text leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Dynamic Specs Table */}
              <div className="pt-4 border-t border-dark-border space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-dark-muted">
                  Specifications & Details
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(listing.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-dark-cardElevated/50 border border-dark-border"
                    >
                      <span className="text-[11px] text-dark-muted block">{key}</span>
                      <strong className="text-xs text-dark-text font-semibold">{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Pricing, Seller Trust Card & Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-5 pt-6 lg:pt-0">
              {/* Pricing Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-dark-cardElevated border border-dark-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30">
                    {listing.condition}
                  </span>
                  {listing.isNegotiable && (
                    <span className="text-[11px] text-brand-amber font-semibold">
                      Negotiable with Seller
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {formatIndianCurrency(listing.price)}
                    </span>
                    {listing.originalPrice && (
                      <span className="text-sm text-dark-muted line-through">
                        {formatIndianCurrency(listing.originalPrice)}
                      </span>
                    )}
                    {discount && (
                      <span className="text-xs font-bold text-brand-emerald">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                  <h1 className="text-sm sm:text-base font-bold text-dark-text mt-1.5 leading-snug">
                    {listing.title}
                  </h1>
                </div>

                <div className="pt-3 border-t border-dark-border/80 flex items-center justify-between text-xs text-dark-muted">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                    <span>{listing.locality}, {listing.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-dark-muted" />
                    <span>{listing.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Seller Trust Profile */}
              <div className="p-4 sm:p-5 rounded-2xl bg-dark-cardElevated border border-dark-border space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-dark-muted">
                    Seller Trust Profile
                  </h4>
                  <span className="text-[10px] text-brand-emerald font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Verified RIO Member
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={listing.seller.avatar}
                      alt={listing.seller.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-emerald"
                    />
                    {listing.seller.isVerified && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-brand-emerald text-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-sm font-bold text-dark-text">{listing.seller.name}</h5>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-dark-muted">
                      <span className="flex items-center gap-1 font-semibold text-brand-amber">
                        <Star className="w-3 h-3 fill-brand-amber" />
                        {listing.seller.rating}
                      </span>
                      <span>({listing.seller.reviewsCount} reviews)</span>
                      <span>•</span>
                      <span>Member since {listing.seller.memberSince}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {listing.seller.verificationBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-dark-card border border-brand-emerald/30 text-brand-emerald"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {badge}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-dark-muted">
                  ⚡ <strong>Response Time:</strong> {listing.seller.responseTime}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => onOpenChat(listing)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-emeraldDark hover:brightness-110 active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-xl shadow-brand-emerald/25 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Seller</span>
                </button>

                <button
                  onClick={() => onOpenReport(listing)}
                  className="w-full py-2.5 rounded-xl border border-dark-border hover:border-rose-500/50 hover:bg-rose-500/5 text-dark-muted hover:text-rose-400 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report this Listing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

