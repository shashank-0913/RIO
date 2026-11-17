import React, { useState } from 'react';
import { X, Lock, Mail, User, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile, CityType } from '../types';
import { CITIES, MOCK_LOCALITIES } from '../data/mockListings';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, DEMO_USER } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityType>('Visakhapatnam');
  const [selectedLocality, setSelectedLocality] = useState('MVP Colony');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name');
          setIsLoading(false);
          return;
        }

        const res = await signUpWithEmail(email, password, fullName, selectedCity, selectedLocality);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.profile) {
          onSuccess(res.profile);
          onClose();
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.profile) {
          onSuccess(res.profile);
          onClose();
        }
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await signInWithGoogle();
      if ('user' in res && res.user) {
        onSuccess(res.user);
        onClose();
      }
    } catch {
      setErrorMsg('Google sign-in failed. Please try email login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    onSuccess(DEMO_USER);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-dark-border bg-dark-cardElevated/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-xl font-black text-white font-['Space_Grotesk',sans-serif]">RIO</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald ml-0.5"></span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30">
              Account
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-dark-muted hover:text-dark-text rounded-lg hover:bg-dark-cardElevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 border-b border-dark-border bg-dark-bg/60">
          <button
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg('');
            }}
            className={`py-3 text-xs font-bold transition-all border-b-2 ${
              !isSignUp
                ? 'border-brand-emerald text-brand-emerald bg-brand-emerald/5'
                : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
          >
            Sign In to RIO
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg('');
            }}
            className={`py-3 text-xs font-bold transition-all border-b-2 ${
              isSignUp
                ? 'border-brand-emerald text-brand-emerald bg-brand-emerald/5'
                : 'border-transparent text-dark-muted hover:text-dark-text'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-dark-border bg-dark-cardElevated hover:border-gray-500 text-dark-text text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-[10px] uppercase font-bold text-dark-muted tracking-wider">or with email</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="grid grid-cols-2 gap-2">
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
                        setSelectedLocality(MOCK_LOCALITIES[c][0]);
                      }
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="bg-dark-card text-dark-text">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                    Locality
                  </label>
                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald cursor-pointer"
                  >
                    {(MOCK_LOCALITIES[selectedCity] || []).map((loc) => (
                      <option key={loc} value={loc} className="bg-dark-card text-dark-text">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-emeraldDark hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-emerald/20 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : isSignUp ? 'Create Free Account' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-brand-amber/40 bg-brand-amber/5 hover:bg-brand-amber/10 text-brand-amber text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ Quick Demo Login (Pavan Varma, Visakhapatnam)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-dark-cardElevated/40 border-t border-dark-border text-center">
          <p className="text-[10px] text-dark-muted flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3 text-brand-emerald" />
            Protected by Supabase Auth with Indian DPDP Compliance
          </p>
        </div>
      </div>
    </div>
  );
};

