import React, { useState } from 'react';
import { Challenge, IndustryPledge, User } from '../types';
import { X, Building, IndianRupee, CheckCircle2, ShieldCheck, Handshake } from 'lucide-react';

interface IndustryPledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  currentUser: User | null;
  onPledgeSubmitted: (updatedChallenge: Challenge) => void;
}

export const IndustryPledgeModal: React.FC<IndustryPledgeModalProps> = ({
  isOpen,
  onClose,
  challenge,
  currentUser,
  onPledgeSubmitted,
}) => {
  const [partnerName, setPartnerName] = useState(
    currentUser?.organization || 'Tata Steel CSR & Technology Incubation Division'
  );
  const [partnerType, setPartnerType] = useState<'Industry' | 'Startup' | 'MSME' | 'CSR Foundation'>('CSR Foundation');
  const [supportType, setSupportType] = useState<'Co-development' | 'Mentorship' | 'CSR Grant' | 'Prototyping Lab' | 'Pilot Deployment'>('CSR Grant');
  const [pledgeAmount, setPledgeAmount] = useState('350000');
  const [contactPerson, setContactPerson] = useState(currentUser?.name || 'Sunil Murmu');
  const [email, setEmail] = useState(currentUser?.email || 'csr.innovate@tatasteel.com');
  const [notes, setNotes] = useState(
    'Committed to provide direct seed grant and access to fabrication workshops and pilot test sites.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !contactPerson.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        partnerName: partnerName.trim(),
        partnerType,
        supportType,
        pledgeAmountINR: supportType === 'CSR Grant' || supportType === 'Co-development' ? parseInt(pledgeAmount, 10) || 0 : 0,
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        notes: notes.trim(),
      };

      const res = await fetch(`/api/challenges/${challenge.id}/pledges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onPledgeSubmitted(data.challenge);
        onClose();
      }
    } catch (err) {
      console.error('Failed to submit industry pledge:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center gap-2.5">
            <Handshake className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold">Pledge Industry / CSR Partnership</h3>
              <p className="text-xs text-slate-300">Co-Funding, Mentorship & Field Deployment</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company / Organization Name *
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Partner Category
              </label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white"
              >
                <option value="CSR Foundation">CSR Foundation</option>
                <option value="Industry">Large Industry Enterprise</option>
                <option value="MSME">MSME Consortium</option>
                <option value="Startup">Technology Startup / Incubatee</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nature of Support *
              </label>
              <select
                value={supportType}
                onChange={(e) => setSupportType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white font-semibold text-emerald-900"
              >
                <option value="CSR Grant">Direct CSR Grant Funding</option>
                <option value="Co-development">Co-Development & Technical Staff</option>
                <option value="Mentorship">Industry Mentorship & Expert Guidance</option>
                <option value="Prototyping Lab">Lab Equipment / Fabrication Testing</option>
                <option value="Pilot Deployment">Field Pilot Testing & Market Access</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Pledged Amount (INR)
              </label>
              <input
                type="number"
                value={pledgeAmount}
                onChange={(e) => setPledgeAmount(e.target.value)}
                disabled={supportType === 'Mentorship'}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Collaboration Scope & Facility Access Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center gap-1.5"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recording Pledge...' : 'Confirm Partnership Pledge'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
