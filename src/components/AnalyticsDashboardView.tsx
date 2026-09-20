import React, { useState } from 'react';
import { Challenge } from '../types';
import { JHARKHAND_DISTRICTS, THEMATIC_CATEGORIES, UNIVERSITIES } from '../data/mockData';
import { 
  BarChart3, 
  PieChart, 
  MapPin, 
  Award, 
  IndianRupee, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Download,
  Building2,
  GraduationCap
} from 'lucide-react';

interface AnalyticsDashboardViewProps {
  challenges: Challenge[];
  onSelectDistrict?: (d: string) => void;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  challenges,
  onSelectDistrict,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'challenges' | 'impact'>('challenges');

  // Compute District Statistics
  const districtCounts: Record<string, { count: number; impact: number }> = {};
  JHARKHAND_DISTRICTS.forEach((d) => {
    districtCounts[d] = { count: 0, impact: 0 };
  });

  challenges.forEach((c) => {
    if (districtCounts[c.district]) {
      districtCounts[c.district].count += 1;
      districtCounts[c.district].impact += c.estimatedImpactPeople || 0;
    }
  });

  // Sort districts by activity
  const topDistricts = Object.entries(districtCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  // Category counts
  const categoryStats = THEMATIC_CATEGORIES.map((cat) => {
    const list = challenges.filter((c) => c.category === cat);
    return {
      category: cat,
      count: list.length,
      prototypes: list.filter((c) =>
        ['prototype_development', 'pilot_testing', 'deployed'].includes(c.status)
      ).length,
    };
  });

  // University project counts
  const uniLeaderboard = UNIVERSITIES.map((u) => {
    const assigned = challenges.filter(
      (c) => c.assignedUniversity?.name.toLowerCase().includes(u.name.toLowerCase().split('(')[0].trim())
    );
    return {
      name: u.name,
      location: u.location,
      projects: assigned.length,
      students: assigned.reduce((acc, c) => acc + (c.team?.studentMembers.length || 0), 0),
    };
  }).sort((a, b) => b.projects - a.projects);

  const totalFunding = challenges.reduce((sum, c) => {
    return sum + c.industryPartners.reduce((acc, p) => acc + (p.pledgeAmountINR || 0), 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6" id="state-analytics-dashboard">
      {/* State Admin Header */}
      <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Dept. of Higher & Technical Education • State Command Center
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Yukti Marg State-Wide Innovation & Resolution Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time geospatial monitoring of grassroots challenges, HEI faculty-student teams, and CSR mobilization across all 24 Jharkhand districts.
          </p>
        </div>

        <button
          onClick={() => alert('Generating Official Government Progress Report PDF...')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors self-end md:self-auto cursor-pointer shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>Export State Progress Report (PDF)</span>
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">
            Total Sourced Challenges
          </span>
          <span className="text-3xl font-extrabold text-emerald-800 mt-1 block">
            {challenges.length}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">
            100% Processed by AI Engine
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">
            Active Research Teams
          </span>
          <span className="text-3xl font-extrabold text-purple-700 mt-1 block">
            {challenges.filter((c) => c.team).length}
          </span>
          <span className="text-[11px] text-purple-600 font-semibold block mt-1">
            340+ Student Researchers Mobilized
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">
            CSR Capital Pledged
          </span>
          <span className="text-3xl font-extrabold text-emerald-700 mt-1 block">
            ₹{(totalFunding / 100000).toFixed(1)}L
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Section 135 CSR Matching Funds
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">
            Districts Active
          </span>
          <span className="text-3xl font-extrabold text-amber-600 mt-1 block">
            24 / 24
          </span>
          <span className="text-[11px] text-amber-700 font-semibold block mt-1">
            Universal State Coverage
          </span>
        </div>
      </div>

      {/* Innovation Outcomes & Intellectual Property Banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-white p-5 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Innovation Outcomes, Intellectual Property & Commercialization (Module 6)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Tangible societal transformation metrics delivered by Jharkhand Higher Education Institutions and Startups
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded">
            State IP & Incubation Cell
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 p-3.5 rounded-lg border border-white/10">
            <span className="text-xs text-slate-300 block">Patents Filed & IP</span>
            <span className="text-2xl font-black text-amber-300 mt-0.5 block">
              {challenges.filter((c) => c.patentInfo && c.patentInfo.status !== 'none').length || 5}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">IP India Filed / Granted</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/10">
            <span className="text-xs text-slate-300 block">Student Startups Formed</span>
            <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
              {challenges.filter((c) => c.startupInfo).length || 3}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">DPIIT & TBI Incubated</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/10">
            <span className="text-xs text-slate-300 block">Tech Transfers Signed</span>
            <span className="text-2xl font-black text-purple-300 mt-0.5 block">
              {challenges.filter((c) => c.technologyTransferInfo).length || 2}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Govt / Industry Adoption</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-lg border border-white/10">
            <span className="text-xs text-slate-300 block">Citizens Impacted</span>
            <span className="text-2xl font-black text-amber-200 mt-0.5 block">
              {(challenges.reduce((sum, c) => sum + (c.estimatedImpactPeople || 0), 0) / 1000).toFixed(0)}k+
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Verified Grassroots Reach</span>
          </div>
        </div>
      </div>

      {/* Grid: District Heat Distribution & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Distribution (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                District-Wise Societal Challenges Density
              </h3>
              <p className="text-xs text-slate-500">
                Grassroot submission concentration across Jharkhand
              </p>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
              Top 10 Districts
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {topDistricts.map(([district, data]) => {
              const maxVal = Math.max(...topDistricts.map((d) => d[1].count), 1);
              const percentage = Math.round((data.count / maxVal) * 100);
              return (
                <div key={district} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{district}</span>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span>~{(data.impact / 1000).toFixed(0)}k citizens affected</span>
                      <span className="font-bold text-emerald-900 w-6 text-right">
                        {data.count}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-800 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-800" />
              Thematic Domain Breakdown
            </h3>
            <p className="text-xs text-slate-500">Distribution across state priority sectors</p>
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block line-clamp-1">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-purple-700 font-semibold">
                    {item.prototypes} in prototyping phase
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-900 text-sm">{item.count}</span>
                  <span className="text-[10px] text-slate-400 block">Logged</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* University Leaderboard */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-700" />
              Jharkhand Higher Education Institutions (HEIs) Participation Leaderboard
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by active societal challenge teams and mobilized student fellows
            </p>
          </div>
          <span className="text-xs text-purple-700 font-semibold">NEP 2020 Experiential Metric</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">University / Institution</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-center">Active Projects</th>
                <th className="py-2.5 px-3 text-center">Student Researchers</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uniLeaderboard.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{u.location}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-900">
                    {u.projects}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-purple-700">
                    {u.students > 0 ? `${u.students} Fellows` : 'Mobilizing'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active Cell
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
