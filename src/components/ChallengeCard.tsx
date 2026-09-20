import React from 'react';
import { Challenge } from '../types';
import { t } from '../utils/translations';
import { 
  MapPin, 
  Users, 
  Calendar, 
  GraduationCap, 
  Building, 
  ShieldCheck, 
  Clock, 
  Check, 
  Layers
} from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  onSelect?: (challenge: Challenge) => void;
  lang?: 'en' | 'hi';
}

const STAGES = [
  { num: 1, name: 'Intake' },
  { num: 2, name: 'HEI Match' },
  { num: 3, name: 'Team' },
  { num: 4, name: 'Prototype' },
  { num: 5, name: 'Deployed' },
];

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, lang = 'en' }) => {
  // 5-Stage Innovation Pipeline Mapping
  const getStageInfo = (status: Challenge['status']) => {
    switch (status) {
      case 'submitted':
        return {
          stepNum: 1,
          stepTitle: 'Problem Intake & Screen',
          badgeLabel: 'Intake Screened',
          badgeColor: 'bg-[#faf6ee] text-emerald-800 border-emerald-200',
          desc: 'Problem statement registered in the state portal and screened by AI domain classifier.',
        };
      case 'under_review':
        return {
          stepNum: 2,
          stepTitle: 'HEI Matching & Review',
          badgeLabel: 'Under State Review',
          badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
          desc: 'Under review by Higher Education Directorate for university research pairing.',
        };
      case 'assigned_hei':
        return {
          stepNum: 2,
          stepTitle: 'Assigned to University',
          badgeLabel: 'HEI Assigned',
          badgeColor: 'bg-indigo-50 text-indigo-900 border-indigo-200',
          desc: challenge.assignedUniversity
            ? `Assigned to ${challenge.assignedUniversity.name} (${challenge.assignedUniversity.department || 'Innovation Cell'}).`
            : 'Assigned to Higher Education Institution for academic prototyping.',
        };
      case 'team_constituted':
        return {
          stepNum: 3,
          stepTitle: 'Student-Faculty Team Formed',
          badgeLabel: 'Team Formed',
          badgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
          desc: challenge.team?.facultyMentor
            ? `Multi-disciplinary research team constituted under faculty mentor ${challenge.team.facultyMentor}.`
            : 'Faculty mentor and student innovator team constituted.',
        };
      case 'proposal_submitted':
        return {
          stepNum: 3,
          stepTitle: 'Solution Proposal Ready',
          badgeLabel: 'Proposal Ready',
          badgeColor: 'bg-cyan-50 text-cyan-900 border-cyan-200',
          desc: 'Prototyping roadmap and technical feasibility proposal submitted for approval.',
        };
      case 'prototype_development':
        return {
          stepNum: 4,
          stepTitle: 'Prototyping & Lab Testing',
          badgeLabel: 'In Prototyping',
          badgeColor: 'bg-orange-50 text-orange-900 border-orange-200',
          desc: 'Engineering prototype under active lab fabrication and iterations.',
        };
      case 'pilot_testing':
        return {
          stepNum: 4,
          stepTitle: 'Field Pilot Testing',
          badgeLabel: 'Field Pilot Active',
          badgeColor: 'bg-teal-50 text-teal-900 border-teal-200',
          desc: 'Prototype deployed on-ground for pilot validation with local beneficiaries.',
        };
      case 'deployed':
        return {
          stepNum: 5,
          stepTitle: 'Complete and Deployed (Status: End)',
          badgeLabel: 'Complete & Deployed (End)',
          badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold',
          desc: 'Formally verified and accepted by industrial officer. Field deployed and operational in community. Status: End.',
        };
      default:
        return {
          stepNum: 1,
          stepTitle: 'Intake Registered',
          badgeLabel: status,
          badgeColor: 'bg-slate-50 text-slate-800 border-slate-200',
          desc: 'Problem status logged in the state registry.',
        };
    }
  };

  const getPriorityBadge = (p: Challenge['priority']) => {
    switch (p) {
      case 'critical':
        return <span className="text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-bold">Critical</span>;
      case 'high':
        return <span className="text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-bold">High</span>;
      default:
        return <span className="text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium">Standard</span>;
    }
  };

  const rawStage = getStageInfo(challenge.status);

  const isIndustryVerified = Boolean(
    challenge.prototypeDeliverable?.status === 'verified_by_industry' || 
    Boolean(challenge.prototypeDeliverable?.verifiedByIndustry?.verified)
  );

  const isCompletedAndDeployed = Boolean(
    (challenge.status === 'deployed' || challenge.lifecycleStatus === 'end') &&
    isIndustryVerified
  );

  const isPrototypeSubmitted = Boolean(
    challenge.prototypeDeliverable && 
    !isCompletedAndDeployed
  );

  const stage = isCompletedAndDeployed
    ? {
        stepNum: 5,
        stepTitle: 'Complete and Deployed (Status: End)',
        badgeLabel: 'Complete & Deployed (End)',
        badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold',
        desc: 'Formally verified and accepted by industrial officer. Field deployed and operational in community. Status: End.',
      }
    : isPrototypeSubmitted
    ? {
        stepNum: 5,
        stepTitle: 'Prototype Submitted to Industry',
        badgeLabel: 'Prototype Submitted (Pending Acceptance)',
        badgeColor: 'bg-blue-50 text-blue-900 border-blue-300 font-bold',
        desc: 'Prototype deliverable submitted to industry partner. Awaiting industrial acceptance & sign-off.',
      }
    : rawStage;

  return (
    <div 
      className="bg-white rounded-xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all p-5 flex flex-col justify-between"
      id={`problem-card-${challenge.id}`}
    >
      <div>
        {/* Top Reference Code & Status Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-mono text-[11px] font-bold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
            {challenge.code}
          </span>
          <div className="flex items-center gap-1.5">
            {getPriorityBadge(challenge.priority)}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${stage.badgeColor}`}>
              {stage.badgeLabel}
            </span>
          </div>
        </div>

        {/* Category & Problem Title */}
        <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1">
          {t(challenge.category, lang)}
        </div>
        <h3 className="text-base font-bold text-stone-900 leading-snug mb-2">
          {challenge.title}
        </h3>

        {/* Problem Description */}
        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-3">
          {challenge.description}
        </p>

        {/* Location & Beneficiaries Impact */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-stone-500 mb-3 pb-3 border-b border-stone-100">
          <span className="flex items-center gap-1 text-stone-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate max-w-[150px]">{challenge.blockOrPanchayat ? `${challenge.blockOrPanchayat}, ` : ''}{challenge.district}</span>
          </span>
          <span className="flex items-center gap-1 text-stone-600">
            <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>~{challenge.estimatedImpactPeople.toLocaleString('en-IN')} Citizens</span>
          </span>
        </div>

        {/* Academic & Industrial Stakeholders */}
        <div className="space-y-1.5 text-xs mb-4">
          {challenge.assignedUniversity ? (
            <div className="flex items-center gap-1.5 text-purple-950 font-medium bg-purple-50/70 border border-purple-100 p-2 rounded text-[11px]">
              <GraduationCap className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <div className="truncate">
                <span className="font-bold">{challenge.assignedUniversity.name}</span>
                {challenge.assignedUniversity.department && (
                  <span className="text-purple-700 font-normal"> • {challenge.assignedUniversity.department}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-stone-500 bg-stone-50 border border-stone-100 p-2 rounded text-[11px] italic">
              <GraduationCap className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Matching Jharkhand University...</span>
            </div>
          )}

          {challenge.industryPartners && challenge.industryPartners.length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-950 font-medium bg-amber-50/70 border border-amber-100 p-2 rounded text-[11px]">
              <Building className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate">{challenge.industryPartners[0].partnerName}</span>
              {challenge.industryPartners.length > 1 && (
                <span className="text-[10px] text-amber-700 font-bold">+{challenge.industryPartners.length - 1}</span>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* READ-ONLY CURRENT STATUS DISPLAY (NO BUTTON FUNCTIONS WORKING) */}
        {/* ========================================================================= */}
        <div className="bg-[#faf8f5] border border-stone-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-stone-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Current Problem Status</span>
            </span>
            <span className="text-[10px] font-extrabold text-emerald-900 bg-[#faf6ee] border border-emerald-200 px-1.5 py-0.5 rounded">
              Stage {stage.stepNum} of 5: {stage.stepTitle}
            </span>
          </div>

          {/* 5-Stage Stepper: Purely Informative, ZERO clickable or button functions */}
          <div className="grid grid-cols-5 gap-1 pt-0.5 select-none">
            {STAGES.map((s) => {
              const isCompleted = isCompletedAndDeployed ? true : isPrototypeSubmitted ? s.num < 5 : s.num < stage.stepNum;
              const isCurrent = isCompletedAndDeployed ? false : isPrototypeSubmitted ? s.num === 5 : s.num === stage.stepNum;

              return (
                <div key={s.num} className="text-center">
                  <div
                    className={`h-1.5 rounded-full mb-1 transition-all ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-amber-500 ring-1 ring-amber-300'
                        : 'bg-slate-200'
                    }`}
                  />
                  <div className="flex items-center justify-center gap-0.5">
                    {isCompleted ? (
                      <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    )}
                    <span
                      className={`text-[9px] leading-none block truncate ${
                        isCompleted
                          ? 'font-bold text-emerald-800'
                          : isCurrent
                          ? 'font-bold text-amber-900'
                          : 'text-slate-400 font-normal'
                      }`}
                    >
                      {s.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Status Explanation (Read-only) */}
          <div className="text-[11px] text-slate-700 pt-1 border-t border-slate-200/60 leading-tight flex items-start gap-1.5">
            <span className="text-slate-400 text-[10px] shrink-0 font-medium">Status:</span>
            <span className="font-medium text-slate-700">{stage.desc}</span>
          </div>
        </div>
      </div>

      {/* Footer details: View Lifecycle Details button is removed */}
      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 text-slate-400">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>Submitted {challenge.submittedDate}</span>
        </span>

        <span className="font-semibold text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Official Status Record</span>
        </span>
      </div>
    </div>
  );
};

