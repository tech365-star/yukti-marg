import React from 'react';
import { User } from '../types';
import { ThemePalette, getTheme } from '../utils/theme';
import { 
  Home, 
  PlusCircle, 
  FolderGit2, 
  GraduationCap, 
  Building, 
  Sparkles, 
  BarChart3, 
  Info, 
  Layers, 
  ShieldCheck
} from 'lucide-react';

export type NavTab = 
  | 'overview'
  | 'workflow'
  | 'submit'
  | 'challenges'
  | 'my-submissions'
  | 'ai-management'
  | 'university'
  | 'industry'
  | 'lifecycle'
  | 'communication'
  | 'analytics'
  | 'ai-doc-tool'
  | 'about-ps'
  | 'admin-directory';

interface NavItem {
  id: NavTab;
  labelEn: string;
  labelHi: string;
  icon: any;
  count?: number;
  badge?: string;
  highlight?: boolean;
}

interface GovNavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  lang: 'en' | 'hi';
  pendingChallengesCount?: number;
  currentUser?: User | null;
  mySubmissionsCount?: number;
  unreadNotificationsCount?: number;
  assignedProblemsCount?: number;
  theme?: ThemePalette;
  adminSubTab?: 'citizen-problems' | 'officers' | 'universities' | 'industries' | 'master-controls';
  setAdminSubTab?: (tab: 'citizen-problems' | 'officers' | 'universities' | 'industries' | 'master-controls') => void;
  challengesCount?: number;
}

export const GovNavbar: React.FC<GovNavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  pendingChallengesCount = 0,
  currentUser = null,
  mySubmissionsCount = 0,
  unreadNotificationsCount = 0,
  assignedProblemsCount = 0,
  theme = 'emerald',
  adminSubTab = 'citizen-problems',
  setAdminSubTab,
  challengesCount,
}) => {
  const themeCfg = getTheme(theme);
  const isCitizen = currentUser?.role === 'citizen';
  const isPanchayat = currentUser?.role === 'panchayat';
  const isGovernment = currentUser?.role === 'government';
  const isUniversity = currentUser?.role === 'university';
  const isIndustry = currentUser?.role === 'industry';
  const isAdmin = currentUser?.role === 'admin';

  // 1. GOVERNMENT ADMINISTRATOR EXCLUSIVE BAR: Full Master Website Controls
  if (isAdmin) {
    return (
      <nav className="bg-white/95 text-slate-800 border-b border-slate-200/90 shadow-2xs sticky top-0 z-40 transition-colors duration-200 backdrop-blur-xs" id="navbar-admin-control-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between py-2.5 gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-900">
                {lang === 'en' ? 'State Innovation Directorate • Master Administrator Panel' : 'राज्य नवाचार निदेशालय • मुख्य प्रशासक पैनल'}
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-600 hidden sm:inline font-medium">
                {currentUser?.name} ({currentUser?.organization || 'State Mission Control'})
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // 2. INDUSTRIAL PARTNER EXCLUSIVE BAR: Proposal Evaluation & CSR Desk
  if (isIndustry) {
    return (
      <nav className="bg-white/95 text-slate-800 border-b border-slate-200/90 shadow-2xs sticky top-0 z-40 transition-colors duration-200 backdrop-blur-xs" id="navbar-industry-desk-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between py-2.5 gap-2">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-900">
                {lang === 'en' ? 'Industrial Partner & CSR Innovation Desk' : 'औद्योगिक साझेदार व सीएसआर नवाचार डेस्क'}
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-amber-700 hidden sm:inline font-semibold">
                {currentUser?.name} ({currentUser?.organization || 'Partner Enterprise'})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="navbar-industry-eval-btn"
                onClick={() => setActiveTab('industry')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'industry'
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'en' ? 'University Proposals Evaluation Desk' : 'विश्वविद्यालय प्रस्ताव मूल्यांकन'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // UNIVERSITY ADMIN EXCLUSIVE VIEW: Dedicated University R&D & Problem Management bar
  if (isUniversity) {
    const panelTitle = lang === 'en' ? 'University Admin & R&D Hub Panel' : 'विश्वविद्यालय एडमिन एवं अनुसंधान पैनल';
    return (
      <nav className="bg-white/95 text-slate-800 border-b border-slate-200/90 shadow-2xs sticky top-0 z-40 transition-colors duration-200 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-800" />
              <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-900">
                {panelTitle}
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-600 hidden sm:inline font-medium">
                {currentUser?.name} ({currentUser?.organization || 'HEI Nodal Lead'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="navbar-uni-assigned-tab"
                onClick={() => setActiveTab('university')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-[#faf6ee] text-emerald-950 border border-stone-200 shadow-2xs`}
              >
                <FolderGit2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'en' ? 'Assigned Problems & R&D Hub' : 'आवंटित समस्याएं एवं आर&डी'}</span>
                {assignedProblemsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                    {assignedProblemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // CITIZEN & GOVERNMENT BODY EXCLUSIVE VIEW: Only Profile, My Submissions, and Submit New Challenge buttons are permitted
  if (isCitizen || isPanchayat || isGovernment) {
    const isGovBody = isPanchayat || isGovernment;
    const panelTitle = isCitizen
      ? (lang === 'en' ? 'Citizen Innovation Dashboard' : 'व्यक्तिगत नागरिक नवाचार पोर्टल')
      : (lang === 'en' ? 'Government & PRI Innovation Panel' : 'सरकारी एवं पंचायती राज व्यक्तिगत नवाचार पोर्टल');
    const submissionsLabel = isCitizen
      ? (lang === 'en' ? 'My Submissions' : 'मेरी प्रस्तुतियां')
      : (lang === 'en' ? 'Department Submissions' : 'विभाग प्रस्तुतियां');

    return (
      <nav className="bg-white/95 text-slate-800 border-b border-slate-200/90 shadow-2xs sticky top-0 z-40 transition-colors duration-200 backdrop-blur-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-900">
                {panelTitle}
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-600 hidden sm:inline font-medium">
                {currentUser?.name} ({currentUser?.district || 'Jharkhand'}{isGovBody && currentUser?.organization ? ` • ${currentUser.organization}` : ''})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* BUTTON 1: My Submissions / Department Submissions */}
              <button
                id="navbar-citizen-my-submissions"
                onClick={() => setActiveTab('my-submissions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'my-submissions'
                    ? `${themeCfg.navActiveBg} ${themeCfg.navActiveText} border ${themeCfg.accentBorder}/40 shadow-2xs`
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <FolderGit2 className={`w-3.5 h-3.5 ${activeTab === 'my-submissions' ? 'text-emerald-700' : 'text-slate-500'}`} />
                <span>{submissionsLabel}</span>
                {mySubmissionsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    {mySubmissionsCount}
                  </span>
                )}
              </button>

              {/* BUTTON 2: Submit New Challenge or Problem */}
              <button
                id="navbar-citizen-submit-new"
                onClick={() => setActiveTab('submit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'submit'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-white" />
                <span>{lang === 'en' ? 'Submit New Challenge' : 'नई समस्या दर्ज करें'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Master ecosystem navigation covering core modules for non-citizen roles
  let navItems: NavItem[] = [
    {
      id: 'overview' as NavTab,
      labelEn: 'Portal Overview',
      labelHi: 'मुख्य पृष्ठ',
      icon: Home,
    },
    {
      id: 'lifecycle' as NavTab,
      labelEn: 'Project Lifecycle & IP',
      labelHi: 'परियोजना जीवनचक्र',
      icon: ShieldCheck,
    },
    {
      id: 'analytics' as NavTab,
      labelEn: 'Visual Analytics',
      labelHi: 'विश्लेषण डैशबोर्ड',
      icon: BarChart3,
    },
  ];

  // If user has active submissions or is a citizen/panchayat, also allow quick access
  if (isCitizen || isPanchayat) {
    navItems.splice(2, 0, {
      id: 'my-submissions' as NavTab,
      labelEn: 'My Submissions',
      labelHi: 'मेरी प्रस्तुतियां',
      icon: FolderGit2,
      count: mySubmissionsCount,
    });
  }

  return (
    <nav className="bg-white/95 text-slate-700 border-b border-slate-200/90 shadow-2xs sticky top-0 z-40 transition-colors duration-200 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center overflow-x-auto scrollbar-none space-x-1 pt-1.5 pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 relative cursor-pointer ${
                  isActive
                    ? `${themeCfg.navActiveBg} ${themeCfg.navActiveText} shadow-2xs font-bold border-b-2 ${themeCfg.navActiveBorder}`
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                <span>{lang === 'en' ? item.labelEn : item.labelHi}</span>

                {item.highlight && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-tight flex items-center gap-0.5 shadow-2xs border border-emerald-200">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}

                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
