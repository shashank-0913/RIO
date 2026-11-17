import React, { useState } from 'react';
import { Listing, ListingStatus } from '../types';
import { formatIndianCurrency } from '../lib/formatters';
import { Edit3, CheckCircle2, Trash2, Tag, PlusCircle, AlertCircle, Rocket } from 'lucide-react';

interface MyAdsDashboardProps {
  myListings: Listing[];
  onUpdatePrice: (listingId: string, newPrice: number) => void;
  onUpdateStatus: (listingId: string, newStatus: ListingStatus) => void;
  onDeleteListing: (listingId: string) => void;
  onOpenSellModal: () => void;
  onOpenBoostModal: (listing: Listing) => void;
  isLoading?: boolean;
}

export const MyAdsDashboard: React.FC<MyAdsDashboardProps> = ({
  myListings,
  onUpdatePrice,
  onUpdateStatus,
  onDeleteListing,
  onOpenSellModal,
  onOpenBoostModal,
  isLoading = false,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<number | ''>('');

  const filtered = myListings.filter((l) => {
    if (activeFilter === 'active') return l.status === 'active';
    if (activeFilter === 'sold') return l.status === 'sold';
    return true;
  });

  const handleStartEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setEditPriceValue(listing.price);
  };

  const handleSavePrice = (listingId: string) => {
    if (editPriceValue && Number(editPriceValue) > 0) {
      onUpdatePrice(listingId, Number(editPriceValue));
    }
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4 animate-pulse">
        <div className="h-6 w-32 bg-dark-cardElevated rounded-md" />
        <div className="h-20 bg-dark-cardElevated rounded-2xl" />
        <div className="h-20 bg-dark-cardElevated rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Filter Tabs & Action */}
      <div className="flex items-center justify-between gap-2 border-b border-dark-border pb-3">
        <div className="flex gap-1.5">
          {(['all', 'active', 'sold'] as const).map((tab) => {
            const count =
              tab === 'all'
                ? myListings.length
                : myListings.filter((l) => l.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                  activeFilter === tab
                    ? 'border-brand-emerald bg-brand-emerald/15 text-brand-emerald'
                    : 'border-dark-border bg-dark-cardElevated text-dark-muted hover:text-dark-text'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenSellModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-emerald text-white text-xs font-bold shadow-md shadow-brand-emerald/20 hover:brightness-110"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Ad</span>
        </button>
      </div>

      {/* Listing Cards */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-dark-cardElevated/40 rounded-2xl border border-dashed border-dark-border space-y-2">
          <Tag className="w-8 h-8 mx-auto text-dark-muted opacity-40" />
          <h5 className="text-sm font-bold text-dark-text">No {activeFilter} listings</h5>
          <p className="text-xs text-dark-muted max-w-xs mx-auto">
            You don't have any ads in this category. Post an ad to reach thousands of buyers across India!
          </p>
          <button
            onClick={onOpenSellModal}
            className="mt-2 px-4 py-2 rounded-xl bg-brand-emerald text-white text-xs font-bold uppercase tracking-wider"
          >
            Post Your First Ad
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const isSold = item.status === 'sold';
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-dark-cardElevated border border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-dark-border"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          isSold
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[10px] text-dark-muted">{item.category}</span>
                    </div>

                    <h5 className="text-xs font-bold text-dark-text truncate">{item.title}</h5>

                    {/* Price & Edit input */}
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-brand-emerald font-bold">₹</span>
                        <input
                          type="number"
                          value={editPriceValue}
                          onChange={(e) => setEditPriceValue(Number(e.target.value))}
                          className="w-24 px-2 py-0.5 rounded-lg bg-dark-card border border-brand-emerald text-xs text-white font-bold focus:outline-none"
                        />
                        <button
                          onClick={() => handleSavePrice(item.id)}
                          className="px-2 py-0.5 rounded-lg bg-brand-emerald text-white text-[10px] font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-1.5 py-0.5 text-dark-muted text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-brand-emerald">
                          {formatIndianCurrency(item.price)}
                        </span>
                        <span className="text-[10px] text-dark-muted">
                          {item.locality}, {item.city}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {/* Edit Price */}
                  {!isEditing && (
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-2 rounded-xl bg-dark-card border border-dark-border text-dark-muted hover:text-dark-text hover:border-brand-emerald text-xs transition-colors"
                      title="Edit price"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Boost Ad Button (for active listings) */}
                  {!isSold && (
                    <button
                      onClick={() => onOpenBoostModal(item)}
                      className="px-2.5 py-1.5 rounded-xl border border-brand-amber/40 bg-brand-amber/10 hover:bg-brand-amber/20 text-brand-amber text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                      title="Boost to top of search results"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>{item.isFeatured ? 'Boosted' : 'Boost Ad'}</span>
                    </button>
                  )}

                  {/* Mark as Sold / Reactivate */}
                  <button
                    onClick={() => onUpdateStatus(item.id, isSold ? 'active' : 'sold')}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSold
                        ? 'border-brand-emerald/40 text-brand-emerald bg-brand-emerald/5 hover:bg-brand-emerald/10'
                        : 'border-brand-amber/40 text-brand-amber bg-brand-amber/5 hover:bg-brand-amber/10'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSold ? 'Reactivate' : 'Mark as Sold'}</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                        onDeleteListing(item.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-dark-card border border-dark-border text-dark-muted hover:text-rose-400 hover:border-rose-500/50 transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quota Policy Reminder */}
      <div className="p-3 rounded-2xl bg-brand-emerald/5 border border-brand-emerald/20 flex items-start gap-2 text-xs text-dark-muted">
        <AlertCircle className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          Remember: Under RIO's fair marketplace policy, deleted or marked-as-sold ads remain counted against your 30/60 day free tier category quota.
        </p>
      </div>
    </div>
  );
};
