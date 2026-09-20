import React, { useState } from 'react';
import { Challenge, Milestone, User } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Award, 
  Layers, 
  ShieldCheck, 
  FlaskConical, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  GraduationCap, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Download, 
  Users,
  Calendar,
  MapPin
} from 'lucide-react';

interface ProjectLifecycleViewProps {
  challenges: Challenge[];
  currentUser: User | null;
  onUpdateChallenge: (c: Challenge) => void;
  onSelectChallenge: (c: Challenge) => void;
  onAddNotification?: (notif: any) => void;
}

export const ProjectLifecycleView: React.FC<ProjectLifecycleViewProps> = ({
  challenges,
  currentUser: _currentUser,
  onUpdateChallenge: _onUpdateChallenge,
  onSelectChallenge: _onSelectChallenge,
}) => {
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('All');
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(challenges[0]?.id || null);

  // Filter challenges by stage
  const filtered = challenges.filter((c) => {
    if (selectedStageFilter === 'All') return true;
    if (selectedStageFilter === 'stage1') return c.status === 'submitted' || c.status === 'under_review';
    if (selectedStageFilter === 'stage2') return c.status === 'assigned_hei';
    if (selectedStageFilter === 'stage3') return c.status === 'team_constituted' || c.status === 'proposal_submitted';
    if (selectedStageFilter === 'stage4') return c.status === 'prototype_development' || c.status === 'pilot_testing';
    if (selectedStageFilter === 'stage5') return c.status === 'deployed';
    return true;
  });

  // Calculate high-level lifecycle metrics
  const totalProjects = challenges.length;
  const inFieldPilots = challenges.filter((c) => c.status === 'pilot_testing' || c.prototypeTesting?.testedInField).length;
  const fullyDeployed = challenges.filter((c) => c.status === 'deployed').length;
  const totalPatents = challenges.filter((c) => c.patentInfo && c.patentInfo.status !== 'none').length;
  const startupsCount = challenges.filter((c) => c.startupInfo).length + 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6" id="project-lifecycle-view">
      {/* Module Banner */}
      <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Stage 5 • Project Lifecycle Management System
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Milestone Tracking, Deliverables, Approvals, Testing & IP Generation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              End-to-end monitoring of multi-institutional innovation workflows: track milestone deliverables, government stage approvals, field testing outcomes in Panchayats, intellectual property generation (patents & papers), and technology transfer to public agencies or startups.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-emerald-800 font-semibold flex items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Real-Time Audit Trail
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Monitored Projects
          </span>
          <span className="text-2xl font-extrabold text-emerald-800 mt-0.5 block">
            {totalProjects}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            Across 24 Districts
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Field Pilots Active
          </span>
          <span className="text-2xl font-extrabold text-amber-600 mt-0.5 block">
            {inFieldPilots}
          </span>
          <span className="text-[11px] text-amber-800 font-semibold block mt-0.5">
            Panchayat Field Testing
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            State Deployments
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-0.5 block">
            {fullyDeployed}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
            Full Community Scale
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Patents & IP Filed
          </span>
          <span className="text-2xl font-extrabold text-purple-700 mt-0.5 block">
            {totalPatents}
          </span>
          <span className="text-[11px] text-purple-700 font-semibold block mt-0.5">
            Joint HEI-Gov Filings
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider block">
            Startups & Tech Xfers
          </span>
          <span className="text-2xl font-extrabold text-emerald-800 mt-0.5 block">
            {startupsCount}
          </span>
          <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">
            Commercialized Spin-offs
          </span>
        </div>
      </div>

      {/* Stage Filter Buttons */}
      <div className="bg-white p-2 rounded-xl border border-stone-200 flex flex-wrap gap-1.5 shadow-xs">
        <button
          onClick={() => setSelectedStageFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            selectedStageFilter === 'All' ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-[#faf6ee]'
          }`}
        >
          All Stages ({challenges.length})
        </button>
        <button
          onClick={() => setSelectedStageFilter('stage1')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            selectedStageFilter === 'stage1' ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-[#faf6ee]'
          }`}
        >
          Stage 1: Inception & Screening
        </button>
        <button
          onClick={() => setSelectedStageFilter('stage2')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            selectedStageFilter === 'stage2' ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-[#faf6ee]'
          }`}
        >
          Stage 2: HEI Allocation
        </button>
        <button
          onClick={() => setSelectedStageFilter('stage3')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            selectedStageFilter === 'stage3' ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-[#faf6ee]'
          }`}
        >
          Stage 3: Proposal & Approvals
        </button>
        <button
          onClick={() => setSelectedStageFilter('stage4')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            selectedStageFilter === 'stage4' ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-[#faf6ee]'
          }`}
        >
          Stage 4: Prototyping & Field Testing
        </button>
        <button
          onClick={() => setSelectedStageFilter('stage5')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            selectedStageFilter === 'stage5' ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-[#faf6ee]'
          }`}
        >
          Stage 5: Deployment & IP
        </button>
      </div>

      {/* Projects Lifecycle List */}
      <div className="space-y-4">
        {filtered.map((challenge) => {
          const isExpanded = expandedChallengeId === challenge.id;
          const completedMilestones = challenge.milestones.filter((m) => m.status === 'completed' || m.status === 'verified_by_gov').length;
          const progressPercent = Math.round((completedMilestones / Math.max(challenge.milestones.length, 1)) * 100);

          return (
            <div
              key={challenge.id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-300 transition-all"
            >
              {/* Project Card Header */}
              <div
                onClick={() => setExpandedChallengeId(isExpanded ? null : challenge.id)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#faf8f5] select-none"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-900 bg-[#faf6ee] px-2.5 py-0.5 rounded border border-emerald-200">
                      {challenge.code}
                    </span>

                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      challenge.status === 'deployed' ? 'bg-emerald-100 text-emerald-800' :
                      challenge.status === 'pilot_testing' ? 'bg-amber-100 text-amber-900' :
                      challenge.status === 'prototype_development' ? 'bg-emerald-100 text-emerald-900' :
                      'bg-stone-100 text-stone-800'
                    }`}>
                      {challenge.status.replace('_', ' ')}
                    </span>

                    <span className="text-xs text-stone-500 font-medium">
                      {challenge.district} • {challenge.blockOrPanchayat}
                    </span>

                    {challenge.assignedUniversity && (
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                        {challenge.assignedUniversity.name.split('(')[0]}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-stone-900 leading-snug">
                    {challenge.title}
                  </h3>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 pt-1 max-w-md">
                    <div className="flex-1 bg-stone-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          progressPercent === 100 ? 'bg-emerald-600' : 'bg-emerald-700'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-stone-700 shrink-0">
                      {progressPercent}% Complete ({completedMilestones}/{challenge.milestones.length})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Target Beneficiaries
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {(challenge.estimatedImpactPeople || 0).toLocaleString('en-IN')} Citizens
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Deep Lifecycle Details */}
              {isExpanded && (
                <div className="border-t border-stone-200 p-5 bg-[#faf8f5] space-y-6">
                  {/* 3-Column Detailed Section: Milestones & Deliverables / Approvals / Testing & IP */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Milestones & Deliverables Tracker */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
                      <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
                        <Layers className="w-4 h-4 text-emerald-700" />
                        Milestones & Technical Deliverables
                      </h4>

                      <div className="space-y-2.5">
                        {challenge.milestones.map((m, idx) => (
                          <div
                            key={m.id || idx}
                            className={`p-2.5 rounded-lg border text-xs ${
                              m.status === 'completed' || m.status === 'verified_by_gov'
                                ? 'bg-emerald-50/60 border-emerald-200 text-stone-800'
                                : 'bg-[#faf8f5] border-stone-200 text-stone-600'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold flex items-center gap-1.5">
                                {m.status === 'completed' || m.status === 'verified_by_gov' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                )}
                                <span>{m.title}</span>
                              </div>
                              <span className="text-[10px] font-semibold text-stone-400 shrink-0">
                                {m.completedDate || m.dueDate}
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-500 mt-1 pl-5">
                              {m.description}
                            </p>

                            {m.status === 'verified_by_gov' && (
                              <div className="mt-1 pl-5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> State Certified Deliverable
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Deliverables List */}
                        {challenge.deliverables && challenge.deliverables.length > 0 && (
                          <div className="pt-2 border-t border-stone-100 space-y-1.5">
                            <span className="text-[11px] font-bold text-stone-700 block">
                              Verified Technical Deliverables:
                            </span>
                            {challenge.deliverables.map((d) => (
                              <div key={d.id} className="p-2 bg-[#faf6ee] rounded border border-stone-200 text-[11px] flex items-center justify-between">
                                <div>
                                  <strong className="text-stone-900 block">{d.title}</strong>
                                  <span className="text-stone-500">{d.category} • {d.submissionDate}</span>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px]">
                                  {d.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Government & Academic Approvals */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
                      <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Official Stage Gate Approvals
                      </h4>

                      {challenge.approvals && challenge.approvals.length > 0 ? (
                        <div className="space-y-2.5">
                          {challenge.approvals.map((appr) => (
                            <div key={appr.id} className="p-3 bg-[#faf8f5] rounded-lg border border-stone-200 text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-stone-900">
                                  {appr.stageName}
                                </span>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  appr.decision === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {appr.decision}
                                </span>
                              </div>

                              <div className="text-[11px] text-stone-500 font-mono">
                                Ref: {appr.officialRefNo} • {appr.approvalDate}
                              </div>

                              <p className="text-[11px] text-stone-700 italic">
                                "{appr.comments}"
                              </p>

                              <div className="text-[10px] text-stone-400 font-medium">
                                Sign-off Authority: <strong className="text-stone-700">{appr.approverName}</strong> ({appr.approverOrg})
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-[#faf8f5] rounded-lg border border-stone-200 text-center text-xs text-stone-500 space-y-1">
                          <ShieldCheck className="w-6 h-6 text-stone-300 mx-auto" />
                          <p className="font-semibold text-stone-700">Initial Approvals Pending</p>
                          <p className="text-[11px]">Click "Record Stage Approval" above to log government compliance sign-off.</p>
                        </div>
                      )}
                    </div>

                    {/* Column 3: Field Testing, IP & Spin-offs */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
                      <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        Testing Outcomes & Intellectual Property
                      </h4>

                      {/* Field Testing Box */}
                      <div className="p-3 bg-[#faf8f5] rounded-lg border border-stone-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 flex items-center gap-1">
                            <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                            Field Testing in Community
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            challenge.prototypeTesting?.testedInField ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {challenge.prototypeTesting?.testedInField ? 'Field Tested' : 'Lab Prototyping'}
                          </span>
                        </div>

                        {challenge.prototypeTesting?.testedInField ? (
                          <>
                            <p className="text-[11px] text-stone-700 font-medium">
                              Location: {challenge.prototypeTesting.testLocation} ({challenge.prototypeTesting.testingDate})
                            </p>
                            <p className="text-[11px] text-stone-600 italic">
                              "{challenge.prototypeTesting.testingSummary}"
                            </p>
                            <div className="p-2 bg-emerald-50 rounded text-[10px] text-emerald-900 font-semibold border border-emerald-200">
                              Community Adoption: {challenge.prototypeTesting.beneficiaryFeedback}
                            </div>
                          </>
                        ) : (
                          <p className="text-[11px] text-stone-500">
                            Physical prototype undergoing bench verification prior to Panchayat deployment.
                          </p>
                        )}
                      </div>

                      {/* Patent Information */}
                      {challenge.patentInfo && challenge.patentInfo.status !== 'none' && (
                        <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-950 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-purple-700" />
                              Patent Application
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-purple-200 text-purple-900 rounded">
                              {challenge.patentInfo.status}
                            </span>
                          </div>
                          <p className="font-semibold text-stone-900 text-[11px]">
                            {challenge.patentInfo.patentTitle || 'Intellectual Property Asset'}
                          </p>
                          <div className="text-[10px] text-stone-500 font-mono">
                            App No: {challenge.patentInfo.applicationNumber} • {challenge.patentInfo.filingDate}
                          </div>
                          <div className="text-[10px] text-stone-600">
                            Inventors: {challenge.patentInfo.inventors?.join(', ') || 'Faculty & Student Researchers'}
                          </div>
                        </div>
                      )}

                      {/* Startup Spin-off Record */}
                      {challenge.startupInfo && (
                        <div className="p-3 bg-[#faf6ee] rounded-lg border border-stone-200 text-xs space-y-1">
                          <span className="font-bold text-stone-900 block">
                            Enterprise Spin-off: {challenge.startupInfo.name}
                          </span>
                          <p className="text-[11px] text-stone-600">
                            Incubated at {challenge.startupInfo.incubationCenter}. Seed Funding: ₹{((challenge.startupInfo.fundingRaisedINR || 0) / 100000).toFixed(1)} Lakhs.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
