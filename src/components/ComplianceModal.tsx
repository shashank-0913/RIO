import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Scale,
  AlertOctagon,
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { COMPLIANCE_DOCS } from '../data/compliance';

export type ComplianceDocKey = 'terms' | 'dpdp' | 'prohibited' | 'grievance';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocKey: ComplianceDocKey;
  onSelectDocKey: (key: ComplianceDocKey) => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({
  isOpen,
  onClose,
  activeDocKey,
  onSelectDocKey,
}) => {
  // Grievance Takedown Form State
  const [complainantName, setComplainantName] = useState('');
  const [complainantContact, setComplainantContact] = useState('');
  const [listingRef, setListingRef] = useState('');
  const [violationType, setViolationType] = useState('Prohibited Goods (Weapons, Drugs, Wildlife)');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDoc = COMPLIANCE_DOCS[activeDocKey];

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedTicket = `GRV-${Date.now().toString().slice(-6)}`;
    setSubmittedTicket(generatedTicket);
  };

  const getDocIcon = (key: ComplianceDocKey) => {
    switch (key) {
      case 'terms':
        return <Scale className="w-4 h-4 text-brand-emerald" />;
      case 'dpdp':
        return <ShieldCheck className="w-4 h-4 text-brand-emerald" />;
      case 'prohibited':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'grievance':
      default:
        return <Mail className="w-4 h-4 text-brand-amber" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-dark-border bg-dark-cardElevated/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-emerald/10 text-brand-emerald">
              {getDocIcon(activeDocKey)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-dark-text">
                  {currentDoc.title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30">
                  {currentDoc.badge}
                </span>
              </div>
              <p className="text-xs text-dark-muted">
                Statutory Compliance • Republic of India • Visakhapatnam Jurisdiction
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

        {/* Tab Navigation */}
        <div className="flex border-b border-dark-border bg-dark-bg/60 overflow-x-auto no-scrollbar px-3 pt-2">
          {(['terms', 'dpdp', 'prohibited', 'grievance'] as const).map((key) => {
            const isSelected = activeDocKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  onSelectDocKey(key);
                  setSubmittedTicket(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isSelected
                    ? 'border-brand-emerald text-brand-emerald bg-brand-emerald/5'
                    : 'border-transparent text-dark-muted hover:text-dark-text'
                }`}
              >
                {COMPLIANCE_DOCS[key].title}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-dark-text leading-relaxed flex-1">
          {/* Main Legal Sections */}
          {currentDoc.content.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="font-bold text-white text-sm sm:text-base border-l-2 border-brand-emerald pl-2.5">
                {section.heading}
              </h4>
              <p className="text-dark-muted leading-relaxed pl-3">{section.text}</p>
              {section.bulletPoints && (
                <ul className="list-disc pl-8 space-y-1 text-dark-muted pt-1">
                  {section.bulletPoints.map((pt, pIdx) => (
                    <li key={pIdx}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Special Interactive Section for Grievance Officer & Takedown Form */}
          {activeDocKey === 'grievance' && (
            <div className="pt-4 border-t border-dark-border space-y-5">
              {/* SLA Guarantee Card */}
              <div className="p-4 rounded-2xl bg-brand-amber/10 border border-brand-amber/30 space-y-2">
                <div className="flex items-center gap-2 text-brand-amber font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Statutory 48-Hour Acknowledgment SLA Guaranteed</span>
                </div>
                <p className="text-xs text-dark-text leading-relaxed">
                  As mandated under Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Consumer Protection (E-Commerce) Rules, 2020: Every grievance ticket is acknowledged within <strong>48 hours</strong> and fully investigated within <strong>15 days</strong>.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-dark-muted pt-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                  <span>D.No 48-12-3, Dwaraka Nagar 3rd Lane, Visakhapatnam, AP — 530016, India</span>
                </div>
              </div>

              {/* Direct Takedown / Complaint Form */}
              <div className="p-4 sm:p-5 rounded-2xl bg-dark-cardElevated/70 border border-dark-border space-y-4">
                <div className="border-b border-dark-border pb-2.5">
                  <h5 className="font-bold text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-emerald" />
                    <span>Direct Takedown & Grievance Lodgment Form</span>
                  </h5>
                  <p className="text-[11px] text-dark-muted mt-0.5">
                    Submit a formal complaint or request removal of infringing / prohibited content.
                  </p>
                </div>

                {submittedTicket ? (
                  <div className="p-5 text-center space-y-2.5 bg-dark-card rounded-xl border border-brand-emerald/30">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-brand-emerald" />
                    <h6 className="text-sm font-bold text-white">Grievance Successfully Registered</h6>
                    <p className="text-xs text-dark-muted">
                      Your statutory reference number is: <strong className="font-mono text-brand-emerald">{submittedTicket}</strong>
                    </p>
                    <p className="text-[11px] text-dark-muted">
                      Our Nodal Grievance Officer in Visakhapatnam has been notified. You will receive an acknowledgment at your contact details within 48 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleGrievanceSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={complainantName}
                          onChange={(e) => setComplainantName(e.target.value)}
                          placeholder="e.g., Rajesh Sharma"
                          className="w-full px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                          Contact Email or Mobile *
                        </label>
                        <input
                          type="text"
                          required
                          value={complainantContact}
                          onChange={(e) => setComplainantContact(e.target.value)}
                          placeholder="email@example.com or +91 98..."
                          className="w-full px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                          Nature of Violation *
                        </label>
                        <select
                          value={violationType}
                          onChange={(e) => setViolationType(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald cursor-pointer"
                        >
                          <option value="Prohibited Goods">Prohibited Goods (Weapons, Drugs, Wildlife)</option>
                          <option value="Counterfeit Product">Counterfeit / Fake Replica Item</option>
                          <option value="Financial Fraud / Scammer">Potential Financial Fraud / Scammer</option>
                          <option value="Copyright or Trademark">Intellectual Property Infringement</option>
                          <option value="Defamatory or Abusive">Defamatory or Obscene Material</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                          Listing ID / URL / Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={listingRef}
                          onChange={(e) => setListingRef(e.target.value)}
                          placeholder="e.g. rio-101 or iPhone 15 Pro MVP Colony"
                          className="w-full px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-dark-muted mb-1">
                        Factual Grievance Details *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={complaintDetails}
                        onChange={(e) => setComplaintDetails(e.target.value)}
                        placeholder="Provide dates, description of violation, and basis for takedown request..."
                        className="w-full p-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-dark-text focus:outline-none focus:border-brand-emerald"
                      />
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-dark-card border border-dark-border text-[11px] text-dark-muted">
                      <AlertTriangle className="w-4 h-4 text-brand-amber shrink-0" />
                      <span>
                        Under Section 79 of IT Act 2000, filing a false or frivolous complaint may attract legal penalties.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-emerald to-brand-emeraldDark hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-brand-emerald/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Grievance to Nodal Officer</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border bg-dark-cardElevated/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-brand-emerald hover:bg-brand-emeraldDark text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
