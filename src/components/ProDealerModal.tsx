import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  TrendingUp,
  Loader2,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { UserProfile, CityType } from '../types';
import { CITIES, MOCK_LOCALITIES } from '../data/mockListings';
import { initiateRazorpayPayment } from '../lib/razorpay';

interface ProDealerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpgradeSuccess: () => void;
}

export const ProDealerModal: React.FC<ProDealerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpgradeSuccess,
}) => {
  const [shopName, setShopName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Mobiles & Electronics');
  const [gstin, setGstin] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityType>(currentUser.city || 'Visakhapatnam');
  const [locality, setLocality] = useState(currentUser.locality || 'MVP Colony');
  const [contactPhone, setContactPhone] = useState(currentUser.email || '+91 98480 12345');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) return;

    setIsProcessing(true);

    try {
      await initiateRazorpayPayment({
        amount: 499,
        name: 'RIO Pro Dealer Membership',
        description: `Monthly Subscription for ${shopName}`,
        planType: 'pro_dealer',
        prefill: {
          name: currentUser.full_name,
          email: currentUser.email,
          contact: contactPhone,
        },
        onSuccess: () => {
          setIsProcessing(false);
          setIsSuccess(true);
          setTimeout(() => {
            onUpgradeSuccess();
            setIsSuccess(false);
            onClose();
          }, 1600);
        },
      });
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-dark-border bg-gradient-to-r from-brand-amber/15 via-dark-card to-dark-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-amber/20 text-brand-amber">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg">RIO Pro for Shops & Dealers</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-brand-amber text-black">
                  ₹499 / mo
                </span>
              </div>
              <p className="text-xs text-dark-muted">
                Empowering verified refurbished shops & vehicle dealers across India
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {isSuccess ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-brand-emerald/15 text-brand-emerald flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-white">Dealer Verification Submitted & Activated!</h4>
              <p className="text-xs text-dark-muted max-w-md mx-auto">
                Welcome to RIO Pro Dealer! Your Verified Store Shield 🛡️ is now live, and all category listing limits have been removed nationwide.
              </p>
            </div>
          ) : (
            <>
              {/* Value Proposition Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-dark-cardElevated border border-dark-border">
                  <div className="p-2 rounded-xl bg-brand-emerald/10 text-brand-emerald w-fit mb-2">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white mb-1">50 Monthly Ad Slots</h5>
                  <p className="text-[11px] text-dark-muted leading-relaxed">
                    Bypass all category cooldowns. Post and restock inventory continuously.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-cardElevated border border-dark-border">
                  <div className="p-2 rounded-xl bg-brand-amber/10 text-brand-amber w-fit mb-2">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white mb-1">Verified Store Badge</h5>
                  <p className="text-[11px] text-dark-muted leading-relaxed">
                    Build instant buyer trust with the golden PRO Dealer verification shield.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-cardElevated border border-dark-border">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-2">
                    <Crown className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white mb-1">Priority Search Rank</h5>
                  <p className="text-[11px] text-dark-muted leading-relaxed">
                    Dealer inventory is ranked above regular ads in city search results.
                  </p>
                </div>
              </div>

              {/* Request Dealer Verification Form */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-3xl bg-dark-cardElevated/40 border border-dark-border space-y-4">
                <div className="border-b border-dark-border pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-brand-amber" />
                    <span>Dealer Verification Application</span>
                  </h4>
                  <p className="text-[11px] text-dark-muted mt-0.5">
                    Enter your shop credentials for statutory compliance under Indian E-Commerce rules.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                      Shop / Business Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g., Patnaik Electronics & Mobiles"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                      Business Category *
                    </label>
                    <select
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald cursor-pointer"
                    >
                      <option value="Mobiles & Electronics">Used Mobiles & Electronics</option>
                      <option value="Bikes & Cars">Pre-owned Bikes & Cars Dealership</option>
                      <option value="Furniture">Refurbished Furniture Showroom</option>
                      <option value="Appliances">Home Appliances Outlet</option>
                      <option value="Property">Real Estate Brokerage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                      GSTIN / Trade License No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="e.g. 37AAAAA0000A1Z5"
                      className="w-full px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                      Business Phone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                      <input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 98480 •••••"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                      City
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        const c = e.target.value as CityType;
                        setSelectedCity(c);
                        if (MOCK_LOCALITIES[c]?.length) {
                          setLocality(MOCK_LOCALITIES[c][0]);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald cursor-pointer"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                      Locality / Market Area
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                      <input
                        type="text"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-amber via-amber-400 to-brand-amber hover:brightness-110 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-brand-amber/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Initiating Razorpay Subscription...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Verification & Subscribe (₹499/mo)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-dark-cardElevated/50 border-t border-dark-border text-center flex items-center justify-center gap-2 text-[11px] text-dark-muted">
          <ShieldCheck className="w-4 h-4 text-brand-emerald" />
          <span>Compliant with Consumer Protection (E-Commerce) Rules, 2020</span>
        </div>
      </div>
    </div>
  );
};

