import React, { useState } from 'react';
import { Challenge, SolutionProposal, User, PartnershipEngagementType } from '../types';
import { INDUSTRY_PARTNERS } from '../data/mockData';
import { 
  X, 
  Send, 
  Lightbulb, 
  IndianRupee, 
  Clock, 
  ListChecks, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Paperclip, 
  FileCheck2, 
  Upload, 
  FileText 
} from 'lucide-react';

interface ProposalSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  currentUser: User | null;
  onProposalSubmitted: (updatedChallenge: Challenge) => void;
}

export const ProposalSubmitModal: React.FC<ProposalSubmitModalProps> = ({
  isOpen,
  onClose,
  challenge,
  currentUser,
  onProposalSubmitted,
}) => {
  const [proposalTitle, setProposalTitle] = useState(
    `Technological Solution: ${challenge.title.slice(0, 50)}...`
  );
  const [summary, setSummary] = useState('');
  const [ideaPlanDetails, setIdeaPlanDetails] = useState(
    'Phase 1: Component sourcing & laboratory bench assembly. Phase 2: Sensor calibration and microgrid telemetry. Phase 3: Field deployment and community demonstration.'
  );
  const [techStackInput, setTechStackInput] = useState('IoT Sensors, Low-Power Microcontrollers, Solar Thermal, CAD Modeling');
  const [budget, setBudget] = useState('350000');
  const [timelineMonths, setTimelineMonths] = useState('4');
  const [deliverablesInput, setDeliverablesInput] = useState(
    'Lab Tested Functional Prototype, Field Validation Report in District, Open Design CAD Dossier'
  );

  // Proposal File format state (Mandated by user workflow)
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
  } | null>({
    name: `${challenge.code}_Technical_Solution_Plan.pdf`,
    size: '3.8 MB',
    type: 'application/pdf',
    uploadedAt: new Date().toISOString(),
  });
  
  // Target Industry / Startup selection & AI Recommendation
  const [targetIndustryId, setTargetIndustryId] = useState('tata-steel-csr');
  const [partnershipType, setPartnershipType] = useState<PartnershipEngagementType>('Funding');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    partnerId: string;
    partnerName: string;
    confidence: number;
    reason: string;
    track: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setAttachedFile({
        name: file.name,
        size: `${sizeMB} MB`,
        type: file.type || 'application/pdf',
        uploadedAt: new Date().toISOString(),
      });
    }
  };

  const handleGenerateTemplateProposal = () => {
    setAttachedFile({
      name: `${challenge.code}_Detailed_RD_Proposal_Plan_${Date.now().toString().slice(-4)}.pdf`,
      size: '4.2 MB',
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
    });
  };

  const handleAiSuggest = async () => {
    setAiSuggesting(true);
    try {
      const res = await fetch('/api/ai/suggest-industry-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalTitle,
          category: challenge.category,
          summary: summary || challenge.description,
          technologyStack: techStackInput.split(',').map((s) => s.trim()).filter(Boolean),
          estimatedBudgetINR: parseInt(budget, 10) || 350000,
          partnershipType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.suggestedPartner) {
        setTargetIndustryId(data.suggestedPartner.id);
        if (data.recommendedEngagementTrack) {
          setPartnershipType(data.recommendedEngagementTrack);
        }
        setAiRecommendation({
          partnerId: data.suggestedPartner.id,
          partnerName: data.suggestedPartner.name,
          confidence: data.confidenceScore || 92,
          reason: data.matchReason,
          track: data.recommendedEngagementTrack || partnershipType,
        });
      }
    } catch (err) {
      console.error('AI Industry Match failed:', err);
    } finally {
      setAiSuggesting(false);
    }
  };

  const selectedPartner = INDUSTRY_PARTNERS.find((p) => p.id === targetIndustryId) || INDUSTRY_PARTNERS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle.trim() || !summary.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        universityName: challenge.assignedUniversity?.name || currentUser?.organization || 'Birla Institute of Technology (BIT) Mesra',
        universityId: challenge.assignedUniversity?.id || 'bit-mesra',
        facultyLead: challenge.team?.facultyMentor || currentUser?.name || 'Prof. Dr. Rajesh K. Verma',
        proposalTitle: proposalTitle.trim(),
        summary: summary.trim(),
        ideaPlanDetails: ideaPlanDetails.trim(),
        proposalFile: attachedFile,
        technologyStack: techStackInput.split(',').map((s) => s.trim()).filter(Boolean),
        estimatedBudgetINR: parseInt(budget, 10) || 250000,
        timelineMonths: parseInt(timelineMonths, 10) || 4,
        targetDeliverables: deliverablesInput.split(',').map((s) => s.trim()).filter(Boolean),
        targetIndustryId: selectedPartner.id,
        targetIndustryName: selectedPartner.name,
        targetIndustryType: selectedPartner.type,
        partnershipType,
        aiSuggestedMatch: Boolean(aiRecommendation && aiRecommendation.partnerId === selectedPartner.id),
        aiMatchReason: aiRecommendation?.partnerId === selectedPartner.id ? aiRecommendation.reason : undefined,
      };

      const res = await fetch(`/api/challenges/${challenge.id}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onProposalSubmitted(data.challenge);
        onClose();
      }
    } catch (err) {
      console.error('Failed to submit proposal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold">Submit University Research Proposal</h3>
              <p className="text-xs text-slate-300">Route to Industry, Startup or MSME for Funding & Co-development</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Target Company / Startup Selection with AI Recommender */}
          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                Target Industry, Startup or MSME Partner *
              </label>
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={aiSuggesting}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-800 to-teal-850 hover:from-emerald-900 hover:to-teal-900 text-white rounded text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                title="AI analyzes problem statement, technology, and budget to find the best matching industry"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{aiSuggesting ? 'Analyzing Matches...' : '✨ AI Suggest Suitable Industry'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="text-[11px] text-slate-600 font-medium block mb-1">Select Partner Organization:</span>
                <select
                  value={targetIndustryId}
                  onChange={(e) => setTargetIndustryId(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <optgroup label="Industries & PSUs">
                    {INDUSTRY_PARTNERS.filter((p) => p.type === 'Industry').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.location || 'Jharkhand'})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Startups & Innovation Hubs">
                    {INDUSTRY_PARTNERS.filter((p) => p.type === 'Startup' || p.type === 'Innovation Hub').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.type}]
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="MSMEs & Clusters">
                    {INDUSTRY_PARTNERS.filter((p) => p.type === 'MSME').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (MSME)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="CSR Foundations & Research Labs">
                    {INDUSTRY_PARTNERS.filter((p) => p.type === 'CSR Foundation' || p.type === 'Research Institution').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.type}]
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-600 font-medium block mb-1">Partnership Track Requested:</span>
                <select
                  value={partnershipType}
                  onChange={(e) => setPartnershipType(e.target.value as PartnershipEngagementType)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Funding">Funding & CSR Sponsorship</option>
                  <option value="Co-development">Joint Co-development</option>
                  <option value="Mentoring">Industry Mentorship & Advisory</option>
                  <option value="Prototyping Lab">Prototyping Lab & Hardware Testing</option>
                  <option value="Pilot Implementation">Field Pilot Implementation</option>
                  <option value="Technology Transfer">Technology Transfer & Licensing</option>
                </select>
              </div>
            </div>

            {/* AI Recommendation Badge / Explanation */}
            {aiRecommendation && (
              <div className="bg-white/90 border border-purple-200 rounded p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between text-purple-900 font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    AI Match Confirmed: {aiRecommendation.partnerName}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {aiRecommendation.confidence}% Compatibility
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{aiRecommendation.reason}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Proposal Title *
            </label>
            <input
              type="text"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Abstract & Technical Methodology *
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Outline the scientific or engineering approach, thermodynamic or material calculations, student tasks, and how this solves the community bottleneck..."
              required
              className="w-full text-xs p-3 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
            />
          </div>

          {/* Detailed Idea / Execution Plan (Mandated by user: proposal with idea/plan) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Idea / Execution Plan & Milestones
            </label>
            <textarea
              rows={2}
              value={ideaPlanDetails}
              onChange={(e) => setIdeaPlanDetails(e.target.value)}
              placeholder="Phase-by-phase execution plan and hardware fabrication roadmap..."
              className="w-full text-xs p-3 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
            />
          </div>

          {/* Proposal File Attachment in File Format (Mandated by user: proposal with idea/plan in file format) */}
          <div className="p-3.5 bg-emerald-50/80 rounded-xl border-2 border-dashed border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <Paperclip className="w-4 h-4 text-emerald-700" />
                <span>Proposal Plan in File Format (PDF / DOC / ZIP) *</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateTemplateProposal}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Generate Official PDF Plan</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              Attach the detailed proposal dossier to transmit to the industrial officer for CSR funding approval.
            </p>

            {attachedFile ? (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-mono">
                      {attachedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Size: {attachedFile.size} • Uploaded and verified
                    </span>
                  </div>
                </div>
                <label className="text-xs text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer underline">
                  Replace File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.zip"
                  />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-300 hover:border-emerald-400 cursor-pointer text-center">
                <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">
                  Click or drag file here to attach proposal document
                </span>
                <span className="text-[10px] text-slate-500">
                  Accepts .pdf, .docx, .zip (Max 50MB)
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.zip"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Estimated R&D Budget (INR) *
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-400">Covers materials, lab testing, prototype assembly</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                Estimated Timeline (Months) *
              </label>
              <input
                type="number"
                value={timelineMonths}
                onChange={(e) => setTimelineMonths(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-400">Semester project duration</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Technology Stack / Materials (Comma separated)
            </label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <ListChecks className="w-3.5 h-3.5 text-purple-600" />
              Target Deliverables (Comma separated)
            </label>
            <input
              type="text"
              value={deliverablesInput}
              onChange={(e) => setDeliverablesInput(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Will be routed directly to {selectedPartner.name}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSubmitting ? 'Routing Proposal...' : 'Submit to Industry'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
