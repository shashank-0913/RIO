import React, { useState } from 'react';
import {
  X,
  Rocket,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { Listing, UserProfile } from '../types';
import { formatIndianCurrency } from '../lib/formatters';
import { initiateRazorpayPayment } from '../lib/razorpay';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  currentUser: UserProfile;
  onBoostSuccess: (listingId: string, plan: '24h' | '7d') => void;
}

export const BoostModal: React.FC<BoostModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser,
  onBoostSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'24h' | '7d'>('7d');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessId, setPaymentSuccessId] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const planAmount = selectedPlan === '24h' ? 29 : 99;

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      await initiateRazorpayPayment({
        amount: planAmount,
        name: 'RIO by Vink',
        description:
          selectedPlan === '24h'
            ? '24-Hour Top Boost for ' + listing.title
            : '7-Day Featured Spotlight for ' + listing.title,
        listingId: listing.id,
        planType: selectedPlan === '24h' ? 'boost_24h' : 'featured_7d',
        prefill: {
          name: currentUser.full_name,
          email: currentUser.email,
        },
        onSuccess: (paymentId) => {
          setIsProcessing(false);
          setPaymentSuccessId(paymentId);
          setTimeout(() => {
            onBoostSuccess(listing.id, selectedPlan);
            setPaymentSuccessId(null);
            onClose();
          }, 1500);
        },
      });
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-dark-border bg-gradient-to-r from-amber-500/10 via-dark-card to-dark-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-amber/15 text-brand-amber">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-dark-text text-base">Boost Listing to Top</h3>
              <p className="text-xs text-dark-muted">Get up to 10x more buyer responses in {listing.city}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-dark-muted hover:text-dark-text rounded-lg hover:bg-dark-cardElevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {paymentSuccessId ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-emerald/15 text-brand-emerald flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Payment Verified via Razorpay!</h4>
              <p className="text-xs text-dark-muted">
                Transaction ID: <strong className="font-mono text-brand-emerald">{paymentSuccessId}</strong>
              </p>
              <p className="text-xs text-dark-text pt-1 font-medium">
                "{listing.title}" is now boosted with a Featured badge at the top of the {listing.city} feed!
              </p>
            </div>
          ) : (
            <>
              {/* Listing Mini Summary */}
              <div className="p-3 rounded-2xl bg-dark-cardElevated border border-dark-border flex items-center gap-3">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-dark-border"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-dark-text truncate">{listing.title}</h5>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-extrabold text-brand-emerald">
                      {formatIndianCurrency(listing.price)}
                    </span>
                    <span className="text-[10px] text-dark-muted">
                      {listing.locality}, {listing.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Tiers Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Tier 1: 24-Hour Top Boost (₹29) */}
                <div
                  onClick={() => setSelectedPlan('24h')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    selectedPlan === '24h'
                      ? 'border-brand-amber bg-brand-amber/10 shadow-lg shadow-brand-amber/5'
                      : 'border-dark-border bg-dark-cardElevated/50 hover:border-gray-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-amber flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        Quick Bump
                      </span>
                      <input
                        type="radio"
                        name="boostTier"
                        checked={selectedPlan === '24h'}
                        onChange={() => setSelectedPlan('24h')}
                        className="accent-brand-amber"
                      />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">₹29</span>
                      <span className="text-[11px] text-dark-muted">/ 24 hours</span>
                    </div>
                    <h6 className="text-xs font-bold text-dark-text mt-1.5">24-Hour Top Boost</h6>
                    <ul className="text-[11px] text-dark-muted space-y-1 mt-2">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>Bumps listing to top of results</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>3x more buyer inquiries today</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Tier 2: 7-Day Featured Spotlight (₹99) */}
                <div
                  onClick={() => setSelectedPlan('7d')}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    selectedPlan === '7d'
                      ? 'border-brand-emerald bg-brand-emerald/10 shadow-lg shadow-brand-emerald/10'
                      : 'border-dark-border bg-dark-cardElevated/50 hover:border-gray-600'
                  }`}
                >
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-brand-emerald text-white tracking-wider">
                    Recommended
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-emerald flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Spotlight
                      </span>
                      <input
                        type="radio"
                        name="boostTier"
                        checked={selectedPlan === '7d'}
                        onChange={() => setSelectedPlan('7d')}
                        className="accent-brand-emerald"
                      />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">₹99</span>
                      <span className="text-[11px] text-dark-muted">/ 7 days</span>
                    </div>
                    <h6 className="text-xs font-bold text-dark-text mt-1.5">7-Day Featured Spotlight</h6>
                    <ul className="text-[11px] text-dark-muted space-y-1 mt-2">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>Pinned "Featured" badge</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>Top spotlight for entire week</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>10x buyer engagement</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-3.5 rounded-2xl bg-dark-cardElevated/40 border border-dark-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-dark-muted">
                  <CreditCard className="w-4 h-4 text-brand-emerald" />
                  <span>Secure Indian Payment Gateway</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-dark-muted block">Total Payable:</span>
                  <strong className="text-sm font-bold text-white">₹{planAmount}</strong>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-emeraldDark hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-emerald/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting Razorpay...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Pay ₹{planAmount} via Razorpay / UPI</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-dark-cardElevated/40 border-t border-dark-border text-center flex items-center justify-center gap-1.5 text-[11px] text-dark-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
          <span>Razorpay 256-bit SSL encrypted • UPI, Cards & NetBanking</span>
        </div>
      </div>
    </div>
  );
};

