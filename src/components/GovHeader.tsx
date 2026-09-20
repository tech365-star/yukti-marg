import React from 'react';
import { User, UserRole } from '../types';
import { ThemePalette, getTheme } from '../utils/theme';
import { YuktiMargLogo } from './YuktiMargLogo';
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe2, 
  UserCheck, 
  LogOut, 
  LogIn, 
  FileText, 
  Eye, 
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Moon,
  Sun,
  Landmark,
  User as UserIcon,
  GraduationCap,
  Bell,
  Briefcase,
  Palette
} from 'lucide-react';

interface GovHeaderProps {
  currentUser: User | null;
  onOpenLogin: (defaultRole?: UserRole | 'departmental' | 'industrial' | 'administration') => void;
  onLogout: () => void;
  onSwitchRole?: (role: UserRole) => void;
  fontSize?: 'normal' | 'large' | 'larger';
  setFontSize?: (size: 'normal' | 'large' | 'larger') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  lang: 'en' | 'hi';
  setLang: (l: 'en' | 'hi') => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  theme?: ThemePalette;
  setTheme?: (theme: ThemePalette) => void;
  onThemeChange?: (theme: ThemePalette) => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onSwitchRole,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  lang,
  setLang,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  theme = 'emerald',
  setTheme,
  onThemeChange,
}) => {
  const handleThemeChange = (newTheme: ThemePalette) => {
    setTheme?.(newTheme);
    onThemeChange?.(newTheme);
  };
  const themeCfg = getTheme(theme);

  return (
    <header className="w-full select-none" id="gov-header-wrapper">
      {/* Top Accessibility & Official Helpline Bar */}
      <div className={`${themeCfg.topBarBg} ${themeCfg.topBarText} text-xs py-2 px-4 sm:px-8 border-b ${themeCfg.topBarBorder} transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Official Government of Jharkhand Statement */}
          <div className="flex items-center space-x-2.5 text-[11px] text-slate-700">
            <span className="flex items-center gap-1.5 font-extrabold tracking-wider text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse shadow-xs"></span>
              {lang === 'en' ? 'GOVERNMENT OF JHARKHAND' : 'झारखंड सरकार'}
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-600 hidden sm:inline text-[11px] font-medium">
              {lang === 'en' ? 'Department of Higher & Technical Education' : 'उच्च एवं तकनीकी शिक्षा विभाग'}
            </span>
          </div>

          {/* Right: Theme Selector, Toll Free, Dark/Light Mode & Language Toggle */}
          <div className="flex items-center space-x-2.5 text-[11px] flex-wrap">
            {/* Theme / Colour Palette Switcher */}
            {setTheme && (
              <div 
                className="flex items-center gap-1.5 bg-white/80 border border-slate-200/90 shadow-2xs rounded-md p-1 px-2 text-[11px]"
                id="gov-theme-color-selector"
              >
                <div className="flex items-center gap-1 text-stone-600 text-[10px] font-bold">
                  <Palette className="w-3 h-3 text-emerald-700" />
                  <span className="hidden lg:inline">{lang === 'en' ? 'Palette:' : 'रंग:'}</span>
                </div>
                <button
                  onClick={() => handleThemeChange('emerald')}
                  title="Jharkhand Forest Emerald"
                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer border ${
                    theme === 'emerald' ? 'ring-2 ring-emerald-600 scale-110 border-white' : 'border-stone-300 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: '#059669' }}
                />
                <button
                  onClick={() => handleThemeChange('beige')}
                  title="Warm Sandstone Beige"
                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer border ${
                    theme === 'beige' ? 'ring-2 ring-amber-700 scale-110 border-white' : 'border-stone-300 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: '#b4916c' }}
                />
                <button
                  onClick={() => handleThemeChange('cream')}
                  title="Royal Ivory Cream"
                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer border ${
                    theme === 'cream' ? 'ring-2 ring-emerald-700 scale-110 border-white' : 'border-stone-300 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: '#e0cfa9' }}
                />
                <button
                  onClick={() => handleThemeChange('slate')}
                  title="Earth Stone & Moss"
                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer border ${
                    theme === 'slate' ? 'ring-2 ring-stone-700 scale-110 border-white' : 'border-stone-300 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: '#78716c' }}
                />
              </div>
            )}

            {/* Toll Free Helpline */}
            <div className="flex items-center gap-1.5 text-slate-700 bg-white/80 px-2.5 py-1 rounded-md border border-slate-200/90 shadow-2xs">
              <Phone className="w-3 h-3 text-emerald-700" />
              <span className="font-bold tracking-wide text-[11px]">1800-345-6544</span>
            </div>

            {/* Dark & Light Button */}
            <div className="flex items-center border border-slate-200/90 rounded-md bg-white/80 p-0.5 text-[11px] shadow-2xs">
              <button
                onClick={() => setHighContrast(false)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all cursor-pointer ${
                  !highContrast
                    ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Light Mode"
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setHighContrast(true)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all cursor-pointer ${
                  highContrast
                    ? 'bg-slate-800 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
            </div>

            {/* Language toggle */}
            <div className="flex items-center border border-slate-200/90 rounded-md bg-white/80 overflow-hidden text-[11px] shadow-2xs" id="gov-header-language-toggle">
              <button
                id="gov-header-lang-en"
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white'
                }`}
                title="Switch portal language to English"
              >
                <span>English</span>
              </button>
              <button
                id="gov-header-lang-hi"
                type="button"
                data-keep-hindi="true"
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'hi'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white'
                }`}
                title="पोर्टल की भाषा हिन्दी में बदलें (Switch to Hindi)"
              >
                <span data-keep-hindi="true">हिन्दी</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delicate National Tricolor Accent Bar */}
      <div className="h-[3px] bg-gradient-to-r from-amber-500 via-white to-emerald-600 w-full" />

      {/* Main Header Container */}
      <div className="bg-white border-b border-slate-200/90 py-3.5 px-4 sm:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left: Official Emblem & Portal Title */}
          <div className="flex items-center space-x-3.5 sm:space-x-4">
            {/* Emblem representation */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs flex-shrink-0 overflow-hidden hover:border-slate-300 transition-colors">
              <YuktiMargLogo className="w-full h-full object-contain" />
            </div>

            {/* Portal Titles */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className={`text-2xl sm:text-3xl font-extrabold ${themeCfg.headerText} tracking-tight flex items-center gap-2`} id="gov-header-main-heading">
                  <span className={`font-extrabold ${themeCfg.headerText}`} id="heading-yukti-marg-hindi" data-keep-hindi="true">युक्ति मार्ग</span>
                  <span className="text-slate-300 font-light">|</span>
                  <span className="text-slate-800 font-bold" id="heading-yukti-marg-english" data-keep-english="true">Yukti Marg</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/90" id="gov-header-state-portal-badge">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'hi' ? 'आधिकारिक राज्य पोर्टल' : 'Official State Portal'}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                {lang === 'hi' 
                  ? 'सामाजिक नवाचार एवं उच्च शिक्षण संस्थान सहभागिता मंच'
                  : 'Societal Innovation & Higher Education Collaboration Portal'}
              </p>
              <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
                {lang === 'hi'
                  ? 'झारखंड सरकार • राष्ट्रीय शिक्षा नीति (NEP 2020) सामाजिक नवाचार पहल'
                  : 'Government of Jharkhand • NEP 2020 Experiential Social Innovation Initiative'}
              </p>
            </div>
          </div>

          {/* Right: User Role & Login Switcher */}
          <div className="flex items-center flex-wrap gap-2 self-stretch md:self-auto justify-end">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-200 rounded-xl p-2 pl-3.5 shadow-2xs">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      currentUser.role === 'panchayat'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : currentUser.role === 'government'
                        ? 'bg-[#f4efe4] text-emerald-950 border border-[#ded5c2]'
                        : currentUser.role === 'citizen'
                        ? 'bg-stone-100 text-stone-800 border border-stone-200'
                        : currentUser.role === 'university'
                        ? 'bg-[#fbf7ee] text-stone-800 border border-stone-200'
                        : currentUser.role === 'industry'
                        ? 'bg-[#f6ede1] text-amber-950 border border-[#e2d4c0]'
                        : 'bg-stone-100 text-stone-800 border border-stone-200'
                    }`}>
                      {currentUser.role === 'panchayat'
                        ? `🏛️ PRI: ${currentUser.designation || 'Mukhiya'}`
                        : currentUser.role === 'government'
                        ? `🏢 Gov: ${currentUser.designation || 'Officer'}`
                        : currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 max-w-[220px] truncate">
                    {currentUser.organization || currentUser.district}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200/90 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Sign Out of Session"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span className="font-semibold text-[11px]">{lang === 'hi' ? 'साइन आउट' : 'Sign Out'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center flex-wrap gap-1.5">
                {/* 1. Citizen Login (Prominent Primary Button) */}
                <button
                  id="gov-header-login-btn"
                  onClick={() => onOpenLogin('citizen')}
                  className={`inline-flex items-center gap-1.5 ${themeCfg.headerButtonBg} text-white px-3.5 py-2 rounded-lg font-bold text-xs transition-all shadow-xs cursor-pointer border border-black/10 active:scale-[0.98]`}
                  title="Citizen Contributor Login"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span id="gov-header-login-text">{lang === 'hi' ? 'नागरिक लॉगिन' : 'Citizen Login'}</span>
                </button>

                {/* 2. Departmental & Officer Login */}
                <button
                  id="header-departmental-login-btn"
                  onClick={() => onOpenLogin('departmental')}
                  className={`inline-flex items-center gap-1.5 bg-white hover:bg-[#faf6ee] text-stone-700 ${themeCfg.headerHoverText} px-3 py-2 rounded-lg font-semibold text-xs transition-all border border-stone-200 hover:border-stone-300 shadow-2xs cursor-pointer`}
                  title="Government Officer & Departmental Login"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'hi' ? 'अधिकारी लॉगिन' : 'Officer Login'}</span>
                </button>

                {/* 3. University / HEI Login */}
                <button
                  id="header-university-login-btn"
                  onClick={() => onOpenLogin('university')}
                  className={`inline-flex items-center gap-1.5 bg-white hover:bg-[#faf6ee] text-stone-700 ${themeCfg.headerHoverText} px-3 py-2 rounded-lg font-semibold text-xs transition-all border border-stone-200 hover:border-stone-300 shadow-2xs cursor-pointer`}
                  title="University & Higher Education Institution Login"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{lang === 'hi' ? 'विश्वविद्यालय लॉगिन' : 'University Login'}</span>
                </button>

                {/* 4. Industrial Partner Login */}
                <button
                  id="header-industrial-login-btn"
                  onClick={() => onOpenLogin('industrial')}
                  className={`inline-flex items-center gap-1.5 bg-white hover:bg-[#faf6ee] text-stone-700 ${themeCfg.headerHoverText} px-3 py-2 rounded-lg font-semibold text-xs transition-all border border-stone-200 hover:border-stone-300 shadow-2xs cursor-pointer`}
                  title="Industrial, Startup & CSR Login"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === 'hi' ? 'उद्योग लॉगिन' : 'Industry Login'}</span>
                </button>

                {/* 5. Administration Login */}
                <button
                  id="header-administration-login-btn"
                  onClick={() => onOpenLogin('administration')}
                  className={`inline-flex items-center gap-1.5 bg-white hover:bg-[#faf6ee] text-stone-700 ${themeCfg.headerHoverText} px-3 py-2 rounded-lg font-semibold text-xs transition-all border border-stone-200 hover:border-stone-300 shadow-2xs cursor-pointer`}
                  title="State Government Master Administrator Login"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'hi' ? 'प्रशासन लॉगिन' : 'Admin Login'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Government Scrolling Notice Bar */}
      <div className="bg-[#faf6ee] border-b border-stone-200/80 px-4 sm:px-8 py-2 text-xs text-stone-700 flex items-center gap-3 overflow-hidden">
        <span 
          style={{ backgroundColor: '#e96e87', color: '#ffffff' }}
          className={`${themeCfg.badgeBg} ${themeCfg.badgeText} text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1.5 shadow-2xs border border-stone-200/80`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>{lang === 'hi' ? 'नवीनतम सूचनाएं' : 'LATEST NOTICES'}</span>
        </span>
        <div className="truncate text-stone-700 font-medium">
          <span 
            style={{ color: '#e61010' }}
            className={`${themeCfg.headerText} font-bold`}
          >
            {lang === 'hi' 
              ? 'एनईपी 2020 सामाजिक नवाचार अनुसंधान अनुदान 2026-27' 
              : 'NEP 2020 Social Challenge Research Grants 2026-27'}
          </span>
          {lang === 'hi'
            ? ': झारखंड के सभी 24 ज़िलों के उच्च शिक्षण संस्थानों को छात्र-शिक्षक परियोजना दल गठित करने हेतु आमंत्रित किया जाता है। टाटा स्टील, सेल और सीसीएल द्वारा ₹1.4 करोड़ से अधिक सीएसआर सह-अनुदान स्वीकृत।'
            : ': Higher Education Institutions across all 24 Jharkhand districts invited to constitute student-faculty project teams for live societal challenges. Over ₹1.4 Cr in CSR co-funding pledged by Tata Steel, SAIL, and CCL.'}
        </div>
      </div>
    </header>
  );
};
