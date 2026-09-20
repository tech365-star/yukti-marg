import React, { useState, useCallback } from 'react';
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
  Landmark,
  BadgeCheck,
  Award
} from 'lucide-react';

export interface GovernmentBodyPanelProps {
  challenges: Challenge[];
  currentUser: User;
  activeSubTab?: 'my-submissions' | 'submit';
  onNavigateSubTab?: (subTab: 'my-submissions' | 'submit') => void;
  onSelectChallenge: (challenge: Challenge) => void;
  onChallengeSubmitted: (challenge: Challenge) => void;
  lang: 'en' | 'hi';
}

export const GovernmentBodyPanel: React.FC<GovernmentBodyPanelProps> = ({
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
  const [category, setCategory] = useState<ThematicCategory>('Water Resources & Sanitation');
  const [district, setDistrict] = useState(currentUser.district || 'Ranchi');
  const [blockOrPanchayat, setBlockOrPanchayat] = useState(currentUser.organization || currentUser.block || 'Block Administration');
  const [village, setVillage] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [estimatedImpactPeople, setEstimatedImpactPeople] = useState('10000');
  const [isAiClassifying, setIsAiClassifying] = useState(false);
  const [aiClassificationResult, setAiClassificationResult] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recentlySubmittedId, setRecentlySubmittedId] = useState<string | null>(null);

  // Assisted citizen submission state (for citizens unable to use technology who visit the officer)
  const [isAssistedCitizen, setIsAssistedCitizen] = useState(true);
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [assistanceReason, setAssistanceReason] = useState('Citizen lacks digital smartphone or internet literacy (नागरिक के पास स्मार्टफोन/इंटरनेट की सुविधा नहीं है)');

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

  // Filter only submissions by this government body
  const govSubmissions = challenges.filter((c) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'prototype_development'
        ? c.status === 'prototype_development' || c.status === 'pilot_testing'
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
    { num: 1, title: 'Intake Registered', desc: 'Administrative problem logged in State Registry' },
    { num: 2, title: 'AI & Dept Screening', desc: 'Screened & validated for HEI matching' },
    { num: 3, title: 'University Assigned', desc: 'Assigned to university faculty & R&D lab' },
    { num: 4, title: 'Prototyping & Testing', desc: 'Student-faculty solution development' },
    { num: 5, title: 'Field Deployed', desc: 'Implemented in your local community/jurisdiction' },
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
        return { label: 'Intake Registered & Logged', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'under_review':
        return { label: 'Under AI & State Review', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'assigned_hei':
      case 'team_constituted':
      case 'proposal_submitted':
        return { label: 'Assigned to University Partner', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'prototype_development':
      case 'pilot_testing':
        return { label: 'In Lab Prototyping & Field Testing', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'deployed':
        return { label: 'Field Deployed & Solved in Jurisdiction', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  // AI helper for quick categorization
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
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.category && THEMATIC_CATEGORIES.includes(json.data.category)) {
          setCategory(json.data.category as ThematicCategory);
        }
        if (json.data.priority) {
          setPriority(json.data.priority);
        }
        setAiClassificationResult(
          `AI Identified Domain: ${json.data.category}. Recommended University: ${json.data.recommendedUniversities?.[0] || 'State Research Center'}. Rationale: ${json.data.routingReason || 'High match with faculty specializations.'}`
        );
      }
    } catch (e) {
      console.warn('AI classification error:', e);
    } finally {
      setIsAiClassifying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileSizeKB = Math.round(file.size / 1024);
      setAttachedFiles((prev) => [
        ...prev,
        { name: file.name, size: `${fileSizeKB} KB` },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setSubmitError('Please provide a title and detailed problem description.');
      return;
    }

    if (isAssistedCitizen) {
      if (!citizenName.trim()) {
        setSubmitError('Please provide the Citizen Beneficiary Name.');
        return;
      }
      if (!citizenPhone.trim()) {
        setSubmitError('Please provide the Citizen Contact Number.');
        return;
      }
      if (!assistanceReason.trim()) {
        setSubmitError('Please select the Assistance Reason.');
        return;
      }
    }

    if (!village.trim()) {
      setSubmitError('Please enter the Village or Habitation.');
      return;
    }

    if (!estimatedImpactPeople || parseInt(estimatedImpactPeople) <= 0) {
      setSubmitError('Please enter a valid number of estimated beneficiaries.');
      return;
    }

    if (attachedFiles.length === 0) {
      setSubmitError('Please attach at least one supporting official survey, field photo, or PDF.');
      return;
    }

    if (captchaCode && captchaInput.trim().toUpperCase() !== captchaCode.trim().toUpperCase()) {
      setSubmitError('Invalid security captcha. Please re-enter the characters shown in the security box.');
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
      blockOrPanchayat: blockOrPanchayat || `${district} Administration`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'assigned_hei',
      priority,
      estimatedImpactPeople: parseInt(estimatedImpactPeople) || 10000,
      assignedUniversity: assignedUniversityData ? {
        id: assignedUniversityData.universityId,
        name: assignedUniversityData.universityName,
        department: assignedUniversityData.leadDepartment,
        assignedDate: new Date().toISOString().split('T')[0],
      } : undefined,
      aiAnalysis: {
        categoryConfidence: 0.95,
        summary: `Identified domain as [${category}] and matched to ${assignedUniversityData?.universityName || 'State University'} based on departmental research capacity.`,
        urgencyScore: assignedUniversityData?.matchScore || 90,
        rootCauses: ['Administrative & jurisdictional constraints', 'Engineering requirements for scalable implementation'],
        suggestedDisciplines: [assignedUniversityData?.leadDepartment || 'Environmental & Civil Engineering'],
        recommendedUniversities: [assignedUniversityData?.universityName || 'Indian Institute of Technology (IIT ISM) Dhanbad'],
        routingReason: assignedUniversityData?.routingRationale || 'AI auto-assigned based on faculty expertise and research facilities.',
        incubationCenterMatched: 'State Academic Incubation Hub',
        potentialPatentOrIP: true,
      },
      submittedBy: {
        name: isAssistedCitizen && citizenName.trim() ? `${citizenName.trim()} (Assisted by ${currentUser.name})` : currentUser.name,
        type: currentUser.role === 'panchayat' ? 'Panchayat / Local Body (PRI/ULB)' : 'Government Agency',
        userId: currentUser.id,
        contact: isAssistedCitizen && citizenPhone.trim() ? citizenPhone.trim() : (currentUser.phone || currentUser.email),
        email: currentUser.email,
        isVerifiedUser: true,
        citizenBeneficiary: isAssistedCitizen && citizenName.trim() ? citizenName.trim() : undefined,
        citizenContact: isAssistedCitizen && citizenPhone.trim() ? citizenPhone.trim() : undefined,
        assistedByOfficer: isAssistedCitizen,
        localityVillage: village || 'Administrative Jurisdiction',
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
          authorRole: currentUser.role as any,
          authorOrg: currentUser.organization || 'Departmental Officer Administration',
          message: isAssistedCitizen
            ? `Official Assisted Citizen Intake: Registered by departmental officer ${currentUser.name} (${currentUser.designation || 'Officer'}) on behalf of citizen ${citizenName.trim() || 'Resident'} (${citizenPhone ? `Phone: ${citizenPhone}, ` : ''}${village || 'Local Habitation'}). Citizen visited office as they lack smartphone/digital access. Problem statement formally endorsed for university technical intervention.`
            : 'Official community problem statement registered in State Societal Innovation Portal by departmental authority.',
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
            : `Manual Institutional Routing: Problem routed to ${assignedUniversityData.universityName} as designated by government official. ${assignedUniversityData.hasMismatchWarning ? `Note: AI issued warning (Compatibility: ${assignedUniversityData.matchScore}%).` : ''}`,
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
      setIsSubmitting(false);

      // Switch view back to Department Submissions
      setPanelView('my-submissions');
    } catch (err: any) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Failed to submit problem statement. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="government-body-individual-panel">
      
      {/* 1. GOVERNMENT BODY PROFILE SECTION */}
      <section className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden" id="gov-body-profile-section">
        {/* Top Official Banner */}
        <div className="bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#084b8a] px-6 py-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                <Landmark className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                  Departmental Officer Portal / विभागीय अधिकारी प्रकोष्ठ (Gram Panchayat & Administration)
                </span>
                <h1 className="text-xl font-extrabold text-white leading-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs text-slate-300 font-semibold">
                  {currentUser.designation || (currentUser.role === 'panchayat' ? 'Gram Panchayat Representative' : 'Departmental Nodal Officer')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-400/40 px-3 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>State Administration Verified</span>
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/70 text-xs border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Official Authority ID
            </span>
            <span className="font-mono font-bold text-slate-900 mt-0.5 block truncate">
              {currentUser.role === 'panchayat' ? 'PRI-JH-' : 'GOV-JH-'}{currentUser.id}
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
              Department / Office
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block truncate">
              {currentUser.department || currentUser.organization || 'Block Development Office'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Official Contact
            </span>
            <span className="font-medium text-slate-800 mt-0.5 block truncate">
              {currentUser.phone || currentUser.email}
            </span>
          </div>
        </div>

        {/* 2. ONLY TWO BUTTONS: "Department Submissions" and "Submit New Challenge or Problem" */}
        <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* BUTTON 1: Department Submissions Button */}
            <button
              id="gov-my-submissions-btn"
              onClick={() => setPanelView('my-submissions')}
              className={`px-5 py-2.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                panelView === 'my-submissions'
                  ? 'bg-[#003366] text-white ring-2 ring-[#003366] ring-offset-1'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <FolderGit2 className={`w-4 h-4 ${panelView === 'my-submissions' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{lang === 'en' ? 'Department Submissions' : 'मेरी प्रस्तुतियां'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                panelView === 'my-submissions' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-800'
              }`}>
                {challenges.length}
              </span>
            </button>

            {/* BUTTON 2: Submit New Challenge or Problem Button */}
            <button
              id="gov-submit-new-problem-btn"
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
            Showing exclusively your official submissions and live status tracking
          </div>
        </div>
      </section>

      {/* 3. PANEL CONTENT: EITHER PREVIOUSLY UPLOADED SUBMISSIONS OR NEW CHALLENGE FORM */}
      
      {/* ========================================================================= */}
      {/* VIEW A: DEPARTMENT SUBMISSIONS & READ-ONLY STATUS BAR */}
      {/* ========================================================================= */}
      {panelView === 'my-submissions' && (
        <section className="space-y-4" id="gov-submissions-list-section">
          {/* Submissions Header Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search official challenges by keyword, code, or block..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
              >
                <option value="all">All Progress Stages ({challenges.length})</option>
                <option value="submitted">Intake Registered</option>
                <option value="under_review">AI & Dept Review</option>
                <option value="assigned_hei">Assigned to University</option>
                <option value="prototype_development">Prototyping / Testing</option>
                <option value="deployed">Field Deployed</option>
              </select>
            </div>
          </div>

          {/* Submissions Cards List */}
          {govSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-10 text-center space-y-3">
              <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-700">
                No Submissions Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'No problems match your current search criteria.'
                  : 'You have not registered any community problems yet.'}
              </p>
              <button
                type="button"
                onClick={() => setPanelView('submit-new')}
                className="px-4 py-2 bg-[#003366] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit First Problem Statement</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {govSubmissions.map((challenge) => {
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

                const rawStageIdx = getStageIndex(challenge.status);
                const currentStageIdx = isCompletedAndDeployed ? 5 : isPrototypeSubmitted ? 5 : rawStageIdx;

                const baseBadge = getStatusBadge(challenge.status);
                const badge = isCompletedAndDeployed
                  ? { label: 'Complete and Deployed (Status: End)', color: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' }
                  : isPrototypeSubmitted
                  ? { label: 'Prototype Submitted to Industry (Awaiting Acceptance)', color: 'bg-blue-100 text-blue-900 border-blue-300 font-bold' }
                  : baseBadge;

                const isExpanded = expandedChallengeId === challenge.id;

                return (
                  <div
                    key={challenge.id}
                    id={`gov-submission-card-${challenge.id}`}
                    className="bg-white rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all shadow-xs overflow-hidden"
                  >
                    {/* Top Row: Category, Code, Date, Priority */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded">
                            {challenge.code}
                          </span>
                          <span className="text-[10px] font-bold text-[#003366] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            {challenge.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            challenge.priority === 'critical' ? 'bg-red-100 text-red-900 border border-red-300' :
                            challenge.priority === 'high' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {challenge.priority} Priority
                          </span>
                        </div>
                      </div>

                      {/* Problem Title & Description */}
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                          {challenge.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {challenge.description}
                        </p>
                      </div>

                      {/* Location and Metadata Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            {challenge.district} • {challenge.blockOrPanchayat}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Registered: {challenge.submittedDate}
                          </span>
                          {challenge.estimatedImpactPeople && (
                            <span className="hidden sm:inline text-slate-600 font-semibold">
                              ~{challenge.estimatedImpactPeople.toLocaleString()} Impacted Citizens
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedChallengeId(isExpanded ? null : challenge.id)}
                            className="text-[#003366] hover:underline font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide Status Timeline' : 'View Live Status'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* =============================================================== */}
                    {/* READ-ONLY 5-STAGE STATUS BAR (NO ACTIVE BUTTONS AVAILABLE) */}
                    {/* =============================================================== */}
                    <div className="bg-slate-50/90 border-t border-slate-200 p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-700" />
                          <span>5-Stage Societal Innovation Lifecycle Status (Read-Only)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 italic">
                          Official status automatically verified by State Higher Education Directorate
                        </span>
                      </div>

                      {/* Visual Timeline Stepper */}
                      {(() => {
                        return (
                          <div className="relative">
                            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
                            <div 
                              className={`hidden sm:block absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 transition-all duration-500 ${
                                isCompletedAndDeployed ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${isCompletedAndDeployed ? 100 : isPrototypeSubmitted ? 80 : ((currentStageIdx - 1) / (STAGES.length - 1)) * 100}%` }}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative z-10">
                              {STAGES.map((st) => {
                                const isCompleted = isCompletedAndDeployed ? true : isPrototypeSubmitted ? st.num < 5 : st.num < currentStageIdx;
                                const isCurrent = isCompletedAndDeployed ? false : isPrototypeSubmitted ? st.num === 5 : st.num === currentStageIdx;
                                const isUpcoming = isCompletedAndDeployed ? false : isPrototypeSubmitted ? false : st.num > currentStageIdx;

                                return (
                                  <div
                                    key={st.num}
                                    className={`p-2.5 sm:p-2 rounded-lg border text-left transition-all ${
                                      isCompleted
                                        ? 'bg-emerald-50/70 border-emerald-300'
                                        : isCurrent
                                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40'
                                        : 'bg-white border-slate-200 opacity-60'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                        isCompleted
                                          ? 'bg-emerald-600 text-white'
                                          : isCurrent
                                          ? 'bg-amber-500 text-slate-950 font-black'
                                          : 'bg-slate-200 text-slate-600'
                                      }`}>
                                        {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
                                      </span>

                                      {isCompletedAndDeployed ? (
                                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1 rounded">
                                          Done
                                        </span>
                                      ) : isCurrent ? (
                                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-1 rounded">
                                          Active
                                        </span>
                                      ) : null}
                                    </div>

                                    <div className={`text-xs font-bold leading-tight ${isCompleted ? 'text-emerald-900' : 'text-slate-900'}`}>
                                      {st.title}
                                    </div>
                                    <div className="text-[10px] text-slate-500 leading-snug mt-0.5">
                                      {st.desc}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Assigned University details if already assigned */}
                      {challenge.assignedUniversity && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-purple-700 shrink-0" />
                            <span className="text-purple-950">
                              Assigned University Partner: <strong>{challenge.assignedUniversity.name}</strong>
                              {challenge.assignedUniversity.department && ` (${challenge.assignedUniversity.department})`}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                            HEI Matched
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Inline Expanded Details */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                              Administrative Context
                            </h4>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                              <div><strong>Jurisdiction:</strong> {challenge.district}, {challenge.blockOrPanchayat}</div>
                              <div><strong>Locality:</strong> {challenge.submittedBy.localityVillage || 'Jurisdiction Area'}</div>
                              <div><strong>Beneficiary Impact:</strong> {challenge.estimatedImpactPeople?.toLocaleString() || '10,000+'} citizens</div>
                              <div><strong>Priority Level:</strong> {challenge.priority?.toUpperCase()}</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                              Official Progress Notes
                            </h4>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 max-h-40 overflow-y-auto">
                              {challenge.comments && challenge.comments.length > 0 ? (
                                challenge.comments.map((comm) => (
                                  <div key={comm.id} className="text-[11px] pb-1.5 border-b border-slate-200 last:border-0">
                                    <div className="flex items-center justify-between font-bold text-slate-800">
                                      <span>{comm.authorName} ({comm.authorOrg})</span>
                                      <span className="text-[10px] text-slate-500">{comm.createdAt.split('T')[0]}</span>
                                    </div>
                                    <p className="text-slate-600 mt-0.5">{comm.message}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-slate-500 italic text-[11px]">No official notes logged yet.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => onSelectChallenge(challenge)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>Open Full Problem Details</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: SUBMIT NEW CHALLENGE OR PROBLEM FORM (WITH AI UNIVERSITY MATCHING) */}
      {/* ========================================================================= */}
      {panelView === 'submit-new' && (
        <section className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden" id="gov-submit-new-problem-form">
          <div className="bg-[#003366] text-white px-6 py-4">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-400" />
              <span>Register New Community Challenge / Administrative Problem Statement</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Submit local infrastructural, water, sanitation, agricultural, or livelihood bottlenecks for multidisciplinary university R&D solutions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Assisted Citizen Intake Desk (For citizens who approached officer due to lack of tech literacy) */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950">
                      Assisted Citizen Intake Desk / नागरिक सहायता केंद्र
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      For citizens who cannot use digital technology or smartphones. Officers intake and submit the problem statement on their behalf.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={isAssistedCitizen}
                    onChange={(e) => setIsAssistedCitizen(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-500"
                  />
                  <span>Submitting on behalf of a Citizen</span>
                </label>
              </div>

              {isAssistedCitizen && (
                <div className="pt-2 border-t border-emerald-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      Citizen Beneficiary Name / नागरिक का नाम <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={isAssistedCitizen}
                      placeholder="e.g. Smt. Manju Devi / Shri Ramesh Soren"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      Citizen Contact Number / मोबाइल नंबर <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required={isAssistedCitizen}
                      placeholder="e.g. +91 94311 12345 (for SMS notifications)"
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      Assistance Reason / सहायता का कारण <span className="text-red-500">*</span>
                    </label>
                    <select
                      required={isAssistedCitizen}
                      value={assistanceReason}
                      onChange={(e) => setAssistanceReason(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                    >
                      <option value="Citizen lacks digital smartphone / internet literacy">Lacks Smartphone / Digital Literacy (तकनीकी जानकारी का अभाव)</option>
                      <option value="Poor cellular network connectivity in village">Poor Network in Village (गांव में नेटवर्क की कमी)</option>
                      <option value="Senior citizen requiring official grievance intake">Senior Citizen Grievance (वरिष्ठ नागरिक सहायता)</option>
                      <option value="Direct village community delegation to Mukhiya/BDO">Village Community Delegation (ग्राम प्रतिनिधिमंडल)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Problem Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Problem Statement Title / समस्या का शीर्षक <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Heavy Fluoride & Iron Contamination in Deep Wells across Ormanjhi Block"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
              />
            </div>

            {/* Problem Description with AI Categorize Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Detailed Description & Local Impact / विस्तृत विवरण <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAiCategorize}
                  disabled={isAiClassifying}
                  className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isAiClassifying ? 'Analyzing with AI...' : 'Auto-Classify with AI'}</span>
                </button>
              </div>

              <textarea
                required
                rows={4}
                placeholder="Describe the specific local issue, affected habitations, current failure points, and what technical or engineering assistance is requested from universities..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
              />

              {aiClassificationResult && (
                <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{aiClassificationResult}</span>
                </div>
              )}
            </div>

            {/* Thematic Category & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Thematic Domain / विषयगत श्रेणी <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ThematicCategory)}
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
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
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

            {/* Block & Habitation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Block / Panchayat / ब्लॉक या पंचायत <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ormanjhi Block / Kanke Block"
                  value={blockOrPanchayat}
                  onChange={(e) => setBlockOrPanchayat(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Village / Habitation / ग्राम या क्षेत्र <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sikidiri Panchayat Habitations"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>
            </div>

            {/* Priority & Estimated Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Priority Level / प्राथमिकता स्तर <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003366] focus:outline-none"
                >
                  <option value="medium">Medium (Community Inconvenience)</option>
                  <option value="high">High (Livelihood or Infrastructure Impact)</option>
                  <option value="critical">Critical (Health, Safety, or Water Emergency)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Estimated Beneficiaries / प्रभावित नागरिक <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 10000"
                  value={estimatedImpactPeople}
                  onChange={(e) => setEstimatedImpactPeople(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>
            </div>

            {/* Attachment Upload (Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Attach Supporting Official Survey / Field Photo / PDF / संलग्नक <span className="text-red-500">*</span>
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
                    (Official verification document/evidence is mandatory)
                  </span>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* AI UNIVERSITY AUTO-DETECTION, MANUAL SELECTION BUTTON & MISMATCH WARNING */}
            {/* ========================================================================= */}
            <UniversitySelectionSection
              title={title}
              description={description}
              category={category}
              district={district}
              userRole={currentUser.role === 'panchayat' ? 'panchayat' : 'government'}
              onChangeAssignment={handleUniversityAssignmentChange}
            />

            {/* Captcha Verification */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Security Captcha Verification <span className="text-red-500">*</span>
              </label>
              <GovCaptcha
                id="gov-panel-captcha"
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
                className="px-6 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-xs font-extrabold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>{isSubmitting ? 'Registering Problem...' : 'Submit Official Challenge'}</span>
              </button>
            </div>
          </form>
        </section>
      )}

    </div>
  );
};
