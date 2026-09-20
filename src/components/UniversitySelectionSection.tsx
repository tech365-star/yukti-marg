import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ThematicCategory } from '../types';
import { 
  JHARKHAND_UNIVERSITIES, 
  calculateUniversityScores, 
  checkUniversityMismatch, 
  UniversityDomainProfile 
} from '../services/universityMatchingService';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  GraduationCap, 
  Microscope, 
  Users, 
  ArrowRight, 
  Check, 
  SlidersHorizontal,
  Info,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface UniversitySelectionSectionProps {
  title: string;
  description: string;
  category: ThematicCategory;
  district?: string;
  userRole?: 'citizen' | 'government' | 'panchayat';
  onChangeAssignment: (assignment: {
    universityId: string;
    universityName: string;
    isAutoDetected: boolean;
    matchScore: number;
    leadDepartment: string;
    leadFaculty: string;
    routingRationale: string;
    hasMismatchWarning: boolean;
    mismatchWarningText?: string;
  }) => void;
}

export const UniversitySelectionSection: React.FC<UniversitySelectionSectionProps> = ({
  title,
  description,
  category,
  district = 'Ranchi',
  userRole = 'citizen',
  onChangeAssignment,
}) => {
  // Mode: 'auto' = AI auto-detected university (default); 'manual' = user chooses a particular university
  const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto');
  const [manualUniversityId, setManualUniversityId] = useState<string>('');
  const [dismissMismatchWarning, setDismissMismatchWarning] = useState(false);

  // Calculate scores for all universities given current form state
  const evaluations = useMemo(() => {
    return calculateUniversityScores({
      title,
      description,
      category,
      district,
    });
  }, [title, description, category, district]);

  const bestMatch = evaluations[0] || evaluations[0];

  // If manual mode, evaluate compatibility and mismatch
  const mismatchAnalysis = useMemo(() => {
    if (selectionMode !== 'manual' || !manualUniversityId) return null;
    return checkUniversityMismatch({
      title,
      description,
      category,
      district,
      selectedUniversityId: manualUniversityId,
    });
  }, [selectionMode, manualUniversityId, title, description, category, district]);

  const onChangeAssignmentRef = useRef(onChangeAssignment);
  useEffect(() => {
    onChangeAssignmentRef.current = onChangeAssignment;
  }, [onChangeAssignment]);

  const lastDispatchedSigRef = useRef<string>('');

  // When bestMatch changes and we are in auto mode, or manual selection changes, notify parent safely
  useEffect(() => {
    let payload: {
      universityId: string;
      universityName: string;
      isAutoDetected: boolean;
      matchScore: number;
      leadDepartment: string;
      leadFaculty: string;
      routingRationale: string;
      hasMismatchWarning: boolean;
      mismatchWarningText?: string;
    } | null = null;

    if (selectionMode === 'auto' && bestMatch) {
      payload = {
        universityId: bestMatch.university.id,
        universityName: bestMatch.university.name,
        isAutoDetected: true,
        matchScore: bestMatch.score,
        leadDepartment: bestMatch.university.facultySpecializations[0] || 'State Innovation Centre',
        leadFaculty: bestMatch.university.leadFaculty,
        routingRationale: `AI auto-detected ${bestMatch.university.shortName} (Match Score: ${bestMatch.score}%) based on faculty specialization in ${bestMatch.university.facultySpecializations.slice(0, 2).join(' & ')}, student cohort capacity, and prototyping facilities at ${bestMatch.university.incubationCenter}.`,
        hasMismatchWarning: false,
      };
    } else if (selectionMode === 'manual' && manualUniversityId) {
      const selected = JHARKHAND_UNIVERSITIES.find((u) => u.id === manualUniversityId) || bestMatch?.university;
      if (selected) {
        const score = mismatchAnalysis ? mismatchAnalysis.score : 50;
        const hasWarning = Boolean(mismatchAnalysis?.isMismatch && !dismissMismatchWarning);

        payload = {
          universityId: selected.id,
          universityName: selected.name,
          isAutoDetected: false,
          matchScore: score,
          leadDepartment: selected.facultySpecializations[0] || 'Academic Department',
          leadFaculty: selected.leadFaculty,
          routingRationale: `Citizen / Official manually assigned problem statement to ${selected.shortName}. Domain compatibility score: ${score}%. ${hasWarning ? 'AI issued domain mismatch notification.' : 'Direct institutional preference registered.'}`,
          hasMismatchWarning: hasWarning,
          mismatchWarningText: hasWarning ? mismatchAnalysis?.warningMessage : undefined,
        };
      }
    }

    if (payload) {
      const sig = `${payload.universityId}__${payload.isAutoDetected}__${payload.matchScore}__${payload.hasMismatchWarning}__${payload.mismatchWarningText || ''}`;
      if (lastDispatchedSigRef.current !== sig) {
        lastDispatchedSigRef.current = sig;
        onChangeAssignmentRef.current(payload);
      }
    }
  }, [
    selectionMode,
    manualUniversityId,
    bestMatch?.university?.id,
    bestMatch?.score,
    mismatchAnalysis?.isMismatch,
    mismatchAnalysis?.score,
    mismatchAnalysis?.warningMessage,
    dismissMismatchWarning,
  ]);

  // Handle switching to manual mode
  const handleEnableManualMode = () => {
    setSelectionMode('manual');
    if (!manualUniversityId) {
      // Default to best match initially until user chooses another
      setManualUniversityId(bestMatch.university.id);
    }
    setDismissMismatchWarning(false);
  };

  // Handle reverting to auto mode
  const handleRevertToAuto = () => {
    setSelectionMode('auto');
    setDismissMismatchWarning(false);
  };

  // Handle selecting a specific university manually
  const handleSelectSpecificUniversity = (univId: string) => {
    setManualUniversityId(univId);
    setDismissMismatchWarning(false);
  };

  return (
    <div className="bg-slate-50/80 rounded-xl border-2 border-slate-200 p-4 sm:p-5 space-y-4" id="university-assignment-module">
      
      {/* Header and Mode Selector Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-800" />
            <h3 className="text-sm font-extrabold text-stone-900">
              University Routing & Academic R&D Assignment
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              <span>AI Assisted</span>
            </span>
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5">
            AI matches your problem with higher education institutions according to faculty expertise, research labs, and student cohorts.
          </p>
        </div>

        {/* Action Toggle: Auto vs Manual Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {selectionMode === 'auto' ? (
            <button
              type="button"
              id="btn-choose-university-manually"
              onClick={handleEnableManualMode}
              className="px-3.5 py-1.5 bg-white hover:bg-[#faf6ee] text-emerald-800 border-2 border-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>Choose University Manually</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-revert-to-ai-auto"
              onClick={handleRevertToAuto}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Revert to AI Auto-Detection</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: AI AUTO-DETECTION VIEW (DEFAULT) */}
      {/* ========================================================================= */}
      {selectionMode === 'auto' && bestMatch && (
        <div className="bg-white rounded-xl border border-[#ded5c5] p-4 space-y-3.5 shadow-xs" id="ai-auto-detected-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#faf6ee] p-3 rounded-lg border border-[#e5dccf]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-black text-sm shrink-0">
                AI
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  AI Auto-Detected & Auto-Assigned University
                </span>
                <h4 className="text-sm font-extrabold text-stone-900 leading-tight">
                  {bestMatch.university.name}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="inline-flex items-center gap-1 text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>{bestMatch.score}% Compatibility</span>
              </span>
            </div>
          </div>

          {/* 3 Pillars Breakdown: Faculty, Students, Research Facility */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Pillar 1: Faculty & Expertise */}
            <div className="bg-[#fcfaf6] p-3 rounded-lg border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-[11px]">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-800" />
                <span>Faculty & Expertise</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                {bestMatch.university.leadFaculty}
              </p>
              <div className="text-[10px] text-emerald-800 font-semibold pt-1">
                Specialization: {bestMatch.university.facultySpecializations[0]}
              </div>
            </div>

            {/* Pillar 2: Research Facilities & Labs */}
            <div className="bg-[#fcfaf6] p-3 rounded-lg border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-[11px]">
                <Microscope className="w-3.5 h-3.5 text-amber-600" />
                <span>Research Facility & Labs</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                {bestMatch.university.researchFacilities.slice(0, 2).join(' • ')}
              </p>
              <div className="text-[10px] text-amber-800 font-semibold pt-1">
                Incubation: {bestMatch.university.incubationCenter}
              </div>
            </div>

            {/* Pillar 3: Students & Innovators */}
            <div className="bg-[#fcfaf6] p-3 rounded-lg border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-[11px]">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Student Cohort</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                {bestMatch.university.studentCohort}
              </p>
              <div className="text-[10px] text-emerald-800 font-semibold pt-1">
                Field Deployment Internships Ready
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1 border-t border-stone-100">
            <span className="flex items-center gap-1 text-stone-500">
              <Info className="w-3.5 h-3.5 text-emerald-700" />
              Upon submission, AI assigns this problem directly to {bestMatch.university.shortName}'s R&D department.
            </span>
            <button
              type="button"
              onClick={handleEnableManualMode}
              className="text-emerald-800 hover:text-emerald-950 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
            >
              <span>Want a different university? Click to select manually</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: MANUAL UNIVERSITY SELECTION VIEW */}
      {/* ========================================================================= */}
      {selectionMode === 'manual' && (
        <div className="space-y-4" id="manual-university-selection-block">
          
          {/* Manual Selection Dropdown & Options */}
          <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900">
                Select Particular University for Submission Routing <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                Manual Override Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {JHARKHAND_UNIVERSITIES.map((univ) => {
                const isSelected = manualUniversityId === univ.id;
                const isAiRecommended = bestMatch.university.id === univ.id;
                const evalItem = evaluations.find((e) => e.university.id === univ.id);
                const score = evalItem ? evalItem.score : 40;

                return (
                  <button
                    key={univ.id}
                    type="button"
                    onClick={() => handleSelectSpecificUniversity(univ.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-2 border-emerald-700 bg-[#faf6ee] shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {univ.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {univ.facultySpecializations.slice(0, 2).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-slate-100 text-[10px]">
                      <span className="text-slate-600 font-medium">
                        {univ.location}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isAiRecommended && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded text-[9px] font-black">
                            AI Top Choice
                          </span>
                        )}
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          score >= 75 ? 'bg-emerald-100 text-emerald-900' :
                          score >= 50 ? 'bg-amber-100 text-amber-900' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {score}% Match
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* AI WARNING ALERT WHEN MANUALLY SELECTED UNIVERSITY IS NOT A PERFECT MATCH */}
          {/* ========================================================================= */}
          {mismatchAnalysis && mismatchAnalysis.isMismatch && !dismissMismatchWarning && (
            <div 
              className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-sm"
              id="ai-university-mismatch-warning-alert"
            >
              {/* Alert Title Banner */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-slate-950" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      Warning: Domain Discrepancy
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      Match Score: {mismatchAnalysis.score}% (Sub-optimal)
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-amber-950 leading-snug">
                    {mismatchAnalysis.warningTitle}
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {mismatchAnalysis.warningMessage}
                  </p>
                </div>
              </div>

              {/* 3 Specific Mismatch Reasons: Faculty, Facility, Student */}
              <div className="bg-white/80 rounded-lg border border-amber-300 p-3 space-y-2 text-xs">
                <span className="font-bold text-amber-950 text-[11px] block">
                  Detailed AI Discrepancy Diagnostic:
                </span>
                
                <div className="space-y-1.5 text-slate-800 text-[11px]">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Faculty Mismatch:</strong> {mismatchAnalysis.facultyMismatchReason}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Microscope className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Research Facility Gap:</strong> {mismatchAnalysis.facilityMismatchReason}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Student Cohort Focus:</strong> {mismatchAnalysis.studentCohortMismatchReason}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Switch to Recommended or Keep Manual Choice */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-amber-900">
                  AI strongly advises routing to <strong>{mismatchAnalysis.suggestedUniversity.name}</strong> ({mismatchAnalysis.suggestedScore}% Match).
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {/* BUTTON: Switch to AI Recommended University */}
                  <button
                    type="button"
                    id="btn-switch-to-ai-recommended"
                    onClick={handleRevertToAuto}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                    <span>Switch to AI Recommended ({mismatchAnalysis.suggestedScore}%)</span>
                  </button>

                  {/* BUTTON: Proceed with manual selection anyway */}
                  <button
                    type="button"
                    id="btn-dismiss-warning-keep-manual"
                    onClick={() => setDismissMismatchWarning(true)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Keep My Manual Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* If dismissed warning or if the manual selection is actually a good match */}
          {mismatchAnalysis && (!mismatchAnalysis.isMismatch || dismissMismatchWarning) && (
            <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Selected University: <strong>{mismatchAnalysis.selectedUniversity.name}</strong> ({mismatchAnalysis.score}% compatibility)
                  {dismissMismatchWarning && ' • Proceeding with manual override as requested'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRevertToAuto}
                className="text-emerald-700 font-bold hover:underline text-xs shrink-0 cursor-pointer"
              >
                Reset to AI Auto
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
