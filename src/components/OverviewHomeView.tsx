import React, { useState } from 'react';
import { Challenge, ThematicCategory, User } from '../types';
import { JHARKHAND_DISTRICTS, THEMATIC_CATEGORIES, UNIVERSITIES, INDUSTRY_PARTNERS } from '../data/mockData';
import { ChallengeCard } from './ChallengeCard';
import { ThemePalette, getTheme } from '../utils/theme';
import { t } from '../utils/translations';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  MapPin, 
  PlusCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BarChart2, 
  ShieldCheck, 
  Search, 
  Filter,
  IndianRupee,
  Layers,
  Award,
  Clock
} from 'lucide-react';

interface OverviewHomeViewProps {
  challenges: Challenge[];
  onSelectChallenge: (c: Challenge) => void;
  onOpenSubmitModal: () => void;
  onNavigateToTab: (tab: any) => void;
  currentUser: User | null;
  lang: 'en' | 'hi';
  theme?: ThemePalette;
}

export const OverviewHomeView: React.FC<OverviewHomeViewProps> = ({
  challenges,
  onSelectChallenge,
  onOpenSubmitModal,
  onNavigateToTab,
  currentUser,
  lang,
  theme = 'emerald',
}) => {
  const themeCfg = getTheme(theme);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate live statistics
  const totalChallenges = challenges.length;
  const activePrototypes = challenges.filter((c) =>
    ['team_constituted', 'proposal_submitted', 'prototype_development', 'pilot_testing', 'deployed'].includes(c.status)
  ).length;
  const totalFundingPledged = challenges.reduce((sum, c) => {
    return sum + c.industryPartners.reduce((pSum, p) => pSum + (p.pledgeAmountINR || 0), 0);
  }, 0);
  const totalImpact = challenges.reduce((sum, c) => sum + (c.estimatedImpactPeople || 0), 0);

  // Filter challenges
  const filteredChallenges = challenges.filter((c) => {
    const matchesDistrict = selectedDistrict === 'All' || c.district === selectedDistrict;
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12" id="overview-home-view">
      {/* Official Government Hero Banner */}
      <section className={`bg-gradient-to-br ${themeCfg.heroGradient} text-slate-900 py-12 px-4 sm:px-8 relative overflow-hidden border-b border-slate-200/80 transition-all duration-300`}>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-3xl">
            <div 
              id="hero-state-innovation-badge"
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${themeCfg.heroBadgeBg} ${themeCfg.heroBadgeText} border ${themeCfg.heroBadgeBorder} uppercase tracking-wider shadow-2xs`}
            >
              <span 
                style={{ borderColor: '#f71515', color: '#ee222a', backgroundColor: '#ff0000' }}
                className="w-2 h-2 rounded-full animate-pulse" 
              />
              State Innovation Mission
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
              Bridging Grassroot Challenges with Academic Research & Industry CSR
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              A state-wide digital initiative by the Government of Jharkhand to crowdsource local societal issues from citizens, Panchayats, and Municipalities, pairing them with student-faculty researchers across 24 Higher Education Institutions and leading industrial enterprises.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenSubmitModal}
                className={`${themeCfg.headerButtonBg} text-white font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]`}
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>Submit a Societal Challenge</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('existing-problem-status');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Existing Problem Status</span>
              </button>

              <button
                onClick={() => onNavigateToTab('ai-doc-tool')}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI Document Categorizer</span>
              </button>

            </div>
          </div>

          {/* Quick Pillar Badge Graphic */}
          <div className="hidden lg:block w-80 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/90 shadow-2xs text-xs space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Yukti Marg Triple-Helix Triad
            </span>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/70">
                <Users className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">1. Citizens & PRIs</span>
                  <span className="text-slate-600 text-[10px]">Direct problem identification at Gram Sabha level</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-purple-50/70 p-2.5 rounded-xl border border-purple-200/70">
                <GraduationCap className="w-4 h-4 text-purple-700 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">2. Universities & HEIs</span>
                  <span className="text-slate-600 text-[10px]">Multidisciplinary student & faculty prototyping</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70">
                <Building2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">3. Industry & Startups</span>
                  <span className="text-slate-600 text-[10px]">CSR grant funding, lab tools & field pilot scale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* State Metric KPIs Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-7 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Challenges
              </span>
              <span className={`text-2xl font-extrabold ${themeCfg.headerText}`}>{totalChallenges}</span>
            </div>
            <div className={`w-10 h-10 rounded-full bg-slate-100 ${themeCfg.headerText} flex items-center justify-center`}>
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                HEI Prototypes
              </span>
              <span className="text-2xl font-extrabold text-purple-700">{activePrototypes}</span>
              <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Across 8 Universities</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                CSR Funding Pledged
              </span>
              <span className="text-2xl font-extrabold text-emerald-700">
                ₹{(totalFundingPledged / 100000).toFixed(1)}L
              </span>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Tata Steel, SAIL, Coal India</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Citizens Impacted
              </span>
              <span className="text-2xl font-extrabold text-amber-600">
                ~{(totalImpact / 1000).toFixed(0)}k+
              </span>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">24 Jharkhand Districts</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Thematic Focus Areas (Problem Statement 26043 Domains) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {lang === 'hi' ? 'राज्य प्राथमिकता नवाचार स्तंभ' : 'State Priority Innovation Pillars'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? 'झारखंड उच्च शिक्षा ढांचे के तहत छात्र एवं संकाय अनुसंधान के लक्षित क्षेत्र' : 'Target areas for student and faculty research under Jharkhand Higher Education framework'}
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('challenges')}
            className={`text-xs font-bold ${themeCfg.headerText} hover:text-amber-600 transition-colors flex items-center gap-1 cursor-pointer`}
          >
            <span>{lang === 'hi' ? 'सभी समस्याएं देखें' : 'View All Challenges'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {THEMATIC_CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedCategory(cat);
                const el = document.getElementById('challenges-search-filter');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-3.5 rounded-xl border text-left transition-all hover:shadow-2xs cursor-pointer ${
                selectedCategory === cat
                  ? `${themeCfg.cardSelectedBg} ${themeCfg.cardSelectedBorder} ${themeCfg.cardSelectedText} shadow-2xs`
                  : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block mb-1">
                {lang === 'hi' ? `डोमेन 0${idx + 1}` : `Domain 0${idx + 1}`}
              </span>
              <h4 className="text-xs font-bold leading-snug line-clamp-2">{t(cat, lang)}</h4>
              <span className={`text-[10px] font-semibold mt-2 inline-block ${
                selectedCategory === cat ? themeCfg.cardSelectedText : themeCfg.headerText
              }`}>
                {challenges.filter((c) => c.category === cat).length} {lang === 'hi' ? 'समस्याएं →' : 'Challenges →'}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Search, District Filter & Challenge Grid - Existing Problem Status */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-4" id="existing-problem-status">
        {/* Section Header: Existing Problem Status */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'hi' ? 'सार्वजनिक समस्या निर्देशिका' : 'Public Problem Directory'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'hi' ? 'मौजूदा समस्या स्थिति एवं लाइव प्रगति' : 'Existing Problem Status & Live Progress'}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {lang === 'hi' 
                ? "नागरिक और समुदाय के सदस्य झारखंड के सभी 24 जिलों की सामाजिक समस्याओं और उनकी वर्तमान 5-चरणीय नवाचार प्रगति की समीक्षा कर सकते हैं। सभी रिकॉर्ड आधिकारिक रूप से सत्यापित हैं।"
                : "Citizens and community members can review all existing societal challenges across Jharkhand's 24 districts along with their current 5-stage innovation status. All status records are verified and read-only."
              }
            </p>
          </div>
          <div className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{lang === 'hi' ? 'सार्वजनिक स्थिति ट्रैकिंग (सत्यापित)' : 'Read-Only Public Status Tracking'}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3" id="challenges-search-filter">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={lang === 'hi' ? 'कीवर्ड, ज़िला (उदा. पलामू, दुमका), ट्रैकिंग आईडी या तकनीक से खोजें...' : 'Search by keywords, district (e.g. Palamu, Dumka), tracking ID, or technology...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden transition-colors"
            />
          </div>

          {/* District filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'hi' ? 'ज़िला:' : 'District:'}</span>
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white focus:outline-hidden transition-colors"
            >
              <option value="All">{lang === 'hi' ? 'सभी 24 ज़िले' : 'All 24 Districts'}</option>
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {t(d, lang)}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold whitespace-nowrap">
              <Filter className={`w-3.5 h-3.5 ${themeCfg.headerText}`} />
              <span>{lang === 'hi' ? 'श्रेणी / डोमेन:' : 'Category / Domain:'}</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white max-w-[200px] focus:outline-hidden transition-colors"
            >
              <option value="All">{lang === 'hi' ? 'सभी श्रेणियां / डोमेन' : 'All Categories / Domains'}</option>
              {THEMATIC_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(c, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count & Active Filters */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            {lang === 'hi' ? (
              <>
                दिखाया जा रहा है <strong>{filteredChallenges.length}</strong> / {challenges.length} समस्याएं
                {selectedDistrict !== 'All' && ` (${t(selectedDistrict, lang)})`}
                {selectedCategory !== 'All' && ` [${t(selectedCategory, lang)}]`}
              </>
            ) : (
              <>
                Showing <strong>{filteredChallenges.length}</strong> of {challenges.length} societal challenges
                {selectedDistrict !== 'All' && ` in ${selectedDistrict}`}
                {selectedCategory !== 'All' && ` under ${selectedCategory}`}
              </>
            )}
          </span>

          {(selectedDistrict !== 'All' || selectedCategory !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDistrict('All');
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-amber-700 font-semibold hover:underline cursor-pointer"
            >
              {lang === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
            </button>
          )}
        </div>

        {/* Challenge Cards Grid */}
        {filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onSelect={onSelectChallenge}
                lang={lang}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-2xs">
            <p className="text-sm font-bold text-slate-800">No challenges matched your query</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Try clearing your filters or submit a new challenge.</p>
            <button
              onClick={onOpenSubmitModal}
              className={`px-4 py-2 ${themeCfg.headerButtonBg} text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer`}
            >
              + Submit New Challenge
            </button>
          </div>
        )}
      </section>

      {/* University & Industry Partners Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Higher Education & Industry Co-Solving Network
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Participating institutions offering faculty mentorship, incubation labs, and CSR co-funding
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {UNIVERSITIES.slice(0, 6).map((uni) => (
            <div
              key={uni.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-2xs text-center flex flex-col items-center justify-between transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-800 flex items-center justify-center font-bold text-xs mb-1.5">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">{uni.name.split('(')[0]}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{uni.location}</span>
              <span className="text-[10px] text-purple-700 font-semibold mt-1">
                {uni.activeProjects} Active Teams
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
