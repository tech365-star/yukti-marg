import React, { useState } from 'react';
import { Challenge, User, UserRole, ChallengeStatus } from '../types';
import { 
  X, 
  MapPin, 
  Users, 
  Calendar, 
  GraduationCap, 
  Building, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Plus, 
  Lightbulb, 
  IndianRupee, 
  Check, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Award,
  Video,
  Camera,
  RefreshCw,
  Activity,
  Layers,
  FileCode2
} from 'lucide-react';

interface ChallengeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  currentUser: User | null;
  onUpdateChallenge: (updated: Challenge) => void;
  onOpenTeamModal: (challenge: Challenge) => void;
  onOpenProposalModal: (challenge: Challenge) => void;
  onOpenPledgeModal: (challenge: Challenge) => void;
}

export const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  isOpen,
  onClose,
  challenge,
  currentUser,
  onUpdateChallenge,
  onOpenTeamModal,
  onOpenProposalModal,
  onOpenPledgeModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'team_proposals' | 'milestones' | 'collaboration' | 'lifecycle_patents'>('overview');
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const isCitizen = !currentUser || currentUser?.role === 'citizen';
  const isGovernmentBody = currentUser?.role === 'government' || currentUser?.role === 'panchayat';
  const isReadOnlyUser = isCitizen || isGovernmentBody;

  // Stage 5 interactive form state
  const [isSavingTesting, setIsSavingTesting] = useState(false);
  const [testLocationInput, setTestLocationInput] = useState(challenge.prototypeTesting?.testLocation || `${challenge.blockOrPanchayat}, ${challenge.district}`);
  const [testingSummaryInput, setTestingSummaryInput] = useState(challenge.prototypeTesting?.testingSummary || '');
  const [beneficiaryFeedbackInput, setBeneficiaryFeedbackInput] = useState(challenge.prototypeTesting?.beneficiaryFeedback || '');
  const [patentAppNumInput, setPatentAppNumInput] = useState(challenge.patentInfo?.applicationNumber || '');
  const [patentTitleInput, setPatentTitleInput] = useState(challenge.patentInfo?.patentTitle || challenge.title);
  const [isSavingPatent, setIsSavingPatent] = useState(false);

  if (!isOpen) return null;

  // Handle Prototype Testing Save
  const handleSavePrototypeTesting = async (isDeployed: boolean) => {
    setIsSavingTesting(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/prototype-testing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testedInField: true,
          testingDate: new Date().toISOString().split('T')[0],
          testLocation: testLocationInput,
          testingSummary: testingSummaryInput || 'Field pilot test successfully completed with local stakeholders.',
          isDeployedInCommunity: isDeployed,
          deploymentDate: isDeployed ? new Date().toISOString().split('T')[0] : undefined,
          beneficiaryFeedback: beneficiaryFeedbackInput || 'Community adoption verified by local Gram Panchayat / Body.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateChallenge(data.challenge);
      }
    } catch (err) {
      console.error('Failed to log prototype testing:', err);
    } finally {
      setIsSavingTesting(false);
    }
  };

  // Handle Patent Save
  const handleSavePatent = async (patentStatus: 'drafting' | 'filed' | 'granted') => {
    setIsSavingPatent(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/patent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patentInfo: {
            status: patentStatus,
            applicationNumber: patentAppNumInput || `2026310${Math.floor(10000 + Math.random() * 90000)}`,
            filingDate: new Date().toISOString().split('T')[0],
            patentTitle: patentTitleInput,
            inventors: [
              challenge.team?.facultyMentor || 'Faculty Mentor',
              ...(challenge.team?.studentMembers.map((s) => s.name) || ['Student Innovator']),
            ],
            patentOffice: 'Indian Patent Office (Kolkata Jurisdiction)',
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateChallenge(data.challenge);
      }
    } catch (err) {
      console.error('Failed to update patent:', err);
    } finally {
      setIsSavingPatent(false);
    }
  };

  const STATUS_STEPS: { key: ChallengeStatus; label: string }[] = [
    { key: 'submitted', label: '1. Submitted' },
    { key: 'assigned_hei', label: '2. HEI Assigned' },
    { key: 'team_constituted', label: '3. Team Ready' },
    { key: 'proposal_submitted', label: '4. Proposal' },
    { key: 'prototype_development', label: '5. Prototyping' },
    { key: 'pilot_testing', label: '6. Field Pilot' },
    { key: 'deployed', label: '7. Deployed' },
  ];

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === challenge.status);

  // Advance status handler (Gov Admin / University)
  const handleAdvanceStatus = async (nextStatus: ChallengeStatus) => {
    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateChallenge(data.challenge);
      }
    } catch (err) {
      console.error('Failed to advance status:', err);
    }
  };

  // Add collaboration comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: currentUser?.name || 'Authorized Contributor',
          authorRole: currentUser?.role || 'citizen',
          authorOrg: currentUser?.organization || 'Yukti Marg Contributor',
          message: newComment.trim(),
          isOfficialNote: currentUser?.role === 'admin' || currentUser?.role === 'university',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateChallenge(data.challenge);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  // Toggle milestone status
  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' || currentStatus === 'verified_by_gov' ? 'in_progress' : 'completed';
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateChallenge(data.challenge);
      }
    } catch (err) {
      console.error('Failed to update milestone:', err);
    }
  };

  // Add new milestone
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    try {
      const res = await fetch(`/api/challenges/${challenge.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMilestoneTitle.trim(),
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateChallenge(data.challenge);
        setNewMilestoneTitle('');
        setIsAddingMilestone(false);
      }
    } catch (err) {
      console.error('Failed to add milestone:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
              {challenge.code}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight line-clamp-1">
                {challenge.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {challenge.district} ({challenge.blockOrPanchayat})
                </span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">{challenge.category}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lifecycle Stepper Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 overflow-x-auto scrollbar-none flex-shrink-0">
          <div className="flex items-center justify-between min-w-[620px] gap-2">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isPast
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-emerald-700 text-white ring-2 ring-amber-400 ring-offset-1'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs whitespace-nowrap ${
                        isCurrent
                          ? 'font-bold text-emerald-800'
                          : isPast
                          ? 'font-semibold text-emerald-800'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        isPast ? 'bg-emerald-500' : 'bg-stone-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-stone-200 px-6 bg-white flex-shrink-0 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Problem & AI Evaluation</span>
          </button>

          <button
            onClick={() => setActiveTab('team_proposals')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'team_proposals'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>University Teams & Proposals ({challenge.proposals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'milestones'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Milestones ({challenge.milestones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('collaboration')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'collaboration'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Stakeholder Discussion ({challenge.comments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lifecycle_patents')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lifecycle_patents'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Award className="w-4 h-4 text-purple-600" />
            <span>Flowchart Stage 5: Lifecycle & Patents</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: OVERVIEW & AI EVALUATION */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Problem Description */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Citizen Problem Statement (Stage 1 Intake)
                  </span>
                  {challenge.submittedBy.isVerifiedUser && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Submitter
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                  {challenge.description}
                </p>

                {/* Flowchart GPS & Multi-modal tags */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-3 text-xs">
                  {challenge.gpsCoordinates && (
                    <div className="bg-red-50 text-red-900 border border-red-200 px-2.5 py-1 rounded flex items-center gap-1 font-medium text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                      <span>GPS: {challenge.gpsCoordinates.latitude}° N, {challenge.gpsCoordinates.longitude}° E ({challenge.gpsCoordinates.locationName})</span>
                    </div>
                  )}

                  {challenge.videoUrls && challenge.videoUrls.length > 0 && (
                    <div className="bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded flex items-center gap-1 font-medium text-[11px]">
                      <Video className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      <span>{challenge.videoUrls.length} Video Evidence Attached</span>
                    </div>
                  )}

                  {challenge.aiAnalysis?.secondaryCategory && (
                    <div className="bg-[#faf6ee] text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded flex items-center gap-1 font-medium text-[11px]">
                      <Layers className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                      <span>Overlapping Domain: {challenge.aiAnalysis.secondaryCategory}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <span>
                    <strong>Submitted by:</strong> {challenge.submittedBy.name} ({challenge.submittedBy.type})
                  </span>
                  <span>
                    <strong>Impact Radius:</strong> ~{challenge.estimatedImpactPeople.toLocaleString('en-IN')} Citizens
                  </span>
                  <span>
                    <strong>Submission Date:</strong> {challenge.submittedDate}
                  </span>
                </div>
              </div>

              {/* AI Auto-Evaluation Box (Stage 2) */}
              {challenge.aiAnalysis && (
                <div className="bg-gradient-to-br from-amber-50/70 to-stone-50/50 rounded-xl p-5 border border-amber-300 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Yukti Marg AI Classification & Academic Matching (Stage 2)
                    </span>
                    <div className="flex items-center gap-2">
                      {challenge.aiAnalysis.deDuplicationCheck && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          De-duplication: {challenge.aiAnalysis.deDuplicationCheck.status.toUpperCase()}
                        </span>
                      )}
                      <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        Urgency: {challenge.aiAnalysis.urgencyScore}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {challenge.aiAnalysis.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1.5">
                        Identified Root Technical Bottlenecks:
                      </span>
                      <ul className="space-y-1 text-slate-600">
                        {challenge.aiAnalysis.rootCauses.map((rc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{rc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">
                          Recommended Jharkhand Universities:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {challenge.aiAnalysis.recommendedUniversities.map((u, i) => (
                            <span key={i} className="bg-purple-50 text-purple-900 border border-purple-200 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>

                      {challenge.aiAnalysis.incubationCenterMatched && (
                        <div>
                          <span className="font-bold text-slate-800 block mb-0.5 text-[11px]">
                            Incubation Facility Matched:
                          </span>
                          <span className="text-slate-600 text-[11px]">
                            {challenge.aiAnalysis.incubationCenterMatched}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              {challenge.attachments.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Evidence Attachments & Field Reports
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {challenge.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{att.name}</span>
                          <span className="text-[10px] text-slate-400">({att.size})</span>
                        </div>
                        <span className="text-amber-700 font-semibold text-[11px] hover:underline cursor-pointer">
                          View
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons for Stakeholders */}
              <div className="bg-slate-100/70 p-4 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Next Action: </span>
                  {challenge.status === 'submitted' && 'Assign to matching Jharkhand HEI Department.'}
                  {challenge.status === 'assigned_hei' && 'Constitute multidisciplinary student-faculty project team.'}
                  {challenge.status === 'team_constituted' && 'Prepare and submit technological research proposal.'}
                  {challenge.status === 'proposal_submitted' && 'Industry CSR co-funding / Government grant approval.'}
                  {challenge.status === 'prototype_development' && 'Fabrication in university incubation fablab.'}
                  {challenge.status === 'pilot_testing' && 'Live field validation in district.'}
                  {challenge.status === 'deployed' && 'Technology successfully handed over to community.'}
                </div>

                {!isReadOnlyUser && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onOpenTeamModal(challenge)}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Constitute Team</span>
                    </button>

                    <button
                      onClick={() => onOpenProposalModal(challenge)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Submit Proposal</span>
                    </button>

                    <button
                      onClick={() => onOpenPledgeModal(challenge)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>Pledge Industry Grant</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: UNIVERSITY TEAM & PROPOSALS */}
          {activeTab === 'team_proposals' && (
            <div className="space-y-6">
              {/* Constituted Team */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-700" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Assigned University & Multidisciplinary Project Team
                      </h4>
                      <p className="text-xs text-slate-500">
                        Faculty Principal Investigator & Student Researchers (NEP 2020)
                      </p>
                    </div>
                  </div>

                  {!isCitizen && (
                    <button
                      onClick={() => onOpenTeamModal(challenge)}
                      className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded text-xs font-semibold hover:bg-purple-100"
                    >
                      {challenge.team ? 'Edit Team Roster' : '+ Constitute Team'}
                    </button>
                  )}
                </div>

                {challenge.team ? (
                  <div className="space-y-4">
                    {/* Faculty Mentor */}
                    <div className="bg-purple-50/50 p-3.5 rounded-lg border border-purple-200 flex flex-col sm:flex-row justify-between gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                          Faculty Mentor / Lead
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {challenge.team.facultyMentor}
                        </span>
                        <p className="text-slate-600">
                          {challenge.team.mentorDesignation} • {challenge.team.mentorDepartment}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] text-slate-500 block">Institution & Incubation:</span>
                        <span className="font-semibold text-slate-800">{challenge.team.universityName}</span>
                        <p className="text-slate-500 text-[11px]">{challenge.team.incubationCenter}</p>
                      </div>
                    </div>

                    {/* Student Innovators */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-2">
                        Student Researchers & Innovation Fellows ({challenge.team.studentMembers.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {challenge.team.studentMembers.map((st, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs"
                          >
                            <span className="font-bold text-slate-900 block">{st.name}</span>
                            <span className="text-[11px] text-purple-800 font-semibold block">
                              {st.discipline}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {st.rollNo} • {st.yearOrSemester}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No project team has been formally constituted yet for this challenge.
                  </div>
                )}
              </div>

              {/* Research Proposals */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Formal Solution Proposals ({challenge.proposals.length})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Technical specifications, methodology, estimated budget, and timeline
                      </p>
                    </div>
                  </div>

                  {!isCitizen && (
                    <button
                      onClick={() => onOpenProposalModal(challenge)}
                      className="px-3 py-1 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
                    >
                      + Submit Proposal
                    </button>
                  )}
                </div>

                {challenge.proposals.length > 0 ? (
                  <div className="space-y-4">
                    {challenge.proposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-emerald-900">{prop.proposalTitle}</span>
                            <p className="text-[11px] text-slate-500">
                              Submitted by {prop.facultyLead} ({prop.universityName}) on {prop.submittedDate}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-auto">
                            {prop.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {prop.summary}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Estimated Budget</span>
                            <span className="font-bold text-emerald-700">
                              ₹{prop.estimatedBudgetINR.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Timeline</span>
                            <span className="font-bold text-slate-800">{prop.timelineMonths} Months</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-slate-400 block">Tech Stack</span>
                            <span className="text-[11px] text-slate-700">{prop.technologyStack.join(', ')}</span>
                          </div>
                        </div>

                        {prop.sponsoredBy && (
                          <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-900 flex items-center justify-between">
                            <span>
                              <strong>Sponsored by:</strong> {prop.sponsoredBy}
                            </span>
                            <span className="font-bold">
                              ₹{(prop.grantAmountINR || 0).toLocaleString('en-IN')} Grant
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No technical solution proposal submitted yet. University faculty can submit one above.
                  </div>
                )}
              </div>

              {/* Industry Partnerships */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Industry & CSR Pledges ({challenge.industryPartners.length})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Co-funding, corporate social responsibility, and pilot validation
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenPledgeModal(challenge)}
                    className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700"
                  >
                    + Pledge Support
                  </button>
                </div>

                {challenge.industryPartners.length > 0 ? (
                  <div className="space-y-3">
                    {challenge.industryPartners.map((pld) => (
                      <div
                        key={pld.id}
                        className="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{pld.partnerName}</span>
                            <span className="bg-amber-200 text-amber-900 font-semibold px-1.5 py-0.2 rounded text-[10px]">
                              {pld.supportType}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">{pld.notes}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Contact: {pld.contactPerson} ({pld.email})
                          </p>
                        </div>
                        {pld.pledgeAmountINR ? (
                          <div className="sm:text-right flex-shrink-0">
                            <span className="text-[10px] text-slate-400 block">Pledged Amount</span>
                            <span className="font-extrabold text-emerald-700 text-sm">
                              ₹{pld.pledgeAmountINR.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No industry partner has pledged yet. Open for Tata Steel, SAIL, Coal India, or MSMEs.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Project Deliverable Milestones & Verification
                  </h4>
                  <p className="text-xs text-slate-500">
                    Transparent milestone tracking aligned with Government monitoring requirements
                  </p>
                </div>

                {!isReadOnlyUser && (
                  <button
                    onClick={() => setIsAddingMilestone(!isAddingMilestone)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Milestone</span>
                  </button>
                )}
              </div>

              {/* Add milestone form */}
              {isAddingMilestone && (
                <form
                  onSubmit={handleCreateMilestone}
                  className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Milestone Title (e.g. Lab Testing & Spectrometry Report)"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingMilestone(false)}
                      className="px-3 py-1 border border-slate-300 rounded text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-emerald-700 text-white rounded text-xs font-bold"
                    >
                      Save Milestone
                    </button>
                  </div>
                </form>
              )}

              {/* Milestones list */}
              <div className="space-y-3">
                {challenge.milestones.map((ms) => {
                  const isDone = ms.status === 'completed' || ms.status === 'verified_by_gov';
                  return (
                    <div
                      key={ms.id}
                      className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => !isReadOnlyUser && handleToggleMilestone(ms.id, ms.status)}
                          disabled={isReadOnlyUser}
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                            isReadOnlyUser ? 'cursor-default' : 'cursor-pointer'
                          } ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300 text-transparent hover:border-emerald-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <span className={`font-bold block ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {ms.title}
                          </span>
                          {ms.description && (
                            <p className="text-slate-600 text-[11px] mt-0.5">{ms.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                            <span>Due: {ms.dueDate}</span>
                            {ms.completedDate && (
                              <span className="text-emerald-700 font-semibold">
                                • Completed: {ms.completedDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ms.status === 'verified_by_gov'
                              ? 'bg-emerald-200 text-emerald-900'
                              : ms.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ms.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ms.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: COLLABORATION THREAD */}
          {activeTab === 'collaboration' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Official multi-stakeholder dialogue between Citizen Mukhiya, University PI, Student Team, Industry Mentors, and Government Department.
                </span>
              </div>

              {/* Messages list */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {challenge.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-lg border text-xs ${
                      c.isOfficialNote
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.authorName}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                          c.authorRole === 'citizen'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.authorRole === 'university'
                            ? 'bg-purple-100 text-purple-800'
                            : c.authorRole === 'industry'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {c.authorRole}
                        </span>
                        <span className="text-slate-400 text-[11px]">• {c.authorOrg}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-normal">{c.message}</p>
                  </div>
                ))}
              </div>

              {/* Post comment input */}
              <form onSubmit={handlePostComment} className="pt-2 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={`Post an update or question as ${currentUser?.name || 'Stakeholder'}...`}
                    className="flex-1 text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isPostingComment || !newComment.trim()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 disabled:bg-slate-300 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Post</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: FLOWCHART STAGE 5 - LIFECYCLE & PATENTS */}
          {activeTab === 'lifecycle_patents' && (
            <div className="space-y-6">
              {/* Stage 5 Flowchart Header */}
              <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5 rounded-xl shadow-xs border border-emerald-950 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black uppercase px-2 py-0.5 rounded">
                      Flowchart Stage 5
                    </span>
                    <span className="text-xs text-amber-300 font-semibold">• The Lifecycle & Output Dashboard</span>
                  </div>
                  <h4 className="text-base font-bold">
                    Project Monitoring & Patent Tracking / परियोजना एवं पेटेंट निगरानी
                  </h4>
                  <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                    Tracks the real-world validation of student-faculty innovations: verifying if prototypes were tested in field conditions, deployed with community beneficiaries, and registered with the Indian Patent Office or scientific journals.
                  </p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl text-amber-400">
                  <Award className="w-8 h-8" />
                </div>
              </div>

              {/* PROJECT MONITORING (TESTED? DEPLOYED?) */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      1. Project Monitoring: Field Validation & Community Deployment
                    </h5>
                    <p className="text-xs text-slate-500">Flowchart metric: Tested in field? → Deployed in community?</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      challenge.prototypeTesting?.testedInField
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tested: {challenge.prototypeTesting?.testedInField ? 'YES' : 'PENDING'}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      challenge.prototypeTesting?.isDeployedInCommunity
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Deployed: {challenge.prototypeTesting?.isDeployedInCommunity ? 'YES' : 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Field Testing Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Field Testing Summary
                      </span>
                      {challenge.prototypeTesting?.testingDate && (
                        <span className="text-[10px] text-slate-500">
                          Date: {challenge.prototypeTesting.testingDate}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {challenge.prototypeTesting?.testingSummary || 'Field testing is pending fabrication sign-off by the university faculty mentor.'}
                    </p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      <strong>Location:</strong> {challenge.prototypeTesting?.testLocation || `${challenge.blockOrPanchayat}, ${challenge.district}`}
                    </div>
                  </div>

                  {/* Community Deployment Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Community Beneficiary Feedback
                      </span>
                      {challenge.prototypeTesting?.deploymentDate && (
                        <span className="text-[10px] text-slate-500">
                          Deployed: {challenge.prototypeTesting.deploymentDate}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      &quot;{challenge.prototypeTesting?.beneficiaryFeedback || 'Awaiting community deployment sign-off from the local Gram Panchayat Mukhiya.'}&quot;
                    </p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      <strong>Beneficiaries Impacted:</strong> ~{challenge.estimatedImpactPeople.toLocaleString('en-IN')} citizens
                    </div>
                  </div>
                </div>

                {/* Interactive Testing & Deployment Log Form (Hidden for Citizen / Government Body: strictly read-only status view) */}
                {!isReadOnlyUser && (
                  <div className="bg-[#faf6ee] p-4 rounded-xl border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-emerald-900 block">
                      Update Field Testing & Deployment Records (University / Government Admin)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Test Location (Gram Panchayat / Field Site)
                        </label>
                        <input
                          type="text"
                          value={testLocationInput}
                          onChange={(e) => setTestLocationInput(e.target.value)}
                          placeholder="e.g. Ormanjhi Gram Panchayat & FPO, Ranchi"
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Field Testing Summary & Technical Verification
                        </label>
                        <input
                          type="text"
                          value={testingSummaryInput}
                          onChange={(e) => setTestingSummaryInput(e.target.value)}
                          placeholder="e.g. Sensor telemetry validated across 14-day field cycle"
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Community / Mukhiya Beneficiary Feedback
                      </label>
                      <input
                        type="text"
                        value={beneficiaryFeedbackInput}
                        onChange={(e) => setBeneficiaryFeedbackInput(e.target.value)}
                        placeholder="e.g. Over 4,800 farmers utilizing the system with 80% loss reduction"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isSavingTesting}
                        onClick={() => handleSavePrototypeTesting(false)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                      >
                        {isSavingTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>Save Field Pilot Test Log</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSavingTesting}
                        onClick={() => handleSavePrototypeTesting(true)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Certify Community Handover & Deployment</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PATENT MONITORING & SCIENTIFIC PAPERS */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      2. Patent Monitoring: Intellectual Property & Research Publications
                    </h5>
                    <p className="text-xs text-slate-500">Flowchart metric: Indian Patent Office filing & research papers</p>
                  </div>
                  {challenge.patentInfo && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase ${
                      challenge.patentInfo.status === 'granted'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : challenge.patentInfo.status === 'filed'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      Patent: {challenge.patentInfo.status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Patent Info Card */}
                  <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                        <FileCode2 className="w-4 h-4 text-purple-700" />
                        Indian Patent Filing
                      </span>
                      {challenge.patentInfo?.filingDate && (
                        <span className="text-[10px] text-purple-700 font-semibold">
                          Filed: {challenge.patentInfo.filingDate}
                        </span>
                      )}
                    </div>
                    {challenge.patentInfo ? (
                      <div className="space-y-1.5 text-slate-700">
                        <div><strong>Title:</strong> {challenge.patentInfo.patentTitle}</div>
                        <div><strong>App No:</strong> <span className="font-mono font-bold text-purple-900">{challenge.patentInfo.applicationNumber}</span></div>
                        <div><strong>Office:</strong> {challenge.patentInfo.patentOffice}</div>
                        <div><strong>Inventors:</strong> {challenge.patentInfo.inventors?.join(', ') || 'Faculty & Student Innovators'}</div>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No patent filed yet for this challenge.</p>
                    )}
                  </div>

                  {/* Research Paper Card */}
                  <div className="bg-[#faf6ee] p-4 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-emerald-700" />
                        Academic Research Paper
                      </span>
                      {challenge.researchPaperInfo && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">
                          {challenge.researchPaperInfo.status}
                        </span>
                      )}
                    </div>
                    {challenge.researchPaperInfo ? (
                      <div className="space-y-1.5 text-slate-700">
                        <div><strong>Title:</strong> {challenge.researchPaperInfo.paperTitle}</div>
                        <div><strong>Journal/Conf:</strong> {challenge.researchPaperInfo.journalOrConference}</div>
                        <div><strong>DOI:</strong> <span className="font-mono text-emerald-900">{challenge.researchPaperInfo.doi || 'In Press'}</span></div>
                        {challenge.researchPaperInfo.citationsCount !== undefined && (
                          <div><strong>Citations:</strong> {challenge.researchPaperInfo.citationsCount}</div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No academic research paper published yet.</p>
                    )}
                  </div>
                </div>

                {/* Interactive Patent Filing Updater (Hidden for Citizen / Government Body: strictly read-only status view) */}
                {!isReadOnlyUser && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block">
                      Update Patent Record (Indian Patent Office Tracking)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Patent Application Number
                        </label>
                        <input
                          type="text"
                          value={patentAppNumInput}
                          onChange={(e) => setPatentAppNumInput(e.target.value)}
                          placeholder="e.g. 202631008492"
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Invention Title
                        </label>
                        <input
                          type="text"
                          value={patentTitleInput}
                          onChange={(e) => setPatentTitleInput(e.target.value)}
                          placeholder="Invention title for patent..."
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isSavingPatent}
                        onClick={() => handleSavePatent('drafting')}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer disabled:bg-slate-300"
                      >
                        {isSavingPatent ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCode2 className="w-3.5 h-3.5" />}
                        <span>Set Status: Drafting</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSavingPatent}
                        onClick={() => handleSavePatent('filed')}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer disabled:bg-slate-300"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        <span>Set Status: Filed with IPO</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSavingPatent}
                        onClick={() => handleSavePatent('granted')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer disabled:bg-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Set Status: Patent Granted</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Current Phase:</span>
            <span className="font-bold text-emerald-900 capitalize">
              {challenge.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick status advancement button for test workflows (Hidden for citizens & government bodies: Read-only status view) */}
            {!isReadOnlyUser && currentStepIdx < STATUS_STEPS.length - 1 && (
              <button
                onClick={() => handleAdvanceStatus(STATUS_STEPS[currentStepIdx + 1].key)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                title="Advance to next lifecycle phase"
              >
                <span>Advance Phase → {STATUS_STEPS[currentStepIdx + 1].label.split('.')[1]}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Close Window
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
