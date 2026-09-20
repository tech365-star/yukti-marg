import React, { useState, useEffect, useCallback } from 'react';
import { Challenge, ChallengeStatus, User, ThematicCategory, PriorityLevel } from '../types';
import { JHARKHAND_DISTRICTS, THEMATIC_CATEGORIES } from '../data/mockData';
import { t } from '../utils/translations';
import { GovCaptcha } from './GovCaptcha';
import { UniversitySelectionSection } from './UniversitySelectionSection';
import { 
  Building2, 
  MapPin, 
  PlusCircle, 
  FolderGit2,
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Search, 
  FileText, 
  Calendar, 
  Check, 
  AlertCircle,
  Phone,
  Mail,
  UserCheck,
  ChevronDown,
  ChevronUp,
  X,
  Upload,
  Send,
  Camera,
  Layers,
  GraduationCap,
  Building,
  Info,
  Lock,
  Rocket
} from 'lucide-react';

export interface CitizenIndividualPanelProps {
  challenges: Challenge[];
  currentUser: User;
  activeSubTab?: 'my-submissions' | 'submit';
  onNavigateSubTab?: (subTab: 'my-submissions' | 'submit') => void;
  onSelectChallenge: (challenge: Challenge) => void;
  onChallengeSubmitted: (challenge: Challenge) => void;
  lang: 'en' | 'hi';
}

export const CitizenIndividualPanel: React.FC<CitizenIndividualPanelProps> = ({
  challenges,
  currentUser,
  activeSubTab,
  onNavigateSubTab,
  onSelectChallenge,
  onChallengeSubmitted,
  lang,
}) => {
  // Panel mode: strictly either viewing submitted challenges or submitting a new one
  const [internalPanelView, setInternalPanelView] = useState<'my-submissions' | 'submit-new'>('my-submissions');
  const panelView = activeSubTab ? (activeSubTab === 'submit' ? 'submit-new' : 'my-submissions') : internalPanelView;

  const setPanelView = (view: 'my-submissions' | 'submit-new') => {
    setInternalPanelView(view);
    if (onNavigateSubTab) {
      onNavigateSubTab(view === 'submit-new' ? 'submit' : 'my-submissions');
    }
  };
  
  // Search & filter for submitted challenges
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'under_review' | 'assigned_hei' | 'prototype_development' | 'deployed'>('all');
  
  // Expanded challenge for in-place read-only status view
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);

  // New challenge form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ThematicCategory>('Agriculture & Rural Livelihoods');
  const [district, setDistrict] = useState(currentUser.district || 'Ranchi');
  const [blockOrPanchayat, setBlockOrPanchayat] = useState(currentUser.organization || 'Ormanjhi Block');
  const [village, setVillage] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [estimatedImpactPeople, setEstimatedImpactPeople] = useState('5000');
  const [isAiClassifying, setIsAiClassifying] = useState(false);
  const [aiClassificationResult, setAiClassificationResult] = useState<string | null>(null);
  const [aiPriorityRationale, setAiPriorityRationale] = useState<string>(
    'Essential community infrastructure and societal livelihood impact detected by Yukti Marg AI.'
  );

  // Automated AI Priority Detection (Read-only for citizens to prevent queue manipulation)
  const detectAiPriority = useCallback((
    desc: string,
    ttl: string,
    cat: string,
    impactStr: string
  ): { level: PriorityLevel; reason: string } => {
    const combined = `${ttl} ${desc} ${cat}`.toLowerCase();
    const impactNum = parseInt(impactStr, 10) || 0;

    // Critical health, hazardous contamination, structural emergency triggers
    const criticalKeywords = [
      'fluoride', 'arsenic', 'poison', 'contamination', 'toxic', 'death', 'casualty',
      'epidemic', 'cholera', 'diarrhea outbreak', 'collapsed bridge', 'flood emergency',
      'fire hazard', 'electrocution', 'hospital emergency', 'ambulance', 'acute crisis',
      'malnutrition crisis', 'drinking water poisoned', 'outbreak'
    ];

    // High infrastructure & livelihood impact triggers
    const highKeywords = [
      'drinking water', 'crop loss', 'drought', 'irrigation failure', 'borewell dry',
      'transformer burnt', 'blackout', 'power outage', 'road damaged', 'erosion',
      'cattle disease', 'cold storage failure', 'monsoon damage', 'connectivity loss',
      'bridge damaged', 'substation'
    ];

    // Low routine civic maintenance
    const lowKeywords = [
      'street light', 'paint', 'park', 'beautification', 'signboard', 'speed breaker',
      'tree pruning', 'garden', 'fence', 'bench'
    ];

    if (criticalKeywords.some((k) => combined.includes(k)) || impactNum >= 10000) {
      return {
        level: 'critical',
        reason: impactNum >= 10000
          ? 'High demographic impact (>10,000 citizens) with immediate public emergency severity.'
          : 'Acute public health, hazardous water contamination, or structural safety risk detected.',
      };
    }

    if (
      highKeywords.some((k) => combined.includes(k)) ||
      impactNum >= 2000 ||
      cat === 'Water Resources & Sanitation' ||
      cat === 'Healthcare & Telemedicine'
    ) {
      return {
        level: 'high',
        reason: 'Essential community infrastructure, public health, or substantial demographic impact (>2,000 citizens).',
      };
    }

    if (lowKeywords.some((k) => combined.includes(k)) && impactNum < 500) {
      return {
        level: 'low',
        reason: 'Routine civic maintenance or localized non-critical municipal amenity upgrade.',
      };
    }

    return {
      level: 'medium',
      reason: 'Standard community challenge requiring academic research and technological intervention.',
    };
  }, []);

  // Continuously evaluate AI priority as citizen writes description or adjusts affected population
  useEffect(() => {
    const evaluation = detectAiPriority(description, title, category, estimatedImpactPeople);
    setPriority(evaluation.level);
    setAiPriorityRationale(evaluation.reason);
  }, [description, title, category, estimatedImpactPeople, detectAiPriority]);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recentlySubmittedId, setRecentlySubmittedId] = useState<string | null>(null);

  // AI University Auto-Detection and Assignment state
  const [assignedUniversityData, setAssignedUniversityData] = useState<{
    universityId: string;
    universityName: string;
    isAutoDetected: boolean;
    matchScore: number;
    leadDepartment: string;
    leadFaculty: string;
    routingRationale: string;
    hasMismatchWarning: boolean;
    mismatchWarningText?: string;
  } | null>(null);

  const handleUniversityAssignmentChange = useCallback((assignment: {
    universityId: string;
    universityName: string;
    isAutoDetected: boolean;
    matchScore: number;
    leadDepartment: string;
    leadFaculty: string;
    routingRationale: string;
    hasMismatchWarning: boolean;
    mismatchWarningText?: string;
  }) => {
    setAssignedUniversityData((prev) => {
      if (
        prev &&
        prev.universityId === assignment.universityId &&
        prev.isAutoDetected === assignment.isAutoDetected &&
        prev.matchScore === assignment.matchScore &&
        prev.hasMismatchWarning === assignment.hasMismatchWarning &&
        prev.mismatchWarningText === assignment.mismatchWarningText
      ) {
        return prev;
      }
      return assignment;
    });
  }, []);

  // Filter only citizen submissions
  const citizenSubmissions = challenges.filter((c) => {
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

  // Stages definition for read-only 5-Stage Status Bar
  const STAGES = [
    { num: 1, title: 'Intake Submitted', desc: 'Problem logged in State Registry' },
    { num: 2, title: 'State & AI Review', desc: 'Screened & validated for HEI matching' },
    { num: 3, title: 'University Assigned', desc: 'Assigned to university faculty & R&D lab' },
    { num: 4, title: 'Prototyping & Testing', desc: 'Student-faculty solution development' },
    { num: 5, title: 'Complete & Deployed (End)', desc: 'Accepted & deployed by industry into community (Status: End)' },
  ];

  const getStageIndex = (status: ChallengeStatus): number => {
    switch (status) {
      case 'submitted':
        return 1;
      case 'under_review':
        return 2;
      case 'assigned_hei':
        return 3;
      case 'team_constituted':
      case 'proposal_submitted':
        return 3;
      case 'prototype_development':
      case 'pilot_testing':
        return 4;
      case 'deployed':
        return 5;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case 'submitted':
        return { label: 'Intake Submitted & Logged', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'under_review':
        return { label: 'Under AI & State Review', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'assigned_hei':
      case 'team_constituted':
      case 'proposal_submitted':
        return { label: 'Assigned to University Partner', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'prototype_development':
      case 'pilot_testing':
        return { label: 'In Lab Prototyping & Pilot Testing', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'deployed':
        return { label: 'Complete and Deployed (Status: End)', color: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  // AI helper for quick categorization in citizen form
  const handleAiCategorize = async () => {
    if (!description || description.trim().length < 10) {
      setSubmitError('Please enter at least 10 characters in description to run AI categorization.');
      return;
    }
    setIsAiClassifying(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/ai/categorize-and-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: `${title ? `Title: ${title}\n` : ''}${description}`,
          contextDistrict: district,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        if (data.data.category) {
          setCategory(data.data.category);
          setAiClassificationResult(data.data.category);
        }
        if (data.data.priority) {
          setPriority(data.data.priority as PriorityLevel);
          if (data.data.routingReason) {
            setAiPriorityRationale(`Gemini AI evaluated severity: ${data.data.priority.toUpperCase()} - ${data.data.routingReason}`);
          }
        }
        if (!title && data.data.titleSuggestion) {
          setTitle(data.data.titleSuggestion);
        }
      }
    } catch (e) {
      console.warn('AI categorization fallback:', e);
    } finally {
      setIsAiClassifying(false);
    }
  };

  // Handle file upload in new challenge form
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFiles((prev) => [
        ...prev,
        { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` },
      ]);
    }
  };

  // Handle new challenge submission
  const handleSubmitNewChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitError('Please enter a challenge title.');
      return;
    }
    if (!description.trim()) {
      setSubmitError('Please enter the problem statement description.');
      return;
    }
    if (!blockOrPanchayat.trim()) {
      setSubmitError('Please enter the Block or Panchayat.');
      return;
    }
    if (!village.trim()) {
      setSubmitError('Please enter the Village or Habitation.');
      return;
    }
    if (!estimatedImpactPeople || parseInt(estimatedImpactPeople) <= 0) {
      setSubmitError('Please enter a valid estimate of impacted citizens.');
      return;
    }
    if (attachedFiles.length === 0) {
      setSubmitError('Please attach at least one supporting photo or document (Image/PDF).');
      return;
    }
    if (captchaInput !== captchaCode) {
      setSubmitError('Security Captcha does not match. Please verify the 4 digits.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const year = new Date().getFullYear();
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `YM-JH-${year}-${randCode}`;

    const newChallengePayload: Partial<Challenge> = {
      code: trackingCode,
      title: title.trim(),
      description: description.trim(),
      category,
      district,
      blockOrPanchayat: blockOrPanchayat || `${district} Block`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'assigned_hei',
      priority,
      estimatedImpactPeople: parseInt(estimatedImpactPeople) || 5000,
      assignedUniversity: assignedUniversityData ? {
        id: assignedUniversityData.universityId,
        name: assignedUniversityData.universityName,
        department: assignedUniversityData.leadDepartment,
        assignedDate: new Date().toISOString().split('T')[0],
      } : undefined,
      aiAnalysis: {
        categoryConfidence: 0.94,
        summary: `Identified domain as [${category}] and matched to ${assignedUniversityData?.universityName || 'State University'} based on academic expertise.`,
        urgencyScore: assignedUniversityData?.matchScore || 88,
        rootCauses: ['Local infrastructural constraints', 'Lack of technological intervention'],
        suggestedDisciplines: [assignedUniversityData?.leadDepartment || 'Multidisciplinary Engineering'],
        recommendedUniversities: [assignedUniversityData?.universityName || 'Birla Institute of Technology (BIT) Mesra'],
        routingReason: assignedUniversityData?.routingRationale || 'AI auto-assigned based on faculty expertise and research labs.',
        incubationCenterMatched: 'State Academic Incubation Hub',
        potentialPatentOrIP: true,
      },
      submittedBy: {
        name: currentUser.name,
        type: 'Citizen',
        userId: currentUser.id,
        contact: currentUser.phone || currentUser.email,
        email: currentUser.email,
        isVerifiedUser: true,
        localityVillage: village || 'Local Habitation',
        panchayatName: blockOrPanchayat,
      },
      attachments: attachedFiles.map((f, i) => ({
        id: `att-${Date.now()}-${i}`,
        name: f.name,
        type: 'image',
        url: '#',
        size: f.size,
      })),
      proposals: [],
      milestones: [],
      comments: [
        {
          id: `comm-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: 'citizen',
          authorOrg: `${currentUser.district} Citizen Portal`,
          message: 'Problem statement registered in the State Societal Innovation Portal.',
          createdAt: new Date().toISOString(),
          isOfficialNote: true,
        },
        ...(assignedUniversityData ? [{
          id: `comm-ai-${Date.now()}`,
          authorId: 'sys-ai',
          authorName: 'Yukti Marg AI Match Engine',
          authorRole: 'government' as const,
          authorOrg: 'State Higher Education Innovation Directorate',
          message: assignedUniversityData.isAutoDetected
            ? `AI Auto-Assignment: Matched and assigned problem statement to ${assignedUniversityData.universityName} (Match Score: ${assignedUniversityData.matchScore}%) according to faculty expertise (${assignedUniversityData.leadFaculty}) and research prototyping facilities.`
            : `Manual University Routing: Problem routed to ${assignedUniversityData.universityName} as designated by citizen. ${assignedUniversityData.hasMismatchWarning ? `Note: AI issued warning (Compatibility: ${assignedUniversityData.matchScore}%).` : ''}`,
          createdAt: new Date().toISOString(),
          isOfficialNote: true,
        }] : []),
      ],
    };

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChallengePayload),
      });

      const data = await res.json();
      const savedChallenge: Challenge = res.ok && data.success && data.challenge ? data.challenge : {
        ...newChallengePayload,
        id: `ch-${Date.now()}`,
      } as Challenge;

      onChallengeSubmitted(savedChallenge);
      setRecentlySubmittedId(savedChallenge.id);

      // Reset form
      setTitle('');
      setDescription('');
      setVillage('');
      setAttachedFiles([]);
      setCaptchaInput('');
      setAiClassificationResult(null);

      // Switch back to "My Submissions" where the newly uploaded problem is shown
      setPanelView('my-submissions');
      setExpandedChallengeId(savedChallenge.id);
    } catch (err: any) {
      setSubmitError(err.message || 'Error occurred while saving your problem statement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="citizen-individual-panel">
      
      {/* 1. CITIZEN PROFILE SECTION */}
      <section className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden" id="citizen-profile-section">
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#0a4b8f] px-6 py-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-sm shadow-xs">
                {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'CZ'}
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  {lang === 'en' ? 'Citizen Individual Panel' : 'व्यक्तिगत नागरिक पोर्टल'}
                </span>
                <h1 className="text-xl font-extrabold text-white leading-tight">
                  {currentUser.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>UIDAI / Voter ID Verified</span>
              </span>
            </div>
          </div>
        </div>

        {/* Citizen Profile Details Grid */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/70 text-xs border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Citizen ID
            </span>
            <span className="font-mono font-bold text-slate-900 mt-0.5 block truncate">
              CIT-JH-{currentUser.id}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              District Jurisdiction
            </span>
            <span className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {currentUser.district}, Jharkhand
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Block / Locality
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block truncate">
              {currentUser.organization || currentUser.block || 'Ormanjhi Block'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Registered Contact
            </span>
            <span className="font-medium text-slate-800 mt-0.5 block truncate">
              {currentUser.phone || currentUser.email}
            </span>
          </div>
        </div>

        {/* 2. ONLY TWO BUTTONS: "My Submissions" and "Submit New Challenge or Problem" */}
        <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* BUTTON 1: My Submissions Button */}
            <button
              id="citizen-my-submissions-btn"
              onClick={() => setPanelView('my-submissions')}
              className={`px-5 py-2.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                panelView === 'my-submissions'
                  ? 'bg-[#003366] text-white ring-2 ring-[#003366] ring-offset-1'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <FolderGit2 className={`w-4 h-4 ${panelView === 'my-submissions' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{lang === 'en' ? 'My Submissions' : 'मेरी प्रस्तुतियां'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                panelView === 'my-submissions' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-800'
              }`}>
                {challenges.length}
              </span>
            </button>

            {/* BUTTON 2: Submit New Challenge or Problem Button */}
            <button
              id="citizen-submit-new-problem-btn"
              onClick={() => setPanelView('submit-new')}
              className={`px-5 py-2.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                panelView === 'submit-new'
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-500 ring-offset-1 font-black'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>{lang === 'en' ? 'Submit New Challenge or Problem' : 'नई समस्या दर्ज करें'}</span>
            </button>
          </div>

          <div className="text-right text-[11px] text-slate-500 hidden sm:block">
            Showing exclusively your citizen activity and live status tracking
          </div>
        </div>
      </section>

      {/* 3. PANEL CONTENT: EITHER PREVIOUSLY UPLOADED SUBMISSIONS OR NEW CHALLENGE FORM */}
      
      {/* ========================================================================= */}
      {/* VIEW A: MY SUBMISSIONS & READ-ONLY STATUS BAR FOR ALL PREVIOUSLY UPLOADED PROBLEMS */}
      {/* ========================================================================= */}
      {panelView === 'my-submissions' && (
        <section className="space-y-4" id="citizen-submissions-content">
          
          {/* Top Filter & Search */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by Tracking ID (e.g. YM-JH-2026), problem title, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all' ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({challenges.length})
              </button>
              <button
                onClick={() => setStatusFilter('submitted')}
                className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap ${
                  statusFilter === 'submitted' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Submitted ({challenges.filter((c) => c.status === 'submitted').length})
              </button>
              <button
                onClick={() => setStatusFilter('assigned_hei')}
                className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap ${
                  statusFilter === 'assigned_hei' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                HEI Allocated ({challenges.filter((c) => ['assigned_hei', 'team_constituted'].includes(c.status)).length})
              </button>
              <button
                onClick={() => setStatusFilter('deployed')}
                className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap ${
                  statusFilter === 'deployed' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Resolved ({challenges.filter((c) => c.status === 'deployed').length})
              </button>
            </div>
          </div>

          {/* List of previously uploaded problems */}
          {citizenSubmissions.length > 0 ? (
            <div className="space-y-4">
              {citizenSubmissions.map((challenge) => {
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

                const isExpanded = expandedChallengeId === challenge.id;
                const isRecentlySubmitted = recentlySubmittedId === challenge.id;

                return (
                  <article
                    key={challenge.id}
                    className={`bg-white rounded-xl border-2 p-5 shadow-xs transition-all space-y-4 ${
                      isRecentlySubmitted
                        ? 'border-emerald-500 bg-emerald-50/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header Row: Tracking Code, Date, Priority */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-[#003366] px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1.5">
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
                        <span>Submitted: {challenge.submittedDate}</span>
                      </div>
                    </div>

                    {/* Problem Statement Title & Content */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {challenge.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {challenge.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          {challenge.blockOrPanchayat}, {challenge.district}
                        </span>
                        <span>•</span>
                        <span>Estimated Impact: ~{challenge.estimatedImpactPeople.toLocaleString()} citizens</span>
                        <span>•</span>
                        <span className="capitalize font-semibold text-slate-700">
                          Priority: <strong className={challenge.priority === 'critical' ? 'text-red-700' : 'text-amber-700'}>{challenge.priority}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Deployed Completion Banner (Shown ONLY after Industry formally accepts) */}
                    {isCompletedAndDeployed && (
                      <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400 rounded-lg flex items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <div className="font-black text-emerald-900 flex items-center gap-1.5 text-xs sm:text-sm">
                              <span>🎉 Complete and Deployed (Status: End)</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider">
                                END
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-800 mt-0.5">
                              The industrial officer has formally verified and accepted the university deployed prototype into your community. The problem statement lifecycle has reached completion: <strong>Status is END</strong>.
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-700 text-white rounded-full font-bold text-[10px] shrink-0 whitespace-nowrap shadow-2xs">
                          Status: End
                        </span>
                      </div>
                    )}

                    {/* Prototype Submitted to Industry Banner (Awaiting Industry Acceptance) */}
                    {isPrototypeSubmitted && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3 text-xs text-blue-950">
                        <div className="flex items-center gap-2.5">
                          <Rocket className="w-5 h-5 text-blue-600 shrink-0" />
                          <div>
                            <div className="font-bold text-blue-900 text-xs sm:text-sm">
                              🚀 Prototype Submitted to Industry — Awaiting Final Deployment Acceptance
                            </div>
                            <p className="text-[11px] text-blue-800 mt-0.5">
                              {challenge.assignedUniversity?.name || 'Assigned University'} has engineered the working prototype and submitted it to {challenge.prototypeDeliverable?.deployedToIndustryName || 'the Industry Partner'}. Awaiting industrial sign-off and community handover.
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-full font-bold text-[10px] shrink-0 whitespace-nowrap">
                          Stage 5: Pending Acceptance
                        </span>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* READ-ONLY STATUS BAR (NO ACTIVE BUTTON AVAILABLE - HE ONLY SHOWS STATUS) */}
                    {/* ========================================================================= */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 sm:p-4" id={`status-bar-${challenge.id}`}>
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200/60">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Official Problem Statement Status</span>
                        </span>
                        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${
                          isCompletedAndDeployed 
                            ? 'text-emerald-900 bg-emerald-50 border-emerald-300' 
                            : isPrototypeSubmitted 
                            ? 'text-blue-900 bg-blue-50 border-blue-300' 
                            : 'text-[#003366] bg-blue-50 border-blue-200'
                        }`}>
                          {isCompletedAndDeployed 
                            ? 'All 5 Stages Completed (Status: End)' 
                            : isPrototypeSubmitted 
                            ? 'Stage 5 of 5: Awaiting Industry Acceptance' 
                            : `Stage ${currentStage} of 5: ${STAGES[currentStage - 1]?.title}`}
                        </span>
                      </div>

                      {/* Visual 5-Stage Stepper: Purely informative, ZERO clickable/active buttons */}
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1 select-none">
                        {STAGES.map((stage) => {
                          const isDone = isCompletedAndDeployed 
                            ? true 
                            : isPrototypeSubmitted 
                            ? stage.num < 5 // Steps 1-4 are done
                            : stage.num < currentStage;

                          const isCurrent = isCompletedAndDeployed 
                            ? false 
                            : isPrototypeSubmitted 
                            ? stage.num === 5 // Step 5 is active
                            : stage.num === currentStage;

                          return (
                            <div key={stage.num} className="text-center">
                              {/* Step bar indicator */}
                              <div
                                className={`h-2 rounded-full mb-1.5 transition-all ${
                                  isDone
                                    ? 'bg-emerald-500'
                                    : isCurrent
                                    ? 'bg-amber-500 ring-2 ring-amber-300'
                                    : 'bg-slate-200'
                                }`}
                              />
                              <div className="flex items-center justify-center gap-1">
                                {isDone ? (
                                  <Check className="w-3 h-3 text-emerald-600 font-bold shrink-0" />
                                ) : isCurrent ? (
                                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                                )}
                                <span
                                  className={`text-[10px] sm:text-[11px] leading-tight block truncate ${
                                    isDone
                                      ? 'font-bold text-emerald-800'
                                      : isCurrent
                                      ? 'font-black text-amber-900'
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

                      {/* Current Status Explanation Note (Read-Only) */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                        <span>
                          <strong>Current Stage Detail:</strong> {STAGES[currentStage - 1]?.desc}
                        </span>
                        <span className="text-slate-400 text-[10px] italic">
                          (Read-only live status track)
                        </span>
                      </div>
                    </div>

                    {/* Allocated University Info (If Assigned) */}
                    {challenge.assignedUniversity && (
                      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-purple-900 font-bold text-[11px] uppercase tracking-wider">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                          <span>Assigned Higher Education Institution</span>
                        </div>
                        <p className="font-bold text-slate-900">{challenge.assignedUniversity.name}</p>
                        <p className="text-[11px] text-purple-800">
                          Department: {challenge.assignedUniversity.department}
                        </p>
                        {challenge.team?.facultyMentor && (
                          <p className="text-[11px] text-slate-600">
                            Faculty Mentor: <strong>{challenge.team.facultyMentor}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Toggle read-only full problem status report */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        {challenge.comments?.length || 0} Official Collaboration Log Entries
                      </span>

                      <button
                        onClick={() => setExpandedChallengeId(isExpanded ? null : challenge.id)}
                        className="text-xs font-bold text-[#003366] hover:text-[#002244] flex items-center gap-1 cursor-pointer py-1 px-2 rounded hover:bg-slate-100"
                      >
                        <span>{isExpanded ? 'Hide Status Report' : 'Show Full Status Report'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Read-Only Status & Verification Report */}
                    {isExpanded && (
                      <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3 animate-in fade-in duration-150">
                        <div className="font-bold text-slate-800 text-xs flex items-center justify-between pb-2 border-b border-slate-200">
                          <span>Verified Problem Record Details</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            Yukti Marg Registry Reference: {challenge.code}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                          <div>
                            <span className="font-bold text-slate-900 block">Submitted By:</span>
                            <span>{currentUser.name} (Citizen Submitter)</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">Location of Issue:</span>
                            <span>{challenge.blockOrPanchayat}, {challenge.district}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">Category:</span>
                            <span>{challenge.category}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">Community Impact:</span>
                            <span>~{challenge.estimatedImpactPeople.toLocaleString()} residents</span>
                          </div>
                        </div>

                        {/* Collaboration notes (read-only) */}
                        {challenge.comments && challenge.comments.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 space-y-1.5">
                            <span className="font-bold text-slate-900 block">Official Activity & Audit Remarks:</span>
                            <div className="space-y-1.5">
                              {challenge.comments.map((comm) => (
                                <div key={comm.id} className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-[#003366]">{comm.authorName} ({comm.authorRole})</span>
                                    <span className="text-slate-400">{comm.createdAt.split('T')[0]}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-700">{comm.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#003366] flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-[#003366]" />
              </div>

              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No matching submissions found'
                    : 'No Societal Challenges Submitted Yet'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try clearing your search query or status filter to see all your uploaded challenges.'
                    : 'You have not uploaded any societal problems yet under your citizen account. Click below to submit your first challenge.'}
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
                <button
                  onClick={() => setPanelView('submit-new')}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-extrabold flex items-center gap-2 mx-auto cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>Submit New Challenge or Problem</span>
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: SUBMIT NEW CHALLENGE OR PROBLEM FORM (NEW SUBMISSION CONTENT) */}
      {/* ========================================================================= */}
      {panelView === 'submit-new' && (
        <section className="bg-white rounded-xl border-2 border-slate-200 shadow-sm p-6 sm:p-8 space-y-6" id="citizen-new-submission-content">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#003366]">
                Citizen Intake Form
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Submit New Societal Challenge or Problem
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register a real community challenge to initiate state university research & prototyping
              </p>
            </div>

            <button
              onClick={() => setPanelView('my-submissions')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitNewChallenge} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Problem Title / समस्या का शीर्षक <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Drinking Water Fluoride Contamination in Ormanjhi Borewells"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Detailed Problem Statement / विस्तृत विवरण <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAiCategorize}
                  disabled={isAiClassifying}
                  className="text-[11px] font-bold text-slate-900 bg-[#f09e34] hover:bg-[#e08e24] px-2.5 py-1 rounded-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 bg-[#98ed37] text-[#2b2a1e] rounded-xs p-0.5" />
                  <span>{isAiClassifying ? 'Analyzing with AI...' : 'Auto-Suggest Category with AI'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                placeholder="Describe the exact local issue, who is affected, how long it has been occurring, and why current solutions are failing..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
              />
              {aiClassificationResult && (
                <div className="mt-1 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>AI Categorized as: <strong>{aiClassificationResult}</strong></span>
                </div>
              )}
            </div>

            {/* Category & District Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Thematic Category / विषयगत श्रेणी <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ThematicCategory)}
                  required
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003366] focus:outline-none"
                >
                  {THEMATIC_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(cat, lang)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  District / जिला <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003366] focus:outline-none"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Block & Village */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Block / Panchayat / ब्लॉक / पंचायत <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ormanjhi Block / Chutupalu Panchayat"
                  value={blockOrPanchayat}
                  onChange={(e) => setBlockOrPanchayat(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Village / Habitation / ग्राम या टोला <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sikidiri Village / Pipratoli"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>
            </div>

            {/* Priority & Estimated Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Priority Level / प्राथमिकता स्तर</span>
                  </label>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-purple-700" />
                    AI-Detected (Locked)
                  </span>
                </div>
                <select
                  value={priority}
                  disabled={true}
                  aria-disabled="true"
                  tabIndex={-1}
                  className={`w-full text-xs px-3 py-2.5 border rounded-lg cursor-not-allowed font-bold shadow-xs transition-colors ${
                    priority === 'critical'
                      ? 'bg-red-50 text-red-900 border-red-300 ring-1 ring-red-200'
                      : priority === 'high'
                      ? 'bg-amber-50 text-amber-950 border-amber-300 ring-1 ring-amber-200'
                      : priority === 'low'
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-blue-50 text-blue-950 border-blue-300 ring-1 ring-blue-200'
                  }`}
                  title="Priority level is detected automatically by Yukti Marg AI from problem severity and demographic impact, and cannot be selected manually by citizens."
                >
                  <option value="low">Low (Routine Civic Maintenance / Non-Critical)</option>
                  <option value="medium">Medium (Community Inconvenience)</option>
                  <option value="high">High (Livelihood or Infrastructure Impact)</option>
                  <option value="critical">Critical (Health, Safety, or Water Emergency)</option>
                </select>
                <div className="mt-1.5 p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 flex items-start gap-1.5 leading-snug">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">AI Priority Assessment: </span>
                    <span className="font-semibold text-slate-800 capitalize">{priority}</span>
                    <span className="text-slate-600"> — {aiPriorityRationale}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 italic">
                      (Citizen manual override is locked per State Protocol to ensure tamper-proof queue triage)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Estimated Citizens Impacted / प्रभावित नागरिक <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={estimatedImpactPeople}
                  onChange={(e) => setEstimatedImpactPeople(e.target.value)}
                  required
                  min="1"
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>
            </div>

            {/* Attachment Upload (Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Attach Supporting Photo / Document / संलग्नक <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Choose File (Image/PDF)</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {attachedFiles.length > 0 ? (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {attachedFiles.map((f) => f.name).join(', ')}
                  </span>
                ) : (
                  <span className="text-xs text-amber-800 font-medium">
                    (Supporting evidence photo/PDF is mandatory)
                  </span>
                )}
              </div>
            </div>

            {/* AI University Auto-Detection, Manual Choice & Mismatch Warning Alert */}
            <UniversitySelectionSection
              title={title}
              description={description}
              category={category}
              district={district}
              userRole="citizen"
              onChangeAssignment={handleUniversityAssignmentChange}
            />

            {/* Captcha Verification */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Security Captcha Verification <span className="text-red-500">*</span>
              </label>
              <GovCaptcha
                id="citizen-panel-captcha"
                value={captchaInput}
                onChange={(val: string) => setCaptchaInput(val)}
                onCodeGenerated={(code: string) => setCaptchaCode(code)}
                theme="emerald"
                inputPlaceholder="Enter Captcha text"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPanelView('my-submissions')}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>{isSubmitting ? 'Registering Problem...' : 'Submit Problem Statement'}</span>
              </button>
            </div>
          </form>
        </section>
      )}

    </div>
  );
};
