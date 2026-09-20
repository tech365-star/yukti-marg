export type UserRole = 'citizen' | 'panchayat' | 'government' | 'departmental' | 'university' | 'industry' | 'admin';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  organization: string;
  department?: string;
  district: string;
  block?: string;
  panchayat?: string;
  phone?: string;
  designation?: string;
  verified: boolean;
}

export type ThematicCategory =
  | 'Agriculture & Rural Livelihoods'
  | 'Water Resources & Sanitation'
  | 'Healthcare & Telemedicine'
  | 'Smart Education & Skill Dev'
  | 'Clean Energy & Environment'
  | 'Urban Infrastructure & Waste'
  | 'Tribal Crafts, Forestry & Mining Tech'
  | 'Public Service Delivery & Accessibility';

export type ChallengeStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned_hei'
  | 'team_constituted'
  | 'proposal_submitted'
  | 'prototype_development'
  | 'pilot_testing'
  | 'deployed';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'video';
  url: string;
  size: string;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  locationName?: string;
}

export interface PatentRecord {
  status: 'none' | 'drafting' | 'filed' | 'published' | 'granted';
  applicationNumber?: string;
  filingDate?: string;
  patentTitle?: string;
  inventors?: string[];
  patentOffice?: string;
}

export interface ResearchPaperRecord {
  status: 'none' | 'in_review' | 'accepted' | 'published';
  paperTitle?: string;
  journalOrConference?: string;
  publicationDate?: string;
  doi?: string;
  citationsCount?: number;
}

export interface PrototypeTestingStatus {
  testedInField: boolean;
  testingDate?: string;
  testLocation?: string;
  testingSummary?: string;
  isDeployedInCommunity: boolean;
  deploymentDate?: string;
  beneficiaryFeedback?: string;
}

export interface StudentMember {
  name: string;
  rollNo?: string;
  discipline: string;
  yearOrSemester: string;
}

export interface UniversityTeam {
  facultyMentor: string;
  mentorDesignation: string;
  mentorDepartment: string;
  universityName: string;
  universityId?: string;
  incubationCenter?: string;
  studentMembers: StudentMember[];
  constitutedDate: string;
}

export type IndustryPartnerType = 
  | 'Industry' 
  | 'Startup' 
  | 'MSME' 
  | 'CSR Foundation' 
  | 'Research Institution' 
  | 'Innovation Hub';

export type PartnershipEngagementType = 
  | 'Mentoring' 
  | 'Co-development' 
  | 'Funding' 
  | 'Prototyping Lab' 
  | 'Pilot Implementation' 
  | 'Technology Transfer';

export interface SolutionProposal {
  id: string;
  challengeId: string;
  universityName: string;
  universityId: string;
  facultyLead: string;
  proposalTitle: string;
  summary: string;
  technologyStack: string[];
  estimatedBudgetINR: number;
  timelineMonths: number;
  targetDeliverables: string[];
  status: 
    | 'submitted' 
    | 'shortlisted' 
    | 'approved_by_admin' 
    | 'industry_sponsored' 
    | 'accepted_by_industry' 
    | 'rejected_by_industry' 
    | 'funding_approved' 
    | 'funding_rejected';
  submittedDate: string;
  sponsoredBy?: string;
  grantAmountINR?: number;
  targetIndustryId?: string;
  targetIndustryName?: string;
  targetIndustryType?: IndustryPartnerType;
  partnershipType?: PartnershipEngagementType;
  aiSuggestedMatch?: boolean;
  aiMatchReason?: string;
  proposalFile?: {
    name: string;
    size: string;
    type: string;
    url?: string;
    fileData?: string;
    uploadedAt?: string;
  };
  ideaPlanDetails?: string;
  problemDecision?: {
    status: 'accepted' | 'rejected';
    decidedBy: string;
    decidedAt: string;
    comments: string;
    partnerName?: string;
  };
  fundingDecision?: {
    status: 'accepted' | 'rejected';
    approvedAmountINR?: number;
    guaranteeAmountINR?: number;
    csrGuaranteeStatus?: 'guaranteed' | 'rejected' | 'pending';
    csrSanctionRef?: string;
    decidedBy: string;
    decidedAt: string;
    comments: string;
    supportType?: string;
    partnerName?: string;
  };
}

export interface IndustryPledge {
  id: string;
  challengeId: string;
  partnerName: string;
  partnerType: 'Industry' | 'Startup' | 'MSME' | 'CSR Foundation' | 'Research Institution' | 'Innovation Hub';
  supportType: 'Co-development' | 'Mentorship' | 'CSR Grant' | 'Funding' | 'Prototyping Lab' | 'Pilot Deployment' | 'Technology Transfer';
  pledgeAmountINR?: number;
  contactPerson: string;
  email: string;
  notes: string;
  status: 'pledged' | 'mou_signed' | 'active';
  date: string;
}

export interface ProjectApproval {
  id: string;
  stageName: string;
  stageCode: string;
  approverName: string;
  approverRole: 'government' | 'university' | 'industry' | 'admin';
  approverOrg: string;
  approvalDate: string;
  decision: 'approved' | 'rejected' | 'pending' | 'revision_requested';
  comments: string;
  officialRefNo?: string;
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  category: 'System Architecture' | 'Physical Prototype' | 'Lab Testing Report' | 'IP & Patent Filing' | 'Community Field Trial' | 'Technology Transfer Agreement';
  submittedBy: string;
  submissionDate: string;
  status: 'draft' | 'submitted' | 'under_review' | 'verified_by_gov';
  evidenceUrl?: string;
  notes?: string;
}

export interface StartupRecord {
  name: string;
  incubationCenter: string;
  founders: string[];
  incorporationDate?: string;
  fundingRaisedINR?: number;
  dpiitRecognized?: boolean;
  description: string;
  sector: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'submission' | 'ai_routing' | 'adoption' | 'team' | 'proposal' | 'pledge' | 'milestone' | 'approval' | 'patent';
  challengeId?: string;
  challengeCode?: string;
  targetRole?: UserRole | 'all';
  isRead: boolean;
  actorName: string;
  actorOrg: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'verified_by_gov';
  completedDate?: string;
  deliverableEvidenceUrl?: string;
}

export interface CollaborationComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorOrg: string;
  message: string;
  createdAt: string;
  isOfficialNote?: boolean;
}

export interface Challenge {
  id: string;
  code: string; // e.g. YM-JH-2026-1042
  title: string;
  description: string;
  category: ThematicCategory;
  district: string;
  blockOrPanchayat: string;
  submittedBy: {
    name: string;
    type: 'Citizen' | 'Community Organization' | 'Panchayat / Local Body (PRI/ULB)' | 'Government Agency' | 'Panchayati Raj Institution (PRI)' | 'Urban Local Body (ULB)' | 'Community Organization' | 'Government Dept';
    contact?: string;
    email?: string;
    userId?: string;
    isVerifiedUser?: boolean;
    citizenBeneficiary?: string;
    citizenContact?: string;
    assistedByOfficer?: boolean;
    localityVillage?: string;
    panchayatName?: string;
    blockName?: string;
    certifiedByAuthority?: boolean;
  };
  submittedDate: string;
  priority: PriorityLevel;
  status: ChallengeStatus;
  estimatedImpactPeople: number;
  attachments: Attachment[];
  videoUrls?: string[];
  gpsCoordinates?: GPSLocation;
  
  // AI Problem Management (Stage 2 of Flowchart)
  aiAnalysis?: {
    categoryConfidence: number;
    summary: string;
    secondaryCategory?: string;
    rootCauses: string[];
    suggestedDisciplines: string[];
    recommendedUniversities: string[];
    potentialPatentOrIP: boolean;
    urgencyScore: number; // 1-100
    deDuplicationCheck?: {
      isDuplicate: boolean;
      duplicateOfCode?: string;
      similarityScore: number;
      status: 'unique' | 'potential_duplicate';
      explanation: string;
    };
    routingReason?: string;
    incubationCenterMatched?: string;
  };

  // University Collaboration (Stage 3 of Flowchart)
  universityReview?: {
    evaluated: boolean;
    reviewerName: string;
    reviewerDesignation: string;
    reviewDate: string;
    feasibilityScore: number; // 1-100
    evaluationSummary: string;
  };
  assignedUniversity?: {
    id: string;
    name: string;
    department: string;
    assignedDate: string;
  };
  universityAcceptance?: {
    status: 'pending' | 'accepted' | 'declined';
    acceptedAt?: string;
    acceptedBy?: string;
    remarks?: string;
  };
  team?: UniversityTeam;
  proposals: SolutionProposal[];

  // Industry & Partnership (Stage 4 of Flowchart)
  industryPartners: IndustryPledge[];

  // Lifecycle & Dashboard (Stage 5 of Flowchart)
  milestones: Milestone[];
  deliverables?: ProjectDeliverable[];
  approvals?: ProjectApproval[];
  prototypeTesting?: PrototypeTestingStatus;
  prototypeDeliverable?: {
    id: string;
    title: string;
    version?: string;
    description: string;
    deliverableFile?: {
      name: string;
      size: string;
      type: string;
      url?: string;
      fileData?: string;
    };
    demoUrl?: string;
    testResultsSummary?: string;
    specifications?: string[];
    submittedDate: string;
    deployedDate?: string;
    deployedToIndustryId?: string;
    deployedToIndustryName?: string;
    status: 'in_prototyping' | 'prototype_submitted' | 'deployed' | 'verified_by_industry';
    verifiedByIndustry?: {
      verified: boolean;
      verifiedBy: string;
      verifiedAt: string;
      remarks?: string;
    };
  };
  patentInfo?: PatentRecord;
  researchPaperInfo?: ResearchPaperRecord;
  startupInfo?: StartupRecord;
  technologyTransferInfo?: {
    transferredTo: string;
    transferType: 'Licensing' | 'Commercial Production' | 'Open Source Public Good' | 'Startup Spin-off';
    mouDate?: string;
    commercializationStatus: 'negotiating' | 'signed' | 'active_production' | 'deployed_statewide';
  };
  comments: CollaborationComment[];
  socialImpactAchieved?: string;
  lifecycleStatus?: 'in_progress' | 'end';
}

export interface UniversityProfile {
  id: string;
  name: string;
  location: string;
  specializations: string[];
  incubationFacilities: string[];
  activeProjects: number;
  solvedChallenges: number;
  patentsFiled: number;
  type?: string;
  nirfRank?: number;
  district?: string;
  studentInnovatorsCount?: number;
  nodalLead?: string;
  email?: string;
  contactPhone?: string;
}

export interface IndustryPartnerOrg {
  id: string;
  name: string;
  type: IndustryPartnerType;
  sector: string;
  csrFocusAreas: string[];
  committedFundingINR: number;
  contactPerson: string;
  email: string;
  phone?: string;
  location?: string;
  loginUsername?: string;
  verified?: boolean;
  description?: string;
}

export interface AISummaryRequest {
  documentText: string;
  fileName?: string;
  contextDistrict?: string;
}

export interface AISummaryResponse {
  category: ThematicCategory;
  titleSuggestion: string;
  executiveSummary: string;
  keyProblems: string[];
  rootCauses: string[];
  suggestedDisciplines: string[];
  recommendedUniversities: string[];
  nepRelevance: string;
  urgencyScore: number;
  priority: PriorityLevel;
}
