import React from 'react';
import { MapPin, Check, Navigation, X } from 'lucide-react';
import { CityType, RadiusType } from '../types';
import { CITIES, MOCK_LOCALITIES } from '../data/mockListings';

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: CityType;
  onSelectCity: (city: CityType) => void;
  selectedLocality: string;
  onSelectLocality: (locality: string) => void;
  selectedRadius: RadiusType;
  onSelectRadius: (radius: RadiusType) => void;
}

const RADIUS_OPTIONS: RadiusType[] = ['5 km', '10 km', 'City-wide', 'All India'];

export const CityModal: React.FC<CityModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
  selectedLocality,
  onSelectLocality,
  selectedRadius,
  onSelectRadius,
}) => {
  if (!isOpen) return null;

  const currentLocalities = MOCK_LOCALITIES[selectedCity] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-dark-card dark:bg-dark-card border border-dark-border dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden transition-colors"
        style={{ backgroundColor: 'var(--tw-modal-bg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-border dark:border-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-emerald/10 text-brand-emerald">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark-text dark:text-dark-text">Select Location & Radius</h3>
              <p className="text-xs text-dark-muted dark:text-dark-muted">Discover verified pre-owned items near you in India</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-dark-muted hover:text-dark-text rounded-lg hover:bg-dark-cardElevated transition-colors"
            aria-label="Close location selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Auto-detect / GPS */}
          <button
            onClick={() => {
              onSelectCity('Visakhapatnam');
              onSelectLocality('MVP Colony');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-dashed border-brand-emerald/40 bg-brand-emerald/5 hover:bg-brand-emerald/10 text-brand-emerald font-medium transition-all group"
          >
            <div className="flex items-center gap-3">
              <Navigation className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              <div className="text-left">
                <span className="text-sm font-semibold">Use Current Location (GPS)</span>
                <p className="text-xs opacity-80">Auto-detected: MVP Colony, Visakhapatnam</p>
              </div>
            </div>
            <span className="text-xs bg-brand-emerald text-white px-2.5 py-1 rounded-full font-bold">Fast</span>
          </button>

          {/* City Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-2.5">
              Select City (Major Indian Hubs)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CITIES.map((city) => {
                const isSelected = selectedCity === city;
                return (
                  <button
                    key={city}
                    onClick={() => {
                      onSelectCity(city);
                      // default to first locality in this city
                      if (MOCK_LOCALITIES[city]?.length) {
                        onSelectLocality(MOCK_LOCALITIES[city][0]);
                      }
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      isSelected
                        ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald shadow-sm'
                        : 'border-dark-border dark:border-dark-border bg-dark-cardElevated/50 text-dark-text hover:border-gray-500'
                    }`}
                  >
                    <span>{city}</span>
                    {isSelected && <Check className="w-4 h-4 text-brand-emerald" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Radius */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-2.5">
              Distance Radius
            </label>
            <div className="grid grid-cols-4 gap-2">
              {RADIUS_OPTIONS.map((radius) => {
                const isSelected = selectedRadius === radius;
                return (
                  <button
                    key={radius}
                    onClick={() => onSelectRadius(radius)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'border-brand-amber bg-brand-amber/15 text-brand-amber'
                        : 'border-dark-border bg-dark-cardElevated/40 text-dark-text hover:border-gray-500'
                    }`}
                  >
                    {radius}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Localities in selected city */}
          {selectedRadius !== 'All India' && currentLocalities.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-2.5">
                Popular Localities in {selectedCity}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSelectLocality('All Localities')}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedLocality === 'All Localities'
                      ? 'border-brand-emerald bg-brand-emerald text-white'
                      : 'border-dark-border bg-dark-cardElevated/40 text-dark-text hover:border-gray-500'
                  }`}
                >
                  All Localities
                </button>
                {currentLocalities.map((loc) => {
                  const isSelected = selectedLocality === loc;
                  return (
                    <button
                      key={loc}
                      onClick={() => onSelectLocality(loc)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? 'border-brand-emerald bg-brand-emerald text-white'
                          : 'border-dark-border bg-dark-cardElevated/40 text-dark-text hover:border-gray-500'
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-dark-cardElevated/30 border-t border-dark-border dark:border-dark-border flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white font-semibold text-sm shadow-lg shadow-brand-emerald/20 transition-all"
          >
            Apply Location Filter
          </button>
        </div>
      </div>
    </div>
  );
};

