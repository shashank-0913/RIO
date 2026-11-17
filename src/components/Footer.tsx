import React from 'react';
import { Shield, Lock, MapPin, Heart } from 'lucide-react';
import { CityType } from '../types';
import { CITIES } from '../data/mockListings';

interface FooterProps {
  onOpenCompliance: (docKey: 'terms' | 'dpdp' | 'prohibited' | 'grievance') => void;
  selectedCity: CityType;
  onSelectCity: (city: CityType) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCompliance,
  selectedCity,
  onSelectCity,
}) => {
  return (
    <footer className="w-full bg-dark-bg border-t border-dark-border mt-16 pb-20 md:pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white font-['Space_Grotesk',sans-serif]">
                RIO
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30">
                by Vink
              </span>
            </div>
            <p className="text-xs text-dark-muted leading-relaxed">
              India's modern peer-to-peer marketplace. Resell pre-owned items across Indian cities with trust, simplicity, and speed.
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-brand-emerald font-medium">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Verified Community
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                DPDP Compliant
              </span>
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-dark-text mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
              Popular Hubs in India
            </h4>
            <ul className="space-y-1.5 text-xs text-dark-muted">
              {CITIES.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => onSelectCity(c)}
                    className={`hover:text-brand-emerald transition-colors ${
                      selectedCity === c ? 'text-brand-emerald font-bold' : ''
                    }`}
                  >
                    Second-hand in {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-dark-text mb-3">
              Explore Categories
            </h4>
            <ul className="space-y-1.5 text-xs text-dark-muted">
              <li>Used Mobiles & Laptops</li>
              <li>Pre-owned Bikes & Scooters</li>
              <li>Home & Office Furniture</li>
              <li>Refrigerators & ACs</li>
              <li>UPSC Books & Musical Instruments</li>
              <li>Sea-facing Properties</li>
            </ul>
          </div>

          {/* Indian Compliance & Grievance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-dark-text mb-3">
              Indian Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenCompliance('terms')}
                  className="text-dark-muted hover:text-brand-emerald transition-colors text-left"
                >
                  Terms of Use (E-Commerce Rules)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('dpdp')}
                  className="text-dark-muted hover:text-brand-emerald transition-colors text-left"
                >
                  Privacy Policy (DPDP Act 2023)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('prohibited')}
                  className="text-dark-muted hover:text-rose-400 transition-colors text-left"
                >
                  Prohibited Items Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('grievance')}
                  className="text-brand-emerald hover:underline font-semibold transition-colors text-left flex items-center gap-1"
                >
                  Grievance Officer & Trust Center (48h SLA)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-dark-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-dark-muted">
          <p>© {new Date().getFullYear()} Vink Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for India in Visakhapatnam
          </p>
        </div>
      </div>
    </footer>
  );
};
