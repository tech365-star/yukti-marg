import React, { useState, useEffect } from 'react';
import { Challenge, User, UniversityProfile, IndustryPartnerOrg, ThematicCategory } from '../types';
import { UNIVERSITIES, INDUSTRY_PARTNERS, JHARKHAND_DISTRICTS } from '../data/mockData';
import { authService } from '../services/authService';
import { AdminCitizenStatusDashboard } from './AdminCitizenStatusDashboard';
import { 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Building2, 
  Settings, 
  Search, 
  Filter, 
  PlusCircle, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ArrowRight, 
  Sliders, 
  Lock, 
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  FolderGit2,
  Download,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  X
} from 'lucide-react';

export interface OfficerAccountWithCreds extends User {
  password?: string;
}

interface AdminDirectoryControlViewProps {
  challenges: Challenge[];
  currentUser: User | null;
  onUpdateChallenge: (updated: Challenge) => void;
  onSelectChallenge: (c: Challenge) => void;
  onAddNotification?: (notif: any) => Promise<void> | void;
  lang?: 'en' | 'hi';
  initialAdminTab?: 'citizen-problems' | 'officers' | 'universities' | 'industries' | 'master-controls';
}

export const AdminDirectoryControlView: React.FC<AdminDirectoryControlViewProps> = ({
  challenges,
  currentUser,
  onUpdateChallenge,
  onSelectChallenge,
  onAddNotification,
  lang = 'en',
  initialAdminTab = 'citizen-problems',
}) => {
  const [adminTab, setAdminTab] = useState<'citizen-problems' | 'officers' | 'universities' | 'industries' | 'master-controls'>(initialAdminTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');

  // Accounts state (from authService and backend)
  const [officerAccounts, setOfficerAccounts] = useState<OfficerAccountWithCreds[]>([]);
  const [universitiesList, setUniversitiesList] = useState<UniversityProfile[]>(UNIVERSITIES);
  const [industriesList, setIndustriesList] = useState<IndustryPartnerOrg[]>(INDUSTRY_PARTNERS);

  // Officer Account Details Modal & Credential Visibility
  const [selectedOfficerForDetails, setSelectedOfficerForDetails] = useState<OfficerAccountWithCreds | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // University & Industry Details Modals and Admin Dossier
  const [selectedUniForDetails, setSelectedUniForDetails] = useState<{
    uni: UniversityProfile;
    username: string;
    password: string;
    account?: any;
  } | null>(null);
  const [selectedIndustryForDetails, setSelectedIndustryForDetails] = useState<{
    partner: IndustryPartnerOrg;
    username: string;
    password: string;
    officerName: string;
    officerDesignation: string;
    account?: any;
  } | null>(null);
  const [isAdminDossierOpen, setIsAdminDossierOpen] = useState(false);
  const [showAdminDossierPassword, setShowAdminDossierPassword] = useState(false);

  // New Officer Modal / State
  const [isAddOfficerModalOpen, setIsAddOfficerModalOpen] = useState(false);
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerUsername, setNewOfficerUsername] = useState('');
  const [newOfficerPassword, setNewOfficerPassword] = useState('Govt@123');
  const [newOfficerRole, setNewOfficerRole] = useState<'government' | 'panchayat' | 'admin'>('government');
  const [newOfficerDesignation, setNewOfficerDesignation] = useState('Block Development Officer (BDO)');
  const [newOfficerDepartment, setNewOfficerDepartment] = useState('Rural Development & Panchayati Raj');
  const [newOfficerDistrict, setNewOfficerDistrict] = useState('Ranchi');
  const [newOfficerEmail, setNewOfficerEmail] = useState('');
  const [newOfficerPhone, setNewOfficerPhone] = useState('');
  const [accountActionMessage, setAccountActionMessage] = useState<string | null>(null);

  // Challenge Control Override State
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challenges[0]?.id || '');
  const [overrideStatus, setOverrideStatus] = useState<string>('prototype_development');
  const [overridePriority, setOverridePriority] = useState<string>('high');
  const [overrideUniversityId, setOverrideUniversityId] = useState<string>('bit-mesra');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isApplyingOverride, setIsApplyingOverride] = useState(false);
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState<string | null>(null);

  // Load directory on mount
  useEffect(() => {
    loadAccounts();
    fetchBackendDirectory();
  }, []);

  const loadAccounts = () => {
    const all = authService.getAllAccounts();
    // Filter out pure citizens for the officer directory, or include all administrative & government roles
    const officers: OfficerAccountWithCreds[] = all
      .filter(a => a.user.role === 'panchayat' || a.user.role === 'government' || a.user.role === 'admin')
      .map(a => ({
        ...a.user,
        username: a.username,
        password: a.passwordHash || 'password123',
      }));
    setOfficerAccounts(officers);
  };

  const togglePasswordVisibility = (username: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getUniCredentials = (uni: UniversityProfile) => {
    const uniAccounts = authService.getUniversityAccounts();
    const match = uniAccounts.find(
      (a) =>
        a.user.id === uni.id ||
        a.user.name.toLowerCase().includes(uni.name.toLowerCase()) ||
        uni.name.toLowerCase().includes(a.user.name.toLowerCase()) ||
        (uni.email && a.user.email && a.user.email.toLowerCase() === uni.email.toLowerCase())
    );
    if (match) {
      return {
        username: match.username,
        password: match.passwordHash || 'password123',
        account: match,
      };
    }
    const slug = uni.id.replace(/-/g, '_').toLowerCase();
    const fallback = uniAccounts.find(
      (a) => a.username.toLowerCase().includes(slug) || slug.includes(a.username.toLowerCase())
    );
    return {
      username: fallback?.username || (slug === 'bit_mesra' ? 'bit_mesra' : slug === 'iit_ism' ? 'iit_ism' : slug),
      password: fallback?.passwordHash || 'password123',
      account: fallback,
    };
  };

  const getIndustryCredentials = (partner: IndustryPartnerOrg) => {
    const indAccounts = authService.getIndustryAccounts();
    const match = indAccounts.find(
      (a) =>
        a.user.id === partner.id ||
        a.user.organization?.toLowerCase().includes(partner.name.toLowerCase()) ||
        partner.name.toLowerCase().includes(a.user.organization?.toLowerCase() || 'xyz') ||
        a.user.name.toLowerCase() === (partner.contactPerson || '').toLowerCase()
    );
    if (match) {
      return {
        username: match.username,
        password: match.passwordHash || 'password123',
        officerName: match.user.name,
        officerDesignation: match.user.designation || 'Head of CSR & Innovation',
        account: match,
      };
    }
    const slug = partner.id.replace(/-/g, '_').toLowerCase();
    const fallback = indAccounts.find(
      (a) => a.username.toLowerCase().includes(slug) || slug.includes(a.username.toLowerCase())
    );
    return {
      username: fallback?.username || (partner.id.includes('tata-steel') ? 'tatasteel' : partner.id.includes('sail') ? 'sail_bokaro' : partner.id.includes('coal') ? 'coalindia' : partner.id.includes('green') ? 'greentech' : partner.id.includes('msme') ? 'bokaro_msme' : partner.id.includes('trusts') ? 'tata_trusts' : partner.id.includes('cimfr') ? 'csir_cimfr' : 'aic_hub'),
      password: fallback?.passwordHash || 'password123',
      officerName: fallback?.user.name || partner.contactPerson || 'Industrial CSR Officer',
      officerDesignation: fallback?.user.designation || 'Head of CSR Technology Deployments',
      account: fallback,
    };
  };

  const fetchBackendDirectory = async () => {
    try {
      const res = await fetch('/api/admin/directory');
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.universities) setUniversitiesList(data.universities);
        if (data.industries) setIndustriesList(data.industries);
      }
    } catch (e) {
      console.warn('Backend admin directory API fallback:', e);
    }
  };

  // Add Officer Account Handler
  const handleCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerName.trim() || !newOfficerUsername.trim()) return;

    const newAcc: User = {
      id: `usr-off-${Date.now()}`,
      name: newOfficerName.trim(),
      username: newOfficerUsername.trim().toLowerCase(),
      role: newOfficerRole,
      organization: newOfficerDepartment,
      department: newOfficerDepartment,
      designation: newOfficerDesignation,
      district: newOfficerDistrict,
      email: newOfficerEmail.trim() || `${newOfficerUsername.trim().toLowerCase()}@jharkhand.gov.in`,
      phone: newOfficerPhone.trim() || '+91 94311 00000',
      verified: true,
    };

    authService.saveOrUpdateAccount({
      username: newAcc.username!,
      passwordHash: newOfficerPassword,
      user: newAcc,
    });
    loadAccounts();
    setIsAddOfficerModalOpen(false);
    setAccountActionMessage(`Officer Account for "${newAcc.name}" provisioned successfully! User: ${newAcc.username}`);
    setTimeout(() => setAccountActionMessage(null), 5000);

    // Reset fields
    setNewOfficerName('');
    setNewOfficerUsername('');
    setNewOfficerEmail('');
    setNewOfficerPhone('');
  };

  // Reset officer password handler
  const handleResetPassword = (username: string) => {
    const all = authService.getAllAccounts();
    const target = all.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (!target) return;
    authService.saveOrUpdateAccount({
      ...target,
      passwordHash: 'Password@2026',
    });
    loadAccounts();
    if (selectedOfficerForDetails && selectedOfficerForDetails.username?.toLowerCase() === username.toLowerCase()) {
      setSelectedOfficerForDetails(prev => prev ? { ...prev, password: 'Password@2026' } : null);
    }
    setAccountActionMessage(`Password reset to "Password@2026" for ${target.user.name} (${target.username})`);
    setTimeout(() => setAccountActionMessage(null), 4000);
  };

  // Master Override Challenge Handler
  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId) return;

    setIsApplyingOverride(true);
    setOverrideSuccessMsg(null);

    try {
      const assignedUni = universitiesList.find(u => u.id === overrideUniversityId);
      const res = await fetch(`/api/admin/challenges/${selectedChallengeId}/override-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: overrideStatus,
          priority: overridePriority,
          adminRemarks: adminRemarks || 'Administrative state mission override applied.',
          assignedUniversity: assignedUni ? {
            id: assignedUni.id,
            name: assignedUni.name,
            facultyLead: assignedUni.nodalLead,
            status: 'assigned',
            assignedDate: new Date().toISOString().split('T')[0],
          } : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        onUpdateChallenge(data.challenge);
        setOverrideSuccessMsg(`Challenge [${data.challenge.code}] successfully updated to status: ${overrideStatus.toUpperCase()}`);
        setAdminRemarks('');
      }
    } catch (err) {
      console.error('Master override failed:', err);
    } finally {
      setIsApplyingOverride(false);
    }
  };

  // Filtered officers
  const filteredOfficers = officerAccounts.filter(o => {
    const username = o.username || '';
    const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.designation && o.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.organization && o.organization.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDistrict = districtFilter === 'all' || o.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  // Filtered universities
  const filteredUniversities = universitiesList.filter(u => {
    const dist = u.district || u.location || '';
    const lead = u.nodalLead || '';
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = districtFilter === 'all' || dist.toLowerCase().includes(districtFilter.toLowerCase());
    return matchesSearch && matchesDistrict;
  });

  // Filtered industries
  const filteredIndustries = industriesList.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.location && i.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Selected challenge for override info
  const targetChallenge = challenges.find(c => c.id === selectedChallengeId) || challenges[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6" id="admin-directory-control-view">
      {/* Top Banner: Government Administration Mission Control & Admin Identity Console */}
      <div className="bg-gradient-to-r from-[#001f3f] via-[#002b5c] to-[#003875] text-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wide shadow-xs">
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              Government Administration & Website Master Control
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              State Innovation Directorate Mission Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Complete administrative authority over Yukti Marg. Review and manage all departmental officer credentials, university research rosters, industrial sponsor directories, and execute state-level status overrides across all 24 districts.
            </p>
          </div>

          {/* Dedicated Administrator Profile & Credential Panel */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-xs space-y-2.5 min-w-[320px] shadow-sm">
            <div className="flex items-center justify-between border-b border-white/15 pb-2">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-amber-400" />
                State Administrator Identity
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                SUPER ADMIN TIER-1
              </span>
            </div>

            <div>
              <span className="text-slate-300 text-[10px] block">Administrator Name:</span>
              <p className="font-extrabold text-white text-sm leading-tight">{currentUser?.name || 'Dr. Sneha Roy, IAS'}</p>
              <p className="text-amber-200 font-medium text-xs mt-0.5">{currentUser?.designation || 'State Innovation Director & Super Admin'}</p>
              <p className="text-slate-300 text-[11px] mt-0.5">{currentUser?.organization || 'Dept. of Higher & Technical Education, Govt of Jharkhand'}</p>
            </div>

            {/* Admin Credentials Quick Row */}
            <div className="pt-2 border-t border-white/15 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-black/30 p-1.5 rounded border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 font-sans block">Admin User:</span>
                  <span className="font-mono font-bold text-amber-300">{currentUser?.username || 'admin'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(currentUser?.username || 'admin', 'admin-top-user')}
                  className="p-1 hover:bg-white/10 text-amber-300 rounded transition-colors cursor-pointer"
                  title="Copy username"
                >
                  {copiedField === 'admin-top-user' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="bg-black/30 p-1.5 rounded border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 font-sans block">Password:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {visiblePasswords['admin-top'] ? 'Password@2026' : '••••••••'}
                  </span>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('admin-top')}
                    className="p-1 hover:bg-white/10 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                    title={visiblePasswords['admin-top'] ? 'Hide' : 'Show'}
                  >
                    {visiblePasswords['admin-top'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy('Password@2026', 'admin-top-pass')}
                    className="p-1 hover:bg-white/10 text-amber-300 rounded transition-colors cursor-pointer"
                    title="Copy password"
                  >
                    {copiedField === 'admin-top-pass' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsAdminDossierOpen(true)}
                className="w-full py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Administrator Identity Dossier</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Message Alert */}
      {accountActionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{accountActionMessage}</span>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Officer Accounts</span>
          <span className="text-2xl font-extrabold text-[#003366]">{officerAccounts.length} Active</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Panchayat, BDO, DDC & Nodal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Empanelled Universities</span>
          <span className="text-2xl font-extrabold text-purple-700">{universitiesList.length} HEIs</span>
          <span className="text-[10px] text-purple-600 font-semibold block mt-0.5">BIT, IIT ISM, NIT, BAU</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Ecosystem Industry Partners</span>
          <span className="text-2xl font-extrabold text-amber-700">{industriesList.length} Orgs</span>
          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Industries, Startups & MSMEs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Committed Industry Pool</span>
          <span className="text-2xl font-extrabold text-emerald-700">
            ₹{(industriesList.reduce((acc, i) => acc + i.committedFundingINR, 0) / 100000).toFixed(1)} Lakhs
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Active CSR & Seed Grants</span>
        </div>
      </div>

      {/* Navigation Tabs for Administrator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setAdminTab('citizen-problems')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'citizen-problems'
                ? 'bg-[#003366] text-white shadow-sm ring-2 ring-amber-400/50'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Citizen Problem Status Dashboard ({challenges.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('officers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'officers'
                ? 'bg-[#003366] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Officer Login Details ({officerAccounts.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('universities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'universities'
                ? 'bg-[#003366] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>University Details ({universitiesList.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('industries')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'industries'
                ? 'bg-[#003366] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Industry & Startup Details ({industriesList.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('master-controls')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'master-controls'
                ? 'bg-amber-600 text-white shadow-sm font-black'
                : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>Website Master Controls</span>
          </button>
        </div>

        {/* Quick Search & Filters */}
        {adminTab !== 'master-controls' && adminTab !== 'citizen-problems' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, designation, user..."
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {adminTab === 'officers' && (
              <button
                onClick={() => setIsAddOfficerModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Provision Officer</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 0: CITIZEN PROBLEM STATUS DASHBOARD (ADMIN DESK)                  */}
      {/* ========================================================================= */}
      {adminTab === 'citizen-problems' && (
        <AdminCitizenStatusDashboard
          challenges={challenges}
          currentUser={currentUser}
          onUpdateChallenge={onUpdateChallenge}
          onSelectChallenge={onSelectChallenge}
          onAddNotification={onAddNotification}
          lang={lang}
        />
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: ALL OFFICER LOGIN DETAILS                                       */}
      {/* ========================================================================= */}
      {adminTab === 'officers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                <span>State & Panchayat Officer Credentials & Role Directory</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official login IDs, designated roles, contact numbers, and security password controls across Jharkhand districts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter District:</span>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="text-xs px-2.5 py-1 border border-slate-300 rounded-md bg-white font-semibold text-slate-700"
              >
                <option value="all">All 24 Districts</option>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Officer Name & Designation</th>
                  <th className="py-2.5 px-3">Department / Panchayat</th>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Login Username</th>
                  <th className="py-2.5 px-3">Role Tier</th>
                  <th className="py-2.5 px-3">Contact Email / Phone</th>
                  <th className="py-2.5 px-3">Account Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOfficers.map((officer) => (
                  <tr key={officer.username ? `officer-${officer.username}` : `officer-${officer.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div>{officer.name}</div>
                      <span className="text-[11px] text-slate-500 font-normal">{officer.designation || 'Officer'}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {officer.organization || officer.department || 'Government of Jharkhand'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {officer.district || 'State HQ'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                      <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {officer.username}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        officer.role === 'panchayat' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : officer.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 font-black' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {officer.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{officer.email || `${officer.username}@jharkhand.gov.in`}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{officer.phone || '+91 94311 XXXXX'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-1.5 min-w-[210px]">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOfficerForDetails(officer);
                            setShowModalPassword(true);
                          }}
                          className="inline-flex items-center justify-between px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-md text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                          title="Open official account credentials and security details"
                        >
                          <span className="flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                            <span>Account Details</span>
                          </span>
                          <span className="text-[10px] bg-blue-200 group-hover:bg-blue-300 text-blue-900 px-1.5 py-0.5 rounded font-semibold transition-colors">
                            View
                          </span>
                        </button>

                        <div className="bg-slate-50 border border-slate-200 rounded-md p-2 text-[11px] space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between gap-1 font-mono">
                            <div className="flex items-center gap-1 overflow-hidden">
                              <span className="text-[10px] text-slate-500 font-sans font-semibold">User:</span>
                              <span className="font-bold text-blue-900 truncate" title={officer.username}>
                                {officer.username}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(officer.username || '', `user-${officer.username}`)}
                              className="text-slate-400 hover:text-blue-700 p-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Copy username"
                            >
                              {copiedField === `user-${officer.username}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-1 font-mono">
                            <div className="flex items-center gap-1 overflow-hidden">
                              <span className="text-[10px] text-slate-500 font-sans font-semibold">Pass:</span>
                              <span className="font-bold text-amber-950 truncate">
                                {visiblePasswords[officer.username || ''] ? officer.password : '••••••••'}
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(officer.username || '')}
                                className="text-slate-400 hover:text-amber-700 p-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                                title={visiblePasswords[officer.username || ''] ? "Hide password" : "Show password"}
                              >
                                {visiblePasswords[officer.username || ''] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(officer.password || '', `pass-${officer.username}`)}
                                className="text-slate-400 hover:text-amber-700 p-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Copy password"
                              >
                                {copiedField === `pass-${officer.username}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ALL UNIVERSITY DETAILS                                          */}
      {/* ========================================================================= */}
      {adminTab === 'universities' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-700" />
                <span>Empanelled Higher Education & Research Institutions</span>
              </h3>
              <p className="text-xs text-slate-500">
                Technical universities, engineering colleges, and agricultural institutions engaged under NEP 2020 experiential learning.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-full self-start sm:self-auto">
              {filteredUniversities.length} Institutions Registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUniversities.map((uni) => {
              const assignedChallenges = challenges.filter(c => c.assignedUniversity?.id === uni.id);
              const submittedProposals = challenges.reduce((acc, c) => {
                return acc + (c.proposals?.filter(p => p.universityId === uni.id).length || 0);
              }, 0);
              const uniCreds = getUniCredentials(uni);

              return (
                <div key={uni.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            {uni.type || 'University'}
                          </span>
                          {uni.nirfRank && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                              NIRF #{uni.nirfRank}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{uni.name}</h4>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-purple-600" />
                          {uni.district}, Jharkhand
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Assigned Challenges</span>
                        <span className="text-base font-extrabold text-[#003366]">{assignedChallenges.length}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Proposals Submitted</span>
                        <span className="text-base font-extrabold text-amber-700">{submittedProposals}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Student Innovators</span>
                        <span className="text-base font-extrabold text-emerald-700">{uni.studentInnovatorsCount || 120}+</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div>
                        <span className="font-semibold text-slate-900">Nodal Faculty Lead: </span>
                        <span>{uni.nodalLead}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">Incubation Hub / Facilities: </span>
                        <span className="text-slate-600">{uni.incubationFacilities?.join(', ') || 'Design Prototyping Labs, Hardware FabLab'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {uni.email || 'vc@institution.ac.in'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {uni.contactPhone || '+91 651 2275444'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* University Portal Login Credentials Box */}
                  <div className="pt-3 border-t border-purple-100 bg-purple-50/60 -mx-5 -mb-5 p-3.5 rounded-b-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-purple-700" />
                        <span>University Portal Login Credentials</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedUniForDetails({
                          uni,
                          username: uniCreds.username,
                          password: uniCreds.password,
                          account: uniCreds.account
                        })}
                        className="text-[11px] font-bold text-purple-900 hover:text-purple-950 bg-white hover:bg-purple-100 px-2.5 py-1 rounded border border-purple-200 shadow-2xs transition-colors cursor-pointer"
                      >
                        Account Details
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* University Username */}
                      <div className="bg-white border border-purple-200 rounded-lg p-2 flex items-center justify-between">
                        <div className="truncate pr-1">
                          <span className="text-[9px] text-slate-400 font-semibold block uppercase">Username</span>
                          <span className="font-mono font-bold text-slate-900 text-xs">{uniCreds.username}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(uniCreds.username, `uni-user-${uni.id}`)}
                          className="p-1 hover:bg-purple-50 text-purple-700 rounded transition-colors cursor-pointer shrink-0"
                          title="Copy university username"
                        >
                          {copiedField === `uni-user-${uni.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* University Password */}
                      <div className="bg-white border border-purple-200 rounded-lg p-2 flex items-center justify-between">
                        <div className="truncate pr-1">
                          <span className="text-[9px] text-slate-400 font-semibold block uppercase">Password</span>
                          <span className="font-mono font-bold text-purple-950 text-xs">
                            {visiblePasswords[`uni-${uni.id}`] ? uniCreds.password : '••••••••••••'}
                          </span>
                        </div>
                        <div className="flex items-center shrink-0">
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(`uni-${uni.id}`)}
                            className="p-1 hover:bg-purple-50 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                            title={visiblePasswords[`uni-${uni.id}`] ? 'Hide' : 'Show'}
                          >
                            {visiblePasswords[`uni-${uni.id}`] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(uniCreds.password, `uni-pass-${uni.id}`)}
                            className="p-1 hover:bg-purple-50 text-purple-700 rounded transition-colors cursor-pointer"
                            title="Copy university password"
                          >
                            {copiedField === `uni-pass-${uni.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: ALL INDUSTRY, STARTUP & MSME DETAILS                            */}
      {/* ========================================================================= */}
      {adminTab === 'industries' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-700" />
                <span>Industry, Startup, MSME & Research Institution Directory</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ecosystem partners actively reviewing university research proposals, offering CSR funding, mentoring, and fabrication access.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full self-start sm:self-auto">
              {filteredIndustries.length} Corporate & Tech Partners
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIndustries.map((partner) => {
              const indCreds = getIndustryCredentials(partner);

              return (
                <div key={partner.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        partner.type === 'Industry'
                          ? 'bg-blue-100 text-blue-800'
                          : partner.type === 'Startup'
                          ? 'bg-emerald-100 text-emerald-800'
                          : partner.type === 'MSME'
                          ? 'bg-indigo-100 text-indigo-800'
                          : partner.type === 'Research Institution'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {partner.type}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        {partner.id}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{partner.name}</h4>
                    <span className="text-xs text-amber-800 font-semibold block">{partner.sector}</span>
                    <p className="text-xs text-slate-600 line-clamp-2">{partner.description || partner.csrFocusAreas?.join(', ')}</p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Committed CSR/Grant Pool:</span>
                        <span className="font-extrabold text-emerald-700">
                          ₹{(partner.committedFundingINR / 100000).toFixed(1)} Lakhs
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{partner.email || 'csr@partner.org'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Corporate Officer & Login Credentials Box */}
                  <div className="pt-3 border-t border-amber-100 bg-amber-50/60 -mx-5 -mb-5 p-3.5 rounded-b-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Corporate Login Credentials</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedIndustryForDetails({
                          partner,
                          username: indCreds.username,
                          password: indCreds.password,
                          officerName: indCreds.officerName,
                          officerDesignation: indCreds.officerDesignation,
                          account: indCreds.account
                        })}
                        className="text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-white hover:bg-amber-100 px-2.5 py-1 rounded border border-amber-200 shadow-2xs transition-colors cursor-pointer"
                      >
                        Account Details
                      </button>
                    </div>

                    {/* Who is the officer logging as this company */}
                    <div className="bg-white/90 border border-amber-200 rounded-lg p-2 text-[11px]">
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                        Officer Logging as Company:
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-bold text-slate-900">{indCreds.officerName}</span>
                        <span className="text-[10px] text-amber-900 font-semibold bg-amber-100 px-1.5 py-0.5 rounded">
                          {indCreds.officerDesignation}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Company Username */}
                      <div className="bg-white border border-amber-200 rounded-lg p-2 flex items-center justify-between">
                        <div className="truncate pr-1">
                          <span className="text-[9px] text-slate-400 font-semibold block uppercase">Username</span>
                          <span className="font-mono font-bold text-slate-900 text-xs">{indCreds.username}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(indCreds.username, `ind-user-${partner.id}`)}
                          className="p-1 hover:bg-amber-50 text-amber-700 rounded transition-colors cursor-pointer shrink-0"
                          title="Copy company username"
                        >
                          {copiedField === `ind-user-${partner.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Company Password */}
                      <div className="bg-white border border-amber-200 rounded-lg p-2 flex items-center justify-between">
                        <div className="truncate pr-1">
                          <span className="text-[9px] text-slate-400 font-semibold block uppercase">Password</span>
                          <span className="font-mono font-bold text-amber-950 text-xs">
                            {visiblePasswords[`ind-${partner.id}`] ? indCreds.password : '••••••••••••'}
                          </span>
                        </div>
                        <div className="flex items-center shrink-0">
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(`ind-${partner.id}`)}
                            className="p-1 hover:bg-amber-50 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                            title={visiblePasswords[`ind-${partner.id}`] ? 'Hide' : 'Show'}
                          >
                            {visiblePasswords[`ind-${partner.id}`] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(indCreds.password, `ind-pass-${partner.id}`)}
                            className="p-1 hover:bg-amber-50 text-amber-700 rounded transition-colors cursor-pointer"
                            title="Copy company password"
                          >
                            {copiedField === `ind-pass-${partner.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: WEBSITE MASTER CONTROL CENTER (STATUS OVERRIDES, ASSIGNMENTS) */}
      {/* ========================================================================= */}
      {adminTab === 'master-controls' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Challenge Lifecycle & Status Override Engine */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>State Administrator Master Challenge Control Engine</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Directly override challenge progression status, reassign higher education institutions, or escalate priority.
              </p>
            </div>

            {overrideSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{overrideSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Select Problem Statement to Control *
                </label>
                <select
                  value={selectedChallengeId}
                  onChange={(e) => setSelectedChallengeId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600"
                >
                  {challenges.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.title.slice(0, 70)}... ({c.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Status Card Preview */}
              {targetChallenge && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Current Status:</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase bg-blue-100 text-blue-900">
                      {targetChallenge.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Assigned Institution:</span>
                    <span className="font-semibold text-purple-900">
                      {targetChallenge.assignedUniversity?.name || 'Unassigned / Open'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">District:</span>
                    <span>{targetChallenge.district}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Override Status *
                  </label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 font-bold"
                  >
                    <option value="submitted">Submitted (Intake)</option>
                    <option value="under_review">Under State Review</option>
                    <option value="open">Open for HEI Adoption</option>
                    <option value="assigned_hei">Assigned to HEI</option>
                    <option value="proposal_submitted">Proposal Submitted</option>
                    <option value="prototype_development">Prototype Development</option>
                    <option value="field_testing">Field Testing & Pilot</option>
                    <option value="state_deployed">State Deployed & Scaled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Override Priority *
                  </label>
                  <select
                    value={overridePriority}
                    onChange={(e) => setOverridePriority(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 font-bold"
                  >
                    <option value="critical">Critical (State Priority)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assign University
                  </label>
                  <select
                    value={overrideUniversityId}
                    onChange={(e) => setOverrideUniversityId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    {universitiesList.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Administrative Reason & Directives *
                </label>
                <textarea
                  rows={2}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="e.g. Approved for expedited prototype funding under Chief Minister Societal Innovation Fund..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={isApplyingOverride}
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{isApplyingOverride ? 'Executing State Override...' : 'Apply Administrative Status Override'}</span>
              </button>
            </form>
          </div>

          {/* Right Col: System Master Tools & Directory Export */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-blue-700" />
                <span>Website Master Settings</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-800">Public Challenge Submissions</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    LIVE / OPEN
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-800">AI Triage & Synthesis Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    GEMINI ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-800">Industry CSR Matching</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    ENABLED
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">Export Master Government Data:</span>
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                      officers: officerAccounts,
                      universities: universitiesList,
                      industries: industriesList,
                      challenges: challenges,
                      timestamp: new Date().toISOString()
                    }, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `yukti_marg_master_directory_${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>Download Master Directory (JSON)</span>
                </button>
              </div>
            </div>

            {/* State Innovation Mission Summary */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
              <span className="font-bold text-amber-950 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                State Innovation Mission Directives
              </span>
              <p className="text-amber-900 text-[11px] leading-relaxed">
                All 24 district administrations are mandated to review citizen and panchayat problem submissions within 7 working days and match them with certified Higher Education Institutions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROVISION NEW OFFICER ACCOUNT */}
      {isAddOfficerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#003366] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">Provision New Officer Login Account</h3>
              </div>
              <button onClick={() => setIsAddOfficerModalOpen(false)} className="text-slate-300 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOfficer} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Officer Full Name *</label>
                <input
                  type="text"
                  value={newOfficerName}
                  onChange={(e) => setNewOfficerName(e.target.value)}
                  placeholder="e.g. Smt. Neha Kumari"
                  required
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Username *</label>
                  <input
                    type="text"
                    value={newOfficerUsername}
                    onChange={(e) => setNewOfficerUsername(e.target.value)}
                    placeholder="e.g. bdo_kanke"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Temporary Password *</label>
                  <input
                    type="text"
                    value={newOfficerPassword}
                    onChange={(e) => setNewOfficerPassword(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Designation *</label>
                  <input
                    type="text"
                    value={newOfficerDesignation}
                    onChange={(e) => setNewOfficerDesignation(e.target.value)}
                    placeholder="e.g. Block Development Officer"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Role Type *</label>
                  <select
                    value={newOfficerRole}
                    onChange={(e) => setNewOfficerRole(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded font-semibold"
                  >
                    <option value="government">Government Body / Officer</option>
                    <option value="panchayat">Panchayati Raj / Mukhiya</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">District *</label>
                  <select
                    value={newOfficerDistrict}
                    onChange={(e) => setNewOfficerDistrict(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded font-semibold"
                  >
                    {JHARKHAND_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Department</label>
                  <input
                    type="text"
                    value={newOfficerDepartment}
                    onChange={(e) => setNewOfficerDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={newOfficerEmail}
                    onChange={(e) => setNewOfficerEmail(e.target.value)}
                    placeholder="officer@jharkhand.gov.in"
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={newOfficerPhone}
                    onChange={(e) => setNewOfficerPhone(e.target.value)}
                    placeholder="+91 94311 00000"
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOfficerModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold shadow-xs flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Officer Account Details & Security Credentials */}
      {selectedOfficerForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#002244] to-[#003366] text-white p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    Official Account Security
                  </div>
                  <h3 className="text-lg font-bold text-white">Officer Account Details</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOfficerForDetails(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Officer Profile Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {selectedOfficerForDetails.name}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {selectedOfficerForDetails.designation || 'State Designated Officer'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedOfficerForDetails.role === 'panchayat'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : selectedOfficerForDetails.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200 font-black'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {selectedOfficerForDetails.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-semibold block">Department:</span>
                    <span className="text-slate-800 font-medium">
                      {selectedOfficerForDetails.organization || selectedOfficerForDetails.department || 'Government of Jharkhand'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">District:</span>
                    <span className="text-slate-800 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      {selectedOfficerForDetails.district || 'State HQ (Jharkhand)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border-2 border-blue-200/70 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-950 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>Yukti Marg Official Login Credentials</span>
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                    Active & Verified
                  </span>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>Officer Username</span>
                    <span className="text-[10px] text-slate-400 font-normal">Use this ID on the portal</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border border-blue-300 rounded-lg px-3 py-2 font-mono font-bold text-blue-900 text-sm">
                      {selectedOfficerForDetails.username}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedOfficerForDetails.username || '', 'modal-username')}
                      className="px-3 py-2 bg-white hover:bg-blue-50 border border-blue-300 text-blue-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'modal-username' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-blue-600" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>Official Security Password</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Keep confidential</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-2 font-mono font-bold text-amber-950 text-sm flex items-center justify-between">
                      <span>
                        {showModalPassword ? selectedOfficerForDetails.password : '••••••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowModalPassword(prev => !prev)}
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        title={showModalPassword ? 'Hide password' : 'Show password'}
                      >
                        {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedOfficerForDetails.password || '', 'modal-password')}
                      className="px-3 py-2 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'modal-password' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-700" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Combined Copy Credentials & Reset Actions */}
                <div className="pt-2 border-t border-blue-200 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const credentialsText = `Yukti Marg Jharkhand - Official Login Credentials\nOfficer: ${selectedOfficerForDetails.name} (${selectedOfficerForDetails.designation || 'Officer'})\nDepartment: ${selectedOfficerForDetails.organization || 'Govt of Jharkhand'}\nDistrict: ${selectedOfficerForDetails.district || 'State HQ'}\nRole: ${selectedOfficerForDetails.role}\nUsername: ${selectedOfficerForDetails.username}\nPassword: ${selectedOfficerForDetails.password}`;
                      handleCopy(credentialsText, 'modal-all-creds');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-800 hover:text-blue-950 font-bold underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedField === 'modal-all-creds' ? 'Full Credentials Copied!' : 'Copy Full Login Package'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectedOfficerForDetails.username && handleResetPassword(selectedOfficerForDetails.username)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded text-xs font-bold cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-3 h-3 text-amber-700" />
                    <span>Reset Password</span>
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-slate-600">
                <span className="text-[11px] font-bold text-slate-800 block">Registered Communication Details</span>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOfficerForDetails.email || `${selectedOfficerForDetails.username}@jharkhand.gov.in`}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOfficerForDetails.phone || '+91 94311 XXXXX'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOfficerForDetails(null)}
                className="px-4 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UNIVERSITY INSTITUTIONAL ACCOUNT DETAILS                            */}
      {/* ========================================================================= */}
      {selectedUniForDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-purple-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900 text-white p-5 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg text-purple-300">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">University Institutional Account Details</h3>
                  <p className="text-[11px] text-purple-200">Higher Education & R&D Portal Access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUniForDetails(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Institution Bio */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{selectedUniForDetails.uni.name}</h4>
                    <p className="text-xs text-purple-900 font-semibold">{selectedUniForDetails.uni.type || 'University'} • {selectedUniForDetails.uni.district}, Jharkhand</p>
                  </div>
                  {selectedUniForDetails.uni.nirfRank && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                      NIRF #{selectedUniForDetails.uni.nirfRank}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-purple-200 text-xs text-slate-700 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-900">Nodal Faculty Lead: </span>
                    <span>{selectedUniForDetails.uni.nodalLead}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Incubation Facilities: </span>
                    <span className="text-slate-600">{selectedUniForDetails.uni.incubationFacilities?.join(', ') || 'R&D FabLabs, Prototyping Workshop'}</span>
                  </div>
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-purple-950 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <span>Official University Portal Credentials</span>
                  </span>
                  <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">
                    Active HEI Account
                  </span>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>Institutional Username</span>
                    <span className="text-[10px] text-slate-400 font-normal">Use this ID on the portal</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border border-purple-300 rounded-lg px-3 py-2 font-mono font-bold text-purple-950 text-sm">
                      {selectedUniForDetails.username}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedUniForDetails.username, 'modal-uni-user')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-300 text-purple-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'modal-uni-user' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-purple-700" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>Official Security Password</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Institutional Access</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-2 font-mono font-bold text-amber-950 text-sm flex items-center justify-between">
                      <span>
                        {showModalPassword ? selectedUniForDetails.password : '••••••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowModalPassword(prev => !prev)}
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        title={showModalPassword ? 'Hide password' : 'Show password'}
                      >
                        {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedUniForDetails.password, 'modal-uni-pass')}
                      className="px-3 py-2 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'modal-uni-pass' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-700" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Full Package & Reset */}
                <div className="pt-2 border-t border-purple-200 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Yukti Marg Jharkhand - University Login Credentials\nInstitution: ${selectedUniForDetails.uni.name}\nNodal Lead: ${selectedUniForDetails.uni.nodalLead}\nDistrict: ${selectedUniForDetails.uni.district}\nUsername: ${selectedUniForDetails.username}\nPassword: ${selectedUniForDetails.password}`;
                      handleCopy(text, 'modal-uni-all');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-purple-800 hover:text-purple-950 font-bold underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedField === 'modal-uni-all' ? 'Copied to Clipboard!' : 'Copy Full Credential Package'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetPassword(selectedUniForDetails.username)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded text-xs font-bold cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-3 h-3 text-amber-700" />
                    <span>Reset Password</span>
                  </button>
                </div>
              </div>

              {/* Registered Contact */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-slate-600">
                <span className="text-[11px] font-bold text-slate-800 block">Institutional Registry Details</span>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedUniForDetails.uni.email || `${selectedUniForDetails.username}@jharkhand.gov.in`}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedUniForDetails.uni.contactPhone || '+91 651 2275444'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUniForDetails(null)}
                className="px-4 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INDUSTRIAL PARTNER & COMPANY ACCOUNT DETAILS                         */}
      {/* ========================================================================= */}
      {selectedIndustryForDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-950 via-[#2a1b06] to-[#3d2708] text-white p-5 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400/20 rounded-lg text-amber-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Corporate Partner Account Details</h3>
                  <p className="text-[11px] text-amber-200">Industry, Startup & CSR Innovation Desk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndustryForDetails(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Corporate Identity */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{selectedIndustryForDetails.partner.name}</h4>
                    <p className="text-xs text-amber-900 font-semibold">{selectedIndustryForDetails.partner.sector} • {selectedIndustryForDetails.partner.type}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
                    ₹{(selectedIndustryForDetails.partner.committedFundingINR / 100000).toFixed(1)}L CSR Pool
                  </span>
                </div>

                {/* Who is the officer logging as this company */}
                <div className="pt-2 border-t border-amber-200 text-xs text-slate-800 space-y-1">
                  <span className="font-bold text-amber-950 text-xs block">Officer Logging as Company:</span>
                  <div className="bg-white p-2 rounded-md border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 block">{selectedIndustryForDetails.officerName}</span>
                      <span className="text-[11px] text-slate-500">{selectedIndustryForDetails.officerDesignation}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Authorized Signatory
                    </span>
                  </div>
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Official Corporate Portal Credentials</span>
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                    Active Corporate Account
                  </span>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>Company Username</span>
                    <span className="text-[10px] text-slate-400 font-normal">Use this ID on the portal</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-2 font-mono font-bold text-amber-950 text-sm">
                      {selectedIndustryForDetails.username}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedIndustryForDetails.username, 'modal-ind-user')}
                      className="px-3 py-2 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'modal-ind-user' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-700" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>Official Corporate Security Password</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Keep confidential</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-2 font-mono font-bold text-amber-950 text-sm flex items-center justify-between">
                      <span>
                        {showModalPassword ? selectedIndustryForDetails.password : '••••••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowModalPassword(prev => !prev)}
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        title={showModalPassword ? 'Hide password' : 'Show password'}
                      >
                        {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedIndustryForDetails.password, 'modal-ind-pass')}
                      className="px-3 py-2 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      {copiedField === 'modal-ind-pass' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-700" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Full Package & Reset */}
                <div className="pt-2 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Yukti Marg Jharkhand - Corporate Login Credentials\nCompany: ${selectedIndustryForDetails.partner.name}\nOfficer Logging: ${selectedIndustryForDetails.officerName} (${selectedIndustryForDetails.officerDesignation})\nSector: ${selectedIndustryForDetails.partner.sector}\nUsername: ${selectedIndustryForDetails.username}\nPassword: ${selectedIndustryForDetails.password}`;
                      handleCopy(text, 'modal-ind-all');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedField === 'modal-ind-all' ? 'Copied to Clipboard!' : 'Copy Full Corporate Package'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetPassword(selectedIndustryForDetails.username)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded text-xs font-bold cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-3 h-3 text-amber-700" />
                    <span>Reset Password</span>
                  </button>
                </div>
              </div>

              {/* Registered Contact */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-slate-600">
                <span className="text-[11px] font-bold text-slate-800 block">Corporate Communication Record</span>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedIndustryForDetails.partner.email || `${selectedIndustryForDetails.username}@partner.org`}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedIndustryForDetails(null)}
                className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STATE ADMINISTRATOR IDENTITY DOSSIER                               */}
      {/* ========================================================================= */}
      {isAdminDossierOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-blue-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#001f3f] via-[#002b5c] to-[#003875] text-white p-5 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400 text-slate-950 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">State Administrator Identity Dossier</h3>
                  <p className="text-[11px] text-amber-300">Government of Jharkhand • Supreme Master Authority</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminDossierOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Designated Executive</span>
                    <h4 className="font-extrabold text-slate-900 text-base">{currentUser?.name || 'Dr. Sneha Roy, IAS'}</h4>
                    <p className="text-xs text-blue-900 font-semibold">{currentUser?.designation || 'State Innovation Director & Super Admin'}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full">
                    SUPER ADMIN TIER-1
                  </span>
                </div>

                <div className="pt-2 border-t border-blue-200 text-xs text-slate-700 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-900">Ministry / Dept: </span>
                    <span>{currentUser?.organization || 'Department of Higher & Technical Education, Government of Jharkhand'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Secretariat Jurisdiction: </span>
                    <span className="text-slate-600">Project Bhawan, Dhurwa, Ranchi (State Mantralaya HQ)</span>
                  </div>
                </div>
              </div>

              {/* Master Credentials */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>State Super Admin Master Credentials</span>
                  </span>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                    Root Clearance
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Master Username</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 font-mono font-bold text-amber-300 text-sm">
                      {currentUser?.username || 'admin'}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentUser?.username || 'admin', 'dossier-admin-user')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedField === 'dossier-admin-user' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{copiedField === 'dossier-admin-user' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Master Security Password</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 font-mono font-bold text-amber-300 text-sm flex items-center justify-between">
                      <span>{showAdminDossierPassword ? 'Password@2026' : '••••••••••••'}</span>
                      <button
                        type="button"
                        onClick={() => setShowAdminDossierPassword(prev => !prev)}
                        className="text-slate-400 hover:text-white p-1 cursor-pointer"
                      >
                        {showAdminDossierPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('Password@2026', 'dossier-admin-pass')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedField === 'dossier-admin-pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{copiedField === 'dossier-admin-pass' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Yukti Marg Jharkhand - State Master Administrator Dossier\nOfficer: ${currentUser?.name || 'Dr. Sneha Roy, IAS'}\nDesignation: ${currentUser?.designation || 'State Innovation Director & Super Admin'}\nDepartment: ${currentUser?.organization || 'Dept of Higher & Technical Education'}\nUsername: ${currentUser?.username || 'admin'}\nPassword: Password@2026\nClearance: Super Admin Tier-1`;
                      handleCopy(text, 'dossier-all');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedField === 'dossier-all' ? 'Copied to Clipboard!' : 'Copy Full Admin Identity Package'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAdminDossierOpen(false)}
                className="px-4 py-1.5 bg-[#002244] hover:bg-[#001733] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
