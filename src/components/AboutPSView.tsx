import React from 'react';
import { 
  Info, 
  ShieldCheck, 
  Target, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AboutPSViewProps {
  onNavigateTab: (tab: any) => void;
}

export const AboutPSView: React.FC<AboutPSViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8" id="about-problem-statement">
      {/* Official Government Mandate Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Official Problem Statement Dossier • ID: 26043
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          A digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships
        </h1>
        <p className="text-sm font-semibold text-emerald-800 mt-2">
          Department of Higher & Technical Education, Government of Jharkhand
        </p>
      </div>

      {/* Core Background & Rationale */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          Problem Background in Jharkhand
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
          Communities across Jharkhand encounter numerous local challenges related to education, healthcare, agriculture, water management (fluoride/arsenic contamination), sanitation, environment, rural livelihoods (NTFP, lac, tasar silk), accessibility, urban infrastructure, and public service delivery.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
          While citizens and local governance bodies (Panchayati Raj Institutions and Urban Local Bodies) are often the first to identify these issues, there has historically been no structured state mechanism through which they can submit such problems for systematic evaluation and innovation-driven resolution.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
          At the same time, Higher Education Institutions (HEIs) across Jharkhand—such as BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, Birsa Agricultural University, and RIMS—possess deep research capabilities and large pools of talented students capable of building practical solutions. Furthermore, industries like Tata Steel, SAIL, Coal India, and MSMEs possess technical expertise, financial CSR resources, and deployment capacity.
        </p>
      </div>

      {/* The Triple-Helix Solution Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#faf6ee] p-5 rounded-xl border border-emerald-200/70 space-y-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h4 className="text-sm font-bold text-emerald-950">Crowdsourced Ingestion</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Citizens, Mukhiyas, and Municipalities submit ground issues. Built-in AI auto-detects thematic categories, synthesizes problem abstracts, and extracts root causes.
          </p>
        </div>

        <div className="bg-purple-50/60 p-5 rounded-xl border border-purple-200 space-y-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h4 className="text-sm font-bold text-purple-950">University Research Teams</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eligible HEI departments are matched. Faculty mentors form multidisciplinary student innovator cohorts under NEP 2020 experiential learning frameworks.
          </p>
        </div>

        <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200 space-y-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h4 className="text-sm font-bold text-amber-950">Industry CSR & Deployment</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Corporations pledge Section 135 CSR grants, share incubation FabLabs, and validate student prototypes in live Jharkhand village pilot environments.
          </p>
        </div>
      </div>

      {/* NEP 2020 Alignment Card */}
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-white p-6 rounded-xl shadow-sm space-y-3">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
          National Education Policy (NEP 2020) Mandate
        </span>
        <h3 className="text-lg font-bold">
          Transforming Higher Education into Community Problem Solvers
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          Yukti Marg directly operationalizes the NEP 2020 directive for community engagement and multidisciplinary problem solving. Student fellows earn formal experiential learning credits, participate in institutional incubation cells, and co-author patents with faculty and industry mentors.
        </p>
      </div>

      {/* Quick Links */}
      <div className="pt-4 flex flex-wrap gap-3">
        <button
          onClick={() => onNavigateTab('submit')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <span>Submit a Challenge to the Portal</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </button>

        <button
          onClick={() => onNavigateTab('ai-doc-tool')}
          className="border border-slate-300 hover:bg-slate-50 text-slate-800 px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Test the AI Document Intelligence Tool</span>
        </button>
      </div>
    </div>
  );
};
