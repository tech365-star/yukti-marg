import React, { useState } from 'react';
import { Challenge, User } from '../types';
import { 
  Users, 
  BrainCircuit, 
  GraduationCap, 
  Building2, 
  BarChart3, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Camera, 
  Video, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Lightbulb, 
  Search, 
  FileCode2, 
  Coins, 
  ChevronRight, 
  Activity, 
  Flame, 
  Award, 
  Layers, 
  PlusCircle, 
  Compass, 
  Info,
  BadgeCheck
} from 'lucide-react';

interface WorkflowFlowchartViewProps {
  challenges: Challenge[];
  currentUser: User | null;
  onOpenSubmitModal: () => void;
  onOpenLoginModal: () => void;
  onSelectChallenge: (challenge: Challenge) => void;
  onNavigateToTab: (tab: any) => void;
}

export const WorkflowFlowchartView: React.FC<WorkflowFlowchartViewProps> = ({
  challenges,
  currentUser,
  onOpenSubmitModal,
  onOpenLoginModal,
  onSelectChallenge,
  onNavigateToTab,
}) => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Compute counts for each flowchart stage
  const stage1Count = challenges.length;
  const stage2Count = challenges.filter((c) => c.aiAnalysis).length;
  const stage3Count = challenges.filter((c) => c.assignedUniversity || c.team || c.proposals.length > 0).length;
  const stage4Count = challenges.filter((c) => c.industryPartners && c.industryPartners.length > 0).length;
  const stage5Count = challenges.filter(
    (c) => c.status === 'deployed' || c.status === 'pilot_testing' || c.patentInfo || c.researchPaperInfo
  ).length;

  const getStageChallenges = (stage: number) => {
    switch (stage) {
      case 1:
        return challenges;
      case 2:
        return challenges.filter((c) => c.aiAnalysis);
      case 3:
        return challenges.filter((c) => c.assignedUniversity || c.team || c.proposals.length > 0);
      case 4:
        return challenges.filter((c) => c.industryPartners && c.industryPartners.length > 0);
      case 5:
        return challenges.filter(
          (c) => c.status === 'deployed' || c.status === 'pilot_testing' || c.patentInfo || c.researchPaperInfo
        );
      default:
        return challenges;
    }
  };

  const currentStageChallenges = getStageChallenges(activeStage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Layers className="w-3.5 h-3.5" />
            Official State Architecture • 5-Stage Data Flow
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Societal Innovation & Solution Engineering Pipeline
          </h1>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-3xl">
            Yukti Marg orchestrates grassroot challenges from rural Panchayats and citizens through AI multi-domain classification and de-duplication, routing to multidisciplinary university research teams, pairing with industry CSR funding, and monitoring patents and district-level community deployment.
          </p>

          {/* Citizen Login Indicator & Action */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {currentUser ? (
              <div className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span>Logged In as: <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()} • {currentUser.organization})</span>
              </div>
            ) : (
              <div className="bg-amber-500/20 border border-amber-400/30 text-amber-200 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Citizen Login Required to Submit Problems:</span>
                <button
                  onClick={onOpenLoginModal}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded text-xs transition-colors cursor-pointer"
                >
                  Sign In Now
                </button>
              </div>
            )}

            <button
              onClick={onOpenSubmitModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Societal Challenge</span>
            </button>

            <button
              onClick={() => onNavigateToTab('analytics')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>View Government Impact Analytics</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Pattern */}
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 5-STAGE INTERACTIVE FLOWCHART CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-800" />
              5-Stage Data Flow & Operations Architecture
            </h2>
            <p className="text-xs text-stone-500">
              Click any stage card below to inspect data specifications, operational logic, and matching state challenges
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-600 bg-[#faf6ee] border border-stone-200 px-2.5 py-1 rounded-full">
            Active: Stage {activeStage} of 5
          </span>
        </div>

        {/* Flowchart Horizontal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* STAGE 1: THE INPUT */}
          <button
            onClick={() => setActiveStage(1)}
            className={`p-4 rounded-xl text-left border-2 transition-all relative cursor-pointer flex flex-col justify-between ${
              activeStage === 1
                ? 'border-emerald-700 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-[#faf8f5] shadow-xs'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                  Stage 1
                </span>
                <span className="text-xs font-bold text-stone-700">{stage1Count} Challenges</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 rounded-lg bg-emerald-700 text-white">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">THE INPUT</h3>
              </div>
              <div className="text-[11px] text-stone-600 space-y-1 pt-1">
                <p><strong>Who:</strong> Citizens, Community Orgs, Panchayats (PRI/ULB), Govmt</p>
                <p><strong>What:</strong> Ground challenges with photos, video, GPS, docs</p>
                <p><strong>Goal:</strong> Agriculture, Health, Energy, Water, etc.</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] font-bold text-emerald-800">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                Login Required
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* STAGE 2: AI Problem Management */}
          <button
            onClick={() => setActiveStage(2)}
            className={`p-4 rounded-xl text-left border-2 transition-all relative cursor-pointer flex flex-col justify-between ${
              activeStage === 2
                ? 'border-indigo-700 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Stage 2
                </span>
                <span className="text-xs font-bold text-slate-700">{stage2Count} Evaluated</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 rounded-lg bg-indigo-600 text-white">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">AI Problem Mgmt</h3>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                <p><strong>Classification:</strong> Themed multi-domain AI detection</p>
                <p><strong>De-duplication:</strong> Prevents clutter & redundant entries</p>
                <p><strong>Expertise-Routing:</strong> Faculty specialization & incubator match</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-indigo-700">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Gemini 3.8 Flash
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* STAGE 3: University Collaboration */}
          <button
            onClick={() => setActiveStage(3)}
            className={`p-4 rounded-xl text-left border-2 transition-all relative cursor-pointer flex flex-col justify-between ${
              activeStage === 3
                ? 'border-emerald-700 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Stage 3
                </span>
                <span className="text-xs font-bold text-slate-700">{stage3Count} Engaged</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 rounded-lg bg-emerald-600 text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">University Collab</h3>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                <p><strong>Review:</strong> HEI faculty feasibility evaluation</p>
                <p><strong>Team Formation:</strong> Multidisciplinary (e.g. Bio + CS)</p>
                <p><strong>Mentorship:</strong> Formal research & solution proposal</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-emerald-700">
              <span>24 HEIs Linked</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* STAGE 4: Industry & Partnership */}
          <button
            onClick={() => setActiveStage(4)}
            className={`p-4 rounded-xl text-left border-2 transition-all relative cursor-pointer flex flex-col justify-between ${
              activeStage === 4
                ? 'border-amber-700 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-600 text-white">
                  Stage 4
                </span>
                <span className="text-xs font-bold text-slate-700">{stage4Count} Funded</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 rounded-lg bg-amber-600 text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Industry & Partners</h3>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                <p><strong>Partners:</strong> Tech firms, CSR orgs, MSMEs, Startups</p>
                <p><strong>The Action:</strong> Mentorship, funding grants & prototyping</p>
                <p><strong>Result:</strong> Prototype moves to real-world product</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-amber-800">
              <span>₹2.45 Cr Mobilized</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* STAGE 5: Lifecycle & Dashboard */}
          <button
            onClick={() => setActiveStage(5)}
            className={`p-4 rounded-xl text-left border-2 transition-all relative cursor-pointer flex flex-col justify-between ${
              activeStage === 5
                ? 'border-purple-700 bg-purple-50/70 shadow-md ring-2 ring-purple-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-xs'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Stage 5
                </span>
                <span className="text-xs font-bold text-slate-700">{stage5Count} Tracked</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 rounded-lg bg-purple-600 text-white">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Lifecycle & Dash</h3>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                <p><strong>Project Monitoring:</strong> Prototype tested? Deployed?</p>
                <p><strong>Patent Monitoring:</strong> Patents filed & research papers</p>
                <p><strong>Govt Analytics:</strong> Solved problems by district</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-purple-700">
              <span>Impact Tracking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* ACTIVE STAGE DEEP DIVE PANEL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Stage 1 Deep Dive */}
        {activeStage === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-stone-200">
              <div className="space-y-1 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                  <Users className="w-3.5 h-3.5" />
                  Stage 1 Specifications • The Input
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  Direct Societal Challenge Intake with Verified Citizen Authentication
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Every challenge begins with primary evidence submitted directly from grassroot actors across all 24 Jharkhand districts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSubmitModal}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  <span>Test Stage 1 Form (Open Modal)</span>
                </button>
              </div>
            </div>

            {/* Stage 1 Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-[#faf8f5] border border-stone-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="text-xs font-bold text-stone-900">Who? (Submitter Entities)</h4>
                <ul className="text-[11px] text-stone-600 space-y-1">
                  <li>• Individual Citizens</li>
                  <li>• Community Organizations & SHGs</li>
                  <li>• Gram Panchayats / PRIs / ULBs</li>
                  <li>• District Government Agencies</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-[#faf8f5] border border-stone-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="text-xs font-bold text-stone-900">What? (Evidence Modalities)</h4>
                <ul className="text-[11px] text-stone-600 space-y-1 flex flex-col">
                  <li className="flex items-center gap-1.5"><Camera className="w-3 h-3 text-amber-700" /> Photos & camera proof</li>
                  <li className="flex items-center gap-1.5"><Video className="w-3 h-3 text-purple-700" /> Videos & link demonstrations</li>
                  <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-red-700" /> GPS coordinates & geotags</li>
                  <li className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-emerald-700" /> Water/soil test documents</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-[#faf8f5] border border-stone-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="text-xs font-bold text-stone-900">Goal? (Thematic Domains)</h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Targeting acute local constraints in Agriculture, Water Resources, Clean Energy, Healthcare, and Tribal livelihoods.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-300 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4 text-amber-900" />
                </div>
                <h4 className="text-xs font-bold text-amber-950">Citizen Login Requirement</h4>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Mandatory authentication ensures verified citizen identity, geotag authenticity, and establishes direct academic correspondence.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2 Deep Dive */}
        {activeStage === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="space-y-1 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  Stage 2 Specifications • AI Problem Management
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Automated Multi-Themed Classification, De-duplication & Academic Routing
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Powered by Gemini 3.8 Flash to extract technical bottlenecks, verify novelty, and match faculty specializations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToTab('ai-doc-tool')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Launch AI Document Categorizer Tool</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Classification
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  AI reads the submitted text and identifies both <strong>Primary Themed Domain</strong> and <strong>Secondary Overlapping Domain</strong> (e.g., Agriculture + Water Resources problem).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  De-duplication Check
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  AI checks and sorts duplicate problems against all existing submissions across Jharkhand blocks to prevent database clutter and redundant academic allocations.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#faf6ee] border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  Expertise-Routing
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Matches problem to university based on <strong>Faculty Specialization</strong> (e.g. PCM refrigeration, geopolymer chemistry) and <strong>Incubation Facilities</strong> (e.g. BIT-TBI, BAU AgTech Hub).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stage 3 Deep Dive */}
        {activeStage === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-stone-200">
              <div className="space-y-1 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Stage 3 Specifications • University Collaboration
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  Multidisciplinary Student-Faculty Research & Solution Proposals
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Higher Education Institutions (HEIs) convert community problems into live engineering projects under NEP 2020.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToTab('university')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Open University Research Hub</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#faf8f5] border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  Academic Review
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Assigned university deans and department heads evaluate field feasibility, technical constraints, and lab resource requirements.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#faf8f5] border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" />
                  Team Formation
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Constituting <strong>Multidisciplinary Teams</strong> (e.g. Biology students working alongside Computer Science and Mechanical Engineering students).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#faf8f5] border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Faculty Mentorship
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Senior professors guide student innovators with structured milestones, CAD/prototyping assistance, and formal solution proposals.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stage 4 Deep Dive */}
        {activeStage === 4 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-stone-200">
              <div className="space-y-1 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                  <Building2 className="w-3.5 h-3.5" />
                  Stage 4 Specifications • Industry & Partnership
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  CSR Grant Mobilization, Mentorship & Prototyping Facilities
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Connecting commercial and public enterprises directly to high-impact university societal prototypes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToTab('industry')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Open Industry & CSR Hub</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#faf8f5] border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  Partners
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Tech companies, corporate CSR foundations (Tata Steel, SAIL, Coal India), MSMEs, and Jharkhand tech startups.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#faf8f5] border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  The Action
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Providing <strong>Mentorship</strong>, direct <strong>Funding Grants</strong> (₹2.5L to ₹15L), and access to precision <strong>Prototyping Labs</strong>.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#faf8f5] border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-700" />
                  The Result
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  The university prototype transitions from lab scale into a robust, deployable real-world product with local supply chain integration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stage 5 Deep Dive */}
        {activeStage === 5 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-stone-200">
              <div className="space-y-1 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Stage 5 Specifications • Lifecycle & Dashboard
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  Project Monitoring, Patent Tracking & Government District Impact Analytics
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Closing the loop with verified community adoption, scientific IP protection, and district-level metrics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToTab('analytics')}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View District Impact Analytics</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-purple-50/50 border border-purple-200 space-y-2">
                <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-700" />
                  Project Monitoring
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Milestone tracking verifying: <strong>Was the prototype tested?</strong> (field pilot reports) and <strong>Was it deployed?</strong> (community adoption sign-off).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#faf6ee] border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-700" />
                  Patent Monitoring
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Tracking if an <strong>Indian Patent Application</strong> was filed or a <strong>Peer-Reviewed Research Paper</strong> was published by student-faculty inventors.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
                <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-700" />
                  Government Impact Analytics
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  A high-level dashboard for the Government to see: <strong>How many problems were solved in which district?</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CHALLENGES CURRENTLY IN THIS STAGE */}
        <div className="p-6 bg-[#faf8f5] border-t border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Challenges Currently in Stage {activeStage} ({currentStageChallenges.length})
            </h4>
            <span className="text-[11px] text-stone-500">
              Click any card to view full challenge details, milestones, and patent records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentStageChallenges.slice(0, 6).map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => onSelectChallenge(challenge)}
                className="bg-white rounded-lg p-4 border border-stone-200 hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[10px] font-bold text-stone-500">{challenge.code}</span>
                    <span className="bg-[#faf6ee] text-stone-700 border border-stone-200 font-semibold px-2 py-0.5 rounded text-[10px]">
                      {challenge.district}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-stone-900 line-clamp-2">{challenge.title}</h5>
                  <p className="text-[11px] text-stone-600 line-clamp-2">{challenge.description}</p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                  {challenge.patentInfo && challenge.patentInfo.status !== 'none' ? (
                    <span className="text-purple-700 font-bold flex items-center gap-1">
                      <Award className="w-3 h-3 text-purple-600" />
                      Patent: {challenge.patentInfo.status.toUpperCase()}
                    </span>
                  ) : challenge.prototypeTesting?.testedInField ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Tested in Field
                    </span>
                  ) : (
                    <span className="text-stone-500">
                      Domain: {challenge.category.split('&')[0]}
                    </span>
                  )}
                  <span className="text-emerald-800 font-bold flex items-center gap-0.5">
                    Inspect →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
