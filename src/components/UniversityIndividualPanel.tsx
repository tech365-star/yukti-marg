import React, { useState, useMemo } from 'react';
import { Challenge, ChallengeStatus, User, ThematicCategory, PriorityLevel } from '../types';
import { JHARKHAND_DISTRICTS, THEMATIC_CATEGORIES } from '../data/mockData';
import { JHARKHAND_UNIVERSITIES } from '../services/universityMatchingService';
import { t } from '../utils/translations';
import { 
  GraduationCap, 
  Users, 
  Lightbulb, 
  Building, 
  Sparkles, 
  Award, 
  Plus, 
  BookOpen, 
  FolderCheck,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  FileText,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Microscope,
  Briefcase,
  Layers,
  Clock,
  Send,
  ArrowRight,
  TrendingUp,
  Cpu,
  BadgeCheck,
  FolderGit2,
  Rocket,
  Lock,
  PlayCircle,
  FileArchive,
  Paperclip,
  CheckCircle
} from 'lucide-react';
import { PrototypeDeployModal } from './PrototypeDeployModal';

export interface UniversityIndividualPanelProps {
  challenges: Challenge[];
  currentUser: User;
  onSelectChallenge: (challenge: Challenge) => void;
  onUpdateChallenge: (updatedChallenge: Challenge) => void;
  onOpenTeamModal: (challenge: Challenge) => void;
  onOpenProposalModal: (challenge: Challenge) => void;
  onAdoptChallenge: (challengeId: string) => Promise<void>;
  onReviewChallenge: (challengeId: string, review: { feasibilityScore: number; evaluationSummary: string }) => Promise<void>;
  onAddNotification?: (notif: any) => void;
  lang: 'en' | 'hi';
}

/**
 * Robust matcher checking if a problem is assigned to the current university admin's institution
 */
export function isAssignedToThisUniversity(challenge: Challenge, user: User | null): boolean {
  if (!user) return false;
  const userOrg = (user.organization || '').toLowerCase();
  const userId = (user.id || '').toLowerCase();
  
  const assignedId = (challenge.assignedUniversity?.id || '').toLowerCase();
  const assignedName = (challenge.assignedUniversity?.name || '').toLowerCase();
  const teamUniName = (challenge.team?.universityName || '').toLowerCase();
  const teamUniId = (challenge.team?.universityId || '').toLowerCase();

  // 1. Direct ID match
  if (assignedId && (assignedId === userId || userOrg.includes(assignedId))) return true;
  if (teamUniId && (teamUniId === userId || userOrg.includes(teamUniId))) return true;

  // 2. Keyword matching for Jharkhand institutions
  const uniTokens = [
    { key: 'bit', alias: 'mesra' },
    { key: 'mesra', alias: 'birla' },
    { key: 'ism', alias: 'dhanbad' },
    { key: 'dhanbad', alias: 'iit' },
    { key: 'bau', alias: 'kanke' },
    { key: 'kanke', alias: 'birsa' },
    { key: 'nit', alias: 'jamshedpur' },
    { key: 'jamshedpur', alias: 'nit' },
    { key: 'ranchi univ', alias: 'ranchi' },
    { key: 'aiims', alias: 'deoghar' },
    { key: 'kolhan', alias: 'chaibasa' },
    { key: 'vbu', alias: 'hazaribagh' },
    { key: 'skmu', alias: 'dumka' }
  ];

  for (const token of uniTokens) {
    if (userOrg.includes(token.key) || userOrg.includes(token.alias)) {
      if (
        assignedName.includes(token.key) || 
        assignedName.includes(token.alias) ||
        teamUniName.includes(token.key) || 
        teamUniName.includes(token.alias)
      ) {
        return true;
      }
    }
  }

  // 3. Substring matching
  if (assignedName && (userOrg.includes(assignedName) || assignedName.includes(userOrg))) {
    return true;
  }
  if (teamUniName && (userOrg.includes(teamUniName) || teamUniName.includes(userOrg))) {
    return true;
  }

  return false;
}

export const UniversityIndividualPanel: React.FC<UniversityIndividualPanelProps> = ({
  challenges,
  currentUser,
  onSelectChallenge,
  onUpdateChallenge,
  onOpenTeamModal,
  onOpenProposalModal,
  onAdoptChallenge,
  onReviewChallenge,
  onAddNotification,
  lang,
}) => {
  // Navigation inside the university panel
  const [panelView, setPanelView] = useState<'assigned' | 'incoming' | 'profile'>('assigned');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdoptingId, setIsAdoptingId] = useState<string | null>(null);
  const [prototypeDeployChallenge, setPrototypeDeployChallenge] = useState<Challenge | null>(null);

  // University Authority Acceptance of Problem Statement (Mandated by user workflow)
  const handleAcceptProblemStatement = async (challenge: Challenge) => {
    setIsAdoptingId(challenge.id);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/university-accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acceptedBy: currentUser.name || 'University Dean / Director',
          universityName: universityProfile.name,
          universityId: universityProfile.id,
          department: challenge.assignedUniversity?.department || universityProfile.facultySpecializations[0],
          remarks: 'Problem statement accepted by university authority. Multidisciplinary research team constitution unlocked.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        onUpdateChallenge(data.challenge);
        if (onAddNotification) {
          onAddNotification({
            title: 'Problem Statement Accepted & Work Started',
            message: `You have formally accepted [${challenge.code}] for ${universityProfile.shortName}. Multidisciplinary team management is now unlocked!`,
            type: 'success',
          });
        }
      }
    } catch (err) {
      console.error('Failed to accept challenge:', err);
    } finally {
      setIsAdoptingId(null);
    }
  };

  // University Domain Profile lookup
  const universityProfile = useMemo(() => {
    const userOrg = (currentUser.organization || '').toLowerCase();
    return (
      JHARKHAND_UNIVERSITIES.find((u) => {
        return (
          userOrg.includes(u.id) ||
          userOrg.includes(u.shortName.toLowerCase()) ||
          u.name.toLowerCase().includes(userOrg)
        );
      }) || JHARKHAND_UNIVERSITIES[1] // Default BIT Mesra
    );
  }, [currentUser]);

  // Problems assigned specifically to this university
  const assignedProblems = useMemo(() => {
    return challenges.filter((c) => isAssignedToThisUniversity(c, currentUser));
  }, [challenges, currentUser]);

  // Incoming problems available for adoption (not yet assigned or recommended by AI)
  const incomingProblems = useMemo(() => {
    return challenges.filter((c) => !isAssignedToThisUniversity(c, currentUser));
  }, [challenges, currentUser]);

  // Filtered assigned problems
  const filteredAssigned = useMemo(() => {
    return assignedProblems.filter((c) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active_r_and_d'
          ? ['assigned_hei', 'team_constituted', 'proposal_submitted', 'prototype_development'].includes(c.status)
          : c.status === statusFilter;

      const matchesCategory =
        categoryFilter === 'all' ? true : c.category === categoryFilter;

      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.blockOrPanchayat.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [assignedProblems, statusFilter, categoryFilter, searchQuery]);

  // KPI Metrics Calculation
  const totalAssigned = assignedProblems.length;
  const teamsConstituted = assignedProblems.filter((c) => c.team && c.team.studentMembers.length > 0).length;
  const proposalsSubmitted = assignedProblems.filter((c) => c.proposals && c.proposals.length > 0).length;
  const prototypesTested = assignedProblems.filter((c) => c.prototypeTesting && c.prototypeTesting.testedInField).length;
  const patentsFiled = assignedProblems.filter((c) => c.patentInfo && c.patentInfo.status !== 'none').length;
  const totalGrantsMobilized = assignedProblems.reduce((sum, c) => {
    const pSum = (c.proposals || []).reduce((s, p) => s + (p.grantAmountINR || 0), 0);
    const iSum = (c.industryPartners || []).reduce((s, i) => s + (i.pledgeAmountINR || 0), 0);
    return sum + pSum + iSum;
  }, 0);

  // 5-Stage Status Index Helper
  const getStageIndex = (status: ChallengeStatus): number => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return 1;
      case 'assigned_hei':
        return 2;
      case 'team_constituted':
        return 3;
      case 'proposal_submitted':
      case 'prototype_development':
        return 4;
      case 'pilot_testing':
      case 'deployed':
        return 5;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case 'assigned_hei':
        return { label: 'Assigned to HEI', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'team_constituted':
        return { label: 'R&D Team Constituted', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'proposal_submitted':
        return { label: 'Proposal Under Review', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'prototype_development':
        return { label: 'Prototyping in Lab', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'pilot_testing':
        return { label: 'Live Field Pilot', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'deployed':
        return { label: 'Complete and Deployed (Status: End)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' };
      default:
        return { label: 'Intake Logging', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // Quick Adopt handler
  const handleAdopt = async (challengeId: string) => {
    setIsAdoptingId(challengeId);
    try {
      await onAdoptChallenge(challengeId);
      if (onAddNotification) {
        onAddNotification({
          id: `notif-${Date.now()}`,
          title: 'Problem Statement Adopted',
          message: `${currentUser.organization} has officially adopted Challenge #${challengeId} for academic R&D and prototyping.`,
          timestamp: new Date().toISOString(),
          type: 'success',
          isRead: false,
          challengeId,
        });
      }
    } catch (err) {
      console.error('Failed to adopt challenge:', err);
    } finally {
      setIsAdoptingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="university-individual-panel">
      {/* ========================================================================= */}
      {/* 1. OFFICIAL UNIVERSITY IDENTITY & NODAL OFFICER PROFILE CARD */}
      {/* ========================================================================= */}
      <section 
        className="bg-white rounded-xl shadow-xs border-2 border-slate-200 p-5 sm:p-6"
        id="university-official-profile-card"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#003366] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-amber-400 shrink-0">
              <GraduationCap className="w-8 h-8 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
                  Higher Education Institution (HEI)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-emerald-600" />
                  NAAC Grade A++ / NIRF Tier
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 font-mono">
                  AISHE: U-0205
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-[#003366] tracking-tight">
                {currentUser.organization || universityProfile.name}
              </h1>
              <p className="text-xs text-slate-600 font-medium flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser.department || 'Dean of Research & Innovation Hub'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser.district}, Jharkhand
                </span>
              </p>
            </div>
          </div>

          {/* Nodal Officer Credentials */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 w-full md:w-auto shrink-0">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              Nodal R&D Faculty Lead
            </div>
            <div className="font-extrabold text-[#003366] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{currentUser.name}</span>
            </div>
            <div className="text-[11px] text-slate-600">
              {currentUser.email} • {currentUser.phone || '+91 98351 44120'}
            </div>
            <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
              <Microscope className="w-3 h-3 text-amber-600" />
              <span>Incubator: {universityProfile.incubationCenter}</span>
            </div>
          </div>
        </div>

        {/* 2. REAL-TIME INSTITUTIONAL KPI STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-[11px] font-bold text-blue-900">Assigned Problems</div>
            <div className="text-xl sm:text-2xl font-black text-blue-900 mt-0.5">{totalAssigned}</div>
            <div className="text-[10px] text-blue-700 font-semibold mt-0.5">Assigned to HEI</div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3 text-center">
            <div className="text-[11px] font-bold text-purple-900">R&D Teams Ready</div>
            <div className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">{teamsConstituted}</div>
            <div className="text-[10px] text-purple-700 font-semibold mt-0.5">Faculty & Students</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-center">
            <div className="text-[11px] font-bold text-amber-900">Grant Proposals</div>
            <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">{proposalsSubmitted}</div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Under Review / Approved</div>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 text-center">
            <div className="text-[11px] font-bold text-indigo-900">Active Prototypes</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-900 mt-0.5">{prototypesTested}</div>
            <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">Lab & Field Validated</div>
          </div>

          <div className="bg-teal-50/70 border border-teal-200 rounded-lg p-3 text-center">
            <div className="text-[11px] font-bold text-teal-900">Patents / IP Filed</div>
            <div className="text-xl sm:text-2xl font-black text-teal-900 mt-0.5">{patentsFiled}</div>
            <div className="text-[10px] text-teal-700 font-semibold mt-0.5">IPO Application Reg.</div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-center">
            <div className="text-[11px] font-bold text-emerald-900">Grant Mobilized</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">
              ₹{(totalGrantsMobilized / 100000).toFixed(1)}L
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">State & CSR Funding</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PANEL NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          {/* Tab 1: Assigned Problems */}
          <button
            type="button"
            id="uni-tab-assigned-problems"
            onClick={() => setPanelView('assigned')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              panelView === 'assigned'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4 text-amber-400" />
            <span>Assigned Problems to {universityProfile.shortName}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                panelView === 'assigned'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {totalAssigned}
            </span>
          </button>

          {/* Tab 2: Incoming Challenges for Adoption */}
          <button
            type="button"
            id="uni-tab-incoming-adoption"
            onClick={() => setPanelView('incoming')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              panelView === 'incoming'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Incoming Challenges to Adopt</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-slate-200 text-slate-800">
              {incomingProblems.length}
            </span>
          </button>

          {/* Tab 3: Institutional R&D Profile */}
          <button
            type="button"
            id="uni-tab-facilities"
            onClick={() => setPanelView('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              panelView === 'profile'
                ? 'bg-[#003366] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Microscope className="w-4 h-4 text-slate-500" />
            <span>Lab & Incubation Infrastructure</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-semibold hidden md:block">
          Autonomous University R&D Registry • NEP 2020 Mandate
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. VIEW A: ASSIGNED PROBLEMS TO THIS UNIVERSITY */}
      {/* ========================================================================= */}
      {panelView === 'assigned' && (
        <section className="space-y-4" id="assigned-problems-view">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search assigned problems by ID (e.g. YM-JH-2026), title, district, or block..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-60">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003366] focus:outline-none"
              >
                <option value="all">{lang === 'hi' ? 'सभी डोमेन / विषयगत क्षेत्र' : 'All Domains / Thematic Areas'}</option>
                {THEMATIC_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(cat, lang)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-[#003366] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({assignedProblems.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('assigned_hei')}
                className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap ${
                  statusFilter === 'assigned_hei'
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Needs Team ({assignedProblems.filter((c) => c.status === 'assigned_hei').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('prototype_development')}
                className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap ${
                  statusFilter === 'prototype_development'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Prototyping ({assignedProblems.filter((c) => c.status === 'prototype_development').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('deployed')}
                className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap ${
                  statusFilter === 'deployed'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Deployed ({assignedProblems.filter((c) => c.status === 'deployed').length})
              </button>
            </div>
          </div>

          {/* Assigned Problems List */}
          {filteredAssigned.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-10 text-center space-y-3">
              <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-700">
                No Problems Found Matching Filters
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No assigned problems match your search or filter criteria.'
                  : `There are currently no problem statements assigned to ${universityProfile.shortName}.`}
              </p>
              <button
                type="button"
                onClick={() => setPanelView('incoming')}
                className="px-4 py-2 bg-[#003366] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Browse Incoming Problems to Adopt</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssigned.map((challenge) => {
                const isExpanded = expandedId === challenge.id;
                const stageIndex = getStageIndex(challenge.status);
                const badge = getStatusBadge(challenge.status);

                // Workflow stage variables strictly matching citizen -> university -> team -> proposal -> industry -> prototype -> deploy
                const isAccepted = challenge.universityAcceptance?.status === 'accepted' || 
                                   Boolean(challenge.team) || 
                                   ['team_constituted', 'proposal_submitted', 'prototype_development', 'deployed'].includes(challenge.status);
                const hasTeam = Boolean(challenge.team && challenge.team.studentMembers && challenge.team.studentMembers.length > 0);
                const hasProposal = Boolean(challenge.proposals && challenge.proposals.length > 0);
                const latestProposal = hasProposal ? challenge.proposals[0] : null;
                const isFundingGuaranteed = Boolean(
                  latestProposal?.fundingDecision?.status === 'accepted' || 
                  latestProposal?.status === 'funding_approved' || 
                  ['prototype_development', 'deployed'].includes(challenge.status)
                );

                // Industry verification / acceptance check
                const isIndustryVerified = Boolean(
                  challenge.prototypeDeliverable?.status === 'verified_by_industry' || 
                  Boolean(challenge.prototypeDeliverable?.verifiedByIndustry?.verified)
                );

                // Complete and Deployed is ONLY true after Industry accepts the prototype and deployment
                const isCompleteAndDeployed = Boolean(
                  (challenge.status === 'deployed' || challenge.lifecycleStatus === 'end') &&
                  isIndustryVerified
                );

                // Prototype has been submitted to industry, awaiting industry acceptance
                const isPrototypeSubmitted = Boolean(
                  challenge.prototypeDeliverable && 
                  !isCompleteAndDeployed
                );

                const effectiveBadge = isCompleteAndDeployed
                  ? { label: 'Complete and Deployed (Status: End)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' }
                  : isPrototypeSubmitted
                  ? { label: 'Prototype Submitted to Industry (Awaiting Acceptance)', bg: 'bg-blue-100 text-blue-900 border-blue-300 font-bold' }
                  : badge;

                return (
                  <div
                    key={challenge.id}
                    id={`uni-assigned-card-${challenge.id}`}
                    className="bg-white rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all shadow-xs overflow-hidden"
                  >
                    {/* Header Row */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded text-xs font-black tracking-wider bg-slate-100 text-slate-800 border border-slate-300 font-mono">
                            {challenge.code}
                          </span>
                          <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            {challenge.category}
                          </span>
                          <span className={`px-2.5 py-1 rounded text-xs font-extrabold border ${effectiveBadge.bg}`}>
                            {effectiveBadge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Assigned: {challenge.assignedUniversity?.assignedDate || challenge.submittedDate}</span>
                        </div>
                      </div>

                      {/* Title & Narrative */}
                      <div>
                        <h3
                          onClick={() => onSelectChallenge(challenge)}
                          className="text-base sm:text-lg font-black text-slate-900 hover:text-[#003366] cursor-pointer transition-colors"
                        >
                          {challenge.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {challenge.description}
                        </p>
                      </div>

                      {/* District, Beneficiary & Department Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span>{challenge.blockOrPanchayat}, {challenge.district}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-[#003366]" />
                          <span>Dept: <strong>{challenge.assignedUniversity?.department || universityProfile.facultySpecializations[0]}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          <span>Est. Beneficiaries: <strong>{(challenge.estimatedImpactPeople || 2500).toLocaleString('en-IN')} citizens</strong></span>
                        </div>
                      </div>

                      {/* Explicit End-to-End Workflow Status Banner */}
                      {!isAccepted ? (
                        <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-2.5 text-xs text-amber-950 font-bold">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                              <span>Problem Statement Assigned by Citizen/AI — Awaiting University Authority Acceptance & Start Work</span>
                              <p className="text-[11px] font-normal text-amber-800">
                                Once accepted, team management will be unlocked to assign student researchers and faculty mentors.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isAdoptingId === challenge.id}
                            onClick={() => handleAcceptProblemStatement(challenge)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap animate-pulse hover:animate-none"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>{isAdoptingId === challenge.id ? 'Starting Work...' : 'Accept Problem Statement & Start Work'}</span>
                          </button>
                        </div>
                      ) : !hasTeam ? (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-blue-950">
                          <div className="flex items-center gap-2 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Problem statement accepted! Next mandatory step: Manage research team to start working on technical solution.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenTeamModal(challenge)}
                            className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                          >
                            <Users className="w-3.5 h-3.5 text-purple-200" />
                            <span>Manage Team</span>
                          </button>
                        </div>
                      ) : !hasProposal ? (
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-purple-950">
                          <div className="flex items-center gap-2 font-bold">
                            <Users className="w-4 h-4 text-purple-600 shrink-0" />
                            <span>Research team active under {challenge.team?.facultyMentor}. Ready to submit proposal with plan/file to an industry!</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenProposalModal(challenge)}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-200" />
                            <span>Submit Proposal to Industry</span>
                          </button>
                        </div>
                      ) : !isFundingGuaranteed ? (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-950">
                          <div className="flex items-center gap-2 font-bold">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              Proposal sent to <strong>{latestProposal?.targetIndustryName || 'Industry Partner'}</strong>
                              {latestProposal?.proposalFile?.name ? ` (File: ${latestProposal.proposalFile.name})` : ''}.
                              Awaiting corporate officer review & CSR fund guarantee.
                            </span>
                          </div>
                          <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-bold uppercase whitespace-nowrap">
                            CSR Review Pending
                          </span>
                        </div>
                      ) : !challenge.prototypeDeliverable ? (
                        <div className="p-3.5 bg-emerald-50 rounded-xl border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
                          <div className="flex items-center gap-2.5 font-bold">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                              <span>🎉 CSR Fund Guaranteed by {latestProposal?.fundingDecision?.decidedBy || 'Industrial Officer'} ({latestProposal?.targetIndustryName || 'Corporate Partner'})!</span>
                              <div className="text-[11px] font-normal text-emerald-800 mt-0.5">
                                Guaranteed Grant: <strong>₹{(latestProposal?.fundingDecision?.guaranteeAmountINR || latestProposal?.estimatedBudgetINR || 350000).toLocaleString('en-IN')}</strong> • Ref: <span className="font-mono">{latestProposal?.fundingDecision?.csrSanctionRef || 'CSR-JH-APPROVED'}</span> • University prototyping is active!
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPrototypeDeployChallenge(challenge)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            <Rocket className="w-4 h-4 text-amber-300" />
                            <span>Submit Prototype & Deploy to Industry</span>
                          </button>
                        </div>
                      ) : isCompleteAndDeployed ? (
                        <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl border-2 border-emerald-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs animate-in fade-in">
                          <div className="flex items-center gap-2.5 font-bold">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                            <div>
                              <div className="text-sm font-black text-emerald-900 flex items-center gap-2">
                                <span>🎉 Complete and Deployed (Status: End)</span>
                                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black uppercase tracking-wider">
                                  Status: End
                                </span>
                              </div>
                              <p className="text-[11px] font-medium text-emerald-800 mt-0.5">
                                The Industrial Officer ({challenge.prototypeDeliverable?.verifiedByIndustry?.verifiedBy || 'Corporate Partner'}) has formally verified, accepted, and deployed your prototype into field operations! Official problem statement lifecycle status: <strong>END</strong>.
                              </p>
                              <div className="text-[10px] text-emerald-700 mt-1">
                                Deliverable: <strong>{challenge.prototypeDeliverable?.title}</strong> ({challenge.prototypeDeliverable?.version}) {challenge.prototypeDeliverable?.deliverableFile ? `• File: [${challenge.prototypeDeliverable.deliverableFile.name}]` : ''}
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-emerald-700 text-white rounded-full font-black text-xs shrink-0 shadow-xs whitespace-nowrap">
                            Lifecycle: END
                          </span>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-blue-50 rounded-xl border-2 border-blue-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950 shadow-xs">
                          <div className="flex items-center gap-2.5 font-bold">
                            <Rocket className="w-5 h-5 text-blue-700 shrink-0" />
                            <div>
                              <div className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                                <span>🚀 Prototype Submitted to {challenge.prototypeDeliverable?.deployedToIndustryName || latestProposal?.targetIndustryName || 'Industry Partner'}!</span>
                                <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                                  Awaiting Acceptance
                                </span>
                              </div>
                              <div className="text-[11px] font-medium text-blue-800 mt-0.5">
                                Deliverable: <strong>{challenge.prototypeDeliverable?.title}</strong> ({challenge.prototypeDeliverable?.version}) {challenge.prototypeDeliverable?.deliverableFile ? `• File: [${challenge.prototypeDeliverable.deliverableFile.name}] (${challenge.prototypeDeliverable.deliverableFile.size})` : ''}
                              </div>
                              <div className="text-[10px] text-blue-700 mt-0.5">
                                Awaiting industry partner review & verification. Once accepted, status transitions to <strong>Complete and Deployed (Status: End)</strong>.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/challenges/${challenge.id}/verify-prototype`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      verifiedBy: 'Industrial Review Officer',
                                      remarks: 'Directly verified and accepted deployment into community operations.',
                                      partnerName: challenge.prototypeDeliverable?.deployedToIndustryName || 'Industry Partner',
                                    }),
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    onUpdateChallenge(data.challenge);
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                              title="Simulate Industry Accepting the Prototype"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                              <span>Accept as Industry (Simulate)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 5-Stage Visual Stepper */}
                      <div className="pt-2">
                        <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>
                            Institutional Solution Pipeline: {isCompleteAndDeployed ? 'All 5 Stages Completed' : isPrototypeSubmitted ? 'Stage 5 of 5 • Awaiting Industry Acceptance' : `Stage ${stageIndex} of 5`}
                          </span>
                          <span className={isCompleteAndDeployed ? 'text-emerald-700 font-bold flex items-center gap-1' : isPrototypeSubmitted ? 'text-blue-700 font-bold flex items-center gap-1' : 'text-slate-500 font-normal'}>
                            {isCompleteAndDeployed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                                <span>Complete and Deployed (Status: End)</span>
                              </>
                            ) : isPrototypeSubmitted ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-blue-600 inline" />
                                <span>Awaiting Industry Acceptance</span>
                              </>
                            ) : (
                              'Milestones in Progress'
                            )}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[
                            { num: 1, label: 'Intake Validated' },
                            { num: 2, label: 'HEI Assigned' },
                            { num: 3, label: 'Team Ready' },
                            { num: 4, label: 'Prototyping' },
                            { num: 5, label: 'Complete & Deployed (End)' },
                          ].map((step) => {
                            const isDone = isCompleteAndDeployed 
                              ? true 
                              : isPrototypeSubmitted 
                              ? step.num < 5 // Steps 1-4 are completed!
                              : step.num < stageIndex;

                            const isCurrent = isCompleteAndDeployed 
                              ? false 
                              : isPrototypeSubmitted 
                              ? step.num === 5 // Step 5 is active (Awaiting Industry Acceptance)
                              : step.num === stageIndex;

                            return (
                              <div key={step.num} className="text-center">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    isDone
                                      ? 'bg-emerald-500'
                                      : isCurrent
                                      ? 'bg-amber-500 ring-2 ring-amber-300'
                                      : 'bg-slate-200'
                                  }`}
                                />
                                <div className={`text-[10px] font-medium mt-1 truncate ${
                                  isDone
                                    ? 'text-emerald-700 font-bold'
                                    : isCurrent
                                    ? 'text-amber-800 font-bold'
                                    : 'text-slate-500'
                                }`}>
                                  {step.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick Summary of Team, Proposal, Prototype */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                        {/* Team Status */}
                        <div className="p-2.5 rounded-lg border bg-white border-slate-200 flex items-start gap-2">
                          <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">R&D Team</div>
                            {challenge.team ? (
                              <div className="font-semibold text-slate-800">
                                {challenge.team.studentMembers.length} Students • {challenge.team.facultyMentor.split(' ')[0]}
                              </div>
                            ) : (
                              <div className="text-amber-700 font-bold">Team Pending</div>
                            )}
                          </div>
                        </div>

                        {/* Proposal / Grant */}
                        <div className="p-2.5 rounded-lg border bg-white border-slate-200 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Technical Proposal</div>
                            {challenge.proposals && challenge.proposals.length > 0 ? (
                              <div className="font-semibold text-slate-800">
                                ₹{(challenge.proposals[0].estimatedBudgetINR / 1000).toFixed(0)}k Grant Req.
                              </div>
                            ) : (
                              <div className="text-slate-500">Draft Formulation</div>
                            )}
                          </div>
                        </div>

                        {/* Prototype / Patent */}
                        <div className="p-2.5 rounded-lg border bg-white border-slate-200 flex items-start gap-2">
                          <Microscope className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Lab Testing & IP</div>
                            {challenge.patentInfo && challenge.patentInfo.status !== 'none' ? (
                              <div className="font-semibold text-teal-800">
                                Patent: {challenge.patentInfo.status.toUpperCase()}
                              </div>
                            ) : challenge.prototypeTesting?.testedInField ? (
                              <div className="font-semibold text-emerald-700">Lab & Field Tested</div>
                            ) : (
                              <div className="text-slate-500">Bench Prototyping</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Section Toggle */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-200 space-y-3 bg-slate-50 p-3.5 rounded-lg text-xs">
                          {/* Detailed Team List */}
                          {challenge.team && (
                            <div>
                              <div className="font-bold text-[#003366] mb-1">
                                Faculty Mentor & Student Research Scholars:
                              </div>
                              <div className="text-slate-700 font-semibold mb-1">
                                Faculty Lead: {challenge.team.facultyMentor} ({challenge.team.mentorDesignation}) - {challenge.team.mentorDepartment}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {challenge.team.studentMembers.map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 text-[11px]"
                                  >
                                    <strong>{s.name}</strong> ({s.discipline} • {s.yearOrSemester})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Proposal Details */}
                          {challenge.proposals && challenge.proposals.length > 0 && (
                            <div>
                              <div className="font-bold text-[#003366] mb-1">
                                Submitted Technological Proposal:
                              </div>
                              <div className="p-2 bg-white rounded border border-slate-200">
                                <div className="font-bold text-slate-800">
                                  {challenge.proposals[0].proposalTitle}
                                </div>
                                <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">
                                  {challenge.proposals[0].summary}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Field Testing & Patent Data */}
                          {challenge.prototypeTesting && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="p-2 bg-white rounded border border-slate-200">
                                <span className="font-bold text-slate-700 block">Field Testing Summary:</span>
                                <span className="text-slate-600">
                                  {challenge.prototypeTesting.testingSummary || 'Lab test results verified.'}
                                </span>
                              </div>
                              <div className="p-2 bg-white rounded border border-slate-200">
                                <span className="font-bold text-slate-700 block">Patent / IP Records:</span>
                                <span className="text-slate-600">
                                  {challenge.patentInfo?.patentTitle || 'Provisional filing in preparation with university IPR Cell.'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : challenge.id)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Full R&D Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Option 1: Accept Problem Statement & Start Work (Mandated by user workflow) */}
                          {!isAccepted ? (
                            <button
                              type="button"
                              disabled={isAdoptingId === challenge.id}
                              onClick={() => handleAcceptProblemStatement(challenge)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-black inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                              <span>{isAdoptingId === challenge.id ? 'Starting Work...' : 'Accept Problem Statement & Start Work'}</span>
                            </button>
                          ) : null}

                          {/* Option 2: Manage Team (Mandated by user workflow: after accepting, there is a manage team option) */}
                          <button
                            type="button"
                            disabled={!isAccepted}
                            onClick={() => onOpenTeamModal(challenge)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all ${
                              !isAccepted
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : isAccepted && !hasTeam
                                ? 'bg-purple-700 text-white hover:bg-purple-800 shadow-xs ring-2 ring-purple-400 cursor-pointer animate-pulse hover:animate-none'
                                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-300 cursor-pointer'
                            }`}
                            title={!isAccepted ? 'Accept problem statement first to unlock team management' : 'Manage student researchers and faculty mentor'}
                          >
                            {!isAccepted ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : <Users className="w-3.5 h-3.5 text-purple-700" />}
                            <span>{hasTeam ? 'Manage Team' : 'Constitute & Manage Team'}</span>
                          </button>

                          {/* Option 3: Submit Proposal with Idea/Plan in File Format to Industry (Mandated by user workflow) */}
                          {!isFundingGuaranteed ? (
                            <button
                              type="button"
                              disabled={!isAccepted || !hasTeam}
                              onClick={() => onOpenProposalModal(challenge)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all ${
                                !isAccepted || !hasTeam
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                  : hasTeam && !hasProposal
                                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs ring-2 ring-amber-400 cursor-pointer'
                                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 cursor-pointer'
                              }`}
                              title={
                                !isAccepted
                                  ? 'Accept problem statement first'
                                  : !hasTeam
                                  ? 'Manage research team first to start working before submitting proposal'
                                  : 'Submit proposal with idea/plan in file format to a specific company or industry'
                              }
                            >
                              {!isAccepted || !hasTeam ? (
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                              )}
                              <span>{hasProposal ? 'View / Edit Proposal Dossier' : 'Submit Proposal (File & Plan)'}</span>
                            </button>
                          ) : null}

                          {/* Option 4: Submit Prototype & Deploy to Industry (Mandated by user workflow: after industry CSR guarantee, start prototyping and deploy deliverable file) */}
                          {isFundingGuaranteed && !challenge.prototypeDeliverable ? (
                            <button
                              type="button"
                              onClick={() => setPrototypeDeployChallenge(challenge)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-lg text-xs font-black inline-flex items-center gap-1.5 shadow-sm cursor-pointer ring-2 ring-blue-300 animate-pulse hover:animate-none"
                            >
                              <Rocket className="w-3.5 h-3.5 text-amber-300" />
                              <span>Submit Prototype & Deploy</span>
                            </button>
                          ) : null}

                          {/* Option 5: Prototype Submitted, Awaiting Industry Acceptance */}
                          {isPrototypeSubmitted && !isCompleteAndDeployed ? (
                            <button
                              type="button"
                              onClick={() => setPrototypeDeployChallenge(challenge)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-950 border border-blue-300 hover:bg-blue-100 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span>View Submitted Deliverable ({challenge.prototypeDeliverable?.version || 'v1.0'})</span>
                            </button>
                          ) : null}

                          {/* Option 6: Deployed & Accepted Prototype Handover View */}
                          {isCompleteAndDeployed ? (
                            <button
                              type="button"
                              onClick={() => setPrototypeDeployChallenge(challenge)}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>View Deployed Deliverable ({challenge.prototypeDeliverable?.version || 'v1.0'})</span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW B: INCOMING CHALLENGES AWAITING ADOPTION */}
      {/* ========================================================================= */}
      {panelView === 'incoming' && (
        <section className="space-y-4" id="incoming-adoption-view">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-sm text-amber-950">
                Societal Problems Auto-Routed & Recommended for {universityProfile.shortName}
              </div>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                These community challenges have been submitted by rural citizens and local government bodies. Your university can adopt these problem statements for academic research, student capstone projects, and technology business incubation under state grant funding.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {incomingProblems.map((ch) => {
              const isAdoptingThis = isAdoptingId === ch.id;

              return (
                <div
                  key={ch.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border font-mono">
                        {ch.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {ch.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600">
                        {ch.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>

                    <span className="text-xs text-slate-500">
                      Logged from: <strong>{ch.blockOrPanchayat}, {ch.district}</strong>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{ch.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {ch.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectChallenge(ch)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Review Feasibility Details
                    </button>

                    <button
                      type="button"
                      disabled={isAdoptingThis}
                      onClick={() => handleAdopt(ch.id)}
                      className="px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isAdoptingThis ? 'Adopting Problem...' : 'Adopt for Prototyping & R&D'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW C: INSTITUTIONAL R&D & LAB FACILITIES DIRECTORY */}
      {/* ========================================================================= */}
      {panelView === 'profile' && (
        <section className="bg-white rounded-xl border-2 border-slate-200 p-6 space-y-6" id="university-profile-view">
          <div>
            <h3 className="text-base font-extrabold text-[#003366]">
              {universityProfile.name} - Institutional R&D Capacity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Accredited academic resources, faculty domains, prototyping labs, and incubation infrastructure registered with the Department of Higher & Technical Education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Faculty Domains */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#003366]">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Faculty Specializations & Engineering Departments</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {universityProfile.facultySpecializations.map((spec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Research & Lab Facilities */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#003366]">
                <Microscope className="w-4 h-4 text-teal-600" />
                <span>Central Instrumentation & Prototyping Labs</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {universityProfile.researchFacilities.map((fac, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Incubation Center & Student Cohort */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase">Technology Incubation Center</div>
              <div className="text-sm font-black text-[#003366] mt-0.5">
                {universityProfile.incubationCenter}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Student Cohort: <strong>{universityProfile.studentCohort}</strong>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-bold text-slate-500">Historical Solved Challenges</div>
              <div className="text-2xl font-black text-emerald-700">
                {universityProfile.solvedChallengesCount} Completed
              </div>
              <div className="text-[11px] text-slate-500 font-semibold">
                {universityProfile.activePatentsCount} Active Patents
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Prototype Submission and Deployment Modal */}
      {prototypeDeployChallenge && (
        <PrototypeDeployModal
          isOpen={Boolean(prototypeDeployChallenge)}
          onClose={() => setPrototypeDeployChallenge(null)}
          challenge={prototypeDeployChallenge}
          currentUser={currentUser}
          onPrototypeDeployed={(updatedChallenge) => {
            onUpdateChallenge(updatedChallenge);
            if (onAddNotification) {
              onAddNotification({
                title: 'Prototype Deployed to Industry!',
                message: `Functional prototype package for [${updatedChallenge.code}] has been formally deployed to ${updatedChallenge.prototypeDeliverable?.deployedToIndustryName || 'Industry Partner'}.`,
                type: 'success',
              });
            }
          }}
        />
      )}
    </div>
  );
};
