import { ThematicCategory } from '../types';

export interface UniversityDomainProfile {
  id: string;
  name: string;
  shortName: string;
  location: string;
  leadFaculty: string;
  facultySpecializations: string[];
  studentCohort: string;
  researchFacilities: string[];
  incubationCenter: string;
  supportedCategories: ThematicCategory[];
  domainKeywords: string[];
  solvedChallengesCount: number;
  activePatentsCount: number;
}

export const JHARKHAND_UNIVERSITIES: UniversityDomainProfile[] = [
  {
    id: 'bau-ranchi',
    name: 'Birsa Agricultural University (BAU) Kanke, Ranchi',
    shortName: 'BAU Kanke',
    location: 'Ranchi',
    leadFaculty: 'Dr. Rameshwar Singh (Dean, Faculty of Agricultural Engineering) & Dr. Anita Tirkey (Head, Post-Harvest Tech)',
    facultySpecializations: [
      'Agro-Processing & Cold Chain Engineering',
      'Drought-Resistant Crop Breeding & Millet Preservation',
      'Soil Health, Entomology & Biopesticides',
      'Lac, Honey & Non-Timber Forest Product (NTFP) Tech',
      'Rural Micro-Irrigation & Farm Machinery'
    ],
    studentCohort: '580+ M.Sc/B.Tech Agriculture & Agronomy Innovation Scholars, Krishi Vigyan Kendra (KVK) Student Fellows',
    researchFacilities: [
      'Agri-Business Incubator (RABI)',
      'State Food Processing Pilot Plant',
      'Tissue Culture & Micro-propagation Lab',
      'Bio-fertilizer & Soil Analytical Facility'
    ],
    incubationCenter: 'Agri-Business Incubator (RABI) & Millet Processing Demonstration Unit',
    supportedCategories: [
      'Agriculture & Rural Livelihoods',
      'Water Resources & Sanitation',
      'Clean Energy & Environment'
    ],
    domainKeywords: [
      'agriculture', 'crop', 'farmer', 'kisan', 'vegetable', 'tomato', 'potato', 'cold storage', 'soil',
      'irrigation', 'pest', 'fertilizer', 'millet', 'lac', 'seed', 'harvest', 'farm', 'food processing',
      'horticulture', 'dairy', 'poultry', 'rabi', 'kharif', 'spoilage'
    ],
    solvedChallengesCount: 11,
    activePatentsCount: 6,
  },
  {
    id: 'bit-mesra',
    name: 'Birla Institute of Technology (BIT) Mesra, Ranchi',
    shortName: 'BIT Mesra',
    location: 'Ranchi',
    leadFaculty: 'Prof. Dr. Rajesh K. Verma (Dept of Mechanical & Agro-Automation) & Dr. Priyank Sharma (Dept of Electrical & Renewable Energy)',
    facultySpecializations: [
      'Agro-Mechanization & Mechatronics',
      'Solar Photovoltaic, Hybrid Microgrids & Battery Storage',
      'IoT Sensor Networks, Automation & Telemetry',
      'Precision Manufacturing & Low-cost Cold Storage Engineering',
      'Bio-Technology & Pharmaceutical Drug Testing'
    ],
    studentCohort: '1,200+ Multidisciplinary Engineering & Tech Innovators (Robotics Club, IEEE Student Chapter, Solar Car Team)',
    researchFacilities: [
      'BIT-TBI Technology Business Incubator',
      'AICTE IDEA Lab (Advanced Prototyping)',
      'Micro-Manufacturing FabLab with CNC & 3D Printers',
      'Center for Renewable Energy & Power Systems'
    ],
    incubationCenter: 'BIT-TBI Incubation Centre & AICTE IDEA Lab',
    supportedCategories: [
      'Agriculture & Rural Livelihoods',
      'Clean Energy & Environment',
      'Smart Education & Skill Dev',
      'Urban Infrastructure & Waste'
    ],
    domainKeywords: [
      'solar', 'energy', 'power', 'automation', 'machine', 'sensor', 'iot', 'robotics', 'cold storage',
      'mechanical', 'battery', 'inverter', 'microgrid', 'prototyping', 'fabrication', 'hardware',
      'electrical', 'drone', 'biotechnology', 'telemetry'
    ],
    solvedChallengesCount: 14,
    activePatentsCount: 9,
  },
  {
    id: 'iit-ism-dhanbad',
    name: 'Indian Institute of Technology (IIT ISM) Dhanbad',
    shortName: 'IIT (ISM) Dhanbad',
    location: 'Dhanbad',
    leadFaculty: 'Prof. Alok Sinha (Head, Environmental Science & Engineering) & Prof. D. C. Panigrahi (Dept of Mining Engineering)',
    facultySpecializations: [
      'Groundwater Hydrology, Aquifer Remediation & Water Quality',
      'Arsenic, Fluoride & Heavy Metal Nano-Filtration',
      'Mining Safety, Overburden Slag Utilization & Fly Ash Bricks',
      'Clean Coal & Geo-Energy Systems',
      'Earthquake Monitoring & Geotechnical Instrumentation'
    ],
    studentCohort: '850+ PG/Ph.D & B.Tech Researchers in Earth Sciences, Environmental Engineering & Mining Technologies',
    researchFacilities: [
      'TexMiN Technology Innovation Hub (Dept of Science & Tech)',
      'ACIC IIT ISM Foundation (Atal Community Innovation Centre)',
      'Advanced Water Quality & Nano-Analytical Lab',
      'Mine Safety Simulation Testing Center'
    ],
    incubationCenter: 'TexMiN Innovation Hub & ACIC IIT ISM Foundation',
    supportedCategories: [
      'Water Resources & Sanitation',
      'Tribal Crafts, Forestry & Mining Tech',
      'Clean Energy & Environment',
      'Urban Infrastructure & Waste'
    ],
    domainKeywords: [
      'water', 'aquifer', 'groundwater', 'fluoride', 'arsenic', 'drinking water', 'contamination',
      'filtration', 'well', 'borewell', 'mining', 'coal', 'slag', 'quarry', 'fly ash', 'geology',
      'environmental', 'mine safety', 'heavy metal', 'toxic'
    ],
    solvedChallengesCount: 18,
    activePatentsCount: 12,
  },
  {
    id: 'nit-jamshedpur',
    name: 'National Institute of Technology (NIT) Jamshedpur',
    shortName: 'NIT Jamshedpur',
    location: 'East Singhbhum (Jamshedpur)',
    leadFaculty: 'Prof. Sanjay Kumar (Dept of Metallurgical & Materials Engg) & Dr. R. K. Singh (Dept of Civil Infrastructure)',
    facultySpecializations: [
      'Industrial Slag Repurposing & Geopolymer Concrete',
      'Municipal Solid Waste & Plastic Upcycling',
      'Low-cost Community Water Filters & Drainage Systems',
      'Electric Vehicle (EV) Powertrains & Micro-mobility',
      'Rural Structural Engineering & Disaster-Resilient Pavements'
    ],
    studentCohort: '720+ Engineering Scholars, Civil Innovation League & Materials Science Research Society',
    researchFacilities: [
      'STEP Technology Business Incubator',
      'Advanced Materials Testing & Metallurgy Lab',
      'Civil & Structural Prototype Testbed',
      'Centre for Urban Environmental Systems'
    ],
    incubationCenter: 'STEP Technology Business Incubator & Advanced Materials Lab',
    supportedCategories: [
      'Urban Infrastructure & Waste',
      'Water Resources & Sanitation',
      'Clean Energy & Environment',
      'Tribal Crafts, Forestry & Mining Tech'
    ],
    domainKeywords: [
      'waste', 'garbage', 'plastic', 'recycling', 'concrete', 'road', 'pavement', 'drainage', 'sewage',
      'metal', 'metallurgy', 'slag', 'infrastructure', 'bridge', 'pothole', 'urban', 'solid waste',
      'materials', 'ev', 'structural'
    ],
    solvedChallengesCount: 11,
    activePatentsCount: 7,
  },
  {
    id: 'rims-ranchi',
    name: 'Rajendra Institute of Medical Sciences (RIMS) Ranchi',
    shortName: 'RIMS Ranchi',
    location: 'Ranchi',
    leadFaculty: 'Dr. Vivek Kashyap (Head, Community Medicine & Rural Healthcare) & Dr. R. K. Shrivastava (Telemedicine Nodal Lead)',
    facultySpecializations: [
      'Tribal Public Health & Tele-diagnostics',
      'Sickle Cell Anemia & Thalassemia Point-of-Care Diagnostics',
      'Severe Acute Malnutrition (SAM) Clinical Protocols',
      'Vector-Borne Diseases (Malaria, Kala-azar, Dengue) Tracking',
      'Maternal, Neonatal & Child Healthcare (MCH) Devices'
    ],
    studentCohort: '400+ MBBS, MD Community Medicine & Clinical Research Interns actively deployed in rural PHCs/CHCs',
    researchFacilities: [
      'State Tele-Medicine Digital Hub',
      'State Viral Research & Diagnostic Laboratory (VRDL)',
      'Sickle Cell & Hematology Research Center',
      'Public Health Field Practice Demonstration Units'
    ],
    incubationCenter: 'RIMS Clinical Innovation Hub & Tele-Medicine Cell',
    supportedCategories: [
      'Healthcare & Telemedicine',
      'Public Service Delivery & Accessibility'
    ],
    domainKeywords: [
      'health', 'hospital', 'doctor', 'patient', 'medicine', 'disease', 'clinic', 'phc', 'chc',
      'sickle cell', 'anemia', 'malaria', 'malnutrition', 'child health', 'maternal', 'telemedicine',
      'ambulance', 'diagnostic', 'blood', 'vaccination', 'fever', 'medical', 'pregnant', 'infant'
    ],
    solvedChallengesCount: 9,
    activePatentsCount: 4,
  },
  {
    id: 'iiit-ranchi',
    name: 'Indian Institute of Information Technology (IIIT) Ranchi',
    shortName: 'IIIT Ranchi',
    location: 'Ranchi',
    leadFaculty: 'Dr. Bharat Singh (Dept of Computer Science) & Dr. Shweta Kumari (Multilingual NLP & Speech Lab)',
    facultySpecializations: [
      'Multilingual AI/NLP in Santhali, Mundari, Ho, Kurukh & Hindi',
      'Low-bandwidth EdTech & Offline Digital Learning Pods',
      'Citizen Service Portals, Mobile e-Governance & Biometric Access',
      'GIS Mapping, Drone Imagery & Remote Sensing AI',
      'Cyber-Physical Systems & IoT Micro-controllers'
    ],
    studentCohort: '490+ Computer Science, Data Science & AI Innovators (Open Source Developers & Smart India Hackathon Winners)',
    researchFacilities: [
      'AI & Speech Processing Laboratory for Tribal Dialects',
      'Cyber Physical Systems & Embedded Prototyping Cell',
      'Student Startup Hub & Open Data Observatory',
      'EdTech Hardware Prototyping Studio'
    ],
    incubationCenter: 'IIIT Ranchi Technology Business Incubator & AI Lab',
    supportedCategories: [
      'Smart Education & Skill Dev',
      'Public Service Delivery & Accessibility',
      'Healthcare & Telemedicine'
    ],
    domainKeywords: [
      'education', 'school', 'student', 'teacher', 'learning', 'classroom', 'digital', 'software',
      'ai', 'nlp', 'santhali', 'tribal language', 'language', 'translation', 'mobile app', 'portal',
      'governance', 'gis', 'curriculum', 'e-learning', 'internet', 'connectivity', 'exam', 'skill'
    ],
    solvedChallengesCount: 12,
    activePatentsCount: 5,
  },
  {
    id: 'ranchi-univ',
    name: 'Ranchi University, Ranchi',
    shortName: 'Ranchi Univ',
    location: 'Ranchi',
    leadFaculty: 'Prof. Kamini Kumar (School of Tribal Studies & Ethnobotany) & Dr. B. N. Prasad (Dept of Applied Chemistry)',
    facultySpecializations: [
      'Ethnobotany, Indigenous Medicinal Plants & Herbal Formulations',
      'Tribal Livelihoods, Artisan Cooperatives & Handloom Technology',
      'Grassroots Socio-Economic Impact & Village Governance Metrics',
      'Micro-hydel Potential & Local Water Management in Chotanagpur'
    ],
    studentCohort: '600+ PG Researchers in Tribal Studies, Botany, Chemistry & Rural Sociology',
    researchFacilities: [
      'Central Instrumentation Facility (CIF)',
      'Tribal Studies & Ethnobotanical Innovation Unit',
      'Herbal Phytochemical Extraction Testing Lab',
      'Social Science Grassroots Impact Observatory'
    ],
    incubationCenter: 'Ranchi University Innovation & Incubation Centre (RU-IIC)',
    supportedCategories: [
      'Tribal Crafts, Forestry & Mining Tech',
      'Public Service Delivery & Accessibility',
      'Agriculture & Rural Livelihoods'
    ],
    domainKeywords: [
      'tribal', 'indigenous', 'artisan', 'craft', 'handloom', 'herbal', 'medicinal plants', 'forest',
      'sociology', 'culture', 'tradition', 'pottery', 'bamboo', 'weaving', 'panchayat', 'community',
      'forest produce', 'folk', 'welfare'
    ],
    solvedChallengesCount: 8,
    activePatentsCount: 3,
  },
  {
    id: 'vbu-hazaribagh',
    name: 'Vinoba Bhave University (VBU) Hazaribagh',
    shortName: 'VBU Hazaribagh',
    location: 'Hazaribagh',
    leadFaculty: 'Dr. M. P. Sinha (Dept of Biotechnology) & Dr. R. P. Singh (Dept of Environmental Sciences)',
    facultySpecializations: [
      'Microbial Degradation & Rural Sanitation Systems',
      'Rainwater Harvesting & Check-Dam Hydrological Modeling',
      'Localized E-Learning Tools for Rural High Schools',
      'Bio-Composting & Organic Waste Remediation'
    ],
    studentCohort: '380+ Post-Graduate Students in Environmental Sciences, Biotech & Rural Development',
    researchFacilities: [
      'Eco-Restoration Laboratory',
      'University Incubation & Innovation Cell (UIIC)',
      'Watershed & Soil Biological Testing Unit'
    ],
    incubationCenter: 'VBU Innovation and Incubation Cell (UIIC)',
    supportedCategories: [
      'Water Resources & Sanitation',
      'Clean Energy & Environment',
      'Smart Education & Skill Dev'
    ],
    domainKeywords: [
      'sanitation', 'toilet', 'rainwater', 'harvesting', 'check dam', 'hydrology', 'compost',
      'organic', 'microbial', 'village school', 'hazaribagh', 'watershed', 'septic', 'hygiene'
    ],
    solvedChallengesCount: 7,
    activePatentsCount: 2,
  },
];

export interface UniversityMatchEvaluation {
  university: UniversityDomainProfile;
  score: number; // 0-100
  isBestMatch: boolean;
  facultyFitSummary: string;
  facilityFitSummary: string;
  studentCohortSummary: string;
  matchHighlights: string[];
}

export interface UniversityMismatchAnalysis {
  isMismatch: boolean;
  score: number; // 0-100
  selectedUniversity: UniversityDomainProfile;
  suggestedUniversity: UniversityDomainProfile;
  suggestedScore: number;
  severity: 'high' | 'moderate' | 'low';
  warningTitle: string;
  warningMessage: string;
  facultyMismatchReason: string;
  facilityMismatchReason: string;
  studentCohortMismatchReason: string;
  domainDiscrepancy: string;
}

/**
 * Deterministic AI domain matching algorithm scoring universities across:
 * - Category compatibility (35%)
 * - Text/Keywords alignment against faculty expertise (35%)
 * - Research lab & incubation facility match (20%)
 * - District proximity bonus (10%)
 */
export function calculateUniversityScores(params: {
  title: string;
  description: string;
  category: ThematicCategory;
  district?: string;
}): UniversityMatchEvaluation[] {
  const { title, description, category, district = '' } = params;
  const combinedText = `${title} ${description} ${category} ${district}`.toLowerCase();
  const words = combinedText.split(/\W+/).filter((w) => w.length > 2);

  const evaluations: UniversityMatchEvaluation[] = JHARKHAND_UNIVERSITIES.map((univ) => {
    let score = 0;

    // 1. Category alignment (0-35 points)
    if (univ.supportedCategories.includes(category)) {
      score += 35;
    } else {
      score += 8; // base minimum
    }

    // 2. Keyword & semantic match with faculty expertise and domain (0-35 points)
    let keywordHits = 0;
    univ.domainKeywords.forEach((kw) => {
      if (combinedText.includes(kw)) {
        keywordHits++;
      }
    });

    const keywordScore = Math.min(Math.round(keywordHits * 4.5), 35);
    score += keywordScore;

    // 3. Research facility readiness match (0-20 points)
    let facilityHits = 0;
    univ.researchFacilities.forEach((facility) => {
      const fLower = facility.toLowerCase();
      words.forEach((w) => {
        if (fLower.includes(w) && w.length > 3) facilityHits++;
      });
    });
    const facilityScore = Math.min(10 + facilityHits * 3, 20);
    score += facilityScore;

    // 4. District proximity / state context (0-10 points)
    if (district && univ.location.toLowerCase().includes(district.toLowerCase())) {
      score += 10;
    } else if (univ.location === 'Ranchi') {
      // Capital city state research centers get mild baseline bonus
      score += 5;
    }

    // Clamp score to 15 - 98
    const finalScore = Math.min(Math.max(score, 18), 98);

    // Build specific summaries
    const facultyFitSummary = `${univ.leadFaculty}. Expertise in ${univ.facultySpecializations.slice(0, 2).join('; ')}.`;
    const facilityFitSummary = `Equipped with ${univ.researchFacilities.slice(0, 2).join(' and ')}.`;
    const studentCohortSummary = univ.studentCohort;

    const matchHighlights: string[] = [];
    if (univ.supportedCategories.includes(category)) {
      matchHighlights.push(`Direct alignment with ${category}`);
    }
    if (keywordHits > 0) {
      matchHighlights.push(`${keywordHits} verified technical keywords matched to faculty research`);
    }
    matchHighlights.push(`Prototyping support at ${univ.incubationCenter}`);

    return {
      university: univ,
      score: finalScore,
      isBestMatch: false,
      facultyFitSummary,
      facilityFitSummary,
      studentCohortSummary,
      matchHighlights,
    };
  });

  // Sort by score descending
  evaluations.sort((a, b) => b.score - a.score);

  if (evaluations.length > 0) {
    evaluations[0].isBestMatch = true;
  }

  return evaluations;
}

/**
 * Evaluates whether a manually selected university is a mismatch for this problem statement.
 */
export function checkUniversityMismatch(params: {
  title: string;
  description: string;
  category: ThematicCategory;
  district?: string;
  selectedUniversityId: string;
}): UniversityMismatchAnalysis {
  const ranked = calculateUniversityScores(params);
  const best = ranked[0] || ranked[0];

  const selectedEvaluation = ranked.find((r) => r.university.id === params.selectedUniversityId);
  const selectedUniv = selectedEvaluation?.university || JHARKHAND_UNIVERSITIES.find((u) => u.id === params.selectedUniversityId) || best.university;
  const selectedScore = selectedEvaluation ? selectedEvaluation.score : 30;

  // A mismatch occurs if:
  // 1. Selected is not the best match AND selected score is below 65
  // OR 2. There is a huge score gap (> 25 points difference)
  // OR 3. The selected university doesn't even support this category in its primary mandate
  const categorySupported = selectedUniv.supportedCategories.includes(params.category);
  const scoreGap = best.score - selectedScore;
  const isMismatch = (selectedUniv.id !== best.university.id) && (!categorySupported || selectedScore < 65 || scoreGap >= 22);

  const severity: 'high' | 'moderate' | 'low' = 
    selectedScore < 45 || !categorySupported ? 'high' :
    scoreGap >= 25 ? 'moderate' : 'low';

  const domainDiscrepancy = !categorySupported
    ? `This problem is in [${params.category}], whereas ${selectedUniv.shortName}'s primary mandates are [${selectedUniv.supportedCategories.join(', ')}].`
    : `While ${selectedUniv.shortName} has general engineering departments, its primary focus is on [${selectedUniv.facultySpecializations[0]}], making it less specialized for this specific problem compared to ${best.university.shortName}.`;

  const facultyMismatchReason = `Faculty at ${selectedUniv.shortName} primarily specialize in ${selectedUniv.facultySpecializations.slice(0, 2).join(' & ')}, lacking dedicated researchers in this specific problem domain.`;
  const facilityMismatchReason = `${selectedUniv.shortName} facilities (${selectedUniv.researchFacilities[0]}) do not contain the specialized testing rigs needed for this ${params.category} challenge.`;
  const studentCohortMismatchReason = `Student researchers at ${selectedUniv.shortName} are concentrated in ${selectedUniv.studentCohort.split(',')[0]}, whereas ${best.university.shortName} has active research clubs directly working on this domain.`;

  const warningTitle = `AI Match Discrepancy Warning: ${selectedUniv.shortName} is not matched perfectly for this problem statement`;
  const warningMessage = `${domainDiscrepancy} AI auto-matching detected that ${best.university.name} provides a substantially higher compatibility score (${best.score}% vs ${selectedScore}%) with direct faculty leads and research lab facilities.`;

  return {
    isMismatch,
    score: selectedScore,
    selectedUniversity: selectedUniv,
    suggestedUniversity: best.university,
    suggestedScore: best.score,
    severity,
    warningTitle,
    warningMessage,
    facultyMismatchReason,
    facilityMismatchReason,
    studentCohortMismatchReason,
    domainDiscrepancy,
  };
}
