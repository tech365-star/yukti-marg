import React, { useState } from 'react';
import { Challenge, User, ThematicCategory } from '../types';
import { UNIVERSITIES, JHARKHAND_DISTRICTS } from '../data/mockData';
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
  Paperclip,
  Video,
  Eye,
  UserCheck,
  Star,
  Layers,
  ArrowRight
} from 'lucide-react';

interface UniversityHubViewProps {
  challenges: Challenge[];
  onSelectChallenge: (c: Challenge) => void;
  onOpenTeamModal: (c: Challenge) => void;
  onOpenProposalModal: (c: Challenge) => void;
  onAdoptChallenge?: (challengeId: string) => Promise<void>;
  onReviewChallenge?: (challengeId: string, review: { feasibilityScore: number; evaluationSummary: string }) => Promise<void>;
  currentUser: User | null;
}

type SubTab = 'awaiting_adoption' | 'all' | 'recommended_mine' | 'adopted_mine' | 'needs_team' | 'prototyping';

export const UniversityHubView: React.FC<UniversityHubViewProps> = ({
  challenges,
  onSelectChallenge,
  onOpenTeamModal,
  onOpenProposalModal,
  onAdoptChallenge,
  onReviewChallenge,
  currentUser,
}) => {
  const currentUniName = currentUser?.organization || 'Birla Institute of Technology (BIT) Mesra, Ranchi';
  
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('awaiting_adoption');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterUni, setFilterUni] = useState<string>('All');
  
  // Interactive Academic Review Modal State
  const [evaluatingChallenge, setEvaluatingChallenge] = useState<Challenge | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(88);
  const [reviewSummary, setReviewSummary] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [adoptingId, setAdoptingId] = useState<string | null>(null);

  // Categories list
  const categories: ThematicCategory[] = [
    'Agriculture & Rural Livelihoods',
    'Water Resources & Sanitation',
    'Healthcare & Telemedicine',
    'Smart Education & Skill Dev',
    'Tribal Crafts, Forestry & Mining Tech',
    'Clean Energy & Environment',
    'Urban Infrastructure & Waste',
    'Public Service Delivery & Accessibility',
  ];

  // Helper matchers
  const isAwaitingAdoption = (c: Challenge) => c.status === 'submitted' || c.status === 'under_review';
  const isRecommendedForMyUni = (c: Challenge) =>
    c.aiAnalysis?.recommendedUniversities.some((u) =>
      u.toLowerCase().includes(currentUniName.split(' ')[0].toLowerCase()) ||
      currentUniName.toLowerCase().includes(u.toLowerCase())
    ) ?? false;
  const isAdoptedByMyUni = (c: Challenge) =>
    c.assignedUniversity?.name.toLowerCase().includes(currentUniName.split(' ')[0].toLowerCase()) ||
    (c.assignedUniversity?.name && currentUniName.toLowerCase().includes(c.assignedUniversity.name.toLowerCase()));

  // Metric counts
  const totalSubmissions = challenges.length;
  const awaitingCount = challenges.filter(isAwaitingAdoption).length;
  const recommendedCount = challenges.filter(isRecommendedForMyUni).length;
  const adoptedCount = challenges.filter(isAdoptedByMyUni).length;
  const teamsCount = challenges.filter((c) => c.team).length;
  const prototypingCount = challenges.filter((c) => ['prototype_development', 'pilot_testing'].includes(c.status)).length;

  // Filter challenges according to subtab and search filters
  const filteredChallenges = challenges.filter((c) => {
    // 1. SubTab filtering
    if (activeSubTab === 'awaiting_adoption' && !isAwaitingAdoption(c)) return false;
    if (activeSubTab === 'recommended_mine' && !isRecommendedForMyUni(c)) return false;
    if (activeSubTab === 'adopted_mine' && !isAdoptedByMyUni(c)) return false;
    if (activeSubTab === 'needs_team' && c.team) return false;
    if (activeSubTab === 'prototyping' && !['prototype_development', 'pilot_testing'].includes(c.status)) return false;

    // 2. University dropdown filter
    if (filterUni !== 'All') {
      const matchesAssigned = c.assignedUniversity?.name.toLowerCase().includes(filterUni.toLowerCase());
      const matchesRec = c.aiAnalysis?.recommendedUniversities.some((u) => u.toLowerCase().includes(filterUni.toLowerCase()));
      if (!matchesAssigned && !matchesRec) return false;
    }

    // 3. District filter
    if (selectedDistrict !== 'All' && c.district !== selectedDistrict) {
      return false;
    }

    // 4. Category filter
    if (selectedCategory !== 'All' && c.category !== selectedCategory) {
      return false;
    }

    // 5. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchCitizen = c.submittedBy.name.toLowerCase().includes(q);
      const matchCode = c.code.toLowerCase().includes(q);
      const matchLoc = (c.blockOrPanchayat || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCitizen && !matchCode && !matchLoc) {
        return false;
      }
    }

    return true;
  });

  const handleAdoptClick = async (challenge: Challenge) => {
    if (!onAdoptChallenge) return;
    setAdoptingId(challenge.id);
    try {
      await onAdoptChallenge(challenge.id);
    } finally {
      setAdoptingId(null);
    }
  };

  const handleOpenReviewModal = (challenge: Challenge) => {
    setEvaluatingChallenge(challenge);
    setReviewScore(challenge.universityReview?.feasibilityScore || 88);
    setReviewSummary(
      challenge.universityReview?.evaluationSummary ||
      `Technically viable for prototype development under the faculty research cell. Multidisciplinary student team can be constituted to deploy a working solution within 4-6 months.`
    );
  };

  const handleSubmitAcademicReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingChallenge || !onReviewChallenge) return;

    setIsSubmittingReview(true);
    try {
      await onReviewChallenge(evaluatingChallenge.id, {
        feasibilityScore: reviewScore,
        evaluationSummary: reviewSummary,
      });
      setEvaluatingChallenge(null);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6" id="university-portal-view">
      {/* 1. Official Institutional Authority Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-[#003366] to-slate-900 text-white p-6 sm:p-7 rounded-2xl border-l-6 border-amber-400 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
              <GraduationCap className="w-4 h-4 text-slate-950" />
              <span>University Authority Portal • NEP 2020 Social Challenge Research Cell</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Citizen Problem Intake & Higher Education Research Hub
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              As an accredited university authority, you can directly inspect societal problems submitted by rural and urban citizens across Jharkhand, adopt unassigned challenges for your institution, conduct academic feasibility evaluations, and constitute student-faculty project cohorts with state and industry co-funding.
            </p>
          </div>

          {/* Authenticated Authority Persona Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-xs min-w-[280px] shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/15">
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified HEI Authority
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded font-mono font-semibold">
                GOV.JH-HEI
              </span>
            </div>
            <p className="font-bold text-white text-sm">
              {currentUser?.name || 'Prof. Dr. Rajesh K. Verma'}
            </p>
            <p className="text-amber-200 text-xs font-medium">
              {currentUser?.organization || 'Birla Institute of Technology (BIT) Mesra, Ranchi'}
            </p>
            <p className="text-purple-200 text-[11px] mt-0.5">
              {currentUser?.department || 'Dept. of Mechanical & Agro-Automation Engineering'}
            </p>
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-purple-200">
              <span>Incubation: TBI & IDEA Lab</span>
              <span className="text-emerald-300 font-semibold">Portal Access Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setActiveSubTab('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-600/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-semibold block">Total Citizen Issues</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{totalSubmissions}</span>
          <span className="text-[10px] text-purple-700 font-bold block mt-1">Across 24 Districts</span>
        </div>

        <div 
          onClick={() => setActiveSubTab('awaiting_adoption')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'awaiting_adoption'
              ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-600/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-semibold">Awaiting HEI</span>
            {awaitingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-2xl font-black text-amber-600 mt-0.5 block">{awaitingCount}</span>
          <span className="text-[10px] text-amber-800 font-bold block mt-1">Fresh Submissions</span>
        </div>

        <div 
          onClick={() => setActiveSubTab('recommended_mine')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'recommended_mine'
              ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-semibold block">AI Matched</span>
          <span className="text-2xl font-black text-[#003366] mt-0.5 block">{recommendedCount}</span>
          <span className="text-[10px] text-blue-700 font-bold block mt-1">For BIT Mesra / Mine</span>
        </div>

        <div 
          onClick={() => setActiveSubTab('adopted_mine')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'adopted_mine'
              ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-semibold block">Adopted by Me</span>
          <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{adoptedCount}</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">Assigned to My HEI</span>
        </div>

        <div 
          onClick={() => setActiveSubTab('needs_team')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'needs_team'
              ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-semibold block">Needs Team</span>
          <span className="text-2xl font-black text-indigo-700 mt-0.5 block">{challenges.filter((c) => !c.team).length}</span>
          <span className="text-[10px] text-indigo-600 font-bold block mt-1">Form Student Cohort</span>
        </div>

        <div 
          onClick={() => setActiveSubTab('prototyping')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'prototyping'
              ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-600/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-teal-300 shadow-xs'
          }`}
        >
          <span className="text-[11px] text-slate-500 font-semibold block">Field Pilots</span>
          <span className="text-2xl font-black text-teal-700 mt-0.5 block">{prototypingCount}</span>
          <span className="text-[10px] text-teal-600 font-bold block mt-1">Active Fabrication</span>
        </div>
      </div>

      {/* 3. Sub-Navigation Filter Tabs */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveSubTab('awaiting_adoption')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'awaiting_adoption'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-200" />
            <span>Fresh Citizen Submissions (Awaiting HEI Adoption)</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{awaitingCount}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-[#003366] text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FolderCheck className="w-3.5 h-3.5" />
            <span>All Citizen Problems</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{totalSubmissions}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('recommended_mine')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'recommended_mine'
                ? 'bg-purple-700 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Recommended for My University</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{recommendedCount}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('adopted_mine')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'adopted_mine'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Adopted by My University</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{adoptedCount}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('needs_team')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'needs_team'
                ? 'bg-indigo-700 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Needs Project Team</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {challenges.filter((c) => !c.team).length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('prototyping')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'prototyping'
                ? 'bg-teal-700 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Prototyping & Pilots</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{prototypingCount}</span>
          </button>
        </div>

        {/* Search & Secondary Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-slate-100">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by problem title, citizen name, village, or tracking ID..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003366]"
            >
              <option value="All">All 24 Jharkhand Districts</option>
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003366]"
            >
              <option value="All">All Thematic Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Filter Information / Count Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">
            Displaying {filteredChallenges.length} Problem{filteredChallenges.length === 1 ? '' : 's'}
          </span>
          <span>•</span>
          <span className="text-slate-500">
            {activeSubTab === 'awaiting_adoption' && 'Fresh citizen submissions ready for academic adoption'}
            {activeSubTab === 'all' && 'All ground-level problems submitted across Jharkhand'}
            {activeSubTab === 'recommended_mine' && `AI-recommended problems matching ${currentUniName}`}
            {activeSubTab === 'adopted_mine' && `Problems adopted by ${currentUniName}`}
            {activeSubTab === 'needs_team' && 'Challenges needing student-faculty project cohort formation'}
            {activeSubTab === 'prototyping' && 'Active laboratory prototyping and field trials'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Institution Filter:</span>
          <select
            value={filterUni}
            onChange={(e) => setFilterUni(e.target.value)}
            className="text-xs px-2.5 py-1 border border-slate-300 rounded bg-white"
          >
            <option value="All">All Jharkhand HEIs</option>
            {UNIVERSITIES.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Citizen Problem Statements Grid for University Authority */}
      {filteredChallenges.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Citizen Submissions Match Your Filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your search query, district filter, or switch to the "All Citizen Problems" tab to see all societal challenges submitted by Jharkhand citizens.
          </p>
          <button
            onClick={() => {
              setActiveSubTab('all');
              setSearchQuery('');
              setSelectedDistrict('All');
              setSelectedCategory('All');
              setFilterUni('All');
            }}
            className="text-xs text-[#003366] font-bold hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredChallenges.map((challenge) => {
            const isAssignedToMe = isAdoptedByMyUni(challenge);
            const isRecommended = isRecommendedForMyUni(challenge);

            return (
              <div
                key={challenge.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Card Top: Code, Priority, and Stage */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        {challenge.code}
                      </span>
                      {challenge.priority === 'critical' && (
                        <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          Critical Priority
                        </span>
                      )}
                      {challenge.priority === 'high' && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          High Priority
                        </span>
                      )}
                    </div>

                    <div>
                      {isAwaitingAdoption(challenge) ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-700" />
                          Awaiting HEI Adoption
                        </span>
                      ) : challenge.status === 'assigned_hei' ? (
                        <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          HEI Adopted
                        </span>
                      ) : challenge.status === 'team_constituted' ? (
                        <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Team Active
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {challenge.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PROMINENT CITIZEN & LOCALITY SUBMITTER INFORMATION BOX */}
                  <div className="mt-3 bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#003366] font-bold">
                        <UserCheck className="w-4 h-4 text-[#003366]" />
                        <span>Submitted By:</span>
                        <span className="text-slate-900 font-extrabold">{challenge.submittedBy.name}</span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          ({challenge.submittedBy.type || 'Citizen / PRI'})
                        </span>
                      </div>

                      {challenge.submittedBy.certifiedByAuthority ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          Certified by PRI / Authority
                        </span>
                      ) : challenge.submittedBy.isVerifiedUser ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          Verified Citizen Submitter
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                          Locality Issue
                        </span>
                      )}
                    </div>

                    {/* Locality & Affected Citizens Details */}
                    {(challenge.submittedBy.citizenBeneficiary || challenge.submittedBy.localityVillage || challenge.submittedBy.panchayatName) && (
                      <div className="p-2 bg-white/90 rounded border border-blue-100 text-[11px] text-slate-700 space-y-0.5">
                        {challenge.submittedBy.citizenBeneficiary && (
                          <div className="flex items-start gap-1">
                            <strong className="text-blue-900 flex-shrink-0">Affected Citizens:</strong>
                            <span className="text-slate-800 font-medium">{challenge.submittedBy.citizenBeneficiary}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-500">
                          {challenge.submittedBy.localityVillage && (
                            <span>Village/Tola: <strong className="text-slate-700">{challenge.submittedBy.localityVillage}</strong></span>
                          )}
                          {challenge.submittedBy.panchayatName && (
                            <>
                              <span>•</span>
                              <span>Panchayat: <strong className="text-slate-700">{challenge.submittedBy.panchayatName}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-600 pt-1 border-t border-blue-100">
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        <span>{challenge.blockOrPanchayat || challenge.district}, {challenge.district} Dist.</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span>Impact: ~{challenge.estimatedImpactPeople.toLocaleString('en-IN')} Citizens</span>
                      </span>

                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Submitted: {challenge.submittedDate}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                      {challenge.category}
                    </span>
                    <h3 
                      onClick={() => onSelectChallenge(challenge)}
                      className="text-base font-bold text-slate-900 hover:text-[#003366] transition-colors cursor-pointer line-clamp-2 leading-snug"
                    >
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>

                  {/* Evidence & Telemetry Badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                    {challenge.attachments && challenge.attachments.length > 0 && (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Paperclip className="w-3 h-3 text-slate-500" />
                        <span>{challenge.attachments.length} Ground Evidence Document{challenge.attachments.length === 1 ? '' : 's'}</span>
                      </span>
                    )}

                    {challenge.gpsCoordinates && (
                      <span className="bg-red-50 text-red-900 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-red-600" />
                        <span>GPS Verified ({challenge.gpsCoordinates.latitude.toFixed(2)}°, {challenge.gpsCoordinates.longitude.toFixed(2)}°)</span>
                      </span>
                    )}

                    {challenge.videoUrls && challenge.videoUrls.length > 0 && (
                      <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Video className="w-3 h-3 text-purple-600" />
                        <span>Video Evidence</span>
                      </span>
                    )}
                  </div>

                  {/* AI Evaluation & Recommended Universities */}
                  {challenge.aiAnalysis && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          AI Match & Routing:
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                          Urgency: {challenge.aiAnalysis.urgencyScore}/100
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 italic line-clamp-1">
                        "{challenge.aiAnalysis.summary}"
                      </p>

                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-slate-500 font-semibold">Recommended HEIs:</span>
                        {challenge.aiAnalysis.recommendedUniversities.map((u, i) => {
                          const isMatch = u.toLowerCase().includes(currentUniName.split(' ')[0].toLowerCase());
                          return (
                            <span
                              key={i}
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                isMatch
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold'
                                  : 'bg-white text-slate-700 border border-slate-200'
                              }`}
                            >
                              {u}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Current HEI Assignment & Team Status */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Institution:</span>
                      {challenge.assignedUniversity ? (
                        <div className="flex items-center gap-1 text-purple-900 font-bold">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                          <span>{challenge.assignedUniversity.name}</span>
                        </div>
                      ) : (
                        <span className="text-amber-700 font-semibold italic">Unassigned (Open for HEI Adoption)</span>
                      )}
                    </div>

                    {challenge.team && (
                      <div className="sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Constituted Team:</span>
                        <span className="font-bold text-slate-800">
                          {challenge.team.studentMembers.length} Students • {challenge.team.facultyMentor}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Academic Feasibility Review Summary (if recorded) */}
                  {challenge.universityReview?.evaluated && (
                    <div className="mt-2 p-2 bg-emerald-50/80 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                        <span>Academic Feasibility: <strong>{challenge.universityReview.feasibilityScore}/100</strong></span>
                      </div>
                      <span className="text-[10px] text-emerald-700">Evaluated by {challenge.universityReview.reviewerName}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom Action Bar for University Authority */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onSelectChallenge(challenge)}
                    className="flex-1 min-w-[120px] bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>Review Evidence</span>
                  </button>

                  {/* Adopt Challenge Button (if not yet assigned to this university) */}
                  {!isAssignedToMe && (
                    <button
                      onClick={() => handleAdoptClick(challenge)}
                      disabled={adoptingId === challenge.id}
                      className="flex-1 min-w-[140px] bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:bg-slate-400"
                      title="Officially adopt this citizen challenge for your university research cell"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>{adoptingId === challenge.id ? 'Adopting...' : 'Adopt for My HEI'}</span>
                    </button>
                  )}

                  {/* Constitute Team Button */}
                  <button
                    onClick={() => onOpenTeamModal(challenge)}
                    className="flex-1 min-w-[130px] bg-purple-700 hover:bg-purple-800 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-200" />
                    <span>{challenge.team ? 'Manage Team' : '+ Constitute Team'}</span>
                  </button>

                  {/* Submit Proposal Button */}
                  <button
                    onClick={() => onOpenProposalModal(challenge)}
                    className="flex-1 min-w-[130px] bg-[#003366] hover:bg-[#002244] text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Submit Proposal</span>
                  </button>

                  {/* Academic Feasibility Review Button */}
                  <button
                    onClick={() => handleOpenReviewModal(challenge)}
                    className="p-2 text-slate-600 hover:text-[#003366] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    title="Conduct Faculty Academic Feasibility Review"
                  >
                    <Star className="w-4 h-4 text-amber-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Interactive Academic Feasibility Review Modal */}
      {evaluatingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#003366] text-white px-5 py-4 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  Academic & Technical Feasibility Evaluation
                </h3>
              </div>
              <button
                onClick={() => setEvaluatingChallenge(null)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAcademicReview} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Evaluating Challenge:</span>
                <span className="font-bold text-slate-900 block mt-0.5">{evaluatingChallenge.title}</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  Citizen Submitter: {evaluatingChallenge.submittedBy.name} • {evaluatingChallenge.district} District
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Technological Feasibility Score (1 - 100):
                  </label>
                  <span className="font-black text-sm text-[#003366] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {reviewScore} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#003366]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>40 (Complex R&D)</span>
                  <span>70 (Moderate Feasibility)</span>
                  <span>100 (Immediate Prototype Feasible)</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Faculty Evaluation Notes & Lab Readiness Assessment: *
                </label>
                <textarea
                  rows={4}
                  value={reviewSummary}
                  onChange={(e) => setReviewSummary(e.target.value)}
                  placeholder="Outline the technical feasibility, required student disciplines, available fabrication lab facilities, and timeline..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] bg-white text-xs"
                  required
                />
              </div>

              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex items-center justify-between text-slate-700">
                <div>
                  <span className="font-bold block text-purple-900">Evaluating Faculty Mentor:</span>
                  <span>{currentUser?.name || 'Prof. Dr. Rajesh K. Verma'}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold block text-purple-900">Institution:</span>
                  <span>{currentUser?.organization || 'BIT Mesra, Ranchi'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingChallenge(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:bg-slate-400"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>{isSubmittingReview ? 'Submitting...' : 'Record Faculty Evaluation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
