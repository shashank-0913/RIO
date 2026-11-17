import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert } from 'lucide-react';
import { Listing } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

const REPORT_REASONS = [
  'Prohibited or Banned Item (Weapons, Wildlife, Drugs)',
  'Counterfeit, Duplicate or Fake Product',
  'Suspicious Price / Potential Fraud or Scammer',
  'Inappropriate or Offensive Photos / Content',
  'Item Already Sold or Unavailable',
  'Seller Refusing In-Person Verification / Safe Meetup',
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, listing }) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `GRV-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(generatedId);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-dark-text text-base">Report Listing</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-dark-muted hover:text-dark-text rounded-lg hover:bg-dark-cardElevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          /* Confirmation View */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-dark-text">Grievance Ticket Created</h4>
              <p className="text-xs text-dark-muted mt-1">
                Your report has been submitted to RIO's Grievance Redressal Team under Indian IT Rules.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-dark-cardElevated border border-dark-border text-xs">
              <span className="text-dark-muted block">Ticket Reference ID:</span>
              <strong className="text-brand-emerald text-sm font-mono tracking-wider">{ticketId}</strong>
            </div>
            <p className="text-[11px] text-dark-muted">
              Our trust & safety team reviews reported listings within 24 hours. The listing will be temporarily hidden if flagged by multiple users.
            </p>
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-emeraldDark transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="p-3 rounded-xl bg-dark-cardElevated border border-dark-border flex items-center gap-3">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-dark-text truncate">{listing.title}</p>
                <p className="text-[11px] text-dark-muted">Seller: {listing.seller.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-2">
                Reason for Reporting
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? 'border-rose-500/60 bg-rose-500/10 text-dark-text'
                        : 'border-dark-border bg-dark-cardElevated/30 text-dark-muted hover:text-dark-text'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-dark-muted mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Provide any context or links to assist our compliance officer..."
                className="w-full p-2.5 rounded-xl bg-dark-cardElevated border border-dark-border text-xs text-dark-text placeholder:text-dark-muted focus:outline-none focus:border-rose-500 transition-all"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-dark-border text-dark-muted hover:text-dark-text text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Submit Grievance</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

