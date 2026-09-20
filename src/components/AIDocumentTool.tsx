import React, { useState } from 'react';
import { AISummaryResponse, ThematicCategory } from '../types';
import { JHARKHAND_DISTRICTS } from '../data/mockData';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Send, 
  RefreshCw,
  Clock,
  ShieldAlert,
  Building,
  GraduationCap
} from 'lucide-react';

interface AIDocumentToolProps {
  onConvertToChallenge?: (prefillData: {
    title: string;
    description: string;
    category: ThematicCategory;
    district: string;
    aiAnalysis: any;
  }) => void;
}

export const AIDocumentTool: React.FC<AIDocumentToolProps> = ({ onConvertToChallenge }) => {
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [district, setDistrict] = useState('Ranchi');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AISummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample real-world problem documents from Jharkhand for 1-click testing
  const SAMPLE_DOCS = [
    {
      title: 'Palamu Fluoride Ground Water Report',
      district: 'Palamu',
      fileName: 'palamu_aquifer_fluoride_survey_2026.txt',
      text: `GOVERNMENT OF JHARKHAND - DISTRICT WATER TESTING LAB PALAMU
Survey of 45 deep borewells across Hussainabad, Chhatarpur, and Hariharganj blocks shows severe fluoride contamination ranging from 3.2 mg/L to 5.4 mg/L against the BIS permissible limit of 1.0 mg/L.
Over 2,400 school-going children in 28 government primary and middle schools exhibit grade-2 dental fluorosis and early onset crippling skeletal deformities.
Traditional reverse osmosis (RO) plants installed under earlier schemes have failed due to erratic 3-phase electricity, absence of maintenance technicians, and 65% brine water wastage in drought-prone areas.
There is an urgent requirement for an electricity-free, gravity-driven water filtration cartridge using indigenous adsorbents (e.g. modified clay, activated alumina, or agricultural biochar) that can be maintained locally by school management committees (SMCs).`,
    },
    {
      title: 'Ormanjhi Tomato Farmer Spoilage Survey',
      district: 'Ranchi',
      fileName: 'ormanjhi_kanke_mandi_spoilage_memo.txt',
      text: `GRAM SABHA RESOLUTION & FARMER PRODUCER ORGANIZATION (FPO) ORMANJHI
During peak harvesting seasons (November to February), farmers in Ormanjhi, Bero, and Kanke blocks harvest over 60 metric tonnes of tomatoes, brinjal, and capsicum daily.
Due to lack of cold storage at the farm gate and grid power unreliability, perishables decay within 48 to 72 hours.
Local farmers are forced into distress sales to middlemen at ₹2.50 to ₹3.00 per kilogram, whereas retail prices in Ranchi city reach ₹35 per kg.
Farmers require a decentralized 1 to 2 MT capacity solar-powered or thermal-battery cold storage system using phase-change materials (PCM) that can preserve crops at 6-10°C for up to 20 days without relying on costly lithium battery replacements.`,
    },
    {
      title: 'Dumka Tribal Health Language Barrier Note',
      district: 'Dumka',
      fileName: 'santhal_pargana_telehealth_report.txt',
      text: `DISTRICT HEALTH SOCIETY DUMKA - SANTHAL PARGANA REGION
A field study in 32 Health Sub-Centres and Community Health Centres (CHCs) in Dumka and Pakur reveals severe communication bottlenecks between healthcare workers and tribal patients who speak only Santhali (Ol Chiki) or Ho.
Clinical staff unable to understand local colloquial descriptions of symptoms frequently misdiagnose or delay treatment for cerebral malaria, maternal hemorrhages, and sickle-cell crises.
Internet cellular connectivity in dense forest fringe villages is absent or intermittent.
We require an edge-AI tablet-based voice interface that operates completely offline, accepting spoken Santhali queries, translating them to standard medical terminology in Hindi and English, and providing step-by-step diagnostic triage algorithms for rural ASHA workers.`,
    },
  ];

  const handleLoadSample = (sample: typeof SAMPLE_DOCS[0]) => {
    setInputText(sample.text);
    setFileName(sample.fileName);
    setDistrict(sample.district);
    setResult(null);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    // Read text from uploaded file
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file. Please paste the document text directly.');
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!inputText || inputText.trim().length < 15) {
      setError('Please enter or upload document text of at least 15 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/categorize-and-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: inputText,
          fileName: fileName || 'uploaded_document.txt',
          contextDistrict: district,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process document through AI.');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during AI evaluation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6" id="ai-document-intelligence-view">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 rounded-xl p-6 text-white shadow-md border-l-4 border-amber-500 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wide mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Yukti Marg AI Document Intelligence & Summarizer
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Automated Thematic Categorization & Academic Routing Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-3xl">
              Upload Gram Sabha resolutions, field surveys, water test reports, or citizen grievances. The platform’s AI engine automatically identifies the societal domain, condenses the problem statement, extracts root bottlenecks, and matches eligible Jharkhand Higher Education Institutions (HEIs) under NEP 2020.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload / Paste Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sample quick-load buttons */}
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              ⚡ 1-Click Load Realistic Jharkhand Field Documents
            </span>
            <div className="flex flex-col gap-1.5">
              {SAMPLE_DOCS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadSample(sample)}
                  className="text-left text-xs p-2 rounded border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-amber-900">
                    {sample.title}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {sample.district}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Input Box */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-800" />
                Document Content / Text
              </label>
              {fileName && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 truncate max-w-[180px]">
                  {fileName}
                </span>
              )}
            </div>

            {/* Drag & Drop File Upload */}
            <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-700 rounded-lg p-4 text-center bg-slate-50/60 transition-colors">
              <input
                type="file"
                accept=".txt,.doc,.docx,.pdf,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">
                Click to browse or drag & drop document file
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Supports TXT, PDF, DOC, CSV (or paste directly below)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District Context
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document / Grievance Text
              </label>
              <textarea
                rows={9}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste the problem description, survey notes, Gram Sabha resolution, or field findings here..."
                className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed font-mono text-slate-800"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !inputText.trim()}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>AI Analyzing & Routing Problem Statement...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Run AI Categorization & Summarization</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output & Analysis (7 Cols) */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 space-y-5">
              {/* Category & Urgency Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Auto-Detected Thematic Category
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-800 text-white shadow-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{result.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Urgency Score
                    </span>
                    <span className="text-xl font-extrabold text-amber-600">
                      {result.urgencyScore}/100
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Priority Level
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${
                      result.priority === 'critical'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : result.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {result.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title Suggestion */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Synthesized Problem Statement Title
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {result.titleSuggestion}
                </h3>
              </div>

              {/* Executive Summary */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  Executive Summary & Core Bottleneck
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {result.executiveSummary}
                </p>
              </div>

              {/* Key Problems & Root Causes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50/50 rounded-lg p-4 border border-red-200/70">
                  <span className="text-xs font-bold text-red-900 uppercase tracking-wider block mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    Key Pain Points
                  </span>
                  <ul className="space-y-1.5">
                    {result.keyProblems?.map((prob, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                        <span>{prob}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-200/70">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-2 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    Root Technical Causes
                  </span>
                  <ul className="space-y-1.5">
                    {result.rootCauses?.map((cause, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Academic Disciplines & Recommended Universities */}
              <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-200/70 space-y-3">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-700" />
                  Academic Routing & University Matching
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Relevant Academic Disciplines:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {result.suggestedDisciplines?.map((d, i) => (
                        <span
                          key={i}
                          className="bg-white border border-purple-200 text-purple-900 px-2 py-0.5 rounded text-[11px] font-medium"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Recommended Jharkhand HEIs:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {result.recommendedUniversities?.map((u, i) => (
                        <span
                          key={i}
                          className="bg-white border border-purple-200 text-purple-900 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Building className="w-3 h-3 text-purple-600" />
                          {u}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {result.nepRelevance && (
                  <div className="pt-2 border-t border-purple-200/60 text-[11px] text-purple-950 font-medium">
                    <span className="font-bold text-purple-900">NEP 2020 Experiential Scope: </span>
                    {result.nepRelevance}
                  </div>
                )}
              </div>

              {/* Action Button: Convert to Official Submission */}
              {onConvertToChallenge && (
                <div className="pt-2">
                  <button
                    onClick={() =>
                      onConvertToChallenge({
                        title: result.titleSuggestion,
                        description: inputText,
                        category: result.category,
                        district,
                        aiAnalysis: {
                          categoryConfidence: 0.98,
                          summary: result.executiveSummary,
                          rootCauses: result.rootCauses,
                          suggestedDisciplines: result.suggestedDisciplines,
                          recommendedUniversities: result.recommendedUniversities,
                          potentialPatentOrIP: true,
                          urgencyScore: result.urgencyScore,
                        },
                      })
                    }
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Proceed to Official Submission Form with this AI Analysis</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[440px]">
              <div className="w-14 h-14 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Awaiting Document Input
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Upload any problem brief or select one of the realistic Jharkhand field samples on the left to trigger the AI classification and HEI routing engine.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-400">
                <span className="bg-white px-2 py-1 rounded border border-slate-200">Auto Category</span>
                <span className="bg-white px-2 py-1 rounded border border-slate-200">Root Cause Engine</span>
                <span className="bg-white px-2 py-1 rounded border border-slate-200">HEI Matching</span>
                <span className="bg-white px-2 py-1 rounded border border-slate-200">NEP 2020 Scored</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
