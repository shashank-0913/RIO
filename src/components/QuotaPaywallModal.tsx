import React, { useState } from 'react';
import { X, Zap, Crown, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { QuotaStatus } from '../types';

interface QuotaPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotaStatus: QuotaStatus;
  onUnlockSlot: () => void;
  onUpgradeProDealer: () => void;
}

export const QuotaPaywallModal: React.FC<QuotaPaywallModalProps> = ({
  isOpen,
  onClose,
  quotaStatus,
  onUnlockSlot,
  onUpgradeProDealer,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successPlan, setSuccessPlan] = useState<'single' | 'pro' | null>(null);

  if (!isOpen) return null;

  const handlePaySlot = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessPlan('single');
      setTimeout(() => {
        onUnlockSlot();
        onClose();
      }, 1200);
    }, 1000);
  };

  const handlePayPro = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessPlan('pro');
      setTimeout(() => {
        onUpgradeProDealer();
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-dark-border bg-gradient-to-r from-amber-500/10 via-dark-card to-dark-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-amber/15 text-brand-amber">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-dark-text text-base">Free Ad Quota Reached</h3>
              <p className="text-xs text-dark-muted">
                {quotaStatus.category} • Max {quotaStatus.maxAllowed} ad per {quotaStatus.windowDays} days
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-dark-muted hover:text-dark-text rounded-lg hover:bg-dark-cardElevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {successPlan ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-emerald/15 text-brand-emerald flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Payment Successful via UPI!</h4>
              <p className="text-xs text-dark-muted">
                {successPlan === 'single'
                  ? 'Extra ad slot unlocked for this listing. Proceeding to publish...'
                  : 'Welcome to RIO Pro Dealer! Unlimited listings now active on your account.'}
              </p>
            </div>
          ) : (
            <>
              {/* Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-brand-amber/10 border border-brand-amber/25 text-xs text-amber-200 leading-relaxed">
                To maintain authentic peer-to-peer quality and prevent commercial spam in India, free listings in <strong>{quotaStatus.category}</strong> are limited to <strong>{quotaStatus.maxAllowed} ad every {quotaStatus.windowDays} days</strong>.
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Option 1: Unlock 1 Extra Slot */}
                <div className="p-4 rounded-2xl bg-dark-cardElevated border border-dark-border hover:border-brand-emerald/60 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-dark-muted block mb-1">
                      One-Time Slot
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">₹29</span>
                      <span className="text-[11px] text-dark-muted">/ ad</span>
                    </div>
                    <p className="text-xs text-dark-text mt-1.5 font-medium">
                      Unlock 1 Extra Ad Slot
                    </p>
                    <ul className="text-[11px] text-dark-muted space-y-1 mt-2">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>Instant publish right now</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>Valid for 30 days active</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={handlePaySlot}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-xl bg-dark-card border border-brand-emerald text-brand-emerald hover:bg-brand-emerald hover:text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing UPI...' : 'Unlock for ₹29'}
                  </button>
                </div>

                {/* Option 2: Pro Dealer Subscription */}
                <div className="relative p-4 rounded-2xl bg-gradient-to-b from-brand-emerald/10 to-dark-cardElevated border-2 border-brand-emerald flex flex-col justify-between space-y-3 shadow-lg shadow-brand-emerald/10">
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-brand-emerald text-white tracking-wider">
                    Best Value
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-emerald flex items-center gap-1 mb-1">
                      <Crown className="w-3.5 h-3.5" />
                      Pro Dealer Membership
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">₹499</span>
                      <span className="text-[11px] text-dark-muted">/ month</span>
                    </div>
                    <p className="text-xs text-dark-text mt-1.5 font-medium">
                      Unlimited Listings Nationwide
                    </p>
                    <ul className="text-[11px] text-dark-muted space-y-1 mt-2">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>Unlimited ads across all Indian cities</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>Verified PRO Dealer Shield 🛡️</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        <span>Top rank in search results</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={handlePayPro}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-emeraldDark hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-brand-emerald/25 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <span>{isProcessing ? 'Connecting...' : 'Go Pro for ₹499'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-dark-cardElevated/40 border-t border-dark-border text-center flex items-center justify-center gap-2 text-[11px] text-dark-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
          <span>Instant UPI activation (Google Pay, PhonePe, Paytm, BHIM)</span>
        </div>
      </div>
    </div>
  );
};
