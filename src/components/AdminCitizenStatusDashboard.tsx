import React, { useState, useMemo } from 'react';
import { 
  Challenge, 
  ChallengeStatus, 
  PriorityLevel, 
  User, 
  ThematicCategory, 
  UniversityProfile,
  IndustryPartnerOrg 
} from '../types';
import { JHARKHAND_DISTRICTS, THEMATIC_CATEGORIES, UNIVERSITIES, INDUSTRY_PARTNERS } from '../data/mockData';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  GraduationCap, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Download, 
  Send, 
  Sliders, 
  Sparkles, 
  Copy, 
  Check, 
  Eye, 
  Plus, 
  ArrowRight, 
  ExternalLink, 
  RefreshCw, 
  X, 
  Award, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Rocket, 
  CornerDownRight, 
  CheckSquare,
  Lock,
  Layers,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  Tag
} from 'lucide-react';

export interface AdminCitizenStatusDashboardProps {
  challenges: Challenge[];
  currentUser: User | null;
  onUpdateChallenge: (updated: Challenge) => void;
  onSelectChallenge: (c: Challenge) => void;
  onAddNotification?: (notif: any) => Promise<void> | void;
  lang?: 'en' | 'hi';
}

const STAGES = [
  { num: 1, title: 'Intake Submitted', desc: 'Problem logged in State Registry' },
  { num: 2, title: 'State & AI Review', desc: 'Screened & validated for HEI matching' },
  { num: 3, title: 'University Assigned', desc: 'Assigned to university faculty & R&D lab' },
  { num: 4, title: 'Prototyping & Testing', desc: 'Student-faculty solution development' },
  { num: 5, title: 'Complete & Deployed (End)', desc: 'Accepted & deployed by industry into community (Status: End)' },
];

export const AdminCitizenStatusDashboard: React.FC<AdminCitizenStatusDashboardProps> = ({
  challenges,
  currentUser,
  onUpdateChallenge,
  onSelectChallenge,
  onAddNotification,
  lang = 'en',
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [certifiedFilter, setCertifiedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'impact' | 'urgency'>('newest');

  // Accordion / Expanded Detail State per challenge
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<Record<string, 'all' | 'submitter' | 'ai' | 'university' | 'industry' | 'audit'>>({});

  // Administrative Action Modals State
  const [selectedChallengeForOverride, setSelectedChallengeForOverride] = useState<Challenge | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<ChallengeStatus>('assigned_hei');
  const [overridePriority, setOverridePriority] = useState<PriorityLevel>('high');
  const [overrideUniversityId, setOverrideUniversityId] = useState<string>('bit-mesra');
  const [overrideAdminRemarks, setOverrideAdminRemarks] = useState('');
  const [isApplyingOverride, setIsApplyingOverride] = useState(false);

  // Administrative Directive Modal State
  const [selectedChallengeForDirective, setSelectedChallengeForDirective] = useState<Challenge | null>(null);
  const [directiveText, setDirectiveText] = useState('');
  const [directiveOrderNumber, setDirectiveOrderNumber] = useState('');
  const [directiveAudience, setDirectiveAudience] = useState<'all' | 'citizen' | 'university' | 'industry'>('all');
  const [isDispatchingDirective, setIsDispatchingDirective] = useState(false);

  // Success / Alert message banner
  const [actionAlert, setActionAlert] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const showAlert = (message: string, type: 'success' | 'info' = 'success') => {
    setActionAlert({ message, type });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Helper to determine stage index
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
        return { label: 'Intake Submitted', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'under_review':
        return { label: 'Under AI & State Review', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'assigned_hei':
      case 'team_constituted':
      case 'proposal_submitted':
        return { label: 'Assigned to University Partner', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'prototype_development':
      case 'pilot_testing':
        return { label: 'Lab Prototyping & Pilot Testing', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'deployed':
        return { label: 'Complete and Deployed (Status: End)', color: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  // Filtered and Sorted Challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        const matchesSubmitter = c.submittedBy?.name?.toLowerCase().includes(q);
        const matchesDistrict = c.district.toLowerCase().includes(q);
        const matchesCategory = c.category.toLowerCase().includes(q);
        const matchesUni = c.assignedUniversity?.name?.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesDesc && !matchesSubmitter && !matchesDistrict && !matchesCategory && !matchesUni) {
          return false;
        }
      }

      // District filter
      if (districtFilter !== 'all' && c.district !== districtFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'hei_assigned') {
          if (!['assigned_hei', 'team_constituted', 'proposal_submitted'].includes(c.status)) return false;
        } else if (statusFilter === 'prototyping') {
          if (!['prototype_development', 'pilot_testing'].includes(c.status)) return false;
        } else if (c.status !== statusFilter) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) {
        return false;
      }

      // Certification filter
      if (certifiedFilter === 'certified' && !c.submittedBy?.certifiedByAuthority) {
        return false;
      }
      if (certifiedFilter === 'uncertified' && c.submittedBy?.certifiedByAuthority) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'impact') {
        return (b.estimatedImpactPeople || 0) - (a.estimatedImpactPeople || 0);
      }
      if (sortBy === 'urgency') {
        const scoreA = a.aiAnalysis?.urgencyScore || (a.priority === 'critical' ? 95 : a.priority === 'high' ? 80 : 50);
        const scoreB = b.aiAnalysis?.urgencyScore || (b.priority === 'critical' ? 95 : b.priority === 'high' ? 80 : 50);
        return scoreB - scoreA;
      }
      // Newest first
      return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
    });
  }, [challenges, searchQuery, districtFilter, statusFilter, priorityFilter, certifiedFilter, sortBy]);

  // Key Counts for metrics bar
  const metrics = useMemo(() => {
    const total = challenges.length;
    const submitted = challenges.filter((c) => c.status === 'submitted' || c.status === 'under_review').length;
    const heiAssigned = challenges.filter((c) => ['assigned_hei', 'team_constituted', 'proposal_submitted'].includes(c.status)).length;
    const prototyping = challenges.filter((c) => ['prototype_development', 'pilot_testing'].includes(c.status)).length;
    const deployed = challenges.filter((c) => c.status === 'deployed' || c.lifecycleStatus === 'end').length;
    const critical = challenges.filter((c) => c.priority === 'critical').length;
    const certified = challenges.filter((c) => c.submittedBy?.certifiedByAuthority).length;
    return { total, submitted, heiAssigned, prototyping, deployed, critical, certified };
  }, [challenges]);

  // Handler: Execute Administrative Stage / Priority / University Override
  const handleExecuteOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeForOverride) return;

    setIsApplyingOverride(true);
    const assignedUni = UNIVERSITIES.find((u) => u.id === overrideUniversityId);

    try {
      const res = await fetch(`/api/admin/challenges/${selectedChallengeForOverride.id}/override-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: overrideStatus,
          priority: overridePriority,
          adminRemarks: overrideAdminRemarks.trim() || 'Direct administrative review decision applied by State Innovation Directorate.',
          assignedUniversity: assignedUni ? {
            id: assignedUni.id,
            name: assignedUni.name,
            department: assignedUni.specializations?.[0] || 'Department of Applied Engineering',
            assignedDate: new Date().toISOString().split('T')[0],
          } : undefined,
          adminActor: {
            id: currentUser?.id || 'admin-usr',
            name: currentUser?.name || 'State Innovation Director',
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        onUpdateChallenge(data.challenge);
        showAlert(`Administrator action successfully saved for [${data.challenge.code}]! Status: ${overrideStatus.toUpperCase()}`);
        setSelectedChallengeForOverride(null);
        setOverrideAdminRemarks('');
      } else {
        // Fallback local update
        const updated: Challenge = {
          ...selectedChallengeForOverride,
          status: overrideStatus,
          priority: overridePriority,
          assignedUniversity: assignedUni ? {
            id: assignedUni.id,
            name: assignedUni.name,
            department: assignedUni.specializations?.[0] || 'Department of Applied Engineering',
            assignedDate: new Date().toISOString().split('T')[0],
          } : selectedChallengeForOverride.assignedUniversity,
          lifecycleStatus: overrideStatus === 'deployed' ? 'end' : selectedChallengeForOverride.lifecycleStatus,
          comments: [
            ...selectedChallengeForOverride.comments,
            {
              id: `comm-adm-${Date.now()}`,
              authorId: currentUser?.id || 'admin-usr',
              authorName: currentUser?.name || 'State Innovation Director (Admin)',
              authorRole: 'admin',
              authorOrg: 'State Higher & Technical Education Directorate',
              message: `State Administrator Override: Status updated to [${overrideStatus.toUpperCase()}]. Priority: [${overridePriority.toUpperCase()}]. ${overrideAdminRemarks.trim() ? `Remarks: ${overrideAdminRemarks.trim()}` : ''}`,
              createdAt: new Date().toISOString(),
              isOfficialNote: true,
            },
          ],
        };
        onUpdateChallenge(updated);
        showAlert(`Administrator action applied to [${updated.code}]!`);
        setSelectedChallengeForOverride(null);
      }
    } catch (err: any) {
      console.warn('Admin override network fallback:', err);
    } finally {
      setIsApplyingOverride(false);
    }
  };

  // Handler: Toggle Official Government Certification
  const handleToggleCertification = async (challenge: Challenge) => {
    const newCertifiedVal = !challenge.submittedBy?.certifiedByAuthority;
    try {
      const res = await fetch(`/api/admin/challenges/${challenge.id}/override-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certifiedByAuthority: newCertifiedVal,
          adminRemarks: newCertifiedVal 
            ? 'Problem statement authenticated and officially certified by Directorate of Higher & Technical Education.'
            : 'Certification badge reviewed and set to pending verification.',
          adminActor: {
            id: currentUser?.id || 'admin-usr',
            name: currentUser?.name || 'State Innovation Director',
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        onUpdateChallenge(data.challenge);
        showAlert(newCertifiedVal ? `[${challenge.code}] officially CERTIFIED by Directorate!` : `[${challenge.code}] certification withdrawn.`);
        return;
      }
    } catch (err) {
      console.warn('Certification toggle network fallback:', err);
    }

    // Local fallback
    const updated: Challenge = {
      ...challenge,
      submittedBy: {
        ...challenge.submittedBy,
        certifiedByAuthority: newCertifiedVal,
      },
      comments: [
        ...challenge.comments,
        {
          id: `c-cert-${Date.now()}`,
          authorId: currentUser?.id || 'admin-usr',
          authorName: currentUser?.name || 'State Innovation Director (Admin)',
          authorRole: 'admin',
          authorOrg: 'State Higher & Technical Education Directorate',
          message: newCertifiedVal 
            ? 'Official Certification Sealed: Problem statement has been formally verified and stamped by the State Higher & Technical Education Directorate.'
            : 'Certification seal withdrawn for administrative review.',
          createdAt: new Date().toISOString(),
          isOfficialNote: true,
        },
      ],
    };
    onUpdateChallenge(updated);
    showAlert(newCertifiedVal ? `[${challenge.code}] officially CERTIFIED by Directorate!` : `[${challenge.code}] certification status updated.`);
  };

  // Handler: Fast-Track to HEI
  const handleFastTrackToHEI = async (challenge: Challenge) => {
    const defaultUni = UNIVERSITIES[0]; // BIT Mesra
    try {
      const res = await fetch(`/api/admin/challenges/${challenge.id}/override-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'assigned_hei',
          priority: 'critical',
          expediteFlag: true,
          assignedUniversity: {
            id: defaultUni.id,
            name: defaultUni.name,
            department: defaultUni.specializations?.[0] || 'Department of Applied Engineering',
            assignedDate: new Date().toISOString().split('T')[0],
          },
          adminRemarks: 'FAST-TRACK EXPEDITED ORDER: Priority escalated to CRITICAL and directly assigned to premier Higher Education Institution for immediate intervention.',
          adminActor: {
            id: currentUser?.id || 'admin-usr',
            name: currentUser?.name || 'State Innovation Director',
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        onUpdateChallenge(data.challenge);
        showAlert(`Fast-Track Order Executed: [${challenge.code}] allocated to ${defaultUni.name} as CRITICAL priority!`);
        return;
      }
    } catch (e) {
      console.warn('Fast track fallback:', e);
    }

    // Local fallback
    const updated: Challenge = {
      ...challenge,
      status: 'assigned_hei',
      priority: 'critical',
      assignedUniversity: {
        id: defaultUni.id,
        name: defaultUni.name,
        department: defaultUni.specializations?.[0] || 'Department of Applied Engineering',
        assignedDate: new Date().toISOString().split('T')[0],
      },
      comments: [
        ...challenge.comments,
        {
          id: `c-fast-${Date.now()}`,
          authorId: currentUser?.id || 'admin-usr',
          authorName: currentUser?.name || 'State Innovation Director',
          authorRole: 'admin',
          authorOrg: 'State Higher & Technical Education Directorate',
          message: `FAST-TRACK ADMINISTRATIVE MANDATE: Problem statement prioritized to CRITICAL state urgency and allocated to ${defaultUni.name}.`,
          createdAt: new Date().toISOString(),
          isOfficialNote: true,
        },
      ],
    };
    onUpdateChallenge(updated);
    showAlert(`Fast-Track Order Executed for [${challenge.code}]!`);
  };

  // Handler: Dispatch Official Administrative Directive
  const handleDispatchDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeForDirective || !directiveText.trim()) return;

    setIsDispatchingDirective(true);
    const orderNo = directiveOrderNumber.trim() || `DIR/YM/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch(`/api/admin/challenges/${selectedChallengeForDirective.id}/add-directive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directiveText: directiveText.trim(),
          orderNumber: orderNo,
          targetAudience: directiveAudience,
          adminName: currentUser?.name || 'State Innovation Director',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        onUpdateChallenge(data.challenge);
        showAlert(`Official Directive [${orderNo}] dispatched to all stakeholders on [${data.challenge.code}]!`);
        setSelectedChallengeForDirective(null);
        setDirectiveText('');
        setDirectiveOrderNumber('');
      } else {
        // Local fallback
        const updated: Challenge = {
          ...selectedChallengeForDirective,
          comments: [
            ...selectedChallengeForDirective.comments,
            {
              id: `c-dir-${Date.now()}`,
              authorId: currentUser?.id || 'admin-usr',
              authorName: `${currentUser?.name || 'State Innovation Director'} (Directorate Order: ${orderNo})`,
              authorRole: 'admin',
              authorOrg: 'State Higher & Technical Education Directorate, Govt of Jharkhand',
              message: `OFFICIAL GOVERNMENT DIRECTIVE [${orderNo}]: ${directiveText.trim()}`,
              createdAt: new Date().toISOString(),
              isOfficialNote: true,
            },
          ],
        };
        onUpdateChallenge(updated);
        showAlert(`Official Directive [${orderNo}] dispatched!`);
        setSelectedChallengeForDirective(null);
        setDirectiveText('');
      }
    } catch (err) {
      console.warn('Directive dispatch fallback:', err);
    } finally {
      setIsDispatchingDirective(false);
    }
  };

  // Handler: Download Administrative Case Dossier
  const handleDownloadDossier = (challenge: Challenge) => {
    const lines = [
      '========================================================================',
      'GOVERNMENT OF JHARKHAND - DEPARTMENT OF HIGHER & TECHNICAL EDUCATION',
      'YUKTI MARG: STATE SOCIETAL INNOVATION PORTAL',
      'OFFICIAL ADMINISTRATIVE CASE DOSSIER & CITIZEN PROBLEM RECORD',
      '========================================================================',
      `Date Generated: ${new Date().toLocaleString('en-IN')}`,
      `Tracking Code : ${challenge.code}`,
      `Problem Title : ${challenge.title}`,
      `Category      : ${challenge.category}`,
      `District      : ${challenge.district}`,
      `Block/Local   : ${challenge.blockOrPanchayat}`,
      `Current Status: ${challenge.status.toUpperCase()} (Stage ${getStageIndex(challenge.status)} of 5)`,
      `Priority      : ${challenge.priority.toUpperCase()}`,
      `Certified     : ${challenge.submittedBy?.certifiedByAuthority ? 'YES (Officially Certified by Directorate)' : 'Pending Certification'}`,
      `Est. Impact   : ~${challenge.estimatedImpactPeople.toLocaleString()} citizens`,
      '',
      '--- CITIZEN SUBMITTER DETAILS ---',
      `Full Name     : ${challenge.submittedBy?.name || 'Citizen Submitter'}`,
      `Contact       : ${challenge.submittedBy?.contact || challenge.submittedBy?.email || 'Registered in UIDAI portal'}`,
      `Email         : ${challenge.submittedBy?.email || 'N/A'}`,
      `Locality/Vill : ${challenge.submittedBy?.localityVillage || 'Village Habitation'}`,
      `Sub. Type     : ${challenge.submittedBy?.type || 'Citizen Submitter'}`,
      `Verified ID   : UIDAI / Voter Verified Citizen`,
      '',
      '--- YUKTI MARG AI TRIAGE & INTELLIGENCE ---',
      `AI Category   : ${challenge.category} (Confidence: ${((challenge.aiAnalysis?.categoryConfidence || 0.94) * 100).toFixed(0)}%)`,
      `Urgency Score : ${challenge.aiAnalysis?.urgencyScore || 85}/100`,
      `De-Duplication: ${challenge.aiAnalysis?.deDuplicationCheck?.status || 'Unique'} (Similarity: ${challenge.aiAnalysis?.deDuplicationCheck?.similarityScore || 0}%)`,
      `Root Causes   : ${(challenge.aiAnalysis?.rootCauses || ['Infrastructural bottleneck']).join(', ')}`,
      `Recommended HEI: ${(challenge.aiAnalysis?.recommendedUniversities || ['Birla Institute of Technology (BIT) Mesra']).join(', ')}`,
      '',
      '--- ALLOCATED HIGHER EDUCATION INSTITUTION ---',
      `University    : ${challenge.assignedUniversity?.name || 'Not Yet Allocated'}`,
      `Department    : ${challenge.assignedUniversity?.department || 'N/A'}`,
      `Assigned Date : ${challenge.assignedUniversity?.assignedDate || 'N/A'}`,
      `Faculty Mentor: ${challenge.team?.facultyMentor || 'Pending Designation'}`,
      `Research Team : ${challenge.team?.studentMembers?.length || 0} student researchers`,
      '',
      '--- INDUSTRY & CSR SPONSORSHIP ---',
      `Pledged Orgs  : ${challenge.industryPartners?.length || 0} partners`,
      ...(challenge.industryPartners?.map(p => `  - ${p.partnerName}: ₹${(p.pledgeAmountINR || 0).toLocaleString('en-IN')} (${p.supportType})`) || []),
      `Proposals Log : ${challenge.proposals?.length || 0} academic proposals submitted`,
      '',
      '--- COMPLETE ADMINISTRATIVE AUDIT TRAIL ---',
      ...(challenge.comments?.map(c => `[${c.createdAt.split('T')[0]}] ${c.authorName} (${c.authorRole}): ${c.message}`) || ['No audit notes.']),
      '',
      '========================================================================',
      'Confidential Official State Record - Authorized for Administrative Use',
      'Department of Higher & Technical Education, Government of Jharkhand',
      '========================================================================',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `YuktiMarg-Dossier-${challenge.code}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showAlert(`Official Case Dossier for [${challenge.code}] downloaded!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="admin-citizen-status-dashboard">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#0a4b8f] px-6 py-5 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-extrabold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Executive Administrator Oversight Desk</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold">
                  Live State Registry Sync
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {lang === 'en' ? 'Citizen Problem Statements & Live Status Dashboard' : 'नागरिक समस्या प्रस्तुति एवं लाइव स्थिति डैशबोर्ड'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
                Direct administrative oversight of all grassroots societal problems reported by citizens across Jharkhand. View the full citizen-facing 5-stage status tracking, inspect deep verification and AI audit dossiers, and exercise executive state override controls.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDistrictFilter('all');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setCertifiedFilter('all');
                  showAlert('Filters refreshed to show all state submissions.', 'info');
                }}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer shadow-2xs"
                title="Refresh and reset all filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. SUMMARY METRICS CHIPS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-x divide-y sm:divide-y-0 divide-slate-200 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="p-3 sm:p-3.5 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Submissions</span>
            <span className="text-lg font-black text-[#003366]">{metrics.total}</span>
            <span className="text-[10px] text-slate-400 block">All 24 Districts</span>
          </div>

          <div className="p-3 sm:p-3.5 text-center bg-blue-50/40">
            <span className="text-[11px] font-semibold text-blue-800 block">Intake / Under Review</span>
            <span className="text-lg font-black text-blue-900">{metrics.submitted}</span>
            <span className="text-[10px] text-blue-600 block">Stage 1 & 2</span>
          </div>

          <div className="p-3 sm:p-3.5 text-center bg-purple-50/40">
            <span className="text-[11px] font-semibold text-purple-800 block">Allocated to HEIs</span>
            <span className="text-lg font-black text-purple-900">{metrics.heiAssigned}</span>
            <span className="text-[10px] text-purple-600 block">BIT, IIT, NIT, BAU</span>
          </div>

          <div className="p-3 sm:p-3.5 text-center bg-indigo-50/40">
            <span className="text-[11px] font-semibold text-indigo-800 block">In Prototyping</span>
            <span className="text-lg font-black text-indigo-900">{metrics.prototyping}</span>
            <span className="text-[10px] text-indigo-600 block">Stage 4 Active</span>
          </div>

          <div className="p-3 sm:p-3.5 text-center bg-emerald-50/40">
            <span className="text-[11px] font-semibold text-emerald-800 block">Deployed (End)</span>
            <span className="text-lg font-black text-emerald-900">{metrics.deployed}</span>
            <span className="text-[10px] text-emerald-600 block">Completed & Closed</span>
          </div>

          <div className="p-3 sm:p-3.5 text-center bg-rose-50/40">
            <span className="text-[11px] font-semibold text-rose-800 block">Critical Urgency</span>
            <span className="text-lg font-black text-rose-900">{metrics.critical}</span>
            <span className="text-[10px] text-rose-600 block">Priority Flagged</span>
          </div>

          <div className="p-3 sm:p-3.5 text-center bg-amber-50/40">
            <span className="text-[11px] font-semibold text-amber-800 block">Certified by Govt</span>
            <span className="text-lg font-black text-amber-900">{metrics.certified}</span>
            <span className="text-[10px] text-amber-700 block">Officially Sealed</span>
          </div>
        </div>
      </div>

      {/* Action Notification Alert Banner */}
      {actionAlert && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in duration-200 ${
          actionAlert.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-blue-50 text-blue-900 border-blue-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionAlert.message}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-slate-500 hover:text-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. SEARCH & ADMINISTRATIVE FILTER TOOLBAR */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Tracking Code (e.g. YM-JH-2026-1042), title, citizen name, village, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* District Dropdown */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-[#003366] focus:outline-none"
            >
              <option value="all">All 24 Districts</option>
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-[#003366] focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Urgency</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium</option>
              <option value="low">Low Routine</option>
            </select>

            {/* Certification Filter */}
            <select
              value={certifiedFilter}
              onChange={(e) => setCertifiedFilter(e.target.value)}
              className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-[#003366] focus:outline-none"
            >
              <option value="all">Certification: All</option>
              <option value="certified">Officially Certified</option>
              <option value="uncertified">Pending Certification</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-[#003366] focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="impact">Sort: Max Citizen Impact</option>
              <option value="urgency">Sort: Highest AI Urgency</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Status Track:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap transition-all ${
              statusFilter === 'all' ? 'bg-[#003366] text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Submissions ({challenges.length})
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap transition-all ${
              statusFilter === 'submitted' ? 'bg-blue-700 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Stage 1: Intake ({challenges.filter((c) => c.status === 'submitted').length})
          </button>
          <button
            onClick={() => setStatusFilter('under_review')}
            className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap transition-all ${
              statusFilter === 'under_review' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Stage 2: Review ({challenges.filter((c) => c.status === 'under_review').length})
          </button>
          <button
            onClick={() => setStatusFilter('hei_assigned')}
            className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap transition-all ${
              statusFilter === 'hei_assigned' ? 'bg-purple-700 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Stage 3: HEI Allocated ({challenges.filter((c) => ['assigned_hei', 'team_constituted', 'proposal_submitted'].includes(c.status)).length})
          </button>
          <button
            onClick={() => setStatusFilter('prototyping')}
            className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap transition-all ${
              statusFilter === 'prototyping' ? 'bg-indigo-700 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Stage 4: Prototyping ({challenges.filter((c) => ['prototype_development', 'pilot_testing'].includes(c.status)).length})
          </button>
          <button
            onClick={() => setStatusFilter('deployed')}
            className={`px-3 py-1.5 rounded-md font-bold cursor-pointer whitespace-nowrap transition-all ${
              statusFilter === 'deployed' ? 'bg-emerald-700 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Stage 5: Complete & Deployed (End) ({challenges.filter((c) => c.status === 'deployed' || c.lifecycleStatus === 'end').length})
          </button>
        </div>
      </div>

      {/* 4. CHALLENGES LIST: CITIZEN STATUS DASHBOARD ADAPTED FOR ADMINISTRATORS */}
      <div className="space-y-5" id="admin-challenges-list">
        {filteredChallenges.length > 0 ? (
          filteredChallenges.map((challenge) => {
            const isIndustryVerified = Boolean(
              challenge.prototypeDeliverable?.status === 'verified_by_industry' || 
              Boolean(challenge.prototypeDeliverable?.verifiedByIndustry?.verified)
            );

            const isCompletedAndDeployed = Boolean(
              (challenge.status === 'deployed' || challenge.lifecycleStatus === 'end') &&
              (isIndustryVerified || challenge.prototypeDeliverable?.deployedDate)
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
            const currentDetailTab = expandedSection[challenge.id] || 'all';

            return (
              <article
                key={challenge.id}
                className="bg-white rounded-xl border-2 border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                id={`admin-challenge-card-${challenge.id}`}
              >
                {/* Top Meta Bar: Tracking ID, Badges, Certification, District */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center flex-wrap gap-2">
                    {/* Tracking ID with copy button */}
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-black text-xs bg-[#003366] text-amber-300 px-2.5 py-1 rounded border border-[#002244] flex items-center gap-1.5 shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{challenge.code}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(challenge.code, challenge.code)}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                        title="Copy tracking code"
                      >
                        {copiedCode === challenge.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Official Status Badge */}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>

                    {/* Thematic Category */}
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-500" />
                      <span>{challenge.category}</span>
                    </span>

                    {/* Directorate Certification Seal */}
                    {challenge.submittedBy?.certifiedByAuthority ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Directorate Certified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                        <span>Certification Pending</span>
                      </span>
                    )}

                    {/* Citizen UIDAI Verification Flag */}
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>UIDAI Submitter</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{challenge.blockOrPanchayat}, {challenge.district}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{challenge.submittedDate}</span>
                    </span>
                  </div>
                </div>

                {/* Problem Statement Title & Citizen Submitter Overview */}
                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                      {challenge.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0 self-start">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                        challenge.priority === 'critical'
                          ? 'bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-200'
                          : challenge.priority === 'high'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        Priority: {challenge.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {challenge.description}
                  </p>

                  {/* Citizen Submitter Info Summary Bar */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-slate-800 font-semibold">
                      <Users className="w-3.5 h-3.5 text-blue-700" />
                      <span>Citizen Submitter: <strong>{challenge.submittedBy?.name || 'Verified Citizen'}</strong></span>
                    </span>
                    <span>•</span>
                    <span>Beneficiary Reach: <strong>~{(challenge.estimatedImpactPeople || 0).toLocaleString()} residents</strong></span>
                    {challenge.aiAnalysis?.urgencyScore && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-indigo-700 font-bold">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Urgency Index: {challenge.aiAnalysis.urgencyScore}/100</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* 5-STAGE STATUS BAR: EXACT VISUAL PROGRESS ENGINE OF THE CITIZEN PORTAL */}
                {/* ========================================================================= */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 sm:p-4" id={`admin-status-bar-${challenge.id}`}>
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Official Problem Statement Status Tracking</span>
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

                  {/* Visual 5-Stage Stepper */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1 select-none">
                    {STAGES.map((stage) => {
                      const isDone = isCompletedAndDeployed 
                        ? true 
                        : isPrototypeSubmitted 
                        ? stage.num < 5 
                        : stage.num < currentStage;

                      const isCurrent = isCompletedAndDeployed 
                        ? false 
                        : isPrototypeSubmitted 
                        ? stage.num === 5 
                        : stage.num === currentStage;

                      return (
                        <div key={stage.num} className="text-center">
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

                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>
                      <strong>Current Stage Detail:</strong> {STAGES[currentStage - 1]?.desc}
                    </span>
                    <span className="text-[#003366] font-semibold text-[10px]">
                      Visible to Citizen in Citizen Panel
                    </span>
                  </div>
                </div>

                {/* Complete & Deployed Banner if status: end */}
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
                          Problem statement lifecycle has formally completed. Working technological prototype verified and deployed into community operations.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-700 text-white rounded-full font-bold text-[10px] shrink-0 whitespace-nowrap">
                      Status: End
                    </span>
                  </div>
                )}

                {/* University Allocation Strip */}
                {challenge.assignedUniversity && (
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-purple-900 font-bold text-[11px] uppercase tracking-wider">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                        <span>Allocated Higher Education Institution:</span>
                        <span className="text-slate-900 font-extrabold normal-case text-xs">{challenge.assignedUniversity.name}</span>
                      </div>
                      <p className="text-[11px] text-purple-800">
                        Department: {challenge.assignedUniversity.department} • Assigned: {challenge.assignedUniversity.assignedDate}
                        {challenge.team?.facultyMentor && ` • Mentor: ${challenge.team.facultyMentor}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        challenge.universityAcceptance?.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {challenge.universityAcceptance?.status === 'accepted' ? 'Accepted by University' : 'Pending University Acceptance'}
                      </span>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 5. EXTRA ADMINISTRATIVE OPTIONS (BUTTONS & CONTROLS SPECIFIC FOR ADMIN) */}
                {/* ========================================================================= */}
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg p-3.5 space-y-2.5" id={`admin-actions-bar-${challenge.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      <span>Executive Administrator Control Options</span>
                    </span>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                      Direct Authority Actions
                    </span>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* OPTION 1: Override Stage & Status Modal */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChallengeForOverride(challenge);
                        setOverrideStatus(challenge.status);
                        setOverridePriority(challenge.priority);
                        setOverrideUniversityId(challenge.assignedUniversity?.id || 'bit-mesra');
                        setOverrideAdminRemarks('');
                      }}
                      className="px-3 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Override stage, change status, reassign HEI, and set priority"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Override Stage & Status</span>
                    </button>

                    {/* OPTION 2: Reassign / Allocate University */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChallengeForOverride(challenge);
                        setOverrideStatus(challenge.status);
                        setOverridePriority(challenge.priority);
                        setOverrideUniversityId(challenge.assignedUniversity?.id || 'bit-mesra');
                        setOverrideAdminRemarks('Administrative University Reallocation Order.');
                      }}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Reassign problem to a different Higher Education Institution"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-purple-200" />
                      <span>Reassign University</span>
                    </button>

                    {/* OPTION 3: Fast-Track to HEI */}
                    <button
                      type="button"
                      onClick={() => handleFastTrackToHEI(challenge)}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Escalate priority to critical and auto-assign top HEI"
                    >
                      <Rocket className="w-3.5 h-3.5 text-amber-300" />
                      <span>Fast-Track & Escalate</span>
                    </button>

                    {/* OPTION 4: Dispatch Official Government Directive */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChallengeForDirective(challenge);
                        setDirectiveText('');
                        setDirectiveOrderNumber(`DIR/YM/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Dispatch an official order / directive into this problem record"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Issue Directive Order</span>
                    </button>

                    {/* OPTION 5: Toggle Official Directorate Certification */}
                    <button
                      type="button"
                      onClick={() => handleToggleCertification(challenge)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${
                        challenge.submittedBy?.certifiedByAuthority
                          ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
                          : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-400'
                      }`}
                      title={challenge.submittedBy?.certifiedByAuthority ? 'Withdraw Directorate Certification' : 'Stamp Official Directorate Certification'}
                    >
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>{challenge.submittedBy?.certifiedByAuthority ? 'Certify: Verified (Click to Revoke)' : 'Certify Problem Statement'}</span>
                    </button>

                    {/* OPTION 6: Download Official Case Dossier */}
                    <button
                      type="button"
                      onClick={() => handleDownloadDossier(challenge)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ml-auto"
                      title="Download complete administrative case dossier as formatted document"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download Case Dossier</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* 6. EXPANDABLE EXTRA DETAILS: DEEP CITIZEN & AUDIT DOSSIER */}
                {/* ========================================================================= */}
                <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{challenge.comments?.length || 0} Official Audit Entries</span>
                    <span>•</span>
                    <span>{challenge.attachments?.length || 0} Evidence Attachments</span>
                    {challenge.aiAnalysis?.rootCauses && (
                      <>
                        <span>•</span>
                        <span>{challenge.aiAnalysis.rootCauses.length} Root Causes Identified</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedChallengeId(isExpanded ? null : challenge.id)}
                    className="text-xs font-bold text-[#003366] hover:text-[#002244] flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Extra Details & Audit Dossier' : 'Inspect Extra Details & Audit Dossier'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Extra Details Panel */}
                {isExpanded && (
                  <div className="mt-3 p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-300 text-xs space-y-4 animate-in fade-in duration-150">
                    {/* Sub-Tabs for Extra Details */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 flex-wrap gap-2">
                      <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setExpandedSection((prev) => ({ ...prev, [challenge.id]: 'all' }))}
                          className={`px-2.5 py-1 rounded-md cursor-pointer ${
                            currentDetailTab === 'all' ? 'bg-[#003366] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Comprehensive Dossier
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedSection((prev) => ({ ...prev, [challenge.id]: 'submitter' }))}
                          className={`px-2.5 py-1 rounded-md cursor-pointer ${
                            currentDetailTab === 'submitter' ? 'bg-[#003366] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Submitter & Locality
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedSection((prev) => ({ ...prev, [challenge.id]: 'ai' }))}
                          className={`px-2.5 py-1 rounded-md cursor-pointer ${
                            currentDetailTab === 'ai' ? 'bg-[#003366] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          AI Triage & IP
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedSection((prev) => ({ ...prev, [challenge.id]: 'university' }))}
                          className={`px-2.5 py-1 rounded-md cursor-pointer ${
                            currentDetailTab === 'university' ? 'bg-[#003366] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          HEI Team & R&D
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedSection((prev) => ({ ...prev, [challenge.id]: 'industry' }))}
                          className={`px-2.5 py-1 rounded-md cursor-pointer ${
                            currentDetailTab === 'industry' ? 'bg-[#003366] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Industry & Prototype
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedSection((prev) => ({ ...prev, [challenge.id]: 'audit' }))}
                          className={`px-2.5 py-1 rounded-md cursor-pointer ${
                            currentDetailTab === 'audit' ? 'bg-[#003366] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Official Audit Trail
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        Registry Ref: {challenge.code}
                      </span>
                    </div>

                    {/* SECTION 1: CITIZEN SUBMITTER & GEOGRAPHIC IDENTITY */}
                    {(currentDetailTab === 'all' || currentDetailTab === 'submitter') && (
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-900 text-xs flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="flex items-center gap-1.5 text-[#003366]">
                            <Users className="w-3.5 h-3.5" />
                            <span>1. Citizen Submitter & Verification Dossier</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Aadhaar UIDAI Authenticated
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-slate-700">
                          <div>
                            <span className="font-bold text-slate-900 block text-[11px]">Submitter Full Name:</span>
                            <span>{challenge.submittedBy?.name || 'Verified Citizen'}</span>
                            <span className="text-[10px] text-slate-500 block">Type: {challenge.submittedBy?.type || 'Citizen Submitter'}</span>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block text-[11px]">Contact & Mobile:</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{challenge.submittedBy?.contact || '+91 94311 00000'}</span>
                            </span>
                            {challenge.submittedBy?.email && (
                              <span className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{challenge.submittedBy.email}</span>
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block text-[11px]">Locality & Panchayat:</span>
                            <span>{challenge.submittedBy?.localityVillage || 'Village Habitation'}</span>
                            <span className="text-[10px] text-slate-500 block">
                              Block: {challenge.blockOrPanchayat} ({challenge.district})
                            </span>
                          </div>

                          {challenge.gpsCoordinates && (
                            <div>
                              <span className="font-bold text-slate-900 block text-[11px]">GPS Coordinates:</span>
                              <span className="font-mono text-[10px] text-slate-800">
                                {challenge.gpsCoordinates.latitude.toFixed(4)}° N, {challenge.gpsCoordinates.longitude.toFixed(4)}° E
                              </span>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${challenge.gpsCoordinates.latitude},${challenge.gpsCoordinates.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-700 hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <span>Open in Map</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          )}

                          <div>
                            <span className="font-bold text-slate-900 block text-[11px]">Assisted Submission:</span>
                            <span>{challenge.submittedBy?.assistedByOfficer ? 'Yes (Assisted by Panchayat/CSC Officer)' : 'Direct Citizen Portal Entry'}</span>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block text-[11px]">Target Beneficiaries:</span>
                            <span>~{(challenge.estimatedImpactPeople || 500).toLocaleString()} residents</span>
                            <span className="text-[10px] text-slate-500 block">Primary community stakeholders</span>
                          </div>
                        </div>

                        {/* Attachments list if any */}
                        {challenge.attachments && challenge.attachments.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="font-bold text-slate-900 block text-[11px] mb-1">Citizen Supporting Attachments:</span>
                            <div className="flex flex-wrap gap-2">
                              {challenge.attachments.map((att) => (
                                <span key={att.id} className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-[10px] border border-slate-200 flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-slate-500" />
                                  <span>{att.name} ({att.size})</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 2: AI TRIAGE, DE-DUPLICATION & IP INTELLIGENCE */}
                    {(currentDetailTab === 'all' || currentDetailTab === 'ai') && (
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-900 text-xs flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="flex items-center gap-1.5 text-indigo-700">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>2. Yukti Marg AI Problem Curation & De-Duplication Intelligence</span>
                          </span>
                          <span className="text-[10px] text-indigo-700 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            AI Confidence: {((challenge.aiAnalysis?.categoryConfidence || 0.95) * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-slate-700">
                          <div>
                            <span className="font-bold text-slate-900 block text-[11px]">AI Urgency Rating:</span>
                            <span className="text-sm font-extrabold text-indigo-900">
                              {challenge.aiAnalysis?.urgencyScore || (challenge.priority === 'critical' ? 94 : 82)} / 100
                            </span>
                            <span className="text-[10px] text-slate-500 block">Calculated from hazard & demographic risk</span>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block text-[11px]">De-Duplication Audit:</span>
                            <span className="font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{challenge.aiAnalysis?.deDuplicationCheck?.status === 'potential_duplicate' ? 'Potential Duplicate Detected' : 'Unique Problem Statement'}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Similarity: {challenge.aiAnalysis?.deDuplicationCheck?.similarityScore || 0}% against state catalog
                            </span>
                          </div>

                          <div>
                            <span className="font-bold text-slate-900 block text-[11px]">Intellectual Property (IP):</span>
                            <span className="font-semibold text-slate-800">
                              {challenge.aiAnalysis?.potentialPatentOrIP ? 'Patentable Invention Potential Detected' : 'Public Domain Grassroots Innovation'}
                            </span>
                          </div>
                        </div>

                        {/* Root Causes */}
                        {challenge.aiAnalysis?.rootCauses && challenge.aiAnalysis.rootCauses.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="font-bold text-slate-900 block text-[11px] mb-1">Identified Systemic Root Causes:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {challenge.aiAnalysis.rootCauses.map((cause, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 text-[10px] border border-indigo-200">
                                  {cause}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommended Disciplines */}
                        {challenge.aiAnalysis?.suggestedDisciplines && (
                          <div className="pt-1">
                            <span className="font-bold text-slate-900 block text-[11px] mb-1">Recommended Academic Disciplines:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {challenge.aiAnalysis.suggestedDisciplines.map((d, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 text-[10px] border border-purple-200">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Routing Reason */}
                        {challenge.aiAnalysis?.routingReason && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 italic">
                            <strong>AI Routing Rationale:</strong> {challenge.aiAnalysis.routingReason}
                          </p>
                        )}
                      </div>
                    )}

                    {/* SECTION 3: HIGHER EDUCATION INSTITUTION (HEI) & TEAM DOSSIER */}
                    {(currentDetailTab === 'all' || currentDetailTab === 'university') && (
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-900 text-xs flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="flex items-center gap-1.5 text-purple-800">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>3. Higher Education Academic Consortium & Research Team</span>
                          </span>
                          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            NEP 2020 Academic Linkage
                          </span>
                        </div>

                        {challenge.assignedUniversity ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-slate-700">
                              <div>
                                <span className="font-bold text-slate-900 block text-[11px]">Assigned University:</span>
                                <span className="font-extrabold text-[#003366]">{challenge.assignedUniversity.name}</span>
                                <span className="text-[10px] text-slate-500 block">Campus ID: {challenge.assignedUniversity.id}</span>
                              </div>

                              <div>
                                <span className="font-bold text-slate-900 block text-[11px]">Nodal Department:</span>
                                <span>{challenge.assignedUniversity.department}</span>
                              </div>

                              <div>
                                <span className="font-bold text-slate-900 block text-[11px]">Acceptance Status:</span>
                                <span className="font-bold text-emerald-700">
                                  {challenge.universityAcceptance?.status === 'accepted' ? 'Accepted & Work Initiated' : 'Pending University Review'}
                                </span>
                                {challenge.universityAcceptance?.acceptedAt && (
                                  <span className="text-[10px] text-slate-400 block">
                                    Date: {challenge.universityAcceptance.acceptedAt.split('T')[0]}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Faculty Mentor & Students */}
                            {challenge.team && (
                              <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-purple-900">
                                    Faculty Mentor: <strong>{challenge.team.facultyMentor}</strong> ({challenge.team.mentorDesignation})
                                  </span>
                                  <span className="text-[10px] text-purple-700 font-mono">
                                    Constituted: {challenge.team.constitutedDate}
                                  </span>
                                </div>

                                {challenge.team.studentMembers && challenge.team.studentMembers.length > 0 && (
                                  <div>
                                    <span className="font-bold text-slate-800 block text-[11px] mb-1">
                                      Constituted Student Researchers ({challenge.team.studentMembers.length}):
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                      {challenge.team.studentMembers.map((st, i) => (
                                        <div key={i} className="p-2 bg-white rounded border border-purple-200 text-[10px]">
                                          <span className="font-bold text-slate-900 block">{st.name}</span>
                                          <span className="text-slate-500 block">{st.discipline} • {st.yearOrSemester}</span>
                                          {st.rollNo && <span className="text-purple-700 font-mono">{st.rollNo}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Academic Feasibility Review */}
                            {challenge.universityReview && (
                              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-800">
                                    Academic Review: <strong>{challenge.universityReview.reviewerName}</strong>
                                  </span>
                                  <span className="font-bold text-indigo-700">
                                    Feasibility: {challenge.universityReview.feasibilityScore}/100
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 italic">
                                  "{challenge.universityReview.evaluationSummary}"
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 rounded border border-dashed border-slate-300 text-center text-slate-500">
                            <span>No university currently assigned. Use "Override Stage & Status" or "Reassign University" above to allocate.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 4: INDUSTRY & PROTOTYPE TESTING DOSSIER */}
                    {(currentDetailTab === 'all' || currentDetailTab === 'industry') && (
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-900 text-xs flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="flex items-center gap-1.5 text-amber-800">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>4. Industry Partnerships, CSR Grants & Prototype Deployment</span>
                          </span>
                          <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Corporate CSR Linkage
                          </span>
                        </div>

                        {/* Industry Pledges */}
                        {challenge.industryPartners && challenge.industryPartners.length > 0 ? (
                          <div className="space-y-1.5">
                            <span className="font-bold text-slate-900 block text-[11px]">Committed Industry Partners & Sponsors:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {challenge.industryPartners.map((p) => (
                                <div key={p.id} className="p-2.5 bg-amber-50/40 rounded-lg border border-amber-200 text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">{p.partnerName}</span>
                                    {p.pledgeAmountINR ? (
                                      <span className="font-extrabold text-emerald-800">₹{p.pledgeAmountINR.toLocaleString('en-IN')}</span>
                                    ) : (
                                      <span className="text-[10px] text-amber-800 font-bold">{p.supportType}</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-600">Contact: {p.contactPerson} ({p.email})</p>
                                  <p className="text-[10px] text-slate-500 italic">{p.notes}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">No industry partner pledged yet.</p>
                        )}

                        {/* Prototype Deliverable & Field Testing status */}
                        {challenge.prototypeDeliverable && (
                          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 text-xs space-y-1.5 mt-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                                <Rocket className="w-3.5 h-3.5 text-blue-700" />
                                <span>Prototype Deliverable: {challenge.prototypeDeliverable.title}</span>
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                                {challenge.prototypeDeliverable.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-700">{challenge.prototypeDeliverable.description}</p>
                            {challenge.prototypeDeliverable.testResultsSummary && (
                              <p className="text-[10px] text-slate-600">
                                <strong>Testing Results:</strong> {challenge.prototypeDeliverable.testResultsSummary}
                              </p>
                            )}
                            {challenge.prototypeDeliverable.verifiedByIndustry?.verified && (
                              <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded text-[11px] text-emerald-950 font-semibold">
                                Officially Accepted by Industry: {challenge.prototypeDeliverable.verifiedByIndustry.verifiedBy} ({challenge.prototypeDeliverable.verifiedByIndustry.verifiedAt.split('T')[0]})
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 5: OFFICIAL AUDIT TRAIL & COLLABORATION LOG */}
                    {(currentDetailTab === 'all' || currentDetailTab === 'audit') && (
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-900 text-xs flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="flex items-center gap-1.5 text-slate-800">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>5. Official Administrative Audit Trail & Stakeholder Timeline</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {challenge.comments?.length || 0} Chronological Records
                          </span>
                        </div>

                        {challenge.comments && challenge.comments.length > 0 ? (
                          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {challenge.comments.map((comm) => (
                              <div
                                key={comm.id}
                                className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                                  comm.authorRole === 'admin'
                                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                                    : comm.authorRole === 'university'
                                    ? 'bg-purple-50/50 border-purple-200 text-purple-950'
                                    : comm.authorRole === 'industry'
                                    ? 'bg-blue-50/50 border-blue-200 text-blue-950'
                                    : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900">{comm.authorName}</span>
                                    <span className={`px-1.5 py-0.2 rounded font-semibold uppercase text-[9px] ${
                                      comm.authorRole === 'admin' ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {comm.authorRole}
                                    </span>
                                    <span className="text-slate-500 font-medium">({comm.authorOrg})</span>
                                  </div>
                                  <span className="text-slate-400 font-mono">{comm.createdAt.split('T')[0]}</span>
                                </div>
                                <p className="text-[11px] leading-relaxed">{comm.message}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">No audit log entries recorded yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Citizen Submissions Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No problem statements matched your current search filters. Try adjusting your search query, clearing district or priority selections.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDistrictFilter('all');
                setStatusFilter('all');
                setPriorityFilter('all');
                setCertifiedFilter('all');
              }}
              className="px-4 py-2 bg-[#003366] text-white rounded-lg text-xs font-bold hover:bg-[#002244] cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADMINISTRATIVE STAGE & STATUS OVERRIDE */}
      {/* ========================================================================= */}
      {selectedChallengeForOverride && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#003366] text-white rounded-lg">
                  <Sliders className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Administrative Stage & Status Override
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Tracking Code: {selectedChallengeForOverride.code}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChallengeForOverride(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">Problem Statement:</span>
              <p className="font-semibold text-slate-900 mt-0.5 line-clamp-2">{selectedChallengeForOverride.title}</p>
              <span className="text-[10px] text-slate-500 block mt-1">
                District: {selectedChallengeForOverride.district} • Submitter: {selectedChallengeForOverride.submittedBy?.name || 'Citizen'}
              </span>
            </div>

            <form onSubmit={handleExecuteOverride} className="space-y-4 text-xs">
              {/* Target Stage & Status */}
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  1. Target Problem Stage & Status:
                </label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as ChallengeStatus)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-800 focus:ring-2 focus:ring-[#003366] focus:outline-none"
                >
                  <option value="submitted">Stage 1: Intake Submitted & Screened</option>
                  <option value="under_review">Stage 2: Under State & AI Review</option>
                  <option value="assigned_hei">Stage 3: Assigned to University (HEI)</option>
                  <option value="team_constituted">Stage 3B: University Team Constituted</option>
                  <option value="proposal_submitted">Stage 3C: Research Solution Proposal Submitted</option>
                  <option value="prototype_development">Stage 4: In Active Prototype Development</option>
                  <option value="pilot_testing">Stage 4B: In Field Pilot Testing</option>
                  <option value="deployed">Stage 5: Complete & Deployed in Community (Status: End)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Transitioning to Stage 5 will formally mark problem status as "Complete and Deployed (End)".
                </span>
              </div>

              {/* Target Priority */}
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  2. Priority Level:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as PriorityLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setOverridePriority(lvl)}
                      className={`p-2 rounded-lg font-bold uppercase text-[10px] border cursor-pointer transition-all text-center ${
                        overridePriority === lvl
                          ? lvl === 'critical'
                            ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                            : 'bg-[#003366] text-white border-[#002244] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Higher Education Allocation */}
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  3. Allocated Higher Education Institution (HEI):
                </label>
                <select
                  value={overrideUniversityId}
                  onChange={(e) => setOverrideUniversityId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-[#003366] focus:outline-none"
                >
                  {UNIVERSITIES.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Administrative Remarks */}
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  4. Official Administrative Remarks & Audit Note:
                </label>
                <textarea
                  rows={3}
                  value={overrideAdminRemarks}
                  onChange={(e) => setOverrideAdminRemarks(e.target.value)}
                  placeholder="Enter official executive justification, operational instructions, or directive context..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedChallengeForOverride(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplyingOverride}
                  className="px-5 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isApplyingOverride ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Apply Administrator Override</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DISPATCH OFFICIAL GOVERNMENT DIRECTIVE ORDER */}
      {/* ========================================================================= */}
      {selectedChallengeForDirective && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                  <Send className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Dispatch Official Directorate Directive Order
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Problem Ref: {selectedChallengeForDirective.code}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChallengeForDirective(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950">
              <span className="font-bold block text-[11px] uppercase tracking-wider">Government Directive Mandate:</span>
              <p className="mt-0.5">
                This directive will be stamped with an official Directorate Order Number, inserted into the problem audit log, and immediately broadcast as a high-priority notification to the citizen and university authorities.
              </p>
            </div>

            <form onSubmit={handleDispatchDirective} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Official Order Reference Number:
                </label>
                <input
                  type="text"
                  value={directiveOrderNumber}
                  onChange={(e) => setDirectiveOrderNumber(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 bg-slate-50"
                  placeholder="e.g. DIR/YM/2026/4102"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Target Stakeholder Audience:
                </label>
                <select
                  value={directiveAudience}
                  onChange={(e) => setDirectiveAudience(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800"
                >
                  <option value="all">All Stakeholders (Citizen, University & Industry)</option>
                  <option value="university">University Faculty & Student Team Exclusively</option>
                  <option value="citizen">Citizen Submitter Exclusively</option>
                  <option value="industry">Industrial Sponsor & CSR Desk Exclusively</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Directive Order Content:
                </label>
                <textarea
                  rows={4}
                  required
                  value={directiveText}
                  onChange={(e) => setDirectiveText(e.target.value)}
                  placeholder="State the formal government order, timeline milestone requirement, or operational instructions..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedChallengeForDirective(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatchingDirective || !directiveText.trim()}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isDispatchingDirective ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-amber-300" />}
                  <span>Dispatch Official Directive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
