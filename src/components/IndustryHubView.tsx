import React, { useState } from 'react';
import { Challenge, User, IndustryPartnerOrg, SolutionProposal, PartnershipEngagementType } from '../types';
import { INDUSTRY_PARTNERS } from '../data/mockData';
import { 
  Building, 
  Building2,
  Handshake, 
  IndianRupee, 
  CheckCircle2, 
  XCircle,
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  MapPin, 
  GraduationCap,
  Briefcase,
  Rocket,
  Wrench,
  HeartHandshake,
  Check,
  X,
  Clock,
  Send,
  AlertCircle,
  Layers,
  FileCheck2,
  FileX2,
  Lightbulb,
  FileText,
  Paperclip,
  Download,
  CheckCircle,
  Eye
} from 'lucide-react';

interface IndustryHubViewProps {
  challenges: Challenge[];
  onSelectChallenge: (c: Challenge) => void;
  onOpenPledgeModal: (c: Challenge) => void;
  currentUser: User | null;
  onProposalDecisionUpdated?: (challenge: Challenge) => void;
}

export const IndustryHubView: React.FC<IndustryHubViewProps> = ({
  challenges,
  onSelectChallenge,
  onOpenPledgeModal,
  currentUser,
  onProposalDecisionUpdated,
}) => {
  const [challengesList, setChallengesList] = useState<Challenge[]>(challenges);
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [proposalScopeFilter, setProposalScopeFilter] = useState<'my_org' | 'all'>('my_org');
  const [selectedTrackTab, setSelectedTrackTab] = useState<string>('all');
  const [processingProposalId, setProcessingProposalId] = useState<string | null>(null);
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null);

  // Sync when prop updates
  React.useEffect(() => {
    setChallengesList(challenges);
  }, [challenges]);

  // Proposal Decision Modal state
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [activeChallengeForDecision, setActiveChallengeForDecision] = useState<Challenge | null>(null);
  const [activeProposalForDecision, setActiveProposalForDecision] = useState<SolutionProposal | null>(null);
  const [problemDecisionStatus, setProblemDecisionStatus] = useState<'accepted' | 'rejected'>('accepted');
  const [fundingDecisionStatus, setFundingDecisionStatus] = useState<'accepted' | 'rejected'>('accepted');
  const [approvedAmountINR, setApprovedAmountINR] = useState<string>('350000');
  const [supportTrack, setSupportTrack] = useState<string>('Co-development & Funding');
  const [evaluatorComments, setEvaluatorComments] = useState<string>('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState<string | null>(null);
  const [viewingPrototypeChallenge, setViewingPrototypeChallenge] = useState<Challenge | null>(null);

  // Extract all proposals across all challenges
  interface ProposalWithChallenge {
    proposal: SolutionProposal;
    challenge: Challenge;
  }

  const allProposalsWithChallenge: ProposalWithChallenge[] = challengesList.flatMap((c) =>
    (c.proposals || []).map((p) => ({
      proposal: p,
      challenge: c,
    }))
  );

  // Determine user organization matching
  const userOrgName = currentUser?.organization?.toLowerCase() || '';
  const isIndustrialRole = currentUser?.role === 'industry' || currentUser?.role === 'admin';

  // Filter proposals
  const filteredProposals = allProposalsWithChallenge.filter(({ proposal, challenge }) => {
    // If filtering by specific company dropdown
    if (partnerFilter !== 'all') {
      const matchTargetId = proposal.targetIndustryId === partnerFilter;
      const matchTargetName = proposal.targetIndustryName?.toLowerCase().includes(partnerFilter.toLowerCase());
      if (!matchTargetId && !matchTargetName) return false;
    }

    // If viewing "My Organization" only
    if (proposalScopeFilter === 'my_org' && userOrgName && isIndustrialRole && currentUser?.role === 'industry') {
      const targetMatch = proposal.targetIndustryName?.toLowerCase().includes(userOrgName) ||
        userOrgName.includes(proposal.targetIndustryName?.toLowerCase() || 'xyz');
      if (!targetMatch && proposal.targetIndustryName) return false;
    }

    return true;
  });

  const openDecisionModal = (challenge: Challenge, proposal: SolutionProposal, initialProblem?: 'accepted' | 'rejected', initialFunding?: 'accepted' | 'rejected') => {
    setActiveChallengeForDecision(challenge);
    setActiveProposalForDecision(proposal);
    setProblemDecisionStatus(initialProblem || proposal.problemDecision?.status || 'accepted');
    setFundingDecisionStatus(initialFunding || proposal.fundingDecision?.status || 'accepted');
    setApprovedAmountINR(proposal.grantAmountINR ? String(proposal.grantAmountINR) : String(proposal.estimatedBudgetINR || 350000));
    setSupportTrack(proposal.partnershipType || 'Funding');
    setEvaluatorComments(proposal.problemDecision?.comments || proposal.fundingDecision?.comments || '');
    setDecisionModalOpen(true);
    setDecisionSuccessMsg(null);
  };

  const handleQuickDecision = async (
    challenge: Challenge,
    proposal: SolutionProposal,
    type: 'problem' | 'funding',
    status: 'accepted' | 'rejected'
  ) => {
    const decidedBy = currentUser?.name || 'Industrial Evaluator';
    const partnerName = currentUser?.organization || proposal.targetIndustryName || 'Industry Partner';
    const actionKey = `${type}-${status}-${proposal.id}`;

    setProcessingProposalId(proposal.id);
    setActiveActionKey(actionKey);

    const now = new Date().toISOString();

    // 1. Optimistic Local Update
    const updatedProposals = (challenge.proposals || []).map((p) => {
      if (p.id === proposal.id) {
        const updatedP = { ...p };
        if (type === 'problem') {
          updatedP.problemDecision = {
            status,
            comments: status === 'accepted' ? 'Problem statement approved for corporate technical scope.' : 'Problem statement does not match current technical focus.',
            decidedBy,
            partnerName,
            decidedAt: now,
          };
          if (status === 'accepted' && updatedP.status === 'submitted') {
            updatedP.status = 'accepted_by_industry';
          } else if (status === 'rejected') {
            updatedP.status = 'rejected_by_industry';
          }
        } else {
          updatedP.fundingDecision = {
            status,
            approvedAmountINR: status === 'accepted' ? p.estimatedBudgetINR : 0,
            guaranteeAmountINR: status === 'accepted' ? p.estimatedBudgetINR : undefined,
            csrGuaranteeStatus: status === 'accepted' ? 'guaranteed' : 'rejected',
            supportType: p.partnershipType || 'CSR Grant',
            comments: status === 'accepted' ? `Funding approved as requested (₹${p.estimatedBudgetINR.toLocaleString('en-IN')}).` : 'Funding request declined at this time.',
            decidedBy,
            partnerName,
            decidedAt: now,
          };
          if (status === 'accepted') {
            updatedP.status = 'funding_approved';
            updatedP.grantAmountINR = p.estimatedBudgetINR;
            updatedP.sponsoredBy = partnerName;
          } else {
            updatedP.status = 'funding_rejected';
          }
        }
        return updatedP;
      }
      return p;
    });

    const isNowFundingApproved = type === 'funding' && status === 'accepted';
    const updatedChallenge: Challenge = {
      ...challenge,
      status: isNowFundingApproved ? 'prototype_development' : challenge.status,
      proposals: updatedProposals,
    };

    setChallengesList((prev) => prev.map((c) => (c.id === challenge.id ? updatedChallenge : c)));
    if (onProposalDecisionUpdated) {
      onProposalDecisionUpdated(updatedChallenge);
    }
    setDecisionSuccessMsg(`Decision updated: ${type.toUpperCase()} ${status.toUpperCase()} recorded successfully!`);

    const payload: any = {};
    if (type === 'problem') {
      payload.problemDecision = {
        status,
        comments: status === 'accepted' ? 'Problem statement approved for corporate technical scope.' : 'Problem statement does not match current technical focus.',
        decidedBy,
        partnerName,
      };
    } else {
      payload.fundingDecision = {
        status,
        approvedAmountINR: status === 'accepted' ? proposal.estimatedBudgetINR : 0,
        supportType: proposal.partnershipType || 'CSR Grant',
        comments: status === 'accepted' ? `Funding approved as requested (₹${proposal.estimatedBudgetINR.toLocaleString('en-IN')}).` : 'Funding request declined at this time.',
        decidedBy,
        partnerName,
      };
    }

    try {
      const res = await fetch(`/api/challenges/${challenge.id}/proposals/${proposal.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        setChallengesList((prev) => prev.map((c) => (c.id === data.challenge.id ? data.challenge : c)));
        if (onProposalDecisionUpdated) {
          onProposalDecisionUpdated(data.challenge);
        }
      }
    } catch (err) {
      console.error('Quick decision error:', err);
    } finally {
      setProcessingProposalId(null);
      setActiveActionKey(null);
      setTimeout(() => setDecisionSuccessMsg(null), 4000);
    }
  };

  // Guarantee CSR Fund Option (Mandated by user workflow)
  const handleGuaranteeCSRFund = async (challenge: Challenge, proposal: SolutionProposal) => {
    const decidedBy = currentUser?.name || 'Corporate CSR Officer';
    const partnerName = currentUser?.organization || proposal.targetIndustryName || 'Corporate CSR Foundation';
    const grantAmount = proposal.estimatedBudgetINR || 350000;
    const sanctionRef = `CSR-JH-2026-${(proposal.targetIndustryId || 'CORP').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const actionKey = `guarantee-${proposal.id}`;

    setProcessingProposalId(proposal.id);
    setActiveActionKey(actionKey);

    const now = new Date().toISOString();

    // 1. Optimistic Local Update
    const updatedProposals = (challenge.proposals || []).map((p) => {
      if (p.id === proposal.id) {
        return {
          ...p,
          status: 'funding_approved' as const,
          grantAmountINR: grantAmount,
          sponsoredBy: partnerName,
          problemDecision: {
            status: 'accepted' as const,
            comments: 'Problem statement accepted for corporate technology sponsorship and field deployment.',
            decidedBy,
            partnerName,
            decidedAt: now,
          },
          fundingDecision: {
            status: 'accepted' as const,
            approvedAmountINR: grantAmount,
            guaranteeAmountINR: grantAmount,
            csrGuaranteeStatus: 'guaranteed' as const,
            csrSanctionRef: sanctionRef,
            supportType: 'Funding',
            comments: `Guaranteed CSR Grant of ₹${grantAmount.toLocaleString('en-IN')} officially sanctioned under Ref ${sanctionRef}. Returned to university to begin laboratory prototyping immediately.`,
            decidedBy,
            partnerName,
            decidedAt: now,
          },
        };
      }
      return p;
    });

    const updatedChallenge: Challenge = {
      ...challenge,
      status: 'prototype_development',
      proposals: updatedProposals,
      comments: [
        ...(challenge.comments || []),
        {
          id: `c-${Date.now()}`,
          authorId: 'ind-csr-officer',
          authorName: decidedBy,
          authorRole: 'industry',
          authorOrg: partnerName,
          message: `CSR Fund Officially Guaranteed: ₹${grantAmount.toLocaleString('en-IN')} under Sanction Ref [${sanctionRef}]. Project returned to ${proposal.universityName} to begin laboratory prototyping.`,
          createdAt: now,
          isOfficialNote: true,
        },
      ],
    };

    setChallengesList((prev) => prev.map((c) => (c.id === challenge.id ? updatedChallenge : c)));
    if (onProposalDecisionUpdated) {
      onProposalDecisionUpdated(updatedChallenge);
    }
    setDecisionSuccessMsg(`🎉 CSR Fund Guarantee sanctioned for ₹${grantAmount.toLocaleString('en-IN')} (Ref: ${sanctionRef})! Project returned to ${proposal.universityName} for prototyping.`);

    const payload = {
      problemDecision: {
        status: 'accepted',
        comments: 'Problem statement accepted for corporate technology sponsorship and field deployment.',
        decidedBy,
        partnerName,
      },
      fundingDecision: {
        status: 'accepted',
        approvedAmountINR: grantAmount,
        guaranteeAmountINR: grantAmount,
        csrSanctionRef: sanctionRef,
        supportType: 'Funding',
        comments: `Guaranteed CSR Grant of ₹${grantAmount.toLocaleString('en-IN')} officially sanctioned under Ref ${sanctionRef}. Returned to university to begin laboratory prototyping immediately.`,
        decidedBy,
        partnerName,
      },
    };

    try {
      const res = await fetch(`/api/challenges/${challenge.id}/proposals/${proposal.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        setChallengesList((prev) => prev.map((c) => (c.id === data.challenge.id ? data.challenge : c)));
        if (onProposalDecisionUpdated) {
          onProposalDecisionUpdated(data.challenge);
        }
      }
    } catch (err) {
      console.error('CSR Guarantee error:', err);
    } finally {
      setProcessingProposalId(null);
      setActiveActionKey(null);
      setTimeout(() => setDecisionSuccessMsg(null), 6000);
    }
  };

  // Reset decision for testing/re-evaluation
  const handleResetDecision = async (challenge: Challenge, proposal: SolutionProposal) => {
    const actionKey = `reset-${proposal.id}`;
    setProcessingProposalId(proposal.id);
    setActiveActionKey(actionKey);

    const updatedProposals = (challenge.proposals || []).map((p) => {
      if (p.id === proposal.id) {
        return {
          ...p,
          status: 'submitted' as const,
          problemDecision: undefined,
          fundingDecision: undefined,
          grantAmountINR: undefined,
          sponsoredBy: undefined,
        };
      }
      return p;
    });

    const updatedChallenge: Challenge = {
      ...challenge,
      status: 'proposal_submitted',
      proposals: updatedProposals,
    };

    setChallengesList((prev) => prev.map((c) => (c.id === challenge.id ? updatedChallenge : c)));
    if (onProposalDecisionUpdated) {
      onProposalDecisionUpdated(updatedChallenge);
    }

    try {
      const res = await fetch(`/api/challenges/${challenge.id}/proposals/${proposal.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemDecision: { status: 'pending', comments: 'Decision reset for re-evaluation', decidedBy: currentUser?.name || 'Evaluator', partnerName: currentUser?.organization || 'Partner' },
          fundingDecision: { status: 'pending', comments: 'Funding reset for re-evaluation', decidedBy: currentUser?.name || 'Evaluator', partnerName: currentUser?.organization || 'Partner' },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        setChallengesList((prev) => prev.map((c) => (c.id === data.challenge.id ? data.challenge : c)));
        if (onProposalDecisionUpdated) {
          onProposalDecisionUpdated(data.challenge);
        }
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setProcessingProposalId(null);
      setActiveActionKey(null);
      setDecisionSuccessMsg('Proposal decision reset to pending review.');
      setTimeout(() => setDecisionSuccessMsg(null), 3000);
    }
  };

  // Verify and Accept Deployed Prototype from University (Mandated by user workflow)
  const handleVerifyPrototype = async (challenge: Challenge) => {
    const reviewerName = currentUser?.name || 'Industrial Officer';
    const orgName = currentUser?.organization || 'Corporate Verification Division';
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/verify-prototype`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifiedBy: reviewerName,
          industryName: orgName,
          feedback: 'Prototype deliverable package verified against field requirements and industrial specifications.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        setChallengesList((prev) => prev.map((c) => (c.id === data.challenge.id ? data.challenge : c)));
        if (onProposalDecisionUpdated) {
          onProposalDecisionUpdated(data.challenge);
        }
        setDecisionSuccessMsg(`✅ Prototype deliverable for [${challenge.code}] verified and accepted into industrial deployment!`);
        setTimeout(() => setDecisionSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Verify prototype error:', err);
    }
  };

  const handleSubmitFormalDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChallengeForDecision || !activeProposalForDecision) return;

    setIsSubmittingDecision(true);
    try {
      const decidedBy = currentUser?.name || 'Industrial Administrator';
      const partnerName = currentUser?.organization || activeProposalForDecision.targetIndustryName || 'Industrial Partner Org';

      const payload = {
        problemDecision: {
          status: problemDecisionStatus,
          comments: evaluatorComments || (problemDecisionStatus === 'accepted' ? 'Problem statement approved.' : 'Problem statement declined.'),
          decidedBy,
          partnerName,
        },
        fundingDecision: {
          status: fundingDecisionStatus,
          approvedAmountINR: fundingDecisionStatus === 'accepted' ? parseInt(approvedAmountINR, 10) || 0 : 0,
          supportType: supportTrack,
          comments: evaluatorComments || (fundingDecisionStatus === 'accepted' ? 'Funding approved.' : 'Funding declined.'),
          decidedBy,
          partnerName,
        },
      };

      const res = await fetch(
        `/api/challenges/${activeChallengeForDecision.id}/proposals/${activeProposalForDecision.id}/decision`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        if (onProposalDecisionUpdated) {
          onProposalDecisionUpdated(data.challenge);
        }
        setDecisionModalOpen(false);
        setDecisionSuccessMsg(`Formal evaluation saved for "${activeProposalForDecision.proposalTitle}"!`);
        setTimeout(() => setDecisionSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Formal decision submission error:', err);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Filter challenges for the lower marketplace
  const relevantChallenges = challengesList.filter((c) => {
    if (selectedTrackTab === 'all') return true;
    if (selectedTrackTab === 'has_proposals') return (c.proposals || []).length > 0;
    if (selectedTrackTab === 'seeking_funding') {
      const hasFunding = (c.industryPartners || []).some((p) => (p.pledgeAmountINR || 0) > 0);
      return !hasFunding && (c.proposals || []).length > 0;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6" id="industry-csr-hub-view">
      {/* Top Banner & Dedicated Industrial Officer Workstation Console */}
      <div className="bg-gradient-to-r from-[#2a1705] via-[#3a220a] to-[#002855] text-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-lg space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
              <Building2 className="w-3.5 h-3.5" />
              Corporate CSR, Startups & Industrial R&D Marketplace
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Industrial Officer & Corporate Collaboration Desk
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-3xl leading-relaxed">
              Fulfill Schedule VII CSR mandates, acquire breakthrough academic IP, and mentor student innovators. Review incoming university proposals, approve or decline problem statements, and sponsor grassroots R&D across Jharkhand.
            </p>
          </div>

          {/* Dedicated Industrial Officer Identity Panel */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-amber-400/30 text-xs space-y-2.5 min-w-[280px] sm:min-w-[340px] shadow-sm">
            <div className="flex items-center justify-between border-b border-white/15 pb-2">
              <span className="font-extrabold text-amber-300 text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Corporate Officer Identity</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                Desk Verified
              </span>
            </div>

            <div>
              <span className="text-[10px] text-amber-200/80 font-semibold block uppercase">Company / Enterprise</span>
              <p className="font-black text-white text-sm sm:text-base leading-tight">
                {currentUser?.organization || 'Tata Steel CSR & Technology Incubation'}
              </p>
            </div>

            <div className="bg-black/30 p-2.5 rounded-lg border border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[9px] text-amber-200/75 block uppercase font-medium">Officer Logging in as Company:</span>
                <span className="font-extrabold text-white text-xs block">
                  {currentUser?.name || 'S. Murmu'}
                </span>
                <span className="text-[10px] text-amber-300 font-semibold block">
                  {currentUser?.designation || 'Head of CSR & Technical Incubation'}
                </span>
              </div>
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-1 rounded text-right shrink-0">
                Corporate Signatory
              </span>
            </div>
          </div>
        </div>

        {/* Corporate Officer Action Bar */}
        <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-amber-200 font-bold text-[11px]">Quick Corporate Actions:</span>
            <button
              type="button"
              onClick={() => {
                setProposalScopeFilter('my_org');
                const el = document.getElementById('university-proposals-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                proposalScopeFilter === 'my_org'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Proposals Sent to My Company</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setProposalScopeFilter('all');
                const el = document.getElementById('university-proposals-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                proposalScopeFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All State Proposals</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-amber-200 font-medium">
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct MoU Authorization</span>
            </span>
            <span className="flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
              <span>Schedule VII CSR Tax Exemption</span>
            </span>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {decisionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{decisionSuccessMsg}</span>
        </div>
      )}

      {/* 6 Key Engagement Tracks for Industry */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-center space-y-1">
          <HeartHandshake className="w-5 h-5 text-amber-600 mx-auto" />
          <span className="text-xs font-bold text-slate-900 block">Mentoring</span>
          <span className="text-[10px] text-slate-500 block">Expert Guidance</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-center space-y-1">
          <Briefcase className="w-5 h-5 text-blue-600 mx-auto" />
          <span className="text-xs font-bold text-slate-900 block">Co-Development</span>
          <span className="text-[10px] text-slate-500 block">Joint Engineering</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-center space-y-1">
          <IndianRupee className="w-5 h-5 text-emerald-600 mx-auto" />
          <span className="text-xs font-bold text-slate-900 block">CSR Funding</span>
          <span className="text-[10px] text-slate-500 block">R&D Seed Grants</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-center space-y-1">
          <Wrench className="w-5 h-5 text-purple-600 mx-auto" />
          <span className="text-xs font-bold text-slate-900 block">Prototyping Lab</span>
          <span className="text-[10px] text-slate-500 block">FabLab & Tooling</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-center space-y-1">
          <Rocket className="w-5 h-5 text-orange-600 mx-auto" />
          <span className="text-xs font-bold text-slate-900 block">Pilot Deployment</span>
          <span className="text-[10px] text-slate-500 block">District Field Testing</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-center space-y-1">
          <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto" />
          <span className="text-xs font-bold text-slate-900 block">Tech Transfer</span>
          <span className="text-[10px] text-slate-500 block">Patent & Licensing</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CORE WORKFLOW: INCOMING UNIVERSITY PROPOSALS FOR APPROVAL & FUNDING       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-700" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Incoming University Research Proposals for Industrial Review & Funding
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Universities submit formal proposals routed to specific companies or AI-matched partners. Evaluate and record: <strong>Accept / Reject Problem</strong> and <strong>Accept / Reject Funding</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Toggle: My Org vs All */}
            <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setProposalScopeFilter('my_org')}
                className={`px-3 py-1 font-bold rounded-md transition-colors cursor-pointer ${
                  proposalScopeFilter === 'my_org'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Routed to My Company
              </button>
              <button
                type="button"
                onClick={() => setProposalScopeFilter('all')}
                className={`px-3 py-1 font-bold rounded-md transition-colors cursor-pointer ${
                  proposalScopeFilter === 'all'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All State Proposals ({allProposalsWithChallenge.length})
              </button>
            </div>

            {/* Partner Dropdown Filter */}
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800"
            >
              <option value="all">All Target Companies</option>
              {INDUSTRY_PARTNERS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Proposals List */}
        {filteredProposals.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
            <Lightbulb className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No proposals matching current filter</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Switch filter to "All State Proposals" or select another company from the dropdown to review submissions from universities.
            </p>
            <button
              onClick={() => { setProposalScopeFilter('all'); setPartnerFilter('all'); }}
              className="mt-2 text-xs font-bold text-blue-700 hover:underline"
            >
              View all {allProposalsWithChallenge.length} proposals
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map(({ proposal, challenge }) => {
              const problemStatus = proposal.problemDecision?.status;
              const fundingStatus = proposal.fundingDecision?.status;
              const isProblemAccepted = problemStatus === 'accepted';
              const isProblemRejected = problemStatus === 'rejected';
              const isFundingAccepted = fundingStatus === 'accepted';
              const isFundingRejected = fundingStatus === 'rejected';

              return (
                <div
                  key={proposal.id}
                  className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 p-5 shadow-xs transition-all space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {challenge.code}
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {challenge.category}
                        </span>
                        <span className="text-xs text-purple-900 font-bold bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                          Submitted by: {proposal.universityName}
                        </span>
                        {proposal.targetIndustryName && (
                          <span className="text-xs text-blue-900 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                            <Building className="w-3 h-3 text-blue-600" />
                            Target: {proposal.targetIndustryName}
                          </span>
                        )}
                      </div>

                      {/* Title and Summary */}
                      <h4
                        onClick={() => onSelectChallenge(challenge)}
                        className="text-base font-bold text-slate-900 hover:text-[#003366] cursor-pointer"
                      >
                        {proposal.proposalTitle}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">{proposal.summary}</p>

                      {/* University Idea & Plan Details */}
                      {proposal.ideaPlanDetails && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
                          <span className="font-bold text-amber-950 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                            University Implementation Idea & Plan:
                          </span>
                          <p className="text-slate-700 font-sans leading-relaxed whitespace-pre-line text-[11px]">
                            {proposal.ideaPlanDetails}
                          </p>
                        </div>
                      )}

                      {/* Attached Solution Plan File (File Format Mandated by User) */}
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {proposal.proposalFile?.name || `${challenge.code}_Technical_Solution_Plan.pdf`}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {proposal.proposalFile?.size || '1.8 MB'} • Formal Proposal File Format
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setDecisionSuccessMsg(`Viewing / Downloading dossier: ${proposal.proposalFile?.name || `${challenge.code}_Technical_Solution_Plan.pdf`}`);
                            setTimeout(() => setDecisionSuccessMsg(null), 3500);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 rounded text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-700" />
                          <span>Inspect Proposal Dossier</span>
                        </button>
                      </div>

                      {/* AI Recommender Badge if AI matched */}
                      {proposal.aiSuggestedMatch && (
                        <div className="bg-purple-50 border border-purple-200 rounded-md p-2 text-xs flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-purple-950">
                              AI Innovation Recommendation (94% Compatibility):
                            </span>
                            <p className="text-[11px] text-purple-900 mt-0.5 font-sans">
                              {proposal.aiMatchReason || 'AI matched this university proposal with your corporate technology and CSR mandate based on domain alignment and field pilot viability.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Technical Specs & Budget */}
                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1 text-slate-700">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Requested Budget: ₹{proposal.estimatedBudgetINR.toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-500 font-medium">
                          Lead PI: <strong className="text-slate-800">{proposal.facultyLead}</strong>
                        </span>
                        <span className="text-slate-500 font-medium">
                          Timeline: <strong>{proposal.timelineMonths} Months</strong>
                        </span>
                        <span className="text-slate-500 font-medium">
                          Track: <strong className="text-indigo-900 font-bold">{proposal.partnershipType || 'Funding & CSR'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Right Decision State / Action Controls - Sequential Industrial Workflow */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 lg:w-96 flex-shrink-0 space-y-3.5" id={`decision-desk-${proposal.id}`}>
                      <div className="border-b border-slate-200 pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[#003366]" />
                            Industrial Officer Decision Desk
                          </span>
                          {(isProblemAccepted || isProblemRejected || isFundingAccepted || isFundingRejected) && (
                            <button
                              type="button"
                              disabled={processingProposalId === proposal.id}
                              onClick={() => handleResetDecision(challenge, proposal)}
                              className="text-[10px] text-slate-500 hover:text-rose-600 underline font-semibold cursor-pointer"
                              title="Reset options to pending"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Follow the sequential evaluation workflow for this problem statement
                        </p>
                      </div>

                      {/* Status Badges Summary */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Problem Idea:</span>
                          {isProblemAccepted ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[11px] flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" /> Accepted
                            </span>
                          ) : isProblemRejected ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-900 rounded font-bold text-[11px] flex items-center gap-1">
                              <X className="w-3 h-3 text-red-700" /> Declined
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold text-[11px]">
                              Pending Review
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">CSR Fund Guarantee:</span>
                          {isFundingAccepted ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[11px] flex items-center gap-1">
                              <IndianRupee className="w-3 h-3 text-emerald-700" /> Guaranteed
                            </span>
                          ) : isFundingRejected ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-900 rounded font-bold text-[11px] flex items-center gap-1">
                              <X className="w-3 h-3 text-red-700" /> Declined
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded font-bold text-[11px]">
                              {isProblemAccepted ? 'Ready to Guarantee' : 'Awaiting Step 1'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* STEP 1: FIRST OF ALL - ACCEPT THE PROBLEM IDEA AND DECLINE THE PROBLEM IDEA */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#003366] text-white text-[10px] inline-flex items-center justify-center font-bold">1</span>
                            <span>Problem Idea Decision</span>
                          </span>
                          {isProblemAccepted && (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Step 1 Accepted
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Button 1: Accept the problem idea */}
                          <button
                            type="button"
                            id={`btn-accept-idea-${proposal.id}`}
                            disabled={processingProposalId === proposal.id}
                            onClick={() => handleQuickDecision(challenge, proposal, 'problem', 'accepted')}
                            className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                              isProblemAccepted
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 hover:border-emerald-500'
                            } disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                            {processingProposalId === proposal.id && activeActionKey === `problem-accepted-${proposal.id}` ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isProblemAccepted ? (
                              <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                            )}
                            <span className="leading-tight">{isProblemAccepted ? 'Problem Idea Accepted' : 'Accept the problem idea'}</span>
                          </button>

                          {/* Button 2: Decline the problem idea */}
                          <button
                            type="button"
                            id={`btn-decline-idea-${proposal.id}`}
                            disabled={processingProposalId === proposal.id}
                            onClick={() => handleQuickDecision(challenge, proposal, 'problem', 'rejected')}
                            className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                              isProblemRejected
                                ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                                : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-300 hover:border-rose-500'
                            } disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                            {processingProposalId === proposal.id && activeActionKey === `problem-rejected-${proposal.id}` ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isProblemRejected ? (
                              <X className="w-3.5 h-3.5 shrink-0 text-white" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            )}
                            <span className="leading-tight">{isProblemRejected ? 'Problem Idea Declined' : 'Decline the problem idea'}</span>
                          </button>
                        </div>
                      </div>

                      {/* STEP 2: AFTER THIS, ONE MORE BUTTON: ACCEPT AND GUARANTEE CSR FUND */}
                      <div className="space-y-2 pt-1 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#003366] text-white text-[10px] inline-flex items-center justify-center font-bold">2</span>
                            <span>CSR Fund Guarantee</span>
                          </span>
                          {isFundingAccepted && (
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Step 2 Complete
                            </span>
                          )}
                        </div>

                        {/* Prompt when Step 1 is accepted */}
                        {isProblemAccepted && !isFundingAccepted && (
                          <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5 animate-pulse">
                            <span>👉 Step 1 Complete! Now proceed to next button:</span>
                          </div>
                        )}

                        {/* Notice when Step 1 is still pending */}
                        {!isProblemAccepted && !isProblemRejected && (
                          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                            <div className="font-semibold text-slate-700 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>Sequential Workflow Requirement:</span>
                            </div>
                            <p className="text-slate-500 leading-tight">
                              Please click <strong>Accept the problem idea</strong> in Step 1 first, then proceed to the button below to guarantee CSR funds.
                            </p>
                          </div>
                        )}

                        {/* If Step 1 was declined */}
                        {isProblemRejected && (
                          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800">
                            <p className="leading-tight">
                              Problem idea was declined. CSR fund guarantee is unavailable.
                            </p>
                          </div>
                        )}

                        {/* Button or State for CSR Guarantee */}
                        {isFundingAccepted ? (
                          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                                CSR Fund Guaranteed
                              </span>
                              {proposal.fundingDecision?.csrSanctionRef && (
                                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                  {proposal.fundingDecision.csrSanctionRef}
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-bold text-emerald-800">
                              Grant Sanctioned: ₹{(proposal.fundingDecision?.guaranteeAmountINR || proposal.grantAmountINR || proposal.estimatedBudgetINR).toLocaleString('en-IN')}
                            </div>
                            <p className="text-[11px] text-emerald-700 leading-snug">
                              Guaranteed to <strong>{proposal.universityName}</strong>. University can now develop and deploy prototype.
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            id={`btn-guarantee-csr-${proposal.id}`}
                            disabled={processingProposalId === proposal.id || !isProblemAccepted || isProblemRejected}
                            onClick={() => handleGuaranteeCSRFund(challenge, proposal)}
                            className={`w-full py-2.5 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 border transition-all cursor-pointer shadow-xs active:scale-[0.99] ${
                              isProblemAccepted
                                ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white border-emerald-500 shadow-md ring-2 ring-emerald-300 animate-in fade-in'
                                : 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed opacity-60'
                            } disabled:cursor-not-allowed`}
                          >
                            {processingProposalId === proposal.id && activeActionKey === `guarantee-${proposal.id}` ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Sanctioning CSR Fund...</span>
                              </>
                            ) : (
                              <>
                                <IndianRupee className="w-4 h-4 shrink-0" />
                                <span>Accept and guarantee CSR fund (₹{(proposal.estimatedBudgetINR || 350000).toLocaleString('en-IN')})</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Detailed Review & Terms Button */}
                      <button
                        type="button"
                        onClick={() => openDecisionModal(challenge, proposal)}
                        className="w-full py-1.5 text-[11px] font-bold text-[#003366] bg-blue-50/80 hover:bg-blue-100 border border-blue-200 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Formal Review Remarks & Sanction Terms →</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deployed Prototypes from Universities (Direct Industrial Handover & Field Verification) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Deployed Prototypes Awaiting Industrial Handover & Field Verification
                {challenges.filter((c) => Boolean(c.prototypeDeliverable) || c.status === 'deployed').length > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-xs font-black rounded-full">
                    {challenges.filter((c) => Boolean(c.prototypeDeliverable) || c.status === 'deployed').length} Ready
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Functional technological prototypes and deliverable file packages formally submitted by university teams for industrial deployment
              </p>
            </div>
          </div>
        </div>

        {challenges.filter((c) => Boolean(c.prototypeDeliverable) || c.status === 'deployed').length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
            <Rocket className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No Deployed Prototypes in Queue</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Once universities accept CSR fund guarantees and complete laboratory development, their functional prototypes, technical deliverables, and deployment file packages will appear here for industrial verification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {challenges
              .filter((c) => Boolean(c.prototypeDeliverable) || c.status === 'deployed')
              .map((challenge) => {
                const deliverable = challenge.prototypeDeliverable;
                const isVerified = deliverable?.status === 'verified_by_industry' || Boolean(deliverable?.verifiedByIndustry?.verified);

                return (
                  <div
                    key={challenge.id}
                    className="p-4 bg-gradient-to-br from-white to-emerald-50/20 border-2 border-emerald-200 rounded-xl shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#003366] text-white text-[11px] font-mono font-bold rounded">
                            {challenge.code}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            Submitted by {challenge.assignedUniversity?.name || 'Partner University'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {deliverable?.title || `${challenge.title} — Working Prototype`}
                        </h4>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Problem Statement: <strong>{challenge.title}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-bold text-xs rounded-full">
                          {deliverable?.version || 'v1.0-FieldReady'}
                        </span>
                        {isVerified ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full inline-flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                            Industrial Verified
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full">
                            Pending Industrial Verification
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Deliverable Specifications & Testing Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-800 block">Technical & Hardware Specifications:</span>
                        <p className="text-slate-600 font-sans">
                          {deliverable?.specifications && deliverable.specifications.length > 0
                            ? deliverable.specifications.join(' • ')
                            : deliverable?.description || 'Fabricated PCB, microcontroller firmware, IoT sensor telemetry module, and local mesh communication bridge.'}
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-800 block">Lab & Field Validation Results:</span>
                        <p className="text-slate-600 font-sans">
                          {deliverable?.testResultsSummary || 'Completed 120-hour continuous bench stress testing with 99.4% telemetry accuracy under simulated field conditions.'}
                        </p>
                      </div>
                    </div>

                    {/* Attached Deliverable Package File (File Format Mandated by User) */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {deliverable?.deliverableFile?.name || `${challenge.code}_Functional_Prototype_Deliverable.zip`}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {deliverable?.deliverableFile?.size || '14.2 MB Archive'} • Production Firmware & CAD Blueprints
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Option to View the Deployed Prototype */}
                        <button
                          type="button"
                          id={`btn-view-prototype-${challenge.id}`}
                          onClick={() => setViewingPrototypeChallenge(challenge)}
                          className="px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                          <span>View Deployed Prototype</span>
                        </button>

                        {/* Download Package */}
                        <button
                          type="button"
                          onClick={() => {
                            setDecisionSuccessMsg(`Downloading Prototype Package: ${deliverable?.deliverableFile?.name || `${challenge.code}_Functional_Prototype_Deliverable.zip`}`);
                            setTimeout(() => setDecisionSuccessMsg(null), 3500);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span>Download Deliverable</span>
                        </button>

                        {/* Option to Accept the Deployed Prototype */}
                        {!isVerified ? (
                          <button
                            type="button"
                            id={`btn-accept-prototype-${challenge.id}`}
                            onClick={() => handleVerifyPrototype(challenge)}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-black inline-flex items-center gap-1.5 shadow-xs cursor-pointer ring-2 ring-emerald-300 transition-transform active:scale-95"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Accept Deployed Prototype</span>
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-lg text-xs font-black inline-flex items-center gap-1.5 shadow-2xs">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Complete & Deployed (Status: End)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Active Corporate Partners Roster */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Leading Industry & CSR Partners Active in Jharkhand
            </h3>
            <p className="text-xs text-slate-500">
              Corporations and organizations supporting the State Societal Innovation Fund under NEP 2020
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
            {INDUSTRY_PARTNERS.length} Partners Registered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INDUSTRY_PARTNERS.map((partner: IndustryPartnerOrg) => (
            <div
              key={partner.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between hover:border-amber-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                    {partner.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{partner.location}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-1.5">{partner.name}</h4>
                <span className="text-[11px] text-amber-800 font-semibold block">{partner.sector}</span>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{partner.csrFocusAreas.join(', ')}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">Total Contribution:</span>
                <span className="font-bold text-emerald-700">
                  ₹{(partner.committedFundingINR / 100000).toFixed(1)}L
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges Marketplace */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Grassroot Challenges & University Proposals Seeking Industry Co-Funding
            </h3>
            <p className="text-xs text-slate-500">
              Directly sponsor university student-faculty prototypes or offer fabrication equipment
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedTrackTab('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                selectedTrackTab === 'all'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Challenges
            </button>
            <button
              onClick={() => setSelectedTrackTab('has_proposals')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                selectedTrackTab === 'has_proposals'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              With Formal HEI Proposal
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {relevantChallenges.map((challenge) => {
            const hasPledges = (challenge.industryPartners || []).length > 0;
            const latestProposal = challenge.proposals?.[0];

            return (
              <div
                key={challenge.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {challenge.code}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {challenge.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      {challenge.district}
                    </span>
                  </div>

                  <h4
                    onClick={() => onSelectChallenge(challenge)}
                    className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#003366] cursor-pointer"
                  >
                    {challenge.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2">{challenge.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                    {challenge.assignedUniversity ? (
                      <span className="flex items-center gap-1 text-purple-900 font-semibold">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                        {challenge.assignedUniversity.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Matching HEI...</span>
                    )}

                    {latestProposal && (
                      <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Proposal Budget: ₹{latestProposal.estimatedBudgetINR.toLocaleString('en-IN')}
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      ~{challenge.estimatedImpactPeople.toLocaleString('en-IN')} Beneficiaries
                    </span>
                  </div>

                  {hasPledges && (
                    <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded border border-amber-200/60 inline-flex items-center gap-2">
                      <Handshake className="w-3.5 h-3.5 text-amber-700" />
                      <span>
                        Pledged by <strong>{challenge.industryPartners.map((p) => p.partnerName).join(', ')}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto flex-shrink-0">
                  <button
                    onClick={() => onOpenPledgeModal(challenge)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Handshake className="w-4 h-4" />
                    <span>Pledge Partnership / CSR Grant</span>
                  </button>

                  <button
                    onClick={() => onSelectChallenge(challenge)}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs text-center transition-colors"
                  >
                    View Technical Brief & Proposals
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORMAL PROPOSAL EVALUATION MODAL (ACCEPT/REJECT PROBLEM & FUNDING)        */}
      {/* ========================================================================= */}
      {decisionModalOpen && activeChallengeForDecision && activeProposalForDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#003366] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">Industrial Proposal Evaluation & CSR Decision Desk</h3>
              </div>
              <button onClick={() => setDecisionModalOpen(false)} className="text-slate-300 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFormalDecision} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">{activeProposalForDecision.proposalTitle}</span>
                <span className="text-slate-500 text-[11px] block">
                  Institution: <strong>{activeProposalForDecision.universityName}</strong> • Lead: {activeProposalForDecision.facultyLead}
                </span>
                <span className="text-emerald-800 text-[11px] font-bold block">
                  Requested Budget: ₹{activeProposalForDecision.estimatedBudgetINR.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Option 1: Problem Statement Accept / Reject */}
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 space-y-2">
                <label className="font-bold text-slate-800 block">
                  Option 1: Problem Statement Technical Fit *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProblemDecisionStatus('accepted')}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      problemDecisionStatus === 'accepted'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Problem</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProblemDecisionStatus('rejected')}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      problemDecisionStatus === 'rejected'
                        ? 'bg-red-700 text-white border-red-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Problem</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Funding Accept / Reject */}
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 space-y-2.5">
                <label className="font-bold text-slate-800 block">
                  Option 2: Corporate Funding Decision *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFundingDecisionStatus('accepted')}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      fundingDecisionStatus === 'accepted'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <IndianRupee className="w-4 h-4" />
                    <span>Accept Funding</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFundingDecisionStatus('rejected')}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      fundingDecisionStatus === 'rejected'
                        ? 'bg-red-700 text-white border-red-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Funding</span>
                  </button>
                </div>

                {/* If funding is accepted, customize amount & track */}
                {fundingDecisionStatus === 'accepted' && (
                  <div className="pt-2 border-t border-amber-200 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Approved Grant (INR) *</label>
                        <input
                          type="number"
                          value={approvedAmountINR}
                          onChange={(e) => setApprovedAmountINR(e.target.value)}
                          required
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded font-bold text-emerald-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Engagement Mode</label>
                        <select
                          value={supportTrack}
                          onChange={(e) => setSupportTrack(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                        >
                          <option value="CSR Grant & Funding">Direct CSR Grant</option>
                          <option value="Co-development">Joint Co-development</option>
                          <option value="Prototyping Lab Access">Prototyping & Lab Access</option>
                          <option value="Pilot Implementation">Field Pilot Implementation</option>
                          <option value="Mentoring">Industry Advisory</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Evaluation Remarks / Special Guidance for University
                </label>
                <textarea
                  rows={3}
                  value={evaluatorComments}
                  onChange={(e) => setEvaluatorComments(e.target.value)}
                  placeholder="e.g. Approved under FY26-27 Rural Livelihoods CSR pool. Industry engineers will assist in CAD testing..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDecision}
                  className="px-4 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSubmittingDecision ? 'Saving Decision...' : 'Record Industrial Decision'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* VIEW DEPLOYED PROTOTYPE & INDUSTRIAL ACCEPTANCE MODAL                     */}
      {/* ========================================================================= */}
      {viewingPrototypeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#003366] text-white px-5 py-4 flex items-center justify-between border-b-2 border-emerald-500">
              <div className="flex items-center gap-2.5">
                <Rocket className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold">Industrial Inspection: University Deployed Prototype</h3>
                  <p className="text-[11px] text-blue-200">
                    Review specifications, testing metrics, and accept deliverable to complete lifecycle
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingPrototypeChallenge(null)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Challenge & University Overview */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#003366] text-white text-[11px] font-mono font-bold rounded">
                    {viewingPrototypeChallenge.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">
                    {viewingPrototypeChallenge.category} • {viewingPrototypeChallenge.district}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {viewingPrototypeChallenge.title}
                </h4>
                <p className="text-slate-600 text-[11px] line-clamp-2">
                  {viewingPrototypeChallenge.description}
                </p>
              </div>

              {/* Prototype Details Card */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">Deliverable Title</span>
                    <span className="text-sm font-bold text-slate-900">
                      {viewingPrototypeChallenge.prototypeDeliverable?.title || `${viewingPrototypeChallenge.title} — Working Field Prototype`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[11px] rounded-full">
                      {viewingPrototypeChallenge.prototypeDeliverable?.version || 'v1.0-FieldReady'}
                    </span>
                    {viewingPrototypeChallenge.status === 'deployed' ? (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[11px] rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                        Complete and Deployed (End)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[11px] rounded-full">
                        Submitted by University • Awaiting Industrial Acceptance
                      </span>
                    )}
                  </div>
                </div>

                {/* Submitting Team */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-medium block">Lead Institution:</span>
                    <span className="font-bold text-slate-800">
                      {viewingPrototypeChallenge.assignedUniversity?.name || 'Assigned State University'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Faculty Principal Investigator:</span>
                    <span className="font-bold text-slate-800">
                      {viewingPrototypeChallenge.proposals?.[0]?.facultyLead ||
                        `${viewingPrototypeChallenge.assignedUniversity?.department || 'Engineering'} Faculty Project Lead`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block text-xs">Technical Architecture & Hardware Specifications:</span>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {viewingPrototypeChallenge.prototypeDeliverable?.specifications && viewingPrototypeChallenge.prototypeDeliverable.specifications.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {viewingPrototypeChallenge.prototypeDeliverable.specifications.map((spec, idx) => (
                        <li key={idx}>{spec}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      {viewingPrototypeChallenge.prototypeDeliverable?.description ||
                        'Industrial-grade microcontroller firmware, integrated IoT telemetry sensors, dual-band mesh connectivity, and solar-power battery enclosure engineered for field deployment.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Field Validation & Stress Testing */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block text-xs">Laboratory & Field Validation Testing Results:</span>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700">
                  <p>
                    {viewingPrototypeChallenge.prototypeDeliverable?.testResultsSummary ||
                      '120-hour continuous bench stress testing completed with 99.4% telemetry reporting accuracy under high humidity and dust simulation.'}
                  </p>
                </div>
              </div>

              {/* Attached Deliverable Package File */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {viewingPrototypeChallenge.prototypeDeliverable?.deliverableFile?.name || `${viewingPrototypeChallenge.code}_Prototype_Package.zip`}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {viewingPrototypeChallenge.prototypeDeliverable?.deliverableFile?.size || '14.2 MB Archive'} • Firmware, Schematics & Test Logs
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDecisionSuccessMsg(`Downloading: ${viewingPrototypeChallenge.prototypeDeliverable?.deliverableFile?.name || `${viewingPrototypeChallenge.code}_Prototype_Package.zip`}`);
                    setTimeout(() => setDecisionSuccessMsg(null), 3500);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download Deliverable Package</span>
                </button>
              </div>

              {/* Status Update Policy Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 space-y-1">
                <span className="font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  Portal Synchronization Guarantee:
                </span>
                <p className="leading-snug text-blue-800">
                  When you accept this deployed prototype, the platform will automatically update the status in both the <strong>University Portal</strong> and the <strong>Citizen Portal</strong> to <strong>Complete and Deployed (Status: End)</strong>.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setViewingPrototypeChallenge(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Close Inspection
              </button>

              {viewingPrototypeChallenge.status !== 'deployed' &&
              viewingPrototypeChallenge.prototypeDeliverable?.status !== 'verified_by_industry' ? (
                <button
                  type="button"
                  id={`modal-btn-accept-prototype-${viewingPrototypeChallenge.id}`}
                  onClick={() => {
                    const ch = viewingPrototypeChallenge;
                    setViewingPrototypeChallenge(null);
                    handleVerifyPrototype(ch);
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-black inline-flex items-center gap-2 shadow-md cursor-pointer ring-2 ring-emerald-400 active:scale-98 transition-all"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-200" />
                  <span>Accept Deployed Prototype (Complete & End)</span>
                </button>
              ) : (
                <div className="px-4 py-2 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-lg font-black text-xs inline-flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Complete & Deployed (Status: End)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
