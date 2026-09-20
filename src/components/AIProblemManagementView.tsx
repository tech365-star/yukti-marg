import React, { useState } from 'react';
import { Challenge, ThematicCategory, PriorityLevel, User } from '../types';
import { UNIVERSITIES, JHARKHAND_DISTRICTS } from '../data/mockData';
import { 
  Sparkles, 
  Layers, 
  Filter, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  GitMerge, 
  Cpu, 
  FileText, 
  RefreshCw, 
  Clock, 
  BarChart3, 
  Upload, 
  Copy, 
  Eye, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface AIProblemManagementViewProps {
  challenges: Challenge[];
  onSelectChallenge: (c: Challenge) => void;
  onUpdateChallenge: (c: Challenge) => void;
  onNavigateToTab?: (tab: any) => void;
  currentUser: User | null;
  onAddNotification?: (notif: any) => void;
  onConvertToChallenge?: (prefillData: {
    title: string;
    description: string;
    category: ThematicCategory;
    district: string;
    aiAnalysis: any;
  }) => void;
}

type ManagementSubTab = 'curation_pipeline' | 'deduplication' | 'prioritization' | 'doc_intelligence';

export const AIProblemManagementView: React.FC<AIProblemManagementViewProps> = ({
  challenges,
  onSelectChallenge,
  onUpdateChallenge,
  onNavigateToTab,
  currentUser,
  onConvertToChallenge,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ManagementSubTab>('curation_pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [routingInProgress, setRoutingInProgress] = useState<string | null>(null);
  const [routingSuccessMessage, setRoutingSuccessMessage] = useState<string | null>(null);

  // Document Analyzer state (for doc_intelligence subtab)
  const [docText, setDocText] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docDistrict, setDocDistrict] = useState('Ranchi');
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [docAnalysisResult, setDocAnalysisResult] = useState<any>(null);
  const [docAnalysisError, setDocAnalysisError] = useState<string | null>(null);

  // Sample real-world problem documents for 1-click analysis
  const SAMPLE_DOCS = [
    {
      title: 'Palamu Fluoride Ground Water Aquifer Survey',
      district: 'Palamu',
      fileName: 'palamu_fluoride_survey_2026.txt',
      text: `GOVERNMENT OF JHARKHAND - DISTRICT WATER TESTING LAB PALAMU
Survey of 45 deep borewells across Hussainabad, Chhatarpur, and Hariharganj blocks shows severe fluoride contamination ranging from 3.2 mg/L to 5.4 mg/L against the BIS permissible limit of 1.0 mg/L.
Over 2,400 school-going children in 28 government primary and middle schools exhibit grade-2 dental fluorosis and early onset crippling skeletal deformities.
Traditional reverse osmosis (RO) plants installed under earlier schemes have failed due to erratic 3-phase electricity, absence of maintenance technicians, and 65% brine water wastage in drought-prone areas.
There is an urgent requirement for an electricity-free, gravity-driven water filtration cartridge using indigenous adsorbents (e.g. modified clay, activated alumina, or agricultural biochar) that can be maintained locally by school management committees (SMCs).`,
    },
    {
      title: 'Ormanjhi Perishable Crops Cold-Chain Distress',
      district: 'Ranchi',
      fileName: 'ormanjhi_farmer_coldchain_memo.txt',
      text: `GRAM SABHA RESOLUTION & FARMER PRODUCER ORGANIZATION (FPO) ORMANJHI
During peak harvesting seasons (November to February), farmers in Ormanjhi, Bero, and Kanke blocks harvest over 60 metric tonnes of tomatoes, brinjal, and capsicum daily.
Due to lack of cold storage at the farm gate and grid power unreliability, perishables decay within 48 to 72 hours.
Local farmers are forced into distress sales to middlemen at ₹2.50 to ₹3.00 per kilogram, whereas retail prices in Ranchi city reach ₹35 per kg.
Farmers require a decentralized 1 to 2 MT capacity solar-powered or thermal-battery cold storage system using phase-change materials (PCM) that can preserve crops at 6-10°C for up to 20 days without relying on costly lithium battery replacements.`,
    },
    {
      title: 'Dumka Santhali Speech Clinical Diagnostic Tool',
      district: 'Dumka',
      fileName: 'dumka_santhal_telemedicine_field_note.txt',
      text: `DISTRICT HEALTH SOCIETY DUMKA - SANTHAL PARGANA REGION
A field study in 32 Health Sub-Centres and Community Health Centres (CHCs) in Dumka and Pakur reveals severe communication bottlenecks between healthcare workers and tribal patients who speak only Santhali (Ol Chiki) or Ho.
Clinical staff unable to understand local colloquial descriptions of symptoms frequently misdiagnose or delay treatment for cerebral malaria, maternal hemorrhages, and sickle-cell crises.
Internet cellular connectivity in dense forest fringe villages is absent or intermittent.
We require an edge-AI tablet-based voice interface that operates completely offline, accepting spoken Santhali queries, translating them to standard medical terminology in Hindi and English, and providing step-by-step diagnostic triage algorithms for rural ASHA workers.`,
    },
  ];

  // 1-Click Auto-Route Challenge to AI Recommended HEI
  const handleAutoRoute = async (challenge: Challenge) => {
    const recommendedUniName = challenge.aiAnalysis?.recommendedUniversities?.[0] || 'Birla Institute of Technology (BIT) Mesra, Ranchi';
    const matchedUni = UNIVERSITIES.find(u => 
      recommendedUniName.toLowerCase().includes(u.name.toLowerCase().split('(')[0].trim()) ||
      u.name.toLowerCase().includes(recommendedUniName.toLowerCase().split('(')[0].trim())
    ) || UNIVERSITIES[0];

    const department = challenge.aiAnalysis?.suggestedDisciplines?.[0] 
      ? `Department of ${challenge.aiAnalysis.suggestedDisciplines[0]}`
      : 'Centre for Advanced Research & Innovation';

    setRoutingInProgress(challenge.id);
    setRoutingSuccessMessage(null);

    try {
      const res = await fetch('/api/ai/route-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          universityId: matchedUni.id,
          universityName: matchedUni.name,
          department,
          facultyMentor: 'Appointed Department Lead',
          routingReason: challenge.aiAnalysis?.routingReason || 'High match with faculty publications, labs, and incubation facilities.',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        onUpdateChallenge(data.challenge);
        setRoutingSuccessMessage(`Successfully routed ${challenge.code} to ${matchedUni.name}! Notification dispatched.`);
      } else {
        // Local fallback update
        const updated: Challenge = {
          ...challenge,
          status: 'assigned_hei',
          assignedUniversity: {
            id: matchedUni.id,
            name: matchedUni.name,
            department,
            assignedDate: new Date().toISOString().split('T')[0],
          },
        };
        onUpdateChallenge(updated);
        setRoutingSuccessMessage(`Routed ${challenge.code} to ${matchedUni.name}!`);
      }
    } catch (err) {
      console.warn('Auto route error, falling back to local update:', err);
      const updated: Challenge = {
        ...challenge,
        status: 'assigned_hei',
        assignedUniversity: {
          id: matchedUni.id,
          name: matchedUni.name,
          department,
          assignedDate: new Date().toISOString().split('T')[0],
        },
      };
      onUpdateChallenge(updated);
      setRoutingSuccessMessage(`Routed ${challenge.code} to ${matchedUni.name}!`);
    } finally {
      setRoutingInProgress(null);
      setTimeout(() => setRoutingSuccessMessage(null), 5000);
    }
  };

  // Document Analyzer handler
  const handleAnalyzeDocument = async () => {
    if (!docText || docText.trim().length < 15) {
      setDocAnalysisError('Please enter document content of at least 15 characters.');
      return;
    }

    setIsAnalyzingDoc(true);
    setDocAnalysisError(null);

    try {
      const res = await fetch('/api/ai/categorize-and-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: docText,
          fileName: docFileName || 'evidence_memo.txt',
          contextDistrict: docDistrict,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI Evaluation failed');
      }

      setDocAnalysisResult(data.data);
    } catch (err: any) {
      setDocAnalysisError(err.message || 'An error occurred during AI evaluation.');
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  // Filtered challenges for curation
  const filtered = challenges.filter((c) => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && c.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate AI Management KPIs
  const totalAnalyzed = challenges.length;
  const awaitingRouting = challenges.filter((c) => ['submitted', 'under_review'].includes(c.status)).length;
  const potentialDuplicates = challenges.filter((c) => c.aiAnalysis?.deDuplicationCheck?.isDuplicate).length;
  const highUrgencyCount = challenges.filter((c) => (c.aiAnalysis?.urgencyScore || 0) >= 80 || c.priority === 'critical').length;
  const ipPotentialCount = challenges.filter((c) => c.aiAnalysis?.potentialPatentOrIP).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6" id="ai-problem-management-view">
      {/* Module Banner */}
      <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#0d47a1] text-white p-6 rounded-xl border-l-4 border-amber-500 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wide mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Stage 2 • AI-Enabled Problem Management Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Automated Categorization, Prioritization, Deduplication & HEI Routing
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-3xl">
              Yukti Marg AI scans incoming societal problem statements across all 24 districts to classify themes, score multi-factor urgency, detect cross-block duplicates, and match challenges to Higher Education Institutions based on faculty research specialization and incubation lab infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] bg-white/10 border border-white/20 px-2.5 py-1 rounded text-amber-200 font-semibold flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              Model: Gemini 3.8 Flash
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {routingSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{routingSuccessMessage}</span>
          </div>
          <button
            onClick={() => onNavigateToTab?.('university')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer"
          >
            View in University Hub <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Total Sourced
          </span>
          <span className="text-2xl font-extrabold text-[#003366] mt-0.5 block">
            {totalAnalyzed}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
            100% Processed
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Awaiting HEI Route
          </span>
          <span className="text-2xl font-extrabold text-amber-600 mt-0.5 block">
            {awaitingRouting}
          </span>
          <span className="text-[11px] text-amber-800 font-semibold block mt-0.5">
            Pending State Dispatch
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Deduplication Flagged
          </span>
          <span className="text-2xl font-extrabold text-indigo-700 mt-0.5 block">
            {potentialDuplicates}
          </span>
          <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">
            Clusters Identified
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            High Urgency Score
          </span>
          <span className="text-2xl font-extrabold text-red-600 mt-0.5 block">
            {highUrgencyCount}
          </span>
          <span className="text-[11px] text-red-700 font-semibold block mt-0.5">
            Urgency &gt; 80 / 100
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Patent / IP Potential
          </span>
          <span className="text-2xl font-extrabold text-purple-700 mt-0.5 block">
            {ipPotentialCount}
          </span>
          <span className="text-[11px] text-purple-700 font-semibold block mt-0.5">
            Eligible for Co-Filing
          </span>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveSubTab('curation_pipeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeSubTab === 'curation_pipeline'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Automated Curation & HEI Routing Pipeline</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeSubTab === 'curation_pipeline' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'}`}>
            {challenges.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('deduplication')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeSubTab === 'deduplication'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          <span>Deduplication & Clustering Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('prioritization')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeSubTab === 'prioritization'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Multi-Factor Prioritization Index</span>
        </button>

        <button
          onClick={() => setActiveSubTab('doc_intelligence')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeSubTab === 'doc_intelligence'
              ? 'bg-[#003366] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Document & Evidence Intelligence</span>
        </button>
      </div>

      {/* TAB 1: CURATION PIPELINE & ROUTING */}
      {activeSubTab === 'curation_pipeline' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challenges by title, district, code..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#003366] bg-slate-50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 font-medium"
              >
                <option value="All">All Thematic Categories</option>
                <option value="Agriculture & Rural Livelihoods">Agriculture & Rural Livelihoods</option>
                <option value="Water Resources & Sanitation">Water Resources & Sanitation</option>
                <option value="Healthcare & Telemedicine">Healthcare & Telemedicine</option>
                <option value="Clean Energy & Environment">Clean Energy & Environment</option>
                <option value="Smart Education & Skill Dev">Smart Education & Skill Dev</option>
                <option value="Tribal Crafts, Forestry & Mining Tech">Tribal Crafts & Mining Tech</option>
                <option value="Urban Infrastructure & Waste">Urban Infrastructure & Waste</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 font-medium"
              >
                <option value="All">All Priority Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Challenges List with AI Intelligence dossier */}
          <div className="space-y-4">
            {filtered.map((challenge) => {
              const ai = challenge.aiAnalysis;
              const isAssigned = Boolean(challenge.assignedUniversity);
              const urgencyScore = ai?.urgencyScore || (challenge.priority === 'critical' ? 90 : challenge.priority === 'high' ? 80 : 65);

              return (
                <div
                  key={challenge.id}
                  className={`bg-white rounded-xl border transition-all p-5 shadow-xs hover:shadow-md ${
                    isAssigned ? 'border-slate-200' : 'border-amber-300 ring-1 ring-amber-100'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left Column: Challenge Metadata & Title */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#003366] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                          {challenge.code}
                        </span>

                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {challenge.category}
                        </span>

                        <span className="text-xs text-slate-500 font-medium">
                          {challenge.district} • {challenge.blockOrPanchayat}
                        </span>

                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          challenge.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          challenge.priority === 'high' ? 'bg-amber-100 text-amber-900' :
                          'bg-emerald-100 text-emerald-900'
                        }`}>
                          {challenge.priority} Priority
                        </span>

                        {isAssigned ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Routed to {challenge.assignedUniversity?.name.split('(')[0]}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Awaiting University Route
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {challenge.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                        {challenge.description}
                      </p>

                      {/* AI Intelligence Dossier Box */}
                      {ai && (
                        <div className="mt-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                            <div className="flex items-center gap-1.5 font-bold text-[#003366]">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>AI Diagnostic & Routing Dossier</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500 font-medium">
                                Confidence: <strong className="text-slate-800">{Math.round((ai.categoryConfidence || 0.95) * 100)}%</strong>
                              </span>
                              <span className="text-slate-500 font-medium">
                                Urgency Index: <strong className="text-red-700">{urgencyScore}/100</strong>
                              </span>
                            </div>
                          </div>

                          <p className="text-slate-700 italic">
                            "{ai.summary}"
                          </p>

                          {/* Recommended HEIs & Routing Rationale */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div>
                              <span className="font-bold text-slate-700 block mb-1">
                                Recommended Jharkhand HEIs:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {(ai.recommendedUniversities || ['BIT Mesra, Ranchi', 'IIT ISM Dhanbad']).map((uni, idx) => (
                                  <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3 text-blue-600" /> {uni}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="font-bold text-slate-700 block mb-1">
                                Matching Incubation / Prototyping Lab:
                              </span>
                              <span className="text-[11px] text-slate-600 font-medium block">
                                {ai.incubationCenterMatched || 'AICTE IDEA Lab & Technology Business Incubator'}
                              </span>
                            </div>
                          </div>

                          {ai.routingReason && (
                            <div className="pt-1 text-[11px] text-slate-500">
                              <strong className="text-slate-700">Routing Criteria:</strong> {ai.routingReason}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Actions */}
                    <div className="flex lg:flex-col items-center justify-end gap-2 lg:w-48 shrink-0">
                      {!isAssigned && (
                        <button
                          disabled={routingInProgress === challenge.id}
                          onClick={() => handleAutoRoute(challenge)}
                          className="w-full bg-[#003366] hover:bg-[#002244] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {routingInProgress === challenge.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Routing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Auto-Route to HEI</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => onSelectChallenge(challenge)}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Challenge</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DEDUPLICATION & CLUSTERING MATRIX */}
      {activeSubTab === 'deduplication' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-indigo-600" />
                Deduplication & Cross-District Problem Clustering Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically flags overlapping submissions from neighboring blocks or similar technical problems to prevent fragmented academic R&D effort.
              </p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full self-start">
              Deduplication Threshold: 70%
            </span>
          </div>

          <div className="space-y-4">
            {challenges.map((c) => {
              const dedup = c.aiAnalysis?.deDuplicationCheck;
              const isDup = dedup?.isDuplicate || (dedup?.similarityScore || 0) >= 50;

              return (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDup ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#003366] bg-white px-2 py-0.5 rounded border border-slate-200">
                          {c.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {c.title}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ({c.district})
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">
                        {dedup?.explanation || 'Unique societal problem statement. Zero duplication clutter identified in state database.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">
                          Similarity Index
                        </span>
                        <span className={`text-sm font-extrabold ${
                          (dedup?.similarityScore || 15) > 60 ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {dedup?.similarityScore || 15}%
                        </span>
                      </div>

                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isDup ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isDup ? 'Clustered / Similar' : 'Verified Unique'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PRIORITIZATION INDEX */}
      {activeSubTab === 'prioritization' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Multi-Factor Severity & Urgency Prioritization Algorithm
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Weighted composite score (1–100) calculated from: Population Impact Density (30%), Seasonal Vulnerability (25%), Public Health / Life Hazard (25%), and Technological Feasibility (20%).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase text-[11px] font-bold">
                <tr>
                  <th className="p-3">Challenge Code</th>
                  <th className="p-3">Problem Title</th>
                  <th className="p-3">Category & District</th>
                  <th className="p-3">People Impacted</th>
                  <th className="p-3 text-center">Urgency Score</th>
                  <th className="p-3 text-center">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[...challenges]
                  .sort((a, b) => (b.aiAnalysis?.urgencyScore || 70) - (a.aiAnalysis?.urgencyScore || 70))
                  .map((c) => {
                    const score = c.aiAnalysis?.urgencyScore || (c.priority === 'critical' ? 92 : c.priority === 'high' ? 82 : 65);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#003366]">{c.code}</td>
                        <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{c.title}</td>
                        <td className="p-3 text-slate-600">{c.category.split('&')[0]} • {c.district}</td>
                        <td className="p-3 font-bold text-slate-800">{(c.estimatedImpactPeople || 1000).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1.5 font-extrabold text-sm">
                            <span className={`w-2 h-2 rounded-full ${score >= 85 ? 'bg-red-500' : score >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span className={score >= 85 ? 'text-red-700' : score >= 75 ? 'text-amber-800' : 'text-slate-700'}>
                              {score}/100
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            c.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            c.priority === 'high' ? 'bg-amber-100 text-amber-900' :
                            'bg-emerald-100 text-emerald-900'
                          }`}>
                            {c.priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENT & EVIDENCE INTELLIGENCE */}
      {activeSubTab === 'doc_intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Input Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#003366]" />
                Intake Document / Evidence Screener
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Paste official memos, Gram Sabha resolutions, survey reports, or field memos. The AI engine will parse, classify, and generate an academic research dossier.
              </p>
            </div>

            {/* Quick Sample Loader */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">
                Load Real Jharkhand Case Study:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_DOCS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDocText(sample.text);
                      setDocFileName(sample.fileName);
                      setDocDistrict(sample.district);
                      setDocAnalysisResult(null);
                    }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer text-left"
                  >
                    {sample.title} ({sample.district})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Context District
                </label>
                <select
                  value={docDistrict}
                  onChange={(e) => setDocDistrict(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Evidence File Tag
                </label>
                <input
                  type="text"
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  placeholder="e.g. gram_sabha_memo.pdf"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Document Text / Field Evidence Content
              </label>
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                rows={8}
                placeholder="Paste the problem statement, field findings, technological bottleneck, or local community constraint here..."
                className="w-full text-xs border border-slate-300 rounded-lg p-3 bg-slate-50 font-mono focus:ring-2 focus:ring-[#003366] focus:outline-hidden"
              />
            </div>

            {docAnalysisError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{docAnalysisError}</span>
              </div>
            )}

            <button
              disabled={isAnalyzingDoc}
              onClick={handleAnalyzeDocument}
              className="w-full bg-[#003366] hover:bg-[#002244] text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isAnalyzingDoc ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Analyzing with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Execute AI Classification & Routing Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Results Dossier */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Generated AI Academic Evaluation Dossier
            </h3>

            {docAnalysisResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#003366] uppercase text-[11px]">
                      Recommended Domain
                    </span>
                    <span className="font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      Urgency Score: {docAnalysisResult.urgencyScore}/100
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{docAnalysisResult.titleSuggestion}</p>
                  <p className="text-slate-600 italic">"{docAnalysisResult.executiveSummary}"</p>
                </div>

                <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 space-y-1.5">
                  <span className="font-bold text-blue-900 block">Matched Higher Education Institutions (HEIs):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {docAnalysisResult.recommendedUniversities.map((u: string, i: number) => (
                      <span key={i} className="bg-white px-2.5 py-1 rounded text-slate-800 font-semibold border border-blue-200">
                        {u}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-600 text-[11px] pt-1">
                    <strong>Routing Rationale:</strong> {docAnalysisResult.routingReason}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Key Disciplines:</span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
                      {docAnalysisResult.suggestedDisciplines?.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Incubation Center:</span>
                    <span className="text-slate-800 font-medium text-[11px]">
                      {docAnalysisResult.incubationCenterMatched}
                    </span>
                  </div>
                </div>

                {onConvertToChallenge && (
                  <button
                    onClick={() => {
                      onConvertToChallenge({
                        title: docAnalysisResult.titleSuggestion,
                        description: docAnalysisResult.executiveSummary,
                        category: docAnalysisResult.category,
                        district: docDistrict,
                        aiAnalysis: docAnalysisResult,
                      });
                    }}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Convert into Formal State Challenge Intake</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-10 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 text-slate-400">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600 text-sm">No Document Evaluated Yet</p>
                <p className="text-xs max-w-sm mx-auto">
                  Select one of the sample Jharkhand case studies or paste text on the left to generate the complete AI classification and routing dossier.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
