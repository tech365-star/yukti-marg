import React, { useState } from 'react';
import { Challenge, User } from '../types';
import { 
  X, 
  Rocket, 
  Upload, 
  FileCheck2, 
  FileArchive, 
  CheckCircle2, 
  Building2, 
  Cpu, 
  Award, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface PrototypeDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  currentUser: User | null;
  onPrototypeDeployed: (updatedChallenge: Challenge) => void;
}

export const PrototypeDeployModal: React.FC<PrototypeDeployModalProps> = ({
  isOpen,
  onClose,
  challenge,
  currentUser,
  onPrototypeDeployed,
}) => {
  const targetIndustryName = 
    challenge.industryPartners?.[0]?.partnerName || 
    challenge.proposals?.[0]?.targetIndustryName || 
    'Tata Steel CSR & Technology Incubation Division';

  const [title, setTitle] = useState(
    challenge.proposals?.[0]?.proposalTitle 
      ? `Prototype: ${challenge.proposals[0].proposalTitle}`
      : `Verified Prototype Deliverable: ${challenge.title.slice(0, 45)}...`
  );
  const [version, setVersion] = useState('v1.0-release');
  const [description, setDescription] = useState(
    `Fully validated working prototype with lab telemetry, field deployment schematics, and operational firmware. Developed by ${challenge.assignedUniversity?.name || currentUser?.organization || 'University'} under corporate CSR sponsorship.`
  );
  const [testResults, setTestResults] = useState(
    'Lab bench testing validated under 45°C ambient temperature. Met all operational requirements with 94% target efficiency.'
  );
  const [demoUrl, setDemoUrl] = useState('https://github.com/jharkhand-r-and-d/prototype-telemetry-demo');
  const [specsInput, setSpecsInput] = useState(
    'Microcontroller Telemetry, Solar Powered DC Inverter, IP65 Weatherproof Enclosure, Hindi/Mundari Farmer Interface'
  );

  // File deliverable state
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
  } | null>({
    name: `${challenge.code}_Prototype_Deliverable_Package.zip`,
    size: '18.4 MB',
    type: 'application/zip',
    uploadedAt: new Date().toISOString(),
  });

  const [isDeploying, setIsDeploying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setAttachedFile({
        name: file.name,
        size: `${sizeMB} MB`,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      });
    }
  };

  const handleGenerateTemplatePackage = () => {
    setAttachedFile({
      name: `${challenge.code}_Engineering_Prototype_Dossier_${Date.now().toString().slice(-4)}.zip`,
      size: '24.6 MB',
      type: 'application/zip',
      uploadedAt: new Date().toISOString(),
    });
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide a prototype title and description.');
      return;
    }

    if (!attachedFile) {
      setErrorMsg('Please attach or upload a prototype deliverable file to deploy to the industry.');
      return;
    }

    setIsDeploying(true);
    setErrorMsg(null);

    try {
      const payload = {
        title: title.trim(),
        version: version.trim(),
        description: description.trim(),
        deliverableFile: attachedFile,
        demoUrl: demoUrl.trim() || undefined,
        testResultsSummary: testResults.trim(),
        specifications: specsInput.split(',').map((s) => s.trim()).filter(Boolean),
        deployedToIndustryId: challenge.proposals?.[0]?.targetIndustryId,
        deployedToIndustryName: targetIndustryName,
        deployedBy: challenge.team?.facultyMentor || currentUser?.name || 'Faculty Principal Investigator',
      };

      const res = await fetch(`/api/challenges/${challenge.id}/deploy-prototype`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.challenge) {
        onPrototypeDeployed(data.challenge);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to submit and deploy prototype');
      }
    } catch (err: any) {
      console.error('Deploy error:', err);
      setErrorMsg(err.message || 'Network error while deploying prototype');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto" id="prototype-deploy-modal">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002855] via-[#003366] to-[#1e3a8a] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/20 rounded-lg border border-amber-400/30">
              <Rocket className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded uppercase">
                  Workflow Phase 5
                </span>
                <span className="text-xs text-blue-200 font-mono font-bold">{challenge.code}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Submit & Deploy Prototype to Industry
              </h3>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-blue-200 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corporate Handover Notice */}
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center justify-between text-xs text-blue-950">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span>Target Deploy Sponsor: <strong>{targetIndustryName}</strong></span>
          </div>
          <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-bold">
            CSR Funded Project
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDeploy} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title & Version */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-800">
                Prototype Deliverable Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="e.g. PCM Solar Cold Room IoT Telemetry Rig"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                Release Version
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                placeholder="v1.0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">
              Prototype Description & Architecture Brief <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
              placeholder="Detail the technical implementation, components used, and operational readiness..."
            />
          </div>

          {/* CRITICAL FILE FORMAT ATTACHMENT MANDATED BY USER */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileArchive className="w-4 h-4 text-blue-700" />
                <label className="text-xs font-black text-slate-900">
                  Prototype Deliverable File (File Format) <span className="text-red-500">*</span>
                </label>
              </div>
              <button
                type="button"
                onClick={handleGenerateTemplatePackage}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Auto-Generate Verified Package (.zip)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              Attach technical deliverables for corporate review (CAD drawings, firmware binaries, testing report, or code archive).
            </p>

            {/* Attached File Display or Upload Box */}
            {attachedFile ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-mono">
                      {attachedFile.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Size: {attachedFile.size} • Type: {attachedFile.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                    Ready for Deployment
                  </span>
                  <label className="text-xs text-blue-700 hover:text-blue-900 font-bold cursor-pointer underline">
                    Replace
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".zip,.tar,.gz,.pdf,.cad,.step,.apk"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-5 bg-white rounded-lg border border-slate-300 hover:border-blue-400 cursor-pointer transition-colors text-center">
                <Upload className="w-6 h-6 text-blue-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">
                  Click or drag file here to attach prototype package
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Accepts .zip, .pdf, .cad, .step, .apk (Max 100MB)
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".zip,.tar,.gz,.pdf,.cad,.step,.apk"
                />
              </label>
            )}
          </div>

          {/* Test Results & Benchmark Metrics */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">
              Lab Testing Benchmark Results & Validation Summary
            </label>
            <input
              type="text"
              value={testResults}
              onChange={(e) => setTestResults(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="e.g. 100% solar uptime, verified 4-8°C storage for 24h"
            />
          </div>

          {/* Specifications Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">
              Technical Specifications (Comma-separated)
            </label>
            <input
              type="text"
              value={specsInput}
              onChange={(e) => setSpecsInput(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="e.g. Microcontroller, Solar PV, PUF insulation"
            />
          </div>

          {/* Live Demo or Repository URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800">
              Working Demonstration Video or GitHub / CAD Repository Link
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              placeholder="https://..."
            />
          </div>

          {/* Faculty / Authority Verification Note */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                Academic & Technical Sign-off:
              </span>
              <span className="text-[11px] text-amber-900 leading-snug block mt-0.5">
                Submitting under authority of <strong>{challenge.team?.facultyMentor || currentUser?.name || 'Faculty Principal Investigator'}</strong> ({challenge.assignedUniversity?.name || currentUser?.organization || 'University'}). This deliverable will be transmitted to <strong>{targetIndustryName}</strong> for corporate verification. Once the industry accepts the prototype and deployment, the status will automatically change to <strong>Complete and Deployed (Status: End)</strong> across the university and citizen portals.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying}
              className="px-6 py-2.5 bg-gradient-to-r from-[#003366] to-[#002855] text-white rounded-xl text-xs font-black flex items-center gap-2 hover:shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              <Rocket className="w-4 h-4 text-amber-300" />
              <span>{isDeploying ? 'Deploying to Industry...' : 'Submit & Deploy Prototype to Industry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
