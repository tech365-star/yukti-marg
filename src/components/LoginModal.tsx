import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { JHARKHAND_DISTRICTS } from '../data/mockData';
import { authService } from '../services/authService';
import { GovCaptcha } from './GovCaptcha';
import { 
  X, 
  ShieldCheck, 
  UserCircle, 
  GraduationCap, 
  Building, 
  Building2,
  Lock,
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  Landmark,
  Briefcase,
  Users
} from 'lucide-react';

export const ADMIN_OFFICERS = [
  {
    username: 'admin',
    name: 'Dr. Sneha Roy, IAS',
    designation: 'State Innovation Director & Super Admin',
    department: 'Department of Higher & Technical Education',
    organization: 'Govt. of Jharkhand State Innovation Directorate',
    district: 'Ranchi (State Mantralaya)',
    clearance: 'SUPER ADMIN TIER-1',
    accessScope: 'Full System Oversight & Statewide Directory Control'
  },
  {
    username: 'collectorate_admin',
    name: 'Dr. Alok Ranjan, IAS',
    designation: 'District Collector & Super Admin',
    department: 'District Administrative & Innovation Directorate',
    organization: 'Ranchi District Collectorate & Innovation Mission',
    district: 'Ranchi Collectorate',
    clearance: 'SUPER ADMIN TIER-1',
    accessScope: 'District Multi-Departmental Oversight & Challenge Escalation'
  }
];

export const INDUSTRIAL_OFFICERS = [
  {
    username: 'tatasteel',
    companyName: 'Tata Steel CSR & Technology Incubation',
    officerName: 'Sunil Murmu',
    designation: 'Head of CSR Technology Deployments',
    sector: 'Steel & Heavy Engineering',
    district: 'East Singhbhum (Jamshedpur)',
    tag: 'Corporate CSR Desk'
  },
  {
    username: 'sail_bokaro',
    companyName: 'Steel Authority of India (SAIL) Bokaro',
    officerName: 'Arun K. Singh',
    designation: 'General Manager (CSR)',
    sector: 'Public Sector Mining & Steel',
    district: 'Bokaro Steel City',
    tag: 'PSU Corporate Officer'
  },
  {
    username: 'coalindia',
    companyName: 'Central Coalfields Limited (CCL) / Coal India',
    officerName: 'Manoj Tirkey',
    designation: 'Chief General Manager (CSR)',
    sector: 'Energy, Coal Mining & Water',
    district: 'Ranchi',
    tag: 'Energy PSU Officer'
  },
  {
    username: 'greentech',
    companyName: 'Jharkhand GreenTech Agritech Solutions',
    officerName: 'Aman Verma',
    designation: 'Co-Founder & CTO',
    sector: 'CleanTech & Agro-IoT Startup',
    district: 'Ranchi',
    tag: 'DPIIT Incubated Startup'
  },
  {
    username: 'bokaro_msme',
    companyName: 'Bokaro Precision Metal MSME Cluster',
    officerName: 'Vikas Agrawal',
    designation: 'MSME Cluster Secretary',
    sector: 'Tooling & Prototyping Consortium',
    district: 'Bokaro',
    tag: 'MSME Cluster Representative'
  },
  {
    username: 'tata_trusts',
    companyName: 'Tata Trusts - Jharkhand Rural Innovation Cell',
    officerName: 'Debolina Mukherjee',
    designation: 'Lead, State Programs',
    sector: 'Philanthropic Innovation Foundation',
    district: 'Ranchi',
    tag: 'CSR Foundation Lead'
  },
  {
    username: 'csir_cimfr',
    companyName: 'CSIR - Central Institute of Mining & Fuel Research',
    officerName: 'Dr. Alok Kumar',
    designation: 'Director of R&D',
    sector: 'Scientific Research Lab',
    district: 'Dhanbad',
    tag: 'Govt. National Laboratory'
  },
  {
    username: 'aic_hub',
    companyName: 'Atal Incubation Centre (AIC) BIT Mesra',
    officerName: 'Dr. Priyaranjan Sharma',
    designation: 'CEO & Incubation Lead',
    sector: 'AIM NITI Aayog Innovation Hub',
    district: 'Ranchi',
    tag: 'Tech Incubator Lead'
  }
];

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  initialMode?: 'login' | 'register';
  defaultRole?: UserRole | 'departmental' | 'industrial' | 'administration';
  lang?: 'en' | 'hi';
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogin,
  initialMode = 'login',
  defaultRole = 'citizen',
  lang = 'en'
}) => {
  type MainTabType = 'citizen' | 'departmental' | 'university' | 'industry' | 'admin';

  // Determine initial tab based on defaultRole or initialMode
  const getInitialTab = (): MainTabType => {
    if (defaultRole === 'admin' || defaultRole === 'administration') return 'admin';
    if (defaultRole === 'industry' || defaultRole === 'industrial') return 'industry';
    if (defaultRole === 'university') return 'university';
    if (defaultRole === 'departmental' || defaultRole === 'panchayat' || defaultRole === 'government') {
      return 'departmental';
    }
    return 'citizen';
  };

  const [mainTab, setMainTab] = useState<MainTabType>(getInitialTab());

  // Keep main tab synchronized when opening with a specific role
  React.useEffect(() => {
    if (isOpen) {
      setMainTab(getInitialTab());
      setAuthError(null);
    }
  }, [isOpen, defaultRole]);

  // Citizen sub-mode: login or register
  const [citizenMode, setCitizenMode] = useState<'login' | 'register'>(initialMode === 'register' ? 'register' : 'login');

  // Common submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // 1. Citizen Form State
  const [citizenIdentifier, setCitizenIdentifier] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [showCitizenPassword, setShowCitizenPassword] = useState(false);
  const [citizenCaptcha, setCitizenCaptcha] = useState('');
  const [citizenCaptchaCode, setCitizenCaptchaCode] = useState('');

  // Citizen Register State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('Ranchi');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [citizenRegCaptcha, setCitizenRegCaptcha] = useState('');
  const [citizenRegCaptchaCode, setCitizenRegCaptchaCode] = useState('');

  // 2. Departmental Login State (Panchayat Mukhiya & Government Bodies)
  const [deptIdentifier, setDeptIdentifier] = useState('');
  const [deptPassword, setDeptPassword] = useState('');
  const [showDeptPassword, setShowDeptPassword] = useState(false);
  const [deptCaptcha, setDeptCaptcha] = useState('');
  const [deptCaptchaCode, setDeptCaptchaCode] = useState('');

  // 3. University / HEI Login State
  const [uniIdentifier, setUniIdentifier] = useState('');
  const [uniPassword, setUniPassword] = useState('');
  const [showUniPassword, setShowUniPassword] = useState(false);
  const [uniCaptcha, setUniCaptcha] = useState('');
  const [uniCaptchaCode, setUniCaptchaCode] = useState('');

  // 4. Industrial Login State (Industries, Startups, MSMEs, CSR)
  const [indIdentifier, setIndIdentifier] = useState('');
  const [indPassword, setIndPassword] = useState('');
  const [showIndPassword, setShowIndPassword] = useState(false);
  const [indCaptcha, setIndCaptcha] = useState('');
  const [indCaptchaCode, setIndCaptchaCode] = useState('');

  // 5. Administration Login State (Government Master Admin)
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminCaptcha, setAdminCaptcha] = useState('');
  const [adminCaptchaCode, setAdminCaptchaCode] = useState('');

  if (!isOpen) return null;

  // Clear errors when changing tab
  const switchTab = (tab: MainTabType) => {
    setMainTab(tab);
    setAuthError(null);
  };

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------

  // 1. Citizen Login
  const handleCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!citizenCaptcha.trim() || citizenCaptcha.trim().toLowerCase() !== citizenCaptchaCode.trim().toLowerCase()) {
      setAuthError('Security Captcha verification failed. Please enter the characters shown in the security image.');
      return;
    }

    setIsSubmitting(true);
    const result = authService.login(citizenIdentifier, citizenPassword);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onLogin(result.user);
      onClose();
    } else {
      setAuthError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  // Citizen Registration
  const handleCitizenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regEmail.trim()) {
      setAuthError(lang === 'hi' ? 'ईमेल पता अनिवार्य है। कृपया एक वैध ईमेल पता दर्ज करें।' : 'Email address is mandatory. Please enter a valid email address.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match. Please verify.');
      return;
    }

    if (!citizenRegCaptcha.trim() || citizenRegCaptcha.trim().toLowerCase() !== citizenRegCaptchaCode.trim().toLowerCase()) {
      setAuthError('Security Captcha verification failed. Please enter the characters shown in the security image.');
      return;
    }

    setIsSubmitting(true);
    const result = authService.registerCitizen({
      name: regName,
      username: regUsername,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      district: regDistrict,
      organization: 'Resident Citizen / Local Beneficiary',
      department: 'Village / Ward Resident',
      role: 'citizen',
    });
    setIsSubmitting(false);

    if (result.success && result.user) {
      onLogin(result.user);
      onClose();
    } else {
      setAuthError(result.error || 'Registration failed. Please try again.');
    }
  };

  // 2. Departmental Login Handler
  const handleDepartmentalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!deptCaptcha.trim() || deptCaptcha.trim().toLowerCase() !== deptCaptchaCode.trim().toLowerCase()) {
      setAuthError('Security Captcha verification failed. Please enter the characters shown in the security image.');
      return;
    }

    setIsSubmitting(true);
    const result = authService.login(deptIdentifier, deptPassword);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onLogin(result.user);
      onClose();
    } else {
      setAuthError(result.error || 'Departmental officer authentication failed. Please verify your official Officer ID.');
    }
  };

  // 3. University Login Handler
  const handleUniversityLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!uniCaptcha.trim() || uniCaptcha.trim().toLowerCase() !== uniCaptchaCode.trim().toLowerCase()) {
      setAuthError('Security Captcha verification failed. Please enter the characters shown in the security image.');
      return;
    }

    setIsSubmitting(true);
    const result = authService.login(uniIdentifier, uniPassword);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onLogin(result.user);
      onClose();
    } else {
      setAuthError(result.error || 'University nodal credentials invalid. Please check username and password.');
    }
  };

  // 4. Industrial Login Handler
  const handleIndustrialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!indCaptcha.trim() || indCaptcha.trim().toLowerCase() !== indCaptchaCode.trim().toLowerCase()) {
      setAuthError('Security Captcha verification failed. Please enter the characters shown in the security image.');
      return;
    }

    setIsSubmitting(true);
    const result = authService.login(indIdentifier, indPassword);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onLogin(result.user);
      onClose();
    } else {
      setAuthError(result.error || 'Industrial partner authentication failed. Please verify company login ID.');
    }
  };

  // 5. Administration Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!adminCaptcha.trim() || adminCaptcha.trim().toLowerCase() !== adminCaptchaCode.trim().toLowerCase()) {
      setAuthError('Security Captcha verification failed. Please enter the characters shown in the security image.');
      return;
    }

    setIsSubmitting(true);
    const result = authService.login(adminIdentifier, adminPassword);
    setIsSubmitting(false);

    if (result.success && result.user) {
      onLogin(result.user);
      onClose();
    } else {
      setAuthError(result.error || 'Administrator authentication failed. Super admin authorization required.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto" id="login-modal-wrapper">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b-2 border-amber-500 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {lang === 'hi' ? 'युक्ति मार्ग बहु-भूमिका प्रमाणीकरण' : 'Yukti Marg Multi-Role Authentication'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {lang === 'hi'
                  ? 'नागरिकों, अधिकारियों, विश्वविद्यालयों, उद्योगों एवं प्रशासकों हेतु आधिकारिक सिंगल साइन-ऑन'
                  : 'Official Single Sign-On for Citizens, Officers, Universities, Industries & Administrators'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Distinct Roles Navigation Bar */}
        <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-100 text-xs font-semibold flex-shrink-0">
          {/* TAB 1: Citizen */}
          <button
            id="tab-citizen-login"
            onClick={() => switchTab('citizen')}
            className={`py-3 px-1 sm:px-2 text-center transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer border-r border-slate-200 ${
              mainTab === 'citizen'
                ? 'bg-white text-emerald-900 font-bold border-b-2 border-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserCircle className={`w-4 h-4 ${mainTab === 'citizen' ? 'text-emerald-700' : 'text-slate-500'}`} />
            <span className="truncate w-full text-[10px] sm:text-xs">{lang === 'hi' ? 'नागरिक' : 'Citizen'}</span>
          </button>

          {/* TAB 2: Departmental & PRI */}
          <button
            id="tab-departmental-login"
            onClick={() => switchTab('departmental')}
            className={`py-3 px-1 sm:px-2 text-center transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer border-r border-slate-200 ${
              mainTab === 'departmental'
                ? 'bg-white text-emerald-900 font-bold border-b-2 border-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className={`w-4 h-4 ${mainTab === 'departmental' ? 'text-amber-600' : 'text-slate-500'}`} />
            <span className="truncate w-full text-[10px] sm:text-xs">{lang === 'hi' ? 'अधिकारी / शासन' : 'Officer / Gov'}</span>
          </button>

          {/* TAB 3: University / HEI */}
          <button
            id="tab-university-login"
            onClick={() => switchTab('university')}
            className={`py-3 px-1 sm:px-2 text-center transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer border-r border-slate-200 ${
              mainTab === 'university'
                ? 'bg-white text-purple-900 font-bold border-b-2 border-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${mainTab === 'university' ? 'text-purple-700' : 'text-slate-500'}`} />
            <span className="truncate w-full text-[10px] sm:text-xs">{lang === 'hi' ? 'विश्वविद्यालय' : 'University'}</span>
          </button>

          {/* TAB 4: Industrial Login (NEW REQUESTED OPTION) */}
          <button
            id="tab-industrial-login"
            onClick={() => switchTab('industry')}
            className={`py-3 px-1 sm:px-2 text-center transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer border-r border-slate-200 ${
              mainTab === 'industry'
                ? 'bg-white text-amber-900 font-bold border-b-2 border-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className={`w-4 h-4 ${mainTab === 'industry' ? 'text-amber-600' : 'text-slate-500'}`} />
            <span className="truncate w-full text-[10px] sm:text-xs font-bold text-amber-800">{lang === 'hi' ? 'उद्योग' : 'Industrial'}</span>
          </button>

          {/* TAB 5: Administration Login (NEW REQUESTED OPTION) */}
          <button
            id="tab-administration-login"
            onClick={() => switchTab('admin')}
            className={`py-3 px-1 sm:px-2 text-center transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer ${
              mainTab === 'admin'
                ? 'bg-white text-red-950 font-bold border-b-2 border-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${mainTab === 'admin' ? 'text-red-700' : 'text-slate-500'}`} />
            <span className="truncate w-full text-[10px] sm:text-xs font-bold text-red-900">{lang === 'hi' ? 'प्रशासन' : 'Admin'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Global Auth Error Alert */}
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. CITIZEN LOGIN / REGISTRATION PORTAL                    */}
          {/* ========================================================= */}
          {mainTab === 'citizen' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => { setCitizenMode('login'); setAuthError(null); }}
                    className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                      citizenMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'hi' ? 'नागरिक साइन इन' : 'Citizen Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCitizenMode('register'); setAuthError(null); }}
                    className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                      citizenMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'hi' ? 'नया नागरिक पंजीकरण' : 'New Citizen Registration'}
                  </button>
                </div>
              </div>

              {citizenMode === 'login' ? (
                <form onSubmit={handleCitizenLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'hi' ? 'नागरिक मोबाइल नंबर / यूजरनेम / ईमेल *' : 'Citizen Mobile Number / Username / Email *'}
                    </label>
                    <input
                      type="text"
                      value={citizenIdentifier}
                      onChange={(e) => setCitizenIdentifier(e.target.value)}
                      placeholder={lang === 'hi' ? 'उदा. citizen या 9876543210' : 'e.g. citizen or 9876543210'}
                      required
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'hi' ? 'पासवर्ड *' : 'Password *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showCitizenPassword ? 'text' : 'password'}
                        value={citizenPassword}
                        onChange={(e) => setCitizenPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full text-xs px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCitizenPassword(!showCitizenPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCitizenPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <GovCaptcha
                    value={citizenCaptcha}
                    onChange={setCitizenCaptcha}
                    onCodeGenerated={setCitizenCaptchaCode}
                    id="cit-login"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-amber-400" />
                    <span>
                      {isSubmitting
                        ? (lang === 'hi' ? 'प्रमाणीकरण जारी है...' : 'Authenticating...')
                        : (lang === 'hi' ? 'नागरिक के रूप में साइन इन करें' : 'Sign In as Citizen Contributor')}
                    </span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCitizenRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'hi' ? 'पूरा नाम *' : 'Full Legal Name *'}
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={lang === 'hi' ? 'उदा. रमेश चंद्र वर्मा' : 'e.g. Ramesh Chandra Verma'}
                      required
                      className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {lang === 'hi' ? 'इच्छित यूजरनेम *' : 'Desired Username *'}
                      </label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="ramesh_v"
                        required
                        className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {lang === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="9876543210"
                        required
                        className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {lang === 'hi' ? 'ईमेल पता *' : 'Email Address *'}
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="ramesh@example.com"
                        required
                        className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {lang === 'hi' ? 'ज़िला (झारखंड) *' : 'District (Jharkhand) *'}
                      </label>
                      <select
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md"
                      >
                        {JHARKHAND_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {lang === 'hi' ? 'पासवर्ड *' : 'Password *'}
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full text-xs px-3 py-1.5 pr-8 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          title={showRegPassword ? (lang === 'hi' ? 'पासवर्ड छुपाएं' : 'Hide password') : (lang === 'hi' ? 'पासवर्ड देखें' : 'Show password')}
                          aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {lang === 'hi' ? 'पासवर्ड की पुष्टि करें *' : 'Confirm Password *'}
                      </label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full text-xs px-3 py-1.5 pr-8 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          title={showRegConfirmPassword ? (lang === 'hi' ? 'पासवर्ड छुपाएं' : 'Hide password') : (lang === 'hi' ? 'पासवर्ड देखें' : 'Show password')}
                          aria-label={showRegConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <GovCaptcha
                    value={citizenRegCaptcha}
                    onChange={setCitizenRegCaptcha}
                    onCodeGenerated={setCitizenRegCaptchaCode}
                    id="cit-reg"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <span>
                      {isSubmitting
                        ? (lang === 'hi' ? 'पंजीकरण जारी है...' : 'Registering...')
                        : (lang === 'hi' ? 'नागरिक पंजीकरण पूर्ण करें' : 'Complete Citizen Registration')}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. DEPARTMENTAL & PRI LOGIN                               */}
          {/* ========================================================= */}
          {mainTab === 'departmental' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Landmark className="w-4 h-4 text-amber-700" />
                  <span>
                    {lang === 'hi'
                      ? 'आधिकारिक विभागीय एवं पंचायती राज अधिकारी पोर्टल'
                      : 'Official Departmental & Panchayati Raj Officer Portal'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  {lang === 'hi'
                    ? 'मुखिया, पंचायत सचिव, बीडीओ, डीडीसी एवं विभागीय अधिकारियों हेतु सुरक्षित।'
                    : 'Restricted to Mukhiyas, Panchayat Secretaries, BDOs, DDCs, and line department officers.'}
                </p>
              </div>

              <form onSubmit={handleDepartmentalLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'अधिकारी यूजरनेम / सरकारी आईडी *' : 'Officer Username / Government ID *'}
                  </label>
                  <input
                    type="text"
                    value={deptIdentifier}
                    onChange={(e) => setDeptIdentifier(e.target.value)}
                    placeholder="e.g. mukhiya, panchayat_sec, bdo_officer"
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'पासवर्ड *' : 'Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showDeptPassword ? 'text' : 'password'}
                      value={deptPassword}
                      onChange={(e) => setDeptPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full text-xs px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeptPassword(!showDeptPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showDeptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <GovCaptcha
                  value={deptCaptcha}
                  onChange={setDeptCaptcha}
                  onCodeGenerated={setDeptCaptchaCode}
                  id="dept-login"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>
                    {isSubmitting
                      ? (lang === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Verifying Credentials...')
                      : (lang === 'hi' ? 'विभागीय डेस्क में साइन इन करें' : 'Sign In to Departmental Desk')}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. UNIVERSITY / HEI LOGIN                                 */}
          {/* ========================================================= */}
          {mainTab === 'university' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <GraduationCap className="w-4 h-4 text-purple-700" />
                  <span>
                    {lang === 'hi'
                      ? 'उच्च शिक्षण संस्थान (HEI) संकाय एवं अनुसंधान पोर्टल'
                      : 'Higher Education Institution (HEI) Faculty & R&D Portal'}
                  </span>
                </div>
                <p className="text-[11px] text-purple-800">
                  {lang === 'hi'
                    ? 'आवंटित समस्याओं तक पहुंचें, तकनीकी प्रस्ताव प्रस्तुत करें एवं कॉर्पोरेट प्रायोजकों से जुड़ें।'
                    : 'Access assigned problem statements, submit technical proposals, and connect with corporate sponsors.'}
                </p>
              </div>

              {/* Quick University Demo Presets removed */}

              <form onSubmit={handleUniversityLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi'
                      ? 'उच्च शिक्षण संस्थान यूजरनेम / संस्थागत ईमेल *'
                      : 'HEI Nodal Username / Institutional Email *'}
                  </label>
                  <input
                    type="text"
                    value={uniIdentifier}
                    onChange={(e) => setUniIdentifier(e.target.value)}
                    placeholder="e.g. university or vc@bitmesra.ac.in"
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'पासवर्ड *' : 'Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showUniPassword ? 'text' : 'password'}
                      value={uniPassword}
                      onChange={(e) => setUniPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full text-xs px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUniPassword(!showUniPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showUniPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <GovCaptcha
                  value={uniCaptcha}
                  onChange={setUniCaptcha}
                  onCodeGenerated={setUniCaptchaCode}
                  id="uni-login"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-900 hover:bg-purple-950 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-amber-300" />
                  <span>
                    {isSubmitting
                      ? (lang === 'hi' ? 'प्रमाणीकरण जारी है...' : 'Authenticating...')
                      : (lang === 'hi' ? 'विश्वविद्यालय / उच्च शिक्षण संस्थान प्रमुख के रूप में साइन इन करें' : 'Sign In as University / HEI Lead')}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. INDUSTRIAL LOGIN (NEW REQUESTED EXPLICIT OPTION)       */}
          {/* ========================================================= */}
          {mainTab === 'industry' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Briefcase className="w-4 h-4 text-amber-700" />
                  <span>
                    {lang === 'hi'
                      ? 'आधिकारिक कॉर्पोरेट, उद्योग एवं एमएसएमई साझेदार पोर्टल'
                      : 'Official Corporate, Industry & MSME Partner Portal'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  {lang === 'hi'
                    ? 'सीएसआर प्रायोजक डेस्क, तकनीकी परीक्षण अंगीकरण एवं छात्र नवाचार सहयोग।'
                    : 'CSR sponsor desk, technical pilot adoption, and student innovation sponsorship.'}
                </p>
              </div>

              <form onSubmit={handleIndustrialLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi'
                      ? 'कंपनी आईडी / औद्योगिक एडमिन यूजरनेम *'
                      : 'Company ID / Industrial Admin Username *'}
                  </label>
                  <input
                    type="text"
                    value={indIdentifier}
                    onChange={(e) => setIndIdentifier(e.target.value)}
                    placeholder="e.g. tatasteel, sail_bokaro, coalindia, greentech"
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'पासवर्ड *' : 'Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showIndPassword ? 'text' : 'password'}
                      value={indPassword}
                      onChange={(e) => setIndPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full text-xs px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowIndPassword(!showIndPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showIndPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <GovCaptcha
                  value={indCaptcha}
                  onChange={setIndCaptcha}
                  onCodeGenerated={setIndCaptchaCode}
                  id="ind-login"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-amber-200" />
                  <span>
                    {isSubmitting
                      ? (lang === 'hi' ? 'प्रमाणीकरण जारी है...' : 'Authenticating...')
                      : (lang === 'hi' ? 'औद्योगिक अधिकारी / कंपनी के रूप में साइन इन करें' : 'Sign In as Industrial Officer / Company')}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. ADMINISTRATION LOGIN (NEW REQUESTED EXPLICIT OPTION)   */}
          {/* ========================================================= */}
          {mainTab === 'admin' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs text-red-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-red-700" />
                  <span>
                    {lang === 'hi'
                      ? 'राज्य सरकार प्रशासनिक एवं मिशन नियंत्रण पोर्टल'
                      : 'State Government Administrative & Mission Control Portal'}
                  </span>
                </div>
                <p className="text-[11px] text-red-800">
                  {lang === 'hi'
                    ? 'राज्य नवाचार निदेशक, ज़िला उपायुक्त एवं अधिकृत प्रशासकों हेतु सीमित।'
                    : 'Restricted to State Innovation Directors, District Collectors, and authorized Directorate Administrators.'}
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'राज्य प्रशासक यूजरनेम *' : 'State Administrator Username *'}
                  </label>
                  <input
                    type="text"
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    placeholder="e.g. admin or collectorate_admin"
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'मास्टर पासवर्ड *' : 'Master Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full text-xs px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <GovCaptcha
                  value={adminCaptcha}
                  onChange={setAdminCaptcha}
                  onCodeGenerated={setAdminCaptchaCode}
                  id="adm-login"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#800000] hover:bg-[#600000] text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>
                    {isSubmitting
                      ? (lang === 'hi' ? 'मास्टर विशेषाधिकार प्रमाणित हो रहे हैं...' : 'Authenticating Master Privileges...')
                      : (lang === 'hi' ? 'सरकारी एडमिन मिशन कंट्रोल में साइन इन करें' : 'Sign In to Government Admin Mission Control')}
                  </span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {lang === 'hi' ? '256-बिट एन्क्रिप्टेड सरकारी प्रमाणीकरण' : '256-bit Encrypted Government Authentication'}
            </span>
          </div>
          <span>{lang === 'hi' ? 'एनईपी 2020 राज्य मिशन' : 'NEP 2020 State Mission'}</span>
        </div>
      </div>
    </div>
  );
};
