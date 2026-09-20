/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Challenge, User, UserRole, ThematicCategory, NotificationItem } from './types';
import { INITIAL_CHALLENGES } from './data/mockData';
import { authService } from './services/authService';
import { GovHeader } from './components/GovHeader';
import { GovNavbar, NavTab } from './components/GovNavbar';
import { OverviewHomeView } from './components/OverviewHomeView';
import { WorkflowFlowchartView } from './components/WorkflowFlowchartView';
import { AIDocumentTool } from './components/AIDocumentTool';
import { UniversityHubView } from './components/UniversityHubView';
import { IndustryHubView } from './components/IndustryHubView';
import { AdminDirectoryControlView } from './components/AdminDirectoryControlView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { AboutPSView } from './components/AboutPSView';
import { ChallengeCard } from './components/ChallengeCard';
import { LoginModal } from './components/LoginModal';
import { SubmitChallengeModal } from './components/SubmitChallengeModal';
import { ChallengeDetailModal } from './components/ChallengeDetailModal';
import { TeamConstituteModal } from './components/TeamConstituteModal';
import { ProposalSubmitModal } from './components/ProposalSubmitModal';
import { IndustryPledgeModal } from './components/IndustryPledgeModal';
import { CitizenSubmissionsView } from './components/CitizenSubmissionsView';
import { CitizenIndividualPanel } from './components/CitizenIndividualPanel';
import { GovernmentBodyPanel } from './components/GovernmentBodyPanel';
import { UniversityIndividualPanel, isAssignedToThisUniversity } from './components/UniversityIndividualPanel';
import { AIProblemManagementView } from './components/AIProblemManagementView';
import { ProjectLifecycleView } from './components/ProjectLifecycleView';
import { CommunicationHubView } from './components/CommunicationHubView';
import { filterCitizenSubmissions } from './utils/citizenUtils';
import { YuktiMargLogo } from './components/YuktiMargLogo';
import { ThemePalette, getTheme } from './utils/theme';
import { useAutoTranslate } from './utils/useAutoTranslate';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Globe2, 
  ExternalLink,
  PlusCircle,
  Sparkles,
  FileCheck2,
  Lock
} from 'lucide-react';

export default function App() {
  // Application State
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getStoredUser());
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const u = authService.getStoredUser();
    if (u?.role === 'admin') return 'admin-directory';
    if (u?.role === 'industry') return 'industry';
    if (u?.role === 'university') return 'university';
    if (u?.role === 'citizen' || u?.role === 'panchayat') return 'my-submissions';
    return 'overview';
  });
  const [adminSubTab, setAdminSubTab] = useState<'citizen-problems' | 'officers' | 'universities' | 'industries' | 'master-controls'>('citizen-problems');
  const [isLoadingChallenges, setIsLoadingChallenges] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalDefaultRole, setLoginModalDefaultRole] = useState<UserRole | 'departmental' | 'industrial' | 'administration'>('citizen');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [teamModalChallenge, setTeamModalChallenge] = useState<Challenge | null>(null);
  const [proposalModalChallenge, setProposalModalChallenge] = useState<Challenge | null>(null);
  const [pledgeModalChallenge, setPledgeModalChallenge] = useState<Challenge | null>(null);

  // Prefill state for challenge submission from AI tool
  const [prefillData, setPrefillData] = useState<{
    title?: string;
    description?: string;
    category?: ThematicCategory;
    district?: string;
    aiAnalysis?: any;
  } | undefined>(undefined);

  // Accessibility & Theme Controls
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [theme, setTheme] = useState<ThemePalette>('emerald');
  const themeCfg = getTheme(theme);

  // Activate portal-wide auto translation when Hindi is selected
  useAutoTranslate(lang);

  // Fetch initial challenges and notifications from Express API
  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.challenges)) {
        setChallenges(data.challenges);
      }
    } catch (err) {
      console.warn('Backend API unavailable, using seeded state:', err);
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('Notifications fetch error:', err);
    }
  };

  useEffect(() => {
    fetchChallenges();
    fetchNotifications();
  }, []);

  // Handlers for notifications
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    } catch (e) {
      console.warn('Mark notif read error:', e);
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' });
    } catch (e) {
      console.warn('Mark all notifs read error:', e);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleAddNotification = async (notif: NotificationItem) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif),
      });
    } catch (e) {
      console.warn('Add notif error:', e);
    }
    setNotifications((prev) => [notif, ...prev]);
  };

  // Handlers for updating single challenge
  const handleUpdateChallenge = (updated: Challenge) => {
    setChallenges((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (selectedChallenge && selectedChallenge.id === updated.id) {
      setSelectedChallenge(updated);
    }
  };

  const isCitizen = currentUser?.role === 'citizen';
  const isPanchayat = currentUser?.role === 'panchayat';
  const isGovernment = currentUser?.role === 'government';
  const isGovernmentBody = isPanchayat || isGovernment;
  const isUniversity = currentUser?.role === 'university';
  const isRestrictedRole = isCitizen || isGovernmentBody;
  const mySubmissions = isRestrictedRole ? filterCitizenSubmissions(challenges, currentUser) : [];
  const assignedToUniCount = isUniversity
    ? challenges.filter((c) => isAssignedToThisUniversity(c, currentUser)).length
    : 0;

  // When citizen, government body, or university admin is active, ensure restricted view to only their individual panel
  useEffect(() => {
    if (isRestrictedRole) {
      setActiveTab((prev) => {
        const restrictedTabs = ['overview', 'challenges', 'university', 'industry', 'analytics', 'workflow', 'ai-management', 'lifecycle', 'communication', 'about-ps'];
        if (restrictedTabs.includes(prev)) {
          return 'my-submissions';
        }
        return prev;
      });
    } else if (isUniversity) {
      setActiveTab((prev) => {
        const nonUniTabs = ['overview', 'challenges', 'industry', 'submit', 'my-submissions', 'analytics', 'workflow', 'ai-management', 'lifecycle', 'communication', 'about-ps'];
        if (nonUniTabs.includes(prev)) {
          return 'university';
        }
        return prev;
      });
    }
  }, [isRestrictedRole, isUniversity, currentUser?.id]);

  const handleChallengeSubmitted = (newChallenge: Challenge) => {
    setChallenges((prev) => [newChallenge, ...prev]);
    setSelectedChallenge(newChallenge);
    setPrefillData(undefined);
    if (currentUser?.role === 'citizen' || currentUser?.role === 'panchayat' || currentUser?.role === 'government') {
      setActiveTab('my-submissions');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveTab('overview');
  };

  const handleLogin = (user: User) => {
    authService.setStoredUser(user);
    setCurrentUser(user);
    if (user.role === 'citizen' || user.role === 'panchayat') {
      setActiveTab('my-submissions');
    } else if (user.role === 'university') {
      setActiveTab('university');
    } else if (user.role === 'industry') {
      setActiveTab('industry');
    } else if (user.role === 'admin') {
      setActiveTab('admin-directory');
    } else if (user.role === 'government') {
      setActiveTab('overview');
    }
  };

  const handleAdoptChallenge = async (challengeId: string) => {
    const uniName = currentUser?.organization || 'Birla Institute of Technology (BIT) Mesra, Ranchi';
    const facultyMentor = currentUser?.name || 'Prof. Dr. Rajesh K. Verma';
    const department = currentUser?.department || 'Department of Mechanical & Agro-Automation';

    try {
      const res = await fetch(`/api/challenges/${challengeId}/adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityId: currentUser?.id || 'bit-mesra',
          universityName: uniName,
          department,
          facultyMentor,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        handleUpdateChallenge(data.challenge);
        return;
      }
    } catch (err) {
      console.warn('Adopt challenge network request fallback:', err);
    }

    // Local fallback update
    const updated = challenges.map((c) => {
      if (c.id === challengeId) {
        return {
          ...c,
          status: 'assigned_hei' as const,
          assignedUniversity: {
            id: currentUser?.id || 'bit-mesra',
            name: uniName,
            department,
            assignedDate: new Date().toISOString().split('T')[0],
          },
          comments: [
            ...c.comments,
            {
              id: `c-${Date.now()}`,
              authorId: currentUser?.id || 'usr-uni',
              authorName: facultyMentor,
              authorRole: 'university' as const,
              authorOrg: uniName,
              message: `Problem officially adopted for academic research and prototyping by ${facultyMentor} (${uniName}).`,
              createdAt: new Date().toISOString(),
              isOfficialNote: true,
            },
          ],
        };
      }
      return c;
    });
    setChallenges(updated);
  };

  const handleReviewChallenge = async (
    challengeId: string,
    review: { feasibilityScore: number; evaluationSummary: string }
  ) => {
    const reviewerName = currentUser?.name || 'Prof. Dr. Rajesh K. Verma';
    const reviewerDesignation = currentUser?.department || 'Dean of Research & Faculty Lead';

    try {
      const res = await fetch(`/api/challenges/${challengeId}/academic-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName,
          reviewerDesignation,
          feasibilityScore: review.feasibilityScore,
          evaluationSummary: review.evaluationSummary,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        handleUpdateChallenge(data.challenge);
        return;
      }
    } catch (err) {
      console.warn('Academic review network request fallback:', err);
    }

    // Local fallback update
    const updated = challenges.map((c) => {
      if (c.id === challengeId) {
        return {
          ...c,
          universityReview: {
            evaluated: true,
            reviewerName,
            reviewerDesignation,
            reviewDate: new Date().toISOString().split('T')[0],
            feasibilityScore: review.feasibilityScore,
            evaluationSummary: review.evaluationSummary,
          },
          comments: [
            ...c.comments,
            {
              id: `c-${Date.now()}`,
              authorId: 'usr-uni-eval',
              authorName: reviewerName,
              authorRole: 'university' as const,
              authorOrg: c.assignedUniversity?.name || currentUser?.organization || 'Higher Education Institution',
              message: `Academic Feasibility Evaluation completed. Score: ${review.feasibilityScore}/100. Notes: ${review.evaluationSummary}`,
              createdAt: new Date().toISOString(),
              isOfficialNote: true,
            },
          ],
        };
      }
      return c;
    });
    setChallenges(updated);
  };

  const handleSelectTab = (tab: NavTab) => {
    // When citizen is logged in, their workspace is strictly confined to their individual panel
    if (isCitizen) {
      if (tab === 'submit') {
        setActiveTab('submit');
      } else {
        setActiveTab('my-submissions');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConvertToChallengeFromAI = (data: {
    title: string;
    description: string;
    category: ThematicCategory;
    district: string;
    aiAnalysis: any;
  }) => {
    setPrefillData(data);
    setIsSubmitModalOpen(true);
  };

  // Font size class mapping
  const fontSizeClass =
    fontSize === 'larger'
      ? 'text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-base leading-normal'
      : 'text-sm leading-normal';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
        highContrast ? 'bg-[#18181b] text-stone-100' : 'bg-[#faf7f0] text-stone-900'
      } ${fontSizeClass}`}
      id="yukti-marg-root-application"
    >
      {/* 1. Official Government Header & Accessibility Toolbar */}
      <GovHeader
        currentUser={currentUser}
        onOpenLogin={(role?: UserRole | 'departmental' | 'industrial' | 'administration') => {
          if (role === 'departmental') {
            setLoginModalDefaultRole('government');
          } else if (role === 'industrial') {
            setLoginModalDefaultRole('industry');
          } else if (role === 'administration') {
            setLoginModalDefaultRole('admin');
          } else {
            setLoginModalDefaultRole(role || 'citizen');
          }
          setIsLoginModalOpen(true);
        }}
        onLogout={handleLogout}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        lang={lang}
        setLang={setLang}
        theme={theme}
        onThemeChange={setTheme}
        unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
        onOpenNotifications={() => setActiveTab('communication')}
      />

      {/* 2. Official Portal Navigation */}
      <GovNavbar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        lang={lang}
        pendingChallengesCount={challenges.filter((c) => c.status === 'submitted').length}
        currentUser={currentUser}
        mySubmissionsCount={mySubmissions.length}
        unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
        assignedProblemsCount={assignedToUniCount}
        theme={theme}
        adminSubTab={adminSubTab}
        setAdminSubTab={setAdminSubTab}
        challengesCount={challenges.length}
      />

      {/* 3. Main Dynamic Content Views */}
      <main className="flex-1 w-full" id="main-content-region">
        {/* CITIZEN EXCLUSIVE PANEL: When a citizen logs in, strictly render their individual panel */}
        {isCitizen ? (
          <CitizenIndividualPanel
            challenges={mySubmissions}
            currentUser={currentUser!}
            activeSubTab={activeTab === 'submit' ? 'submit' : 'my-submissions'}
            onNavigateSubTab={(subTab) => setActiveTab(subTab as NavTab)}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onChallengeSubmitted={handleChallengeSubmitted}
            lang={lang}
          />
        ) : isGovernmentBody ? (
          /* GOVERNMENT BODY & PRI EXCLUSIVE PANEL: Dedicated individual panel */
          <GovernmentBodyPanel
            challenges={mySubmissions}
            currentUser={currentUser!}
            activeSubTab={activeTab === 'submit' ? 'submit' : 'my-submissions'}
            onNavigateSubTab={(subTab) => setActiveTab(subTab as NavTab)}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onChallengeSubmitted={handleChallengeSubmitted}
            lang={lang}
          />
        ) : isUniversity ? (
          /* UNIVERSITY ADMIN EXCLUSIVE PANEL: Dedicated separate panel for the logged in university */
          <UniversityIndividualPanel
            challenges={challenges}
            currentUser={currentUser!}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onUpdateChallenge={handleUpdateChallenge}
            onOpenTeamModal={(c) => setTeamModalChallenge(c)}
            onOpenProposalModal={(c) => setProposalModalChallenge(c)}
            onAdoptChallenge={handleAdoptChallenge}
            onReviewChallenge={handleReviewChallenge}
            onAddNotification={handleAddNotification}
            lang={lang}
          />
        ) : (
          <>
            {/* PANCHAYAT / OFFICIAL MY SUBMISSIONS */}
            {activeTab === 'my-submissions' && (
              <CitizenSubmissionsView
                challenges={mySubmissions}
                currentUser={currentUser!}
                onSelectChallenge={(c) => setSelectedChallenge(c)}
                onOpenSubmitModal={() => {
                  setPrefillData(undefined);
                  setIsSubmitModalOpen(true);
                }}
                onNavigateToTab={handleSelectTab}
                lang={lang}
              />
            )}

            {/* TAB: OVERVIEW (NON-CITIZEN / PUBLIC GUEST) */}
            {activeTab === 'overview' && (
              <OverviewHomeView
                challenges={challenges}
                onSelectChallenge={(c) => setSelectedChallenge(c)}
                onOpenSubmitModal={() => {
                  setPrefillData(undefined);
                  setIsSubmitModalOpen(true);
                }}
                onNavigateToTab={handleSelectTab}
                currentUser={currentUser}
                lang={lang}
                theme={theme}
              />
            )}

        {/* TAB: WORKFLOW FLOWCHART & 5-STAGE PIPELINE */}
        {activeTab === 'workflow' && (
          <WorkflowFlowchartView
            challenges={challenges}
            currentUser={currentUser}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onOpenSubmitModal={() => {
              setPrefillData(undefined);
              setIsSubmitModalOpen(true);
            }}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* TAB: SUBMIT CHALLENGE DIRECT SCREEN */}
        {activeTab === 'submit' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Citizen, Panchayat & Urban Body Challenge Intake
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Register a local problem to initiate academic matching with Jharkhand universities
                  </p>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  <span>Open Full Form Modal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="p-5 rounded-lg border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-white hover:bg-[#f5efe4]/70 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
                      1
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">Direct Citizen / PRI Intake</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Fill out the guided form with district, block, priority, and problem details. Automatic AI categorizer included.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
                    Launch Form →
                  </span>
                </div>

                <div
                  onClick={() => setActiveTab('ai-doc-tool')}
                  className="p-5 rounded-lg border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold mb-3">
                      <Sparkles className="w-5 h-5 text-amber-700" />
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">Upload & AI Summarize Document</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Have a water test report, Gram Sabha resolution, or survey memo? Upload the file or paste text to auto-generate a structured challenge.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-800 mt-4 flex items-center gap-1">
                    Open AI Document Tool →
                  </span>
                </div>
              </div>
            </div>

            {/* Quick guide of categories */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs space-y-2">
              <span className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">
                Eligibility Criteria for Yukti Marg Challenges
              </span>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li>Issues must be situated within the geographic borders of Jharkhand's 24 districts.</li>
                <li>Problems must have actionable scope where technological, scientific, or systemic engineering by students and faculty can create a tangible prototype.</li>
                <li>All submissions are published under the open public transparency mandate of the Department of Higher & Technical Education.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB: CHALLENGES REPOSITORY & TRACKING (NON-CITIZEN) */}
        {!isCitizen && activeTab === 'challenges' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  State Societal Challenges & Innovation Tracking Repository
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse, audit, and track the end-to-end lifecycle of community problems across all 24 districts
                </p>
              </div>

              <button
                onClick={() => {
                  setPrefillData(undefined);
                  setIsSubmitModalOpen(true);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>+ Register New Challenge</span>
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onSelect={(c) => setSelectedChallenge(c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB: UNIVERSITY HUB (NON-CITIZEN) */}
        {!isCitizen && activeTab === 'university' && (
          <UniversityHubView
            challenges={challenges}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onOpenTeamModal={(c) => setTeamModalChallenge(c)}
            onOpenProposalModal={(c) => setProposalModalChallenge(c)}
            onAdoptChallenge={handleAdoptChallenge}
            onReviewChallenge={handleReviewChallenge}
            currentUser={currentUser}
          />
        )}

        {/* TAB: INDUSTRY HUB (NON-CITIZEN) */}
        {!isCitizen && activeTab === 'industry' && (
          <IndustryHubView
            challenges={challenges}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onOpenPledgeModal={(c) => setPledgeModalChallenge(c)}
            currentUser={currentUser}
            onProposalDecisionUpdated={handleUpdateChallenge}
          />
        )}

        {/* MODULE: GOVERNMENT ADMINISTRATOR MASTER DIRECTORY & CONTROL */}
        {activeTab === 'admin-directory' && (
          <AdminDirectoryControlView
            challenges={challenges}
            currentUser={currentUser!}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onUpdateChallenge={handleUpdateChallenge}
            onAddNotification={handleAddNotification}
            lang={lang}
            initialAdminTab={adminSubTab}
          />
        )}

        {/* TAB: AI DOCUMENT TOOL */}
        {activeTab === 'ai-doc-tool' && (
          <AIDocumentTool onConvertToChallenge={handleConvertToChallengeFromAI} />
        )}

        {/* TAB: STATE ANALYTICS (NON-CITIZEN) */}
        {!isCitizen && activeTab === 'analytics' && (
          <AnalyticsDashboardView
            challenges={challenges}
            onSelectDistrict={(d) => {
              handleSelectTab('challenges');
            }}
          />
        )}

        {/* MODULE 2: AI-ENABLED PROBLEM MANAGEMENT & ROUTING */}
        {activeTab === 'ai-management' && (
          <AIProblemManagementView
            challenges={challenges}
            currentUser={currentUser}
            onUpdateChallenge={handleUpdateChallenge}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onAddNotification={handleAddNotification}
            onNavigateToTab={handleSelectTab}
            onConvertToChallenge={handleConvertToChallengeFromAI}
          />
        )}

        {/* MODULE 5: PROJECT LIFECYCLE MANAGEMENT & INTELLECTUAL PROPERTY */}
        {activeTab === 'lifecycle' && (
          <ProjectLifecycleView
            challenges={challenges}
            currentUser={currentUser}
            onUpdateChallenge={handleUpdateChallenge}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onAddNotification={handleAddNotification}
          />
        )}

        {/* MODULE 7: NOTIFICATION AND COMMUNICATION SYSTEM */}
        {activeTab === 'communication' && (
          <CommunicationHubView
            challenges={challenges}
            notifications={notifications}
            currentUser={currentUser}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onUpdateChallenge={handleUpdateChallenge}
            onMarkNotificationRead={handleMarkNotificationRead}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            onAddNotification={handleAddNotification}
          />
        )}

        {/* TAB: PROBLEM STATEMENT 26043 MANDATE */}
        {activeTab === 'about-ps' && <AboutPSView onNavigateTab={(t) => handleSelectTab(t)} />}
          </>
        )}
      </main>

      {/* 4. Official Government Footer */}
      <footer className={`${themeCfg.footerBg} text-slate-700 border-t ${themeCfg.footerBorder} mt-16 py-12 px-4 sm:px-8 text-xs select-none transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Government Identity */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <YuktiMargLogo className="w-8 h-8 rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs" />
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                {lang === 'en' ? 'Yukti Marg' : 'युक्ति मार्ग | Yukti Marg'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              An official technology platform of the Department of Higher & Technical Education, Government of Jharkhand, facilitating collaborative societal problem solving under the National Education Policy (NEP 2020).
            </p>
          </div>

          {/* Col 2: Fast Navigation */}
          <div>
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3">
              Portal Sections
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => handleSelectTab(isRestrictedRole ? 'my-submissions' : 'overview')} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  {isRestrictedRole ? 'My Submissions & Status' : 'Portal Overview & Metrics'}
                </button>
              </li>
              <li>
                <button onClick={() => handleSelectTab('submit')} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  {isCitizen ? 'Submit New Citizen Problem' : isGovernmentBody ? 'Submit New Administrative Challenge' : 'Citizen & PRI Challenge Intake'}
                </button>
              </li>
              {!isRestrictedRole && (
                <>
                  <li>
                    <button onClick={() => handleSelectTab('university')} className="hover:text-emerald-700 transition-colors cursor-pointer">
                      University R&D Teams Hub
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleSelectTab('industry')} className="hover:text-emerald-700 transition-colors cursor-pointer">
                      Industry & CSR Marketplace
                    </button>
                  </li>
                </>
              )}
              {!isRestrictedRole && (
                <li>
                  <button onClick={() => handleSelectTab('ai-doc-tool')} className="hover:text-emerald-700 transition-colors cursor-pointer">
                    AI Document Categorization
                  </button>
                </li>
              )}
              {!isRestrictedRole && (
                <li>
                  <button onClick={() => handleSelectTab('analytics')} className="hover:text-emerald-700 transition-colors cursor-pointer">
                    State Analytics Dashboard
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Institutional Partners */}
          <div>
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3">
              Anchor Institutions
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Birla Institute of Technology (BIT) Mesra • IIT (ISM) Dhanbad • NIT Jamshedpur • Birsa Agricultural University • RIMS Ranchi • Tata Steel CSR • SAIL Bokaro • Central Coalfields Limited.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Jharkhand Public Service Guarantee Act 2011</span>
            </div>
          </div>

          {/* Col 4: State Contact & Helplines */}
          <div className="space-y-2.5">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3">
              Official Helpline & Support
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Toll Free: 1800-345-6544 (Mon-Sat, 9AM-6PM)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>yuktimarg-support@jharkhand.gov.in</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1.5">
              Yojana Bhawan, Nepal House, Doranda, Ranchi, Jharkhand - 834002
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            Designed & Hosted in coordination with National Informatics Centre (NIC) & State Innovation Cell, Jharkhand.
          </p>
          <div className="flex items-center space-x-3">
            <span className="hover:text-slate-700 transition-colors cursor-pointer">Website Policy</span>
            <span>•</span>
            <span className="hover:text-slate-700 transition-colors cursor-pointer">RTI Mandate</span>
            <span>•</span>
            <span className="hover:text-slate-700 transition-colors cursor-pointer">Accessibility Statement</span>
          </div>
        </div>
      </footer>

      {/* 5. Role Authentication / Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        defaultRole={loginModalDefaultRole}
        lang={lang}
      />

      {/* 6. Submit Challenge Modal */}
      <SubmitChallengeModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        currentUser={currentUser}
        onChallengeSubmitted={handleChallengeSubmitted}
        onLoginUser={handleLogin}
        onOpenLoginModal={() => {
          setLoginModalDefaultRole(currentUser?.role || 'citizen');
          setIsLoginModalOpen(true);
        }}
        initialData={prefillData}
        lang={lang}
      />

      {/* 7. Challenge Detail Modal */}
      {selectedChallenge && (
        <ChallengeDetailModal
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          challenge={selectedChallenge}
          currentUser={currentUser}
          onUpdateChallenge={handleUpdateChallenge}
          onOpenTeamModal={(c) => setTeamModalChallenge(c)}
          onOpenProposalModal={(c) => setProposalModalChallenge(c)}
          onOpenPledgeModal={(c) => setPledgeModalChallenge(c)}
        />
      )}

      {/* 8. Team Constitution Modal */}
      {teamModalChallenge && (
        <TeamConstituteModal
          isOpen={!!teamModalChallenge}
          onClose={() => setTeamModalChallenge(null)}
          challenge={teamModalChallenge}
          currentUser={currentUser}
          onTeamUpdated={handleUpdateChallenge}
        />
      )}

      {/* 9. Proposal Submission Modal */}
      {proposalModalChallenge && (
        <ProposalSubmitModal
          isOpen={!!proposalModalChallenge}
          onClose={() => setProposalModalChallenge(null)}
          challenge={proposalModalChallenge}
          currentUser={currentUser}
          onProposalSubmitted={handleUpdateChallenge}
        />
      )}

      {/* 10. Industry Pledge Modal */}
      {pledgeModalChallenge && (
        <IndustryPledgeModal
          isOpen={!!pledgeModalChallenge}
          onClose={() => setPledgeModalChallenge(null)}
          challenge={pledgeModalChallenge}
          currentUser={currentUser}
          onPledgeSubmitted={handleUpdateChallenge}
        />
      )}
    </div>
  );
}
