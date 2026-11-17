import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Phone,
  MapPin,
  Heart,
  Package,
  Download,
  Trash2,
  Award,
  Crown,
  LogOut,
  LogIn,
} from 'lucide-react';
import { UserProfile, CityType, Listing, ListingStatus } from '../types';
import { MyAdsDashboard } from './MyAdsDashboard';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  selectedCity: CityType;
  savedCount: number;
  userListings: Listing[];
  onUpdatePrice: (listingId: string, newPrice: number) => void;
  onUpdateStatus: (listingId: string, newStatus: ListingStatus) => void;
  onDeleteListing: (listingId: string) => void;
  onOpenSellModal: () => void;
  onOpenBoostModal: (listing: Listing) => void;
  onOpenProDealerModal: () => void;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  onOpenCompliance: (docKey: 'terms' | 'dpdp' | 'prohibited' | 'grievance') => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  selectedCity,
  savedCount,
  userListings,
  onUpdatePrice,
  onUpdateStatus,
  onDeleteListing,
  onOpenSellModal,
  onOpenBoostModal,
  onOpenProDealerModal,
  onOpenAuthModal,
  onSignOut,
  onOpenCompliance,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'my_ads' | 'privacy'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-dark-border bg-dark-cardElevated/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-emerald" />
            <h3 className="font-bold text-dark-text text-base">User Dashboard & Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-dark-muted hover:text-dark-text rounded-lg hover:bg-dark-cardElevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-dark-border bg-dark-bg/60 px-4 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-brand-emerald text-brand-emerald'
                : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
          >
            Profile Overview
          </button>
          <button
            onClick={() => setActiveTab('my_ads')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'my_ads'
                ? 'border-brand-emerald text-brand-emerald'
                : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
          >
            <span>My Ads Dashboard</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-emerald/20 text-brand-emerald font-mono">
              {userListings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'privacy'
                ? 'border-brand-emerald text-brand-emerald'
                : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
          >
            DPDP Privacy & Consent
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'my_ads' && (
            <MyAdsDashboard
              myListings={userListings}
              onUpdatePrice={onUpdatePrice}
              onUpdateStatus={onUpdateStatus}
              onDeleteListing={onDeleteListing}
              onOpenSellModal={onOpenSellModal}
              onOpenBoostModal={onOpenBoostModal}
            />
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {currentUser ? (
                /* Logged In User Profile */
                <div className="space-y-5">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-dark-cardElevated border border-dark-border">
                    <img
                      src={
                        currentUser.avatar_url ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={currentUser.full_name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-brand-emerald shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-dark-text text-base truncate">
                          {currentUser.full_name}
                        </h4>
                        {currentUser.is_verified && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        {currentUser.is_pro_dealer && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-amber/15 text-brand-amber border border-brand-amber/40">
                            <Crown className="w-3 h-3" />
                            PRO Dealer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-dark-muted flex items-center gap-1 mt-0.5 truncate">
                        <Phone className="w-3 h-3 text-brand-emerald shrink-0" />
                        <span>{currentUser.email || '+91 98480 •••••'}</span>
                      </p>
                      <p className="text-[11px] text-dark-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-brand-amber shrink-0" />
                        <span>
                          {currentUser.locality}, {currentUser.city || selectedCity}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={onSignOut}
                      className="p-2 rounded-xl border border-dark-border bg-dark-card text-dark-muted hover:text-rose-400 hover:border-rose-500/50 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Activity Stats */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <button
                      onClick={() => setActiveTab('my_ads')}
                      className="p-3.5 rounded-2xl bg-dark-cardElevated/50 border border-dark-border hover:border-brand-emerald/50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-brand-emerald mx-auto mb-1" />
                      <span className="text-lg font-black text-white block">
                        {userListings.length}
                      </span>
                      <span className="text-[10px] text-dark-muted uppercase font-bold">
                        My Ads
                      </span>
                    </button>

                    <div className="p-3.5 rounded-2xl bg-dark-cardElevated/50 border border-dark-border">
                      <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1 fill-rose-500" />
                      <span className="text-lg font-black text-white block">{savedCount}</span>
                      <span className="text-[10px] text-dark-muted uppercase font-bold">
                        Saved Wishlist
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-dark-cardElevated/50 border border-dark-border">
                      <ShieldCheck className="w-4 h-4 text-brand-amber mx-auto mb-1" />
                      <span className="text-lg font-black text-white block">
                        {currentUser.rating_avg} ★
                      </span>
                      <span className="text-[10px] text-dark-muted uppercase font-bold">
                        Trust Score
                      </span>
                    </div>
                  </div>

                  {/* Pro Dealer Upgrade Card */}
                  {!currentUser.is_pro_dealer && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-amber/10 via-dark-card to-dark-cardElevated border border-brand-amber/30 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-brand-amber font-bold text-xs uppercase tracking-wider mb-1">
                          <Crown className="w-4 h-4" />
                          <span>RIO Pro Dealer</span>
                        </div>
                        <p className="text-xs text-dark-muted">
                          Bypass all category listing limits & post unlimited second-hand ads nationwide for ₹499/mo.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenProDealerModal();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-brand-amber text-black font-bold text-xs whitespace-nowrap hover:brightness-110 shadow-md shadow-brand-amber/20"
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Signed Out State */
                <div className="p-8 text-center space-y-4 bg-dark-cardElevated/40 rounded-2xl border border-dark-border">
                  <div className="w-14 h-14 mx-auto rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
                    <LogIn className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-dark-text">Sign In to Manage Your Ads</h4>
                    <p className="text-xs text-dark-muted max-w-sm mx-auto mt-1">
                      Sign in with Google or Email to post ads, manage active listings, and message buyers on RIO.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthModal();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-brand-emerald text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-emerald/20 hover:bg-brand-emeraldDark"
                  >
                    Sign In or Create Account
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-brand-emerald/5 border border-brand-emerald/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
                    DPDP Act Data Privacy Rights
                  </h5>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCompliance('dpdp');
                    }}
                    className="text-[11px] text-brand-emerald underline"
                  >
                    View Official Notice
                  </button>
                </div>
                <p className="text-xs text-dark-muted leading-relaxed">
                  In compliance with India's Digital Personal Data Protection Act, 2023, you have full sovereignty over your personal data on RIO by Vink.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={() =>
                      alert('Your data package has been generated and queued for download.')
                    }
                    className="flex-1 py-2 px-3 rounded-xl bg-dark-card border border-dark-border hover:border-brand-emerald text-xs text-dark-text font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>Export My Data</span>
                  </button>

                  <button
                    onClick={() =>
                      alert('Account erasure request registered with Grievance Officer. SLA: 48 hours.')
                    }
                    className="flex-1 py-2 px-3 rounded-xl bg-dark-card border border-dark-border hover:border-rose-500/50 text-xs text-rose-400 font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Request Erasure</span>
                  </button>
                </div>
              </div>

              {/* Statutory Legal & Compliance Quick Access */}
              <div className="p-4 rounded-2xl bg-dark-cardElevated/40 border border-dark-border space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-dark-text">
                  Indian Statutory Compliance Center
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCompliance('terms');
                    }}
                    className="p-2.5 rounded-xl bg-dark-card border border-dark-border hover:border-brand-emerald text-left text-xs text-dark-text hover:text-brand-emerald transition-colors"
                  >
                    Terms of Use (E-Commerce)
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCompliance('dpdp');
                    }}
                    className="p-2.5 rounded-xl bg-dark-card border border-dark-border hover:border-brand-emerald text-left text-xs text-dark-text hover:text-brand-emerald transition-colors"
                  >
                    Privacy Policy (DPDP 2023)
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCompliance('prohibited');
                    }}
                    className="p-2.5 rounded-xl bg-dark-card border border-dark-border hover:border-rose-500/50 text-left text-xs text-dark-text hover:text-rose-400 transition-colors"
                  >
                    Prohibited Items Policy
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCompliance('grievance');
                    }}
                    className="p-2.5 rounded-xl bg-dark-card border border-dark-border hover:border-brand-amber text-left text-xs text-brand-emerald font-semibold transition-colors"
                  >
                    Grievance Officer & 48h SLA
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border bg-dark-cardElevated/40 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
