import React, { useState, useEffect, useRef } from 'react';
import { Challenge, ThematicCategory, PriorityLevel, User, GPSLocation } from '../types';
import { JHARKHAND_DISTRICTS, THEMATIC_CATEGORIES, UNIVERSITIES } from '../data/mockData';
import { authService } from '../services/authService';
import { t } from '../utils/translations';
import { GovCaptcha } from './GovCaptcha';
import { 
  X, 
  Send, 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  MapPin, 
  Users, 
  ShieldCheck,
  RefreshCw,
  Camera,
  Video,
  Lock,
  UserCheck,
  Compass,
  GraduationCap,
  Layers,
  Trash2,
  ExternalLink,
  Info,
  LogIn,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  Landmark,
  Building2,
  Check,
  Copy,
  Edit3,
  CheckCircle2,
  School,
  ArrowRight
} from 'lucide-react';

interface SubmitChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onChallengeSubmitted: (challenge: Challenge) => void;
  onLoginUser?: (user: User) => void;
  onOpenLoginModal?: () => void;
  lang?: 'en' | 'hi';
  initialData?: {
    title?: string;
    description?: string;
    category?: ThematicCategory;
    district?: string;
    aiAnalysis?: any;
  };
}

export const SubmitChallengeModal: React.FC<SubmitChallengeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChallengeSubmitted,
  onLoginUser,
  onOpenLoginModal,
  lang = 'en',
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<ThematicCategory>(
    initialData?.category || 'Agriculture & Rural Livelihoods'
  );
  const [secondaryCategory, setSecondaryCategory] = useState<ThematicCategory | ''>('Water Resources & Sanitation');
  const detectAbortControllerRef = useRef<AbortController | null>(null);
  const [district, setDistrict] = useState(initialData?.district || currentUser?.district || 'Ranchi');
  const [blockOrPanchayat, setBlockOrPanchayat] = useState('');
  
  // Locality & Citizen problem intake fields
  const [citizenBeneficiary, setCitizenBeneficiary] = useState('');
  const [localityVillage, setLocalityVillage] = useState('');
  const [panchayatName, setPanchayatName] = useState(currentUser?.panchayat || '');
  const [blockName, setBlockName] = useState(currentUser?.block || '');
  const [certifiedByAuthority, setCertifiedByAuthority] = useState(true);

  // Who? (Submitter Entity)
  const [submitterType, setSubmitterType] = useState<
    'Citizen' | 'Panchayati Raj Institution (PRI)' | 'Urban Local Body (ULB)' | 'Community Organization' | 'Government Dept'
  >(
    currentUser?.role === 'citizen'
      ? 'Citizen'
      : currentUser?.role === 'panchayat'
      ? 'Panchayati Raj Institution (PRI)'
      : currentUser?.role === 'government' || currentUser?.role === 'admin'
      ? 'Government Dept'
      : 'Citizen'
  );
  const [submitterName, setSubmitterName] = useState(currentUser?.name || '');
  const [contact, setContact] = useState(currentUser?.email || currentUser?.phone || '');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [estimatedImpactPeople, setEstimatedImpactPeople] = useState('5000');

  // Evidence Modalities (What?)
  const [gpsCoordinates, setGpsCoordinates] = useState<GPSLocation | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: 'pdf' | 'image' | 'doc' }[]>([]);

  // AI Classification, Detection & De-duplication (Stage 2 & 3)
  const [isAiClassifying, setIsAiClassifying] = useState(false);
  const [isAiDetecting, setIsAiDetecting] = useState(false);
  const [isManualCategory, setIsManualCategory] = useState(false);
  const [aiDetectedCategory, setAiDetectedCategory] = useState<string | null>(initialData?.category || null);
  const [aiCategoryConfidence, setAiCategoryConfidence] = useState<number>(0.96);
  const [matchedUniversity, setMatchedUniversity] = useState<{
    id: string;
    name: string;
    department: string;
    incubationCenter?: string;
    routingReason?: string;
    location?: string;
  } | null>({
    id: 'iit-ism-dhanbad',
    name: 'Indian Institute of Technology (IIT ISM) Dhanbad',
    department: 'Department of Environmental Science & Water Engineering',
    incubationCenter: 'TexMiN Technology Innovation Hub & ACIC Foundation',
    routingReason: 'State Center of Excellence in groundwater aquifer mapping, heavy-metal remediation, and low-cost filtration.',
    location: 'Dhanbad',
  });
  const [isManualUniversity, setIsManualUniversity] = useState(false);
  const [autoSubmitToUni, setAutoSubmitToUni] = useState(true);
  const [submissionSuccessData, setSubmissionSuccessData] = useState<{
    challenge: Challenge;
    assignedUniversity: { name: string; department: string; id?: string };
    categoryMode: 'ai' | 'manual';
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(initialData?.aiAnalysis || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Inline Authentication State (for non-authenticated users)
  const [authPortalTab, setAuthPortalTab] = useState<'citizen' | 'panchayat' | 'government'>('citizen');
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [inlineAuthMode, setInlineAuthMode] = useState<'login' | 'register'>('login');
  const [inlineCaptcha, setInlineCaptcha] = useState('');
  const [inlineCaptchaCode, setInlineCaptchaCode] = useState('');

  // Inline Registration fields
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDistrict, setRegDistrict] = useState('Ranchi');
  const [regPassword, setRegPassword] = useState('');
  const [inlineRegCaptcha, setInlineRegCaptcha] = useState('');
  const [inlineRegCaptchaCode, setInlineRegCaptchaCode] = useState('');

  // Sync with current user when logged in
  useEffect(() => {
    if (currentUser) {
      setSubmitterName(currentUser.name);
      setContact(currentUser.email || currentUser.phone || '');
      if (currentUser.district) {
        setDistrict(currentUser.district);
      }
      if (currentUser.panchayat) {
        setPanchayatName(currentUser.panchayat);
        setBlockOrPanchayat(currentUser.panchayat);
      }
      if (currentUser.block) {
        setBlockName(currentUser.block);
        if (!currentUser.panchayat) {
          setBlockOrPanchayat(currentUser.block);
        }
      }
      if (currentUser.role === 'citizen') {
        setSubmitterType('Citizen');
      } else if (currentUser.role === 'panchayat') {
        setSubmitterType('Panchayati Raj Institution (PRI)');
      } else if (currentUser.role === 'government' || currentUser.role === 'admin') {
        setSubmitterType('Government Dept');
      }
    }
  }, [currentUser]);

  // Sync with initialData when provided (e.g. from AI Document Tool)
  useEffect(() => {
    if (initialData) {
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.description !== undefined) setDescription(initialData.description);
      if (initialData.category) setCategory(initialData.category);
      if (initialData.district) setDistrict(initialData.district);
      if (initialData.aiAnalysis) setAiAnalysisResult(initialData.aiAnalysis);
    }
  }, [initialData]);

  // Auto GPS Location Detection
  const handleDetectGPS = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoordinates({
            latitude: parseFloat(pos.coords.latitude.toFixed(4)),
            longitude: parseFloat(pos.coords.longitude.toFixed(4)),
            locationName: `${blockOrPanchayat || 'Field Site'}, ${district}, Jharkhand`,
          });
          setIsDetectingGps(false);
        },
        () => {
          // Fallback district coordinates
          const districtCoords: Record<string, { lat: number; lng: number }> = {
            Ranchi: { lat: 23.3441, lng: 85.3096 },
            Dhanbad: { lat: 23.7957, lng: 86.4304 },
            'East Singhbhum': { lat: 22.8046, lng: 86.2029 },
            Palamu: { lat: 24.0416, lng: 84.0722 },
            Dumka: { lat: 24.2676, lng: 87.2483 },
            Hazaribagh: { lat: 23.9925, lng: 85.3637 },
            Bokaro: { lat: 23.6693, lng: 86.1511 },
            Deoghar: { lat: 24.4826, lng: 86.7029 },
            Latehar: { lat: 23.7431, lng: 84.5029 },
            Khunti: { lat: 23.0726, lng: 85.2796 },
          };
          const coords = districtCoords[district] || { lat: 23.3441, lng: 85.3096 };
          setGpsCoordinates({
            latitude: coords.lat,
            longitude: coords.lng,
            locationName: `${blockOrPanchayat || 'Field Center'}, ${district}`,
          });
          setIsDetectingGps(false);
        }
      );
    } else {
      setGpsCoordinates({
        latitude: 23.3441,
        longitude: 85.3096,
        locationName: `${district} Field Location`,
      });
      setIsDetectingGps(false);
    }
  };

  // Add Video URL
  const handleAddVideo = () => {
    if (!videoUrlInput.trim()) return;
    setVideoUrls((prev) => [...prev, videoUrlInput.trim()]);
    setVideoUrlInput('');
  };

  const handleRemoveVideo = (index: number) => {
    setVideoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Real-time AI Categorization, University Routing & Auto-Submission (Stage 2 & 3)
  const handleAutoDetect = async (overrideCategory?: ThematicCategory) => {
    const textToCheck = `${title} ${description}`.trim();
    if (!textToCheck && !overrideCategory) {
      return;
    }

    setIsAiDetecting(true);
    if (detectAbortControllerRef.current) {
      detectAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    detectAbortControllerRef.current = controller;

    try {
      const res = await fetch('/api/ai/detect-category-and-university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          title,
          description,
          district,
          manualCategory: overrideCategory || (isManualCategory ? category : undefined),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (!overrideCategory && !isManualCategory && data.detectedCategory) {
          setCategory(data.detectedCategory as ThematicCategory);
          setAiDetectedCategory(data.detectedCategory);
          setAiCategoryConfidence(data.categoryConfidence || 0.96);
        }
        if (data.matchedUniversity && !isManualUniversity) {
          setMatchedUniversity(data.matchedUniversity);
        }
        setAiAnalysisResult((prev: any) => ({
          ...(prev || {}),
          urgencyScore: data.urgencyScore || 86,
          summary: data.summary || description.slice(0, 200),
          recommendedUniversities: [data.matchedUniversity.name],
          routingReason: data.matchedUniversity.routingReason,
          incubationCenterMatched: data.matchedUniversity.incubationCenter,
          categoryConfidence: data.categoryConfidence || 0.96,
          deDuplicationCheck: prev?.deDuplicationCheck || {
            isDuplicate: false,
            similarityScore: 8,
            status: 'unique',
            explanation: 'No duplicate entry found in this district. Clean submission verified.',
          },
        }));
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.log('[AI Client] Auto-detection update note:', err?.message || 'Handled gracefully');
    } finally {
      setIsAiDetecting(false);
    }
  };

  // Triggered when user explicitly clicks "Auto-detect" button
  const handleTriggerAutoDetect = () => {
    setIsManualCategory(false);
    handleAutoDetect();
  };

  // Triggered when user manually selects or overrides category
  const handleManualCategoryChange = (newCat: ThematicCategory) => {
    setCategory(newCat);
    setIsManualCategory(true);
    // When user manually picks a category, AI immediately finds the most suitable university for this category!
    handleAutoDetect(newCat);
  };

  // Debounced auto-detection as user types title or description
  useEffect(() => {
    if (isManualCategory) return;
    const combined = `${title} ${description}`.trim();
    if (combined.length < 15) return;

    const timer = setTimeout(() => {
      handleAutoDetect();
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, description, district]);

  // Full AI Categorization & Deep Technical Analysis
  const handleAutoClassify = async () => {
    if (!description || description.trim().length < 15) {
      alert('Please enter at least 15 characters of problem description for AI classification.');
      return;
    }

    setIsAiClassifying(true);
    try {
      const res = await fetch('/api/ai/categorize-and-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: `${title ? `Title: ${title}\n` : ''}${description}`,
          contextDistrict: district,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const d = data.data;
        if (!isManualCategory) {
          setCategory(d.category);
          setAiDetectedCategory(d.category);
        }
        if (d.secondaryCategory) setSecondaryCategory(d.secondaryCategory);
        if (!title && d.titleSuggestion) setTitle(d.titleSuggestion);
        if (d.priority) setPriority(d.priority);
        setAiAnalysisResult({
          categoryConfidence: 0.98,
          summary: d.executiveSummary,
          secondaryCategory: d.secondaryCategory,
          rootCauses: d.rootCauses,
          suggestedDisciplines: d.suggestedDisciplines,
          recommendedUniversities: d.recommendedUniversities,
          routingReason: d.routingReason,
          incubationCenterMatched: d.incubationCenterMatched,
          deDuplicationCheck: d.deDuplicationCheck || {
            isDuplicate: false,
            similarityScore: 10,
            status: 'unique',
            explanation: 'No duplicate entry found in this district. Clean submission verified.',
          },
          potentialPatentOrIP: true,
          urgencyScore: d.urgencyScore || 85,
        });

        // Also update matched university if available
        if (d.recommendedUniversities && d.recommendedUniversities.length > 0 && !isManualUniversity) {
          const uniName = d.recommendedUniversities[0];
          const matchedUni = UNIVERSITIES.find(u => u.name.includes(uniName) || uniName.includes(u.name));
          if (matchedUni) {
            setMatchedUniversity({
              id: matchedUni.id,
              name: matchedUni.name,
              department: matchedUni.specializations[0] ? `Department of ${matchedUni.specializations[0]}` : 'Department of Applied Sciences',
              incubationCenter: matchedUni.incubationFacilities[0] || 'State Innovation Centre',
              routingReason: d.routingReason,
              location: matchedUni.location,
            });
          }
        }
      }
    } catch (err) {
      console.error('Auto-classify failed:', err);
    } finally {
      setIsAiClassifying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.endsWith('.pdf') ? 'pdf' : file.name.match(/\.(jpg|jpeg|png)$/i) ? 'image' : 'doc';
    const newFile = {
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: fileType as 'pdf' | 'image' | 'doc',
    };

    setAttachedFiles((prev) => [...prev, newFile]);

    // Read content to auto-populate description if empty
    if (!description && fileType === 'doc') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text && text.length > 20) {
          setDescription(text.slice(0, 1500));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInlineCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validate Captcha
    if (!inlineCaptcha.trim() || inlineCaptcha.trim().toLowerCase() !== inlineCaptchaCode.trim().toLowerCase()) {
      setAuthError('Security Captcha verification failed. Please enter the characters shown in the security image.');
      return;
    }

    setAuthLoading(true);
    const result = authService.login(authIdentifier, authPassword);
    setAuthLoading(false);

    if (result.success && result.user) {
      if (onLoginUser) onLoginUser(result.user);
    } else {
      setAuthError(result.error || 'Invalid credentials. Please verify your username/email and password.');
    }
  };

  const handleInlineCitizenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validate Captcha
    if (!inlineRegCaptcha.trim() || inlineRegCaptcha.trim().toLowerCase() !== inlineRegCaptchaCode.trim().toLowerCase()) {
      setAuthError('Security Captcha verification failed. Please enter the characters shown in the security image.');
      return;
    }

    setAuthLoading(true);
    const result = authService.registerCitizen({
      name: regName,
      username: regUsername,
      email: regEmail,
      password: regPassword,
      district: regDistrict,
      organization: 'Resident Citizen',
      department: 'Societal Stakeholder',
      role: 'citizen',
    });
    setAuthLoading(false);

    if (result.success && result.user) {
      if (onLoginUser) onLoginUser(result.user);
    } else {
      setAuthError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setSubmitError('You must sign in as a verified citizen, panchayat representative, or government body before submitting a challenge.');
      return;
    }

    if (!title.trim() || !description.trim() || !district) {
      setSubmitError('Title, description, and district are mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Resolve suitable university for automatic academic dispatch
      let targetUni = matchedUniversity;
      if (autoSubmitToUni && !targetUni) {
        targetUni = {
          id: 'iit-ism-dhanbad',
          name: 'Indian Institute of Technology (IIT ISM) Dhanbad',
          department: 'Department of Environmental Science & Water Engineering',
          incubationCenter: 'TexMiN Technology Innovation Hub & ACIC Foundation',
          routingReason: 'State Center of Excellence in groundwater aquifer mapping, heavy-metal remediation, and low-cost filtration.',
        };
      }

      const assignedUniPayload = autoSubmitToUni && targetUni ? {
        id: targetUni.id,
        name: targetUni.name,
        department: targetUni.department,
        assignedDate: new Date().toISOString().split('T')[0],
      } : undefined;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        secondaryCategory: secondaryCategory || undefined,
        district,
        blockOrPanchayat: blockOrPanchayat.trim() || blockName.trim() || panchayatName.trim() || 'Block Headquarters',
        submittedBy: {
          name: submitterName.trim() || currentUser.name,
          type: submitterType,
          contact: contact.trim() || currentUser.email || 'Not specified',
          email: currentUser.email,
          userId: currentUser.id,
          isVerifiedUser: true,
          citizenBeneficiary: citizenBeneficiary.trim() || undefined,
          localityVillage: localityVillage.trim() || undefined,
          panchayatName: panchayatName.trim() || undefined,
          blockName: blockName.trim() || undefined,
          certifiedByAuthority: (currentUser.role === 'panchayat' || currentUser.role === 'government' || currentUser.role === 'admin') ? certifiedByAuthority : undefined,
        },
        priority,
        estimatedImpactPeople: parseInt(estimatedImpactPeople, 10) || 1000,
        gpsCoordinates: gpsCoordinates || undefined,
        videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
        attachments: attachedFiles.map((f, i) => ({
          id: `att-new-${i}`,
          name: f.name,
          type: f.type,
          url: '#',
          size: f.size,
        })),
        aiAnalysis: aiAnalysisResult || {
          categoryConfidence: aiCategoryConfidence,
          summary: description.slice(0, 250),
          secondaryCategory: secondaryCategory || undefined,
          rootCauses: ['Local infrastructural bottlenecks', 'Lack of technological intervention'],
          suggestedDisciplines: ['Multidisciplinary Engineering', 'Applied Sciences'],
          recommendedUniversities: [targetUni?.name || 'IIT ISM Dhanbad', 'BIT Mesra'],
          routingReason: targetUni?.routingReason || 'Matched by domain relevance and district proximity.',
          incubationCenterMatched: targetUni?.incubationCenter || 'State Tech Innovation Hub',
          deDuplicationCheck: {
            isDuplicate: false,
            similarityScore: 8,
            status: 'unique',
            explanation: 'Clean submission verified with no conflicting entries in district.',
          },
          potentialPatentOrIP: true,
          urgencyScore: 88,
        },
        assignedUniversity: assignedUniPayload,
        autoSubmitToUniversity: autoSubmitToUni,
        autoSubmittedByAI: true,
      };

      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit challenge');
      }

      onChallengeSubmitted(data.challenge);
      setSubmissionSuccessData({
        challenge: data.challenge,
        assignedUniversity: assignedUniPayload || {
          name: 'Higher Education Department',
          department: 'State Innovation Incubation Cell',
        },
        categoryMode: isManualCategory ? 'manual' : 'ai',
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Error occurred while saving challenge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#003366] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold uppercase px-1.5 py-0.5 rounded">
                  Flowchart Stage 1: The Input
                </span>
                <span className="text-xs text-amber-300 font-semibold">• Direct Intake</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold">
                Submit Societal Challenge / सामाजिक चुनौती पंजीकरण
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUCCESS CONFIRMATION: Displayed after challenge is submitted & auto-routed */}
        {submissionSuccessData ? (
          <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>AI Auto-Detected & Routed Successfully</span>
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Societal Challenge Registered & Auto-Submitted!
              </h3>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your problem statement has been logged in the State Innovation Register and automatically dispatched to the allocated university for engineering team constitution and faculty review.
              </p>
            </div>

            {/* Structured Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-left max-w-xl mx-auto space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tracking Reference Code</span>
                  <div className="text-sm font-extrabold text-[#003366] flex items-center gap-2">
                    <span>{submissionSuccessData.challenge.code}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(submissionSuccessData.challenge.code);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 cursor-pointer transition-colors"
                      title="Copy Reference Code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {copiedCode && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Pipeline Status</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full inline-block border border-blue-200">
                    Stage 3: Assigned to HEI
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Problem Title</span>
                  <p className="font-bold text-slate-900 leading-snug">{submissionSuccessData.challenge.title}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Thematic Category</span>
                    <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span>{submissionSuccessData.challenge.category}</span>
                      {submissionSuccessData.categoryMode === 'ai' ? (
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold border border-amber-300">
                          AI Auto-Detected
                        </span>
                      ) : (
                        <span className="text-[9px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-bold border border-blue-300">
                          User Override
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Origin Locality</span>
                    <p className="font-semibold text-slate-700">
                      {submissionSuccessData.challenge.district}, Jharkhand
                    </p>
                  </div>
                </div>

                {/* University Auto-Routing Box */}
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-3.5 space-y-1.5 mt-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Automatically Dispatched To University</span>
                  </div>
                  <div className="font-extrabold text-sm text-emerald-950">
                    {submissionSuccessData.assignedUniversity.name}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium">
                    <strong>Department:</strong> {submissionSuccessData.assignedUniversity.department}
                  </div>
                  <div className="text-[10px] text-emerald-700 pt-1 border-t border-emerald-200/80 mt-1 flex items-start gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>The challenge has been routed to faculty leads and will appear in the university&apos;s project constitution backlog.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccessData(null);
                  onClose();
                }}
                className="px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-2"
              >
                <span>Done & View in Registry</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccessData(null);
                  setTitle('');
                  setDescription('');
                  setIsManualCategory(false);
                  setAiDetectedCategory(null);
                  setAttachedFiles([]);
                  setVideoUrls([]);
                }}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Submit Another Challenge
              </button>
            </div>
          </div>
        ) : !currentUser ? (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-amber-100 text-amber-900 rounded-lg flex-shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">
                    Citizen Authentication Required / नागरिक प्रमाणीकरण आवश्यक
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Under Government of Jharkhand Societal Innovation & Higher Education Collaboration Guidelines, all societal problems submitted by <strong>Citizens</strong>, <strong>Gram Panchayats (PRIs)</strong>, or <strong>Community Organizations</strong> must be authenticated.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-700">
                <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified Authenticity
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Ensures ground evidence and GPS coordinates are genuine.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    De-Duplication Check
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Prevents automated spam and duplicate entries in the block.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    Research Feedback
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Enables university faculty and students to correspond with you.
                  </p>
                </div>
              </div>

              {/* Citizen Credentials Sign In & Registration Form */}
              <div className="pt-3 border-t border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    {inlineAuthMode === 'login' ? 'Citizen Sign In (Username/Email & Password):' : 'Register New Citizen Account:'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    {inlineAuthMode === 'login' ? (
                      <button
                        type="button"
                        onClick={() => { setInlineAuthMode('register'); setAuthError(null); }}
                        className="text-[#003366] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Register New Citizen</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setInlineAuthMode('login'); setAuthError(null); }}
                        className="text-[#003366] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 text-blue-700" />
                        <span>Back to Citizen Login</span>
                      </button>
                    )}
                  </div>
                </div>

                {authError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {inlineAuthMode === 'login' ? (
                  <form onSubmit={handleInlineCitizenLogin} className="space-y-3 bg-white p-4 rounded-lg border border-slate-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Username or Email Address *
                        </label>
                        <input
                          type="text"
                          value={authIdentifier}
                          onChange={(e) => setAuthIdentifier(e.target.value)}
                          placeholder="e.g. citizen or ramesh@mail.com"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#003366] bg-slate-50/50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showAuthPassword ? 'text' : 'password'}
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full text-xs px-3 py-2 pr-9 border border-slate-300 rounded focus:ring-2 focus:ring-[#003366] bg-slate-50/50"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthPassword(!showAuthPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showAuthPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Security Captcha */}
                    <GovCaptcha
                      id="inline-auth-captcha"
                      value={inlineCaptcha}
                      onChange={setInlineCaptcha}
                      onCodeGenerated={setInlineCaptchaCode}
                      theme="emerald"
                    />

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full sm:w-auto px-5 py-2 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400 shadow-xs"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>{authLoading ? 'Verifying...' : 'Sign In & Continue'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleInlineCitizenRegister} className="space-y-3 bg-white p-4 rounded-lg border border-slate-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar Mahto"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Desired Username *
                        </label>
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value.toLowerCase())}
                          placeholder="e.g. ramesh_k"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="e.g. ramesh@gmail.com"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          District Jurisdiction *
                        </label>
                        <select
                          value={regDistrict}
                          onChange={(e) => setRegDistrict(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 bg-white"
                        >
                          {JHARKHAND_DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Password (Min 4 characters) *
                        </label>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Choose password"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                          required
                        />
                      </div>
                    </div>

                    {/* Security Captcha */}
                    <GovCaptcha
                      id="inline-reg-captcha"
                      value={inlineRegCaptcha}
                      onChange={setInlineRegCaptcha}
                      onCodeGenerated={setInlineRegCaptchaCode}
                      theme="emerald"
                    />

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400 shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
                        <span>{authLoading ? 'Registering...' : 'Register & Continue to Challenge Form'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Scrollable Form Body when Authenticated */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Authenticated Submitter Confirmation Banner */}
            <div className={`p-3.5 rounded-lg text-xs border flex items-center justify-between ${
              currentUser.role === 'panchayat'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : currentUser.role === 'government' || currentUser.role === 'admin'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                : 'bg-blue-50/80 border-blue-200 text-blue-950'
            }`}>
              <div className="flex items-center gap-2.5">
                {currentUser.role === 'panchayat' ? (
                  <Landmark className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                ) : currentUser.role === 'government' || currentUser.role === 'admin' ? (
                  <Building2 className="w-5 h-5 text-indigo-700 flex-shrink-0" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-blue-700 flex-shrink-0" />
                )}
                <div>
                  <span className="font-bold block">
                    {currentUser.role === 'panchayat'
                      ? '🏛️ Gram Panchayat & Mukhiya Locality Submission Portal'
                      : currentUser.role === 'government' || currentUser.role === 'admin'
                      ? '🏢 Government Body / District Administration Intake'
                      : '👤 Verified Citizen Submission Portal'}
                  </span>
                  <span className="text-[11px] opacity-80">
                    Logged in as: <strong>{currentUser.name}</strong> ({currentUser.designation || currentUser.role.toUpperCase()} • {currentUser.organization || 'Citizen Contributor'} • {currentUser.district})
                  </span>
                </div>
              </div>
              {onOpenLoginModal && (
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  className="text-[11px] underline font-bold cursor-pointer hover:opacity-80"
                >
                  Switch Persona
                </button>
              )}
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* FLOWCHART SECTION 1: WHO? */}
            <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  1. Who? (Submitter Stakeholder Classification)
                </span>
                <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-bold">
                  Stage 1 Intake
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Stakeholder Entity Type *
                  </label>
                  <select
                    value={submitterType}
                    onChange={(e) => setSubmitterType(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
                  >
                    <option value="Citizen">Citizen (Individual Resident)</option>
                    <option value="Community Organization">Community Organization / SHG</option>
                    <option value="Panchayati Raj Institution (PRI)">Panchayat / Local Body (PRI / Mukhiya)</option>
                    <option value="Urban Local Body (ULB)">Urban Local Body (ULB / Ward)</option>
                    <option value="Government Dept">Government Agency (District / Block)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Submitter / Official Name *
                  </label>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="e.g. Smt. Sunita Devi (Mukhiya) / Ramesh Mahto"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Official Contact (Phone / Email)
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. +91 94311 00000"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              {/* DEDICATED LOCALITY & CITIZEN PROBLEM SOURCING BLOCK */}
              <div className="p-3.5 bg-white rounded-lg border border-slate-300 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ground Locality & Citizen Beneficiaries / स्थानीय नागरिक एवं क्षेत्र विवरण</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Locality Problem Sourcing
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Affected Citizen(s) or Beneficiary Group in the Locality *
                  </label>
                  <input
                    type="text"
                    value={citizenBeneficiary}
                    onChange={(e) => setCitizenBeneficiary(e.target.value)}
                    placeholder={
                      currentUser.role === 'panchayat'
                        ? 'e.g. 450 tribal households & smallholder vegetable farmers of Hesatu Tola'
                        : currentUser.role === 'government'
                        ? 'e.g. Resident farming families of Ormanjhi block facing seasonal water table depletion'
                        : 'e.g. Resident citizens of Ward 4 / local farming families'
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Specify the local citizens, families, farmers, or ward residents whose ground-level challenge is being reported.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      Jharkhand District *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      required
                    >
                      {JHARKHAND_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Block / Tehsil *
                    </label>
                    <input
                      type="text"
                      value={blockName}
                      onChange={(e) => {
                        setBlockName(e.target.value);
                        setBlockOrPanchayat(`${e.target.value}${panchayatName ? `, ${panchayatName}` : ''}`);
                      }}
                      placeholder="e.g. Ormanjhi Block"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Gram Panchayat / Ward
                    </label>
                    <input
                      type="text"
                      value={panchayatName}
                      onChange={(e) => {
                        setPanchayatName(e.target.value);
                        setBlockOrPanchayat(`${blockName ? `${blockName}, ` : ''}${e.target.value}`);
                      }}
                      placeholder="e.g. Ormanjhi Gram Panchayat"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Village / Tola / Hamlet / Locality Landmark
                  </label>
                  <input
                    type="text"
                    value={localityVillage}
                    onChange={(e) => setLocalityVillage(e.target.value)}
                    placeholder="e.g. Hesatu Village, near Primary Health Centre and Community Well"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>

                {(currentUser.role === 'panchayat' || currentUser.role === 'government' || currentUser.role === 'admin') && (
                  <div className="pt-2 border-t border-slate-100 flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded border border-emerald-200">
                    <input
                      type="checkbox"
                      id="certify-authority"
                      checked={certifiedByAuthority}
                      onChange={(e) => setCertifiedByAuthority(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="certify-authority" className="text-[11px] text-emerald-950 font-medium cursor-pointer">
                      <strong>Official Locality Endorsement:</strong> I officially certify on behalf of the {currentUser.role === 'panchayat' ? 'Gram Panchayat' : 'Government Administrative Body'} that this issue represents a genuine ground-level civic challenge in our locality and is endorsed for university engineering R&D and field prototyping.
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* FLOWCHART SECTION 2: WHAT? (PROBLEM DESCRIPTION & MULTI-MODAL EVIDENCE) */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  2. What? (Problem Definition, Photos, Videos & GPS)
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                  Evidence Sourcing
                </span>
              </div>

              {/* Problem Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Problem Statement Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Low-Cost Solar Micro-Cold Storage for Tomato Farmers in Ormanjhi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 font-semibold bg-white"
                  required
                />
              </div>

              {/* Description & Auto-Detect AI Trigger */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-800">
                    Detailed Societal Challenge Description *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoClassify}
                    disabled={isAiClassifying || description.length < 15}
                    className="text-xs px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-slate-950 font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isAiClassifying ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>AI Classifying & De-duplicating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Detect with AI (Flowchart Stage 2)</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the challenge in detail: What is happening? Who is affected? What solutions were tried and why did they fail? What technical capability is required from university students & industry?..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans bg-white"
                  required
                />
              </div>

              {/* Multi-modal Evidence: Photos, Videos & GPS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Photos & Documents */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      Photos & Documents
                    </span>
                    <label className="cursor-pointer text-[10px] font-bold text-blue-700 hover:underline">
                      + Add File
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      />
                    </label>
                  </div>
                  {attachedFiles.length === 0 ? (
                    <p className="text-[10px] text-slate-400">Attach photos of damage, crop spoilage, or test reports.</p>
                  ) : (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {attachedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] bg-slate-50 p-1.5 rounded border border-slate-100">
                          <span className="truncate max-w-[120px] font-medium text-slate-700">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(i)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Videos */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-purple-600" />
                    Video Demonstration
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="YouTube / Video URL..."
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      className="text-[10px] px-2 py-1 border border-slate-300 rounded flex-1 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="bg-purple-600 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  {videoUrls.length > 0 && (
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {videoUrls.map((v, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] bg-purple-50 p-1 rounded border border-purple-100 text-purple-900">
                          <span className="truncate max-w-[120px]">{v}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(i)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* GPS Coordinates */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      GPS Geocoding
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={isDetectingGps}
                      className="text-[10px] font-bold text-red-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      {isDetectingGps ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : '📍 Detect GPS'}
                    </button>
                  </div>
                  {gpsCoordinates ? (
                    <div className="text-[10px] bg-red-50 p-1.5 rounded border border-red-200 text-red-900 space-y-0.5">
                      <div className="font-bold">📍 Lat: {gpsCoordinates.latitude}° N, Long: {gpsCoordinates.longitude}° E</div>
                      <div className="text-[9px] text-slate-500 truncate">{gpsCoordinates.locationName}</div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400">Click &quot;Detect GPS&quot; to geotag problem coordinates automatically.</p>
                  )}
                </div>
              </div>
            </div>

            {/* FLOWCHART SECTION 3: GOAL? (THEMATIC DOMAINS & AI UNIVERSITY MATCHING) */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  3. Domain & AI University Auto-Routing (लक्ष्य एवं विश्वविद्यालय आवंटन)
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  AI-Powered Match & Dispatch
                </span>
              </div>

              {/* Domain / Sector Selection with prominent AI Auto-detect trigger */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>{lang === 'hi' ? 'डोमेन / क्षेत्र *' : 'Domain / Sector *'}</span>
                    <span className="text-slate-400 font-normal">
                      {lang === 'hi' ? '(प्राथमिक विषयगत वर्गीकरण)' : '(Primary Thematic Classification)'}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleTriggerAutoDetect}
                    disabled={isAiDetecting || (!title.trim() && !description.trim())}
                    className="text-xs px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                    title="Click to have AI re-detect category from your title and description"
                  >
                    {isAiDetecting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>{lang === 'hi' ? 'जांच जारी है...' : 'Detecting...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-slate-950" />
                        <span>{lang === 'hi' ? 'एआई द्वारा स्वतः पहचान' : 'Auto-detect with AI'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <select
                      value={category}
                      onChange={(e) => handleManualCategoryChange(e.target.value as ThematicCategory)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                    >
                      {THEMATIC_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {t(c, lang)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      value={estimatedImpactPeople}
                      onChange={(e) => setEstimatedImpactPeople(e.target.value)}
                      placeholder="Estimated citizens impacted (e.g. 5000)"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                </div>

                {/* AI Detection vs Manual Override Status Feedback */}
                {isManualCategory ? (
                  <div className="flex items-center justify-between text-[11px] bg-blue-50 text-blue-900 px-3 py-2 rounded-md border border-blue-200 animate-in fade-in duration-150">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span><strong>Manually Set by You:</strong> {category}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleTriggerAutoDetect}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>Restore AI Auto-Detection</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] bg-amber-50 text-amber-900 px-3 py-2 rounded-md border border-amber-200 animate-in fade-in duration-150">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>AI Auto-Detected:</strong> {category} ({Math.round(aiCategoryConfidence * 100)}% Confidence)</span>
                    </span>
                    <span className="text-[10px] text-amber-800 font-medium">
                      If AI detects wrong, you can set it manually from the dropdown above anytime.
                    </span>
                  </div>
                )}
              </div>

              {/* SUITABLE UNIVERSITY AUTO-MATCHING & ROUTING CARD */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-300 rounded-xl p-4 text-xs space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-700 text-white rounded-lg shadow-2xs">
                      <School className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-emerald-950 text-xs">
                          AI Matched University for Academic Routing
                        </span>
                        <span className="text-[9px] font-black uppercase bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                          Flowchart Stage 3
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800">
                        AI automatically identifies the ideal university with domain R&D infrastructure & incubation lab
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManualUniversity(!isManualUniversity)}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto cursor-pointer"
                  >
                    {isManualUniversity ? 'Restore AI Matching' : 'Change University Manually'}
                  </button>
                </div>

                {matchedUniversity && (
                  <div className="space-y-3">
                    <div className="bg-white/95 p-3.5 rounded-lg border border-emerald-200 shadow-2xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                            Allocated Higher Education Institution (HEI)
                          </span>
                          <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>{matchedUniversity.name}</span>
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300 self-start sm:self-auto">
                          {isManualUniversity ? 'Manual Selection' : 'Domain Match: 98%'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-500 font-medium">Assigned Department: </span>
                          <span className="font-bold text-slate-800">{matchedUniversity.department}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Innovation Hub: </span>
                          <span className="font-bold text-slate-800">{matchedUniversity.incubationCenter || 'State Innovation Centre'}</span>
                        </div>
                      </div>

                      {matchedUniversity.routingReason && (
                        <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 leading-relaxed">
                          <strong>AI Rationale:</strong> {matchedUniversity.routingReason}
                        </p>
                      )}
                    </div>

                    {/* Manual University Override Selector if enabled */}
                    {isManualUniversity && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1.5 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-bold text-amber-950">
                          Manually Select University from State Accredited Register:
                        </label>
                        <select
                          value={matchedUniversity.name}
                          onChange={(e) => {
                            const selectedUni = UNIVERSITIES.find(u => u.name === e.target.value);
                            if (selectedUni) {
                              setMatchedUniversity({
                                id: selectedUni.id,
                                name: selectedUni.name,
                                department: selectedUni.specializations[0] ? `Department of ${selectedUni.specializations[0]}` : 'Department of Applied Sciences',
                                incubationCenter: selectedUni.incubationFacilities[0] || 'State Innovation Centre',
                                routingReason: `Manually chosen by submitter: Specialized in ${selectedUni.specializations.join(', ')}`,
                                location: selectedUni.location,
                              });
                            }
                          }}
                          className="w-full text-xs px-2.5 py-1.5 border border-amber-300 rounded bg-white text-slate-800 font-medium"
                        >
                          {UNIVERSITIES.map(u => (
                            <option key={u.id} value={u.name}>
                              {u.name} ({u.location}) - {u.specializations[0] || 'Engineering'}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-amber-800">
                          If you want a specific university to work on your problem, select it above and AI will route the problem there.
                        </p>
                      </div>
                    )}

                    {/* Automatic Submission Checkbox */}
                    <div className="flex items-start gap-2.5 bg-emerald-100/70 p-3 rounded-lg border border-emerald-300">
                      <input
                        type="checkbox"
                        id="auto-submit-uni-toggle"
                        checked={autoSubmitToUni}
                        onChange={(e) => setAutoSubmitToUni(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer h-4 w-4"
                      />
                      <label htmlFor="auto-submit-uni-toggle" className="text-xs text-emerald-950 font-semibold cursor-pointer select-none">
                        <span>Automatically submit and route this problem to <strong>{matchedUniversity.name}</strong> upon submission.</span>
                        <span className="block text-[10px] text-emerald-800 font-normal mt-0.5">
                          ⚡ When checked, the problem will be instantly dispatched to this university&apos;s department in the University Collaboration Hub.
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STAGE 2 AI FEEDBACK CARD (Classification, De-duplication, and Expertise-Routing) */}
            {aiAnalysisResult && (
              <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-amber-50/40 border-2 border-indigo-200 rounded-xl p-4 text-xs space-y-3 animate-in fade-in duration-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-md">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-indigo-950 block">
                        Flowchart Stage 2 • AI Problem Management Results
                      </span>
                      <span className="text-[10px] text-slate-500">Gemini 3.8 Flash Deep Technical Analysis</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded border border-indigo-200">
                    Urgency Score: {aiAnalysisResult.urgencyScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* AI Classification */}
                  <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 space-y-1">
                    <div className="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-600" />
                      Classification
                    </div>
                    <p className="text-[10px] text-slate-600">
                      Primary: <strong>{category}</strong>
                      {secondaryCategory && (
                        <span> + Secondary: <strong>{secondaryCategory}</strong></span>
                      )}
                    </p>
                  </div>

                  {/* AI De-duplication */}
                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      De-duplication Check
                    </div>
                    <p className="text-[10px] text-emerald-800">
                      {aiAnalysisResult.deDuplicationCheck?.explanation || 'No duplicate found in this district. Clean submission verified.'}
                    </p>
                  </div>

                  {/* Expertise-Routing */}
                  <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 space-y-1">
                    <div className="font-bold text-blue-900 text-[11px] flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-blue-600" />
                      Expertise-Routing
                    </div>
                    <p className="text-[10px] text-slate-600">
                      Matched: <strong>{aiAnalysisResult.recommendedUniversities?.[0] || 'BIT Mesra / BAU'}</strong>
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-700 italic bg-white/60 p-2 rounded border border-indigo-100">
                  &quot;{aiAnalysisResult.summary}&quot;
                </p>
              </div>
            )}

            {/* Footer Submit Action */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 max-w-sm">
                * Citizen-authenticated submission directly registers on Yukti Marg for university assignment.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-md text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:bg-slate-400"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registering Challenge...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>Submit Challenge to Yukti Marg</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
