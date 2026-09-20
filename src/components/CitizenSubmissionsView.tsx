import React, { useState } from 'react';
import { Challenge, ChallengeStatus, User } from '../types';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  MapPin, 
  PlusCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Search, 
  Filter,
  IndianRupee,
  Layers,
  AlertCircle,
  FileText,
  Calendar,
  ExternalLink,
  ChevronRight,
  Activity,
  Award,
  Check
} from 'lucide-react';

interface CitizenSubmissionsViewProps {
  challenges: Challenge[];
  currentUser: User;
  onSelectChallenge: (challenge: Challenge) => void;
  onOpenSubmitModal: () => void;
  onNavigateToTab: (tab: any) => void;
  lang: 'en' | 'hi';
}

export const CitizenSubmissionsView: React.FC<CitizenSubmissionsViewProps> = ({
  challenges,
  currentUser,
  onSelectChallenge,
  onOpenSubmitModal,
  onNavigateToTab,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'under_review' | 'assigned_hei' | 'team_constituted' | 'prototype_development' | 'deployed'>('all');

  // Filter only citizen's submissions
  const filtered = challenges.filter((c) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'prototype_development'
        ? ['prototype_development', 'pilot_testing', 'proposal_submitted'].includes(c.status)
        : c.status === statusFilter;

    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.blockOrPanchayat.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Calculate statistics for this citizen
  const totalCount = challenges.length;
  const underReviewCount = challenges.filter((c) => ['submitted', 'under_review'].includes(c.status)).length;
  const inHeiCount = challenges.filter((c) => ['assigned_hei', 'team_constituted', 'proposal_submitted'].includes(c.status)).length;
  const inTestingCount = challenges.filter((c) => ['prototype_development', 'pilot_testing'].includes(c.status)).length;
  const deployedCount = challenges.filter((c) => c.status === 'deployed').length;

  // Stages helper for 5-Stage Stepper
  const getStageIndex = (status: ChallengeStatus): number => {
    switch (status) {
      case 'submitted':
        return 1;
      case 'under_review':
        return 2;
      case 'assigned_hei':
        return 2;
      case 'team_constituted':
        return 3;
      case 'proposal_submitted':
        return 3;
      case 'prototype_development':
        return 4;
      case 'pilot_testing':
        return 4;
      case 'deployed':
        return 5;
      default:
        return 1;
    }
  };

  const STAGES = [
    { num: 1, title: 'Intake & AI Screen' },
    { num: 2, title: 'HEI Matching' },
    { num: 3, title: 'Team & Mentorship' },
    { num: 4, title: 'Prototyping & CSR' },
    { num: 5, title: 'Complete & Deployed (End)' },
  ];

  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case 'submitted':
        return { label: 'Intake Submitted', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'under_review':
        return { label: 'Under AI & State Review', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'assigned_hei':
        return { label: 'Assigned to University', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'team_constituted':
        return { label: 'Student-Faculty Team Formed', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'proposal_submitted':
        return { label: 'Solution Proposal Submitted', color: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
      case 'prototype_development':
        return { label: 'Active Prototype Development', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'pilot_testing':
        return { label: 'Field Pilot Testing', color: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'deployed':
        return { label: 'Complete and Deployed (Status: End)', color: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6" id="citizen-submissions-dashboard">
      {/* 1. Official Citizen Identity & Scope Banner */}
      <section className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-xl p-6 border border-emerald-950 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentUser.role === 'panchayat'
                  ? 'Gram Panchayat & Mukhiya Portal • Locality Submissions'
                  : currentUser.role === 'government'
                  ? 'Government Administration Portal • Locality Submissions'
                  : 'Citizen Portal • My Submissions'}
              </span>
              <span className="text-xs text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs text-amber-200 font-medium hidden sm:inline">
                {currentUser.role === 'panchayat'
                  ? 'Tracking Ground Challenges Submitted from your Gram Panchayat'
                  : currentUser.role === 'government'
                  ? 'Tracking Field Challenges Submitted from your Department / Jurisdiction'
                  : 'Restricted Access: Showing Only Your Submissions'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentUser.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {currentUser.district} District, Jharkhand
              </span>
              <span>•</span>
              <span className="text-slate-300">{currentUser.organization}</span>
              {currentUser.phone && (
                <>
                  <span>•</span>
                  <span className="text-slate-300">{currentUser.phone}</span>
                </>
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onOpenSubmitModal}
              className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Submit New Challenge</span>
            </button>

            <button
              onClick={() => onNavigateToTab('ai-doc-tool')}
              className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Upload Document with AI</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Real-time Status KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            My Total Submissions
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-emerald-900">{totalCount}</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Logged by your citizen account</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            In AI & HEI Review
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-amber-700">{underReviewCount}</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Department matching underway</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            University Prototyping
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-purple-700">{inHeiCount + inTestingCount}</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-purple-600 font-medium mt-1 block">Active student-faculty lab teams</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Field Deployed & Solved
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-emerald-700">{deployedCount}</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">Validated in your community</span>
        </div>
      </section>

      {/* 3. Search & Filter Bar */}
      <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search within my submissions by tracking ID (e.g. YM-JH-2026), keywords, or block..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center overflow-x-auto scrollbar-none gap-1.5 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === 'all'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Submissions ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('under_review')}
            className={`px-3 py-1.5 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === 'under_review'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            In Review ({underReviewCount})
          </button>
          <button
            onClick={() => setStatusFilter('assigned_hei')}
            className={`px-3 py-1.5 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === 'assigned_hei'
                ? 'bg-purple-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            HEI Allocated ({challenges.filter((c) => c.status === 'assigned_hei').length})
          </button>
          <button
            onClick={() => setStatusFilter('prototype_development')}
            className={`px-3 py-1.5 rounded-md font-bold whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === 'prototype_development'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Prototyping & Testing ({inTestingCount})
          </button>
        </div>
      </section>

      {/* 4. Submissions List with Detailed Status & Stepper */}
      <section className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((challenge) => {
            const isIndustryVerified = Boolean(
              challenge.prototypeDeliverable?.status === 'verified_by_industry' || 
              Boolean(challenge.prototypeDeliverable?.verifiedByIndustry?.verified)
            );

            const isCompletedAndDeployed = Boolean(
              (challenge.status === 'deployed' || challenge.lifecycleStatus === 'end') &&
              isIndustryVerified
            );

            const isPrototypeSubmitted = Boolean(
              challenge.prototypeDeliverable && 
              !isCompletedAndDeployed
            );

            const baseStage = getStageIndex(challenge.status);
            const currentStage = isCompletedAndDeployed ? 5 : isPrototypeSubmitted ? 5 : baseStage;

            const baseBadge = getStatusBadge(challenge.status);
            const badge = isCompletedAndDeployed
              ? { label: 'Complete and Deployed (Status: End)', color: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' }
              : isPrototypeSubmitted
              ? { label: 'Prototype Submitted to Industry (Awaiting Acceptance)', color: 'bg-blue-100 text-blue-900 border-blue-300 font-bold' }
              : baseBadge;

            return (
              <div
                key={challenge.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-400/80 transition-all space-y-4"
              >
                {/* Header Row: Tracking Code, Status Badge, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-emerald-900 px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      {challenge.code}
                    </span>

                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      {challenge.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Submitted on {challenge.submittedDate}</span>
                  </div>
                </div>

                {/* Challenge Title & Scope */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {challenge.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      {challenge.blockOrPanchayat}, {challenge.district}
                    </span>
                    <span>•</span>
                    <span>Beneficiaries Impacted: ~{challenge.estimatedImpactPeople.toLocaleString()} citizens</span>
                    <span>•</span>
                    <span className="capitalize font-semibold text-slate-700">
                      Priority: <strong className={challenge.priority === 'critical' ? 'text-red-700' : 'text-amber-700'}>{challenge.priority}</strong>
                    </span>
                  </div>

                  {/* Locality & Ground Citizen Beneficiaries Information */}
                  {(challenge.submittedBy?.citizenBeneficiary || challenge.submittedBy?.localityVillage || challenge.submittedBy?.certifiedByAuthority) && (
                    <div className="mt-2.5 p-2 bg-emerald-50/90 border border-emerald-200 rounded-md text-xs text-emerald-950 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-emerald-900 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-700" />
                        Locality Citizens:
                      </span>
                      <span className="font-medium text-slate-800">
                        {challenge.submittedBy.citizenBeneficiary || 'Local community residents'}
                      </span>
                      {challenge.submittedBy.localityVillage && (
                        <>
                          <span className="text-emerald-300">•</span>
                          <span className="text-slate-600">Hamlet/Village: {challenge.submittedBy.localityVillage}</span>
                        </>
                      )}
                      {challenge.submittedBy.certifiedByAuthority && (
                        <span className="ml-auto bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Endorsed by PRI / Authority
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 5-Stage Live Stepper */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-600" />
                      5-Stage Government Innovation Pipeline Status
                    </span>
                    <span className="text-[11px] font-bold text-emerald-900">
                      Stage {currentStage} of 5: {STAGES[currentStage - 1]?.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1 sm:gap-2">
                    {STAGES.map((stage) => {
                      const isDone = isCompletedAndDeployed 
                        ? true 
                        : isPrototypeSubmitted 
                        ? stage.num < 5 // Steps 1-4 completed
                        : stage.num < currentStage;

                      const isCurrent = isCompletedAndDeployed 
                        ? false 
                        : isPrototypeSubmitted 
                        ? stage.num === 5 // Step 5 active: Awaiting Industry Acceptance
                        : stage.num === currentStage;

                      return (
                        <div key={stage.num} className="text-center">
                          <div
                            className={`h-2 rounded-full mb-1.5 transition-all ${
                              isDone
                                ? 'bg-emerald-500'
                                : isCurrent
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-slate-200'
                            }`}
                          />
                          <div className="flex items-center justify-center gap-1">
                            {isDone ? (
                              <Check className="w-3 h-3 text-emerald-600 font-bold" />
                            ) : isCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                            )}
                            <span
                              className={`text-[10px] sm:text-[11px] leading-tight block truncate ${
                                isDone
                                  ? 'font-bold text-emerald-800'
                                  : isCurrent
                                  ? 'font-extrabold text-amber-900'
                                  : 'text-slate-400 font-medium'
                              }`}
                            >
                              {stage.title}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Current Institutional Allocation Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* University Card */}
                  <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block mb-1">
                      Assigned Higher Education Partner
                    </span>
                    {challenge.assignedUniversity ? (
                      <div>
                        <span className="font-bold text-slate-900 block line-clamp-1">
                          {challenge.assignedUniversity.name}
                        </span>
                        <span className="text-[11px] text-purple-800 mt-0.5 block">
                          Dept: {challenge.assignedUniversity.department}
                        </span>
                        {challenge.team?.facultyMentor && (
                          <span className="text-[11px] text-slate-600 mt-1 block">
                            Faculty Lead: <strong>{challenge.team.facultyMentor}</strong>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">
                        Under academic matching with Jharkhand universities
                      </span>
                    )}
                  </div>

                  {/* Industry & CSR Card */}
                  <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                      Industry & CSR Sponsorship
                    </span>
                    {challenge.industryPartners && challenge.industryPartners.length > 0 ? (
                      <div>
                        <span className="font-bold text-slate-900 block line-clamp-1">
                          {challenge.industryPartners[0].partnerName}
                        </span>
                        <span className="text-[11px] text-emerald-800 font-semibold mt-0.5 block">
                          ₹{(challenge.industryPartners[0].pledgeAmountINR || 0).toLocaleString()} Grant Pledged
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">
                        Open for CSR co-funding from Tata Steel, SAIL, Coal India
                      </span>
                    )}
                  </div>

                  {/* Milestones / Prototype Status */}
                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
                        Milestone Progress
                      </span>
                      {challenge.milestones && challenge.milestones.length > 0 ? (
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {challenge.milestones.filter((m) => m.status === 'completed' || m.status === 'verified_by_gov').length} of {challenge.milestones.length} Milestones Completed
                          </span>
                          <span className="text-[11px] text-slate-600 mt-0.5 block line-clamp-1">
                            Latest: {challenge.milestones[0]?.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">
                          Milestone calendar in drafting with HEI mentor
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectChallenge(challenge)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 mt-2 cursor-pointer"
                    >
                      <span>View Full Status & Evidence</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    {challenge.comments?.length || 0} Official Collaboration Notes Logged
                  </div>

                  <button
                    onClick={() => onSelectChallenge(challenge)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Inspect End-to-End Status Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                {searchQuery || statusFilter !== 'all'
                  ? 'No matching submissions found'
                  : 'No Societal Challenges Registered Yet'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try clearing your search query or status filter to see all your registered challenges.'
                  : 'You have not submitted any challenges under this citizen account yet. Register your local community issue—whether it is drinking water scarcity, post-harvest crop loss, or rural roads.'}
              </p>
            </div>

            {searchQuery || statusFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={onOpenSubmitModal}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Submit Your First Societal Challenge</span>
                </button>

                <button
                  onClick={() => onNavigateToTab('ai-doc-tool')}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Upload Document with AI</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
