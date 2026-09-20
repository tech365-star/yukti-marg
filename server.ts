import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { INITIAL_CHALLENGES, UNIVERSITIES, INDUSTRY_PARTNERS } from './src/data/mockData.js';
import { 
  Challenge, 
  ChallengeStatus,
  SolutionProposal, 
  IndustryPledge, 
  Milestone, 
  CollaborationComment, 
  UniversityTeam,
  NotificationItem,
  ProjectApproval,
  ProjectDeliverable,
  StartupRecord,
  IndustryPartnerOrg
} from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// In-memory data store seeded with authentic Jharkhand records
let challengesStore: Challenge[] = [...INITIAL_CHALLENGES];
let industryPartnersStore: IndustryPartnerOrg[] = [...INDUSTRY_PARTNERS];
let universitiesStore = [...UNIVERSITIES];

// In-memory notification store
let notificationsStore: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Grassroots Challenge Submitted',
    message: 'Gram Panchayat Ormanjhi submitted problem YM-JH-2026-1042: Solar Micro-Cold Storage for Tomato Farmers.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    type: 'submission',
    challengeId: 'ch-1',
    challengeCode: 'YM-JH-2026-1042',
    targetRole: 'all',
    isRead: false,
    actorName: 'Anita Devi (Mukhiya)',
    actorOrg: 'Ormanjhi Gram Panchayat (PRI)',
  },
  {
    id: 'notif-2',
    title: 'AI Problem Routing Recommendation',
    message: 'AI Engine routed YM-JH-2026-1042 to BIT Mesra & BAU Kanke based on agro-thermal expertise and IDEA Lab capabilities.',
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    type: 'ai_routing',
    challengeId: 'ch-1',
    challengeCode: 'YM-JH-2026-1042',
    targetRole: 'university',
    isRead: false,
    actorName: 'Yukti Marg AI Curation Engine',
    actorOrg: 'Dept of Higher & Technical Education',
  },
  {
    id: 'notif-3',
    title: 'University Team Constituted',
    message: 'Prof. Dr. Rajesh K. Verma formed multidisciplinary research team (3 students) at BIT Mesra.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    type: 'team',
    challengeId: 'ch-1',
    challengeCode: 'YM-JH-2026-1042',
    targetRole: 'all',
    isRead: false,
    actorName: 'Prof. Dr. Rajesh K. Verma',
    actorOrg: 'BIT Mesra, Ranchi',
  },
  {
    id: 'notif-4',
    title: 'Industry CSR Pledge Received',
    message: 'Tata Steel CSR Division pledged ₹5,00,000 for field prototyping & fabrication of cold-storage pilot.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'pledge',
    challengeId: 'ch-1',
    challengeCode: 'YM-JH-2026-1042',
    targetRole: 'all',
    isRead: true,
    actorName: 'Sunil Murmu',
    actorOrg: 'Tata Steel CSR & Technology Incubation',
  },
  {
    id: 'notif-5',
    title: 'Patent Application Officially Filed',
    message: 'Patent filed: "Decentralized Phase-Change Solar Micro Cold Storage System" (Application: 202631049281) at Indian Patent Office Kolkata.',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    type: 'patent',
    challengeId: 'ch-1',
    challengeCode: 'YM-JH-2026-1042',
    targetRole: 'all',
    isRead: false,
    actorName: 'Yukti Marg IP Facilitation Cell',
    actorOrg: 'BIT Mesra & Govt of Jharkhand',
  },
];

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to init Gemini client:', err);
    return null;
  }
}

// Helper to call Gemini with graceful model fallback during demand spikes
async function generateWithGeminiFallback(prompt: string, config?: any): Promise<{ text: string; model: string } | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  // Primary model and resilient fallback model
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: config || { responseMimeType: 'application/json' },
      });
      if (response && response.text) {
        return { text: response.text, model };
      }
    } catch (err: any) {
      // If temporary high demand (503), rate limit (429), or unavailable, quietly try the next model
      const status = err?.status || err?.code || (err?.message?.includes('503') ? 503 : 'unavailable');
      if (model !== models[models.length - 1]) {
        console.log(`[AI Engine] ${model} transient status (${status}), routing to alternative model...`);
      } else {
        console.log(`[AI Engine] Model pool temporarily busy, proceeding with verified heuristic engine.`);
      }
    }
  }
  return null;
}

// ==========================================
// 1. AI CATEGORIZATION, DE-DUPLICATION & EXPERTISE-ROUTING API
// ==========================================
app.post('/api/ai/categorize-and-summarize', async (req: Request, res: Response) => {
  try {
    const { documentText, fileName, contextDistrict } = req.body;

    if (!documentText || typeof documentText !== 'string' || documentText.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide valid text or document content (minimum 10 characters).' });
    }

    // Helper: calculate basic de-duplication against existing challenges
    const inputWords = documentText.toLowerCase().split(/\W+/).filter((w: string) => w.length > 4);
    let highestSimScore = 0;
    let mostSimilarChallenge: Challenge | null = null;

    challengesStore.forEach((existing) => {
      const existingText = (existing.title + ' ' + existing.description).toLowerCase();
      let matchCount = 0;
      inputWords.forEach((w: string) => {
        if (existingText.includes(w)) matchCount++;
      });
      const sim = inputWords.length > 0 ? Math.round((matchCount / inputWords.length) * 100) : 0;
      const districtBonus = existing.district.toLowerCase() === (contextDistrict || '').toLowerCase() ? 15 : 0;
      const totalSim = Math.min(sim + districtBonus, 95);
      if (totalSim > highestSimScore) {
        highestSimScore = totalSim;
        mostSimilarChallenge = existing;
      }
    });

    const isDuplicate = highestSimScore >= 70;
    const deDuplicationCheck = {
      isDuplicate,
      similarityScore: highestSimScore,
      duplicateOfCode: mostSimilarChallenge ? (mostSimilarChallenge as Challenge).code : undefined,
      status: isDuplicate ? ('potential_duplicate' as const) : ('unique' as const),
      explanation: isDuplicate
        ? `High similarity (${highestSimScore}%) with existing challenge ${mostSimilarChallenge ? (mostSimilarChallenge as Challenge).code : ''} in ${mostSimilarChallenge ? (mostSimilarChallenge as Challenge).district : ''}. Review to prevent redundant academic effort.`
        : highestSimScore > 35
        ? `Moderate thematic correlation (${highestSimScore}%) with ${mostSimilarChallenge ? (mostSimilarChallenge as Challenge).code : ''}, but distinct problem root-cause verified.`
        : 'Unique societal problem statement. Zero duplication clutter identified in state database.',
    };

    const prompt = `You are the chief AI evaluator for Yukti Marg, the Government of Jharkhand Societal Innovation & Higher Education Collaboration Portal.
Analyze this submitted community problem statement or document according to the 5-Stage Societal Innovation Flowchart.
Document Name: ${fileName || 'Uploaded Evidence Document'}
District Context: ${contextDistrict || 'Jharkhand State'}
Content:
"""
${documentText.slice(0, 8000)}
"""

Classify and summarize this issue for higher education institutions (HEIs like BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, Birsa Agricultural University, RIMS, IIIT Ranchi) and industry partners (Tata Steel, SAIL, Coal India, MSMEs).

Output ONLY valid JSON adhering to this schema:
{
  "category": "One of: Agriculture & Rural Livelihoods | Water Resources & Sanitation | Healthcare & Telemedicine | Smart Education & Skill Dev | Clean Energy & Environment | Urban Infrastructure & Waste | Tribal Crafts, Forestry & Mining Tech | Public Service Delivery & Accessibility",
  "secondaryCategory": "Optional secondary related domain (e.g. Water Resources & Sanitation, Clean Energy & Environment, etc.)",
  "titleSuggestion": "Concise, descriptive problem statement title (max 14 words)",
  "executiveSummary": "2-3 sentence executive brief stating the core challenge, affected population, and technical bottleneck",
  "keyProblems": ["Point 1", "Point 2", "Point 3"],
  "rootCauses": ["Root cause 1", "Root cause 2", "Root cause 3"],
  "suggestedDisciplines": ["Academic discipline 1 (e.g. Biology, Agronomy, Computer Science)", "Academic discipline 2 (e.g. Mechanical, IoT, Electronics)"],
  "recommendedUniversities": ["Specific Jharkhand University 1", "Specific Jharkhand University 2"],
  "routingReason": "Clear rationale matching faculty research specialization to this challenge",
  "incubationCenterMatched": "Name of relevant university incubation center (e.g. BIT-TBI Incubation Centre, BAU AgTech Hub, IIT-ISM Tech Incubator)",
  "nepRelevance": "How this connects to National Education Policy 2020 experiential learning & multidisciplinary solving",
  "urgencyScore": 85,
  "priority": "low | medium | high | critical",
  "potentialPatentOrIP": true
}`;

    const aiResult = await generateWithGeminiFallback(prompt, { responseMimeType: 'application/json' });
    if (aiResult) {
      try {
        const parsed = JSON.parse(aiResult.text);
        parsed.deDuplicationCheck = deDuplicationCheck;
        return res.json({ success: true, data: parsed, engine: aiResult.model });
      } catch {
        // Fall through to deterministic engine
      }
    }

    // Deterministic fallback classifier if Gemini key is missing or offline
    const textLower = documentText.toLowerCase();
    let category = 'Public Service Delivery & Accessibility';
    let secondaryCategory = 'Smart Education & Skill Dev';
    let suggestedDisciplines = ['Social Work', 'Public Administration', 'Civil Engineering'];
    let recommendedUniversities = ['Ranchi University', 'Central University of Jharkhand'];
    let routingReason = 'Faculty expertise in rural socio-technical delivery and public governance.';
    let incubationCenterMatched = 'CUJ Centre for Innovation & Social Enterprise';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let urgencyScore = 70;

    if (textLower.includes('water') || textLower.includes('fluoride') || textLower.includes('arsenic') || textLower.includes('well') || textLower.includes('filter') || textLower.includes('drain')) {
      category = 'Water Resources & Sanitation';
      secondaryCategory = 'Healthcare & Telemedicine';
      suggestedDisciplines = ['Chemical Engineering', 'Environmental Hydrology', 'Materials Science'];
      recommendedUniversities = ['IIT (ISM) Dhanbad', 'NIT Jamshedpur'];
      routingReason = 'Department of Environmental Engineering has advanced water testing labs and nano-filtration testbeds.';
      incubationCenterMatched = 'IIT (ISM) Centre for Innovation, Incubation & Entrepreneurship (CIIE)';
      urgencyScore = 92;
      priority = 'critical';
    } else if (textLower.includes('crop') || textLower.includes('farmer') || textLower.includes('agriculture') || textLower.includes('soil') || textLower.includes('tomato') || textLower.includes('cold storage') || textLower.includes('millet')) {
      category = 'Agriculture & Rural Livelihoods';
      secondaryCategory = 'Clean Energy & Environment';
      suggestedDisciplines = ['Post-Harvest Agro-Technology', 'Renewable Energy', 'Thermal Engineering'];
      recommendedUniversities = ['Birsa Agricultural University (BAU) Kanke', 'Birla Institute of Technology (BIT) Mesra'];
      routingReason = 'BAU agricultural testing stations combined with BIT Mesra agro-automation and refrigeration labs.';
      incubationCenterMatched = 'BIT-TBI Incubation Centre & AICTE IDEA Lab';
      urgencyScore = 86;
      priority = 'high';
    } else if (textLower.includes('health') || textLower.includes('hospital') || textLower.includes('doctor') || textLower.includes('medicine') || textLower.includes('malaria') || textLower.includes('sickle') || textLower.includes('clinic')) {
      category = 'Healthcare & Telemedicine';
      secondaryCategory = 'Smart Education & Skill Dev';
      suggestedDisciplines = ['Community Medicine', 'Biomedical Informatics', 'Artificial Intelligence'];
      recommendedUniversities = ['Rajendra Institute of Medical Sciences (RIMS) Ranchi', 'IIIT Ranchi'];
      routingReason = 'Clinical epidemiologists at RIMS paired with embedded IoT/AI tele-diagnostic specialists at IIIT Ranchi.';
      incubationCenterMatched = 'IIIT Ranchi Atal Incubation Centre (AIC)';
      urgencyScore = 88;
      priority = 'high';
    } else if (textLower.includes('school') || textLower.includes('student') || textLower.includes('teacher') || textLower.includes('education') || textLower.includes('digital') || textLower.includes('curriculum')) {
      category = 'Smart Education & Skill Dev';
      secondaryCategory = 'Public Service Delivery & Accessibility';
      suggestedDisciplines = ['Educational Technology', 'Computer Science', 'Embedded Systems'];
      recommendedUniversities = ['IIIT Ranchi', 'BIT Mesra, Ranchi'];
      routingReason = 'Expertise in localized edtech platforms and offline-first digital learning devices.';
      incubationCenterMatched = 'IIIT Ranchi Technology Business Incubator';
      urgencyScore = 80;
      priority = 'high';
    } else if (textLower.includes('lac') || textLower.includes('tribal') || textLower.includes('forest') || textLower.includes('santhal') || textLower.includes('craft') || textLower.includes('mining') || textLower.includes('coal')) {
      category = 'Tribal Crafts, Forestry & Mining Tech';
      secondaryCategory = 'Agriculture & Rural Livelihoods';
      suggestedDisciplines = ['Mining Engineering', 'Manufacturing Science', 'Forestry & NTFP Management'];
      recommendedUniversities = ['Birsa Agricultural University', 'IIT (ISM) Dhanbad', 'BIT Mesra'];
      routingReason = 'Premier mining tech research and non-timber forest produce processing laboratories.';
      incubationCenterMatched = 'IIT (ISM) Mining & Clean Energy Innovation Hub';
      urgencyScore = 79;
      priority = 'medium';
    } else if (textLower.includes('waste') || textLower.includes('garbage') || textLower.includes('road') || textLower.includes('drainage') || textLower.includes('pavement') || textLower.includes('slum')) {
      category = 'Urban Infrastructure & Waste';
      secondaryCategory = 'Clean Energy & Environment';
      suggestedDisciplines = ['Civil & Structural Engineering', 'Geopolymer Chemistry', 'Urban Planning'];
      recommendedUniversities = ['IIT (ISM) Dhanbad', 'NIT Jamshedpur'];
      routingReason = 'Civil and environmental research groups specializing in industrial slag utilization and smart drainage.';
      incubationCenterMatched = 'NIT Jamshedpur Centre of Excellence in Urban Infrastructure';
      urgencyScore = 81;
      priority = 'high';
    } else if (textLower.includes('solar') || textLower.includes('power') || textLower.includes('energy') || textLower.includes('biomass') || textLower.includes('electricity')) {
      category = 'Clean Energy & Environment';
      secondaryCategory = 'Agriculture & Rural Livelihoods';
      suggestedDisciplines = ['Renewable Energy Engineering', 'Electrical Engineering'];
      recommendedUniversities = ['BIT Mesra, Ranchi', 'NIT Jamshedpur'];
      routingReason = 'Dedicated solar microgrid testbeds and smart inverter prototyping facilities.';
      incubationCenterMatched = 'BIT Mesra Centre for Renewable Energy & Sustainability';
      urgencyScore = 83;
      priority = 'high';
    }

    const fallbackResult = {
      category,
      secondaryCategory,
      titleSuggestion: `Addressing ${category.split('&')[0].trim()} Challenge in ${contextDistrict || 'Jharkhand'}`,
      executiveSummary: `The submitted issue highlights acute local constraints in ${category}. Field evidence indicates strong potential for Higher Education student teams and industry collaboration under NEP 2020.`,
      keyProblems: [
        'Lack of affordable, decentralized technological alternatives suited for rural terrains',
        'Fragmented institutional linkage preventing community issues from reaching research labs',
        'Absence of structured incubation and seed funding for field prototyping',
      ],
      rootCauses: [
        'Geographical and infrastructure barriers in rural/peri-urban blocks',
        'High capital expenditure of commercial urban solutions',
        'Limited localized adaptation of sustainable engineering practices',
      ],
      suggestedDisciplines,
      recommendedUniversities,
      routingReason,
      incubationCenterMatched,
      deDuplicationCheck,
      nepRelevance: 'Aligns directly with NEP 2020 Chapter 11 on multidisciplinary problem solving and community-focused student internships.',
      urgencyScore,
      priority,
      potentialPatentOrIP: true,
    };

    return res.json({ success: true, data: fallbackResult, engine: 'rule-based-fallback' });
  } catch (error: any) {
    console.error('Error in categorize-and-summarize:', error);
    return res.status(500).json({ error: error.message || 'Internal AI evaluation error' });
  }
});

// Helper for university domain mapping in Jharkhand
function matchUniversityForProblem(category: string, text: string, district?: string) {
  const t = (text + ' ' + (district || '')).toLowerCase();
  
  if (category === 'Water Resources & Sanitation' || t.includes('water') || t.includes('fluoride') || t.includes('aquifer') || t.includes('sanitation') || t.includes('well')) {
    return {
      id: 'iit-ism-dhanbad',
      name: 'Indian Institute of Technology (IIT ISM) Dhanbad',
      department: 'Department of Environmental Science & Water Engineering',
      incubationCenter: 'TexMiN Technology Innovation Hub & ACIC Foundation',
      routingReason: 'State Center of Excellence in groundwater aquifer mapping, heavy-metal remediation, and low-cost filtration.',
      location: 'Dhanbad',
      alternatives: [
        { id: 'nit-jamshedpur', name: 'National Institute of Technology (NIT) Jamshedpur', department: 'Department of Civil & Environmental Engineering' },
        { id: 'vbu-hazaribagh', name: 'Vinoba Bhave University (VBU) Hazaribagh', department: 'Department of Watershed Management' },
      ],
    };
  }

  if (category === 'Agriculture & Rural Livelihoods' || t.includes('crop') || t.includes('farmer') || t.includes('soil') || t.includes('millet') || t.includes('cold storage') || t.includes('post-harvest')) {
    return {
      id: 'bau-ranchi',
      name: 'Birsa Agricultural University (BAU) Kanke, Ranchi',
      department: 'Faculty of Agricultural Engineering & Post-Harvest Technology',
      incubationCenter: 'Agri-Business Incubator (RABI) & Millet Processing Unit',
      routingReason: 'Specialized faculty research in indigenous crop preservation, drought-resistant varieties, and decentralized post-harvest processing.',
      location: 'Ranchi',
      alternatives: [
        { id: 'bit-mesra', name: 'Birla Institute of Technology (BIT) Mesra, Ranchi', department: 'Department of Mechanical & Agro-Automation Engineering' },
        { id: 'kolhan-univ', name: 'Kolhan University, Chaibasa', department: 'Centre for Tribal Livelihood Engineering' },
      ],
    };
  }

  if (category === 'Healthcare & Telemedicine' || t.includes('health') || t.includes('hospital') || t.includes('sickle') || t.includes('malaria') || t.includes('clinic') || t.includes('diagnostic')) {
    return {
      id: 'rims-ranchi',
      name: 'Rajendra Institute of Medical Sciences (RIMS) Ranchi',
      department: 'Department of Community Medicine & Tele-Diagnostic Center',
      incubationCenter: 'RIMS Clinical Innovation Hub & State Viral Research Lab',
      routingReason: 'Premier state medical institute with active tribal health research, tele-clinic networks, and sickle cell screening programs.',
      location: 'Ranchi',
      alternatives: [
        { id: 'iiit-ranchi', name: 'Indian Institute of Information Technology (IIIT) Ranchi', department: 'Biomedical AI & Sensor Systems Lab' },
        { id: 'bit-mesra', name: 'Birla Institute of Technology (BIT) Mesra, Ranchi', department: 'Department of Pharmaceutical Sciences & Bio-Engineering' },
      ],
    };
  }

  if (category === 'Clean Energy & Environment' || t.includes('solar') || t.includes('microgrid') || t.includes('biomass') || t.includes('renewable') || t.includes('power')) {
    return {
      id: 'bit-mesra',
      name: 'Birla Institute of Technology (BIT) Mesra, Ranchi',
      department: 'Department of Electrical & Electronics Engineering (Centre for Renewable Energy)',
      incubationCenter: 'BIT-TBI Incubation Centre & AICTE IDEA Lab',
      routingReason: 'Dedicated solar microgrid testing labs, off-grid power research, and active patents in hybrid energy systems.',
      location: 'Ranchi',
      alternatives: [
        { id: 'nit-jamshedpur', name: 'National Institute of Technology (NIT) Jamshedpur', department: 'Electric Microgrid & Power Electronics Lab' },
        { id: 'iit-ism-dhanbad', name: 'IIT (ISM) Dhanbad', department: 'Clean Energy & Environmental Engineering' },
      ],
    };
  }

  if (category === 'Tribal Crafts, Forestry & Mining Tech' || t.includes('tribal') || t.includes('lac') || t.includes('forest') || t.includes('mining') || t.includes('coal') || t.includes('artisan')) {
    return {
      id: 'iit-ism-dhanbad',
      name: 'Indian Institute of Technology (IIT ISM) Dhanbad',
      department: 'Department of Mining & Mineral Processing Engineering',
      incubationCenter: 'TexMiN Innovation Hub (Technology Innovation Hub for Mining)',
      routingReason: 'National hub for safe mining practices, overburden slag utilization, and non-timber forest product extraction machinery.',
      location: 'Dhanbad',
      alternatives: [
        { id: 'kolhan-univ', name: 'Kolhan University, Chaibasa', department: 'School of Tribal Crafts & Ethnobotany' },
        { id: 'bau-ranchi', name: 'Birsa Agricultural University (BAU) Kanke', department: 'Department of Forest Products & Lac Cultivation' },
      ],
    };
  }

  if (category === 'Urban Infrastructure & Waste' || t.includes('waste') || t.includes('garbage') || t.includes('plastic') || t.includes('road') || t.includes('drainage') || t.includes('sewage')) {
    return {
      id: 'nit-jamshedpur',
      name: 'National Institute of Technology (NIT) Jamshedpur',
      department: 'Department of Civil Engineering & Environmental Systems',
      incubationCenter: 'STEP Technology Business Incubator & Advanced Materials Lab',
      routingReason: 'Specializes in municipal solid waste conversion, geopolymer road materials, and industrial slag repurposing.',
      location: 'East Singhbhum (Jamshedpur)',
      alternatives: [
        { id: 'iit-ism-dhanbad', name: 'IIT (ISM) Dhanbad', department: 'Environmental & Civil Engineering' },
        { id: 'bit-mesra', name: 'BIT Mesra, Ranchi', department: 'Department of Civil & Urban Engineering' },
      ],
    };
  }

  if (category === 'Smart Education & Skill Dev' || t.includes('school') || t.includes('student') || t.includes('education') || t.includes('language') || t.includes('santhali') || t.includes('teacher')) {
    return {
      id: 'iiit-ranchi',
      name: 'Indian Institute of Information Technology (IIIT) Ranchi',
      department: 'Department of Computer Science & Multilingual NLP Center',
      incubationCenter: 'IIIT Ranchi Technology Business Incubator & AI Lab',
      routingReason: 'Focus on low-bandwidth educational technologies, AI speech processing in indigenous languages (Santhali, Ho, Mundari), and digital pedagogy.',
      location: 'Ranchi',
      alternatives: [
        { id: 'bit-mesra', name: 'BIT Mesra, Ranchi', department: 'Department of Computer Science & Engineering' },
        { id: 'ranchi-univ', name: 'Ranchi University', department: 'Institute of Community Education & Tribal Studies' },
      ],
    };
  }

  // Default: Public Service Delivery & Accessibility
  return {
    id: 'iiit-ranchi',
    name: 'Indian Institute of Information Technology (IIIT) Ranchi',
    department: 'Department of Data Science & Smart Governance Systems',
    incubationCenter: 'Cyber Physical Systems Cell & Student Startup Hub',
    routingReason: 'Expertise in citizen-facing digital delivery, GIS spatial mapping, and grievance redressal workflow automation.',
    location: 'Ranchi',
    alternatives: [
      { id: 'ranchi-univ', name: 'Ranchi University', department: 'School of Social Sciences & Applied Management' },
      { id: 'bit-mesra', name: 'BIT Mesra, Ranchi', department: 'Department of Production & Industrial Engineering' },
    ],
  };
}

// 1B. Quick AI Category Detection & University Match API
app.post('/api/ai/detect-category-and-university', async (req: Request, res: Response) => {
  try {
    const { title = '', description = '', district = '', manualCategory } = req.body;
    const combinedText = `${title}\n${description}`.trim();

    if (!combinedText) {
      return res.status(400).json({ error: 'Please provide problem title or description.' });
    }

    let detectedCategory = manualCategory;
    let categoryConfidence = 0.95;
    let aiSummary = '';

    // If no manualCategory is passed, ask Gemini to classify with model fallback
    if (!manualCategory) {
      const prompt = `You are the AI triage specialist for Yukti Marg, Government of Jharkhand.
Evaluate this community problem statement from District: "${district || 'Jharkhand'}":
Title: "${title}"
Description: "${description}"

Categories available:
1. Agriculture & Rural Livelihoods
2. Water Resources & Sanitation
3. Healthcare & Telemedicine
4. Smart Education & Skill Dev
5. Clean Energy & Environment
6. Urban Infrastructure & Waste
7. Tribal Crafts, Forestry & Mining Tech
8. Public Service Delivery & Accessibility

Output ONLY valid JSON:
{
  "detectedCategory": "Exact string of best matching category from list above",
  "confidence": 0.96,
  "summary": "1 sentence summarizing core issue and why this category was selected"
}`;

      const aiResult = await generateWithGeminiFallback(prompt, { responseMimeType: 'application/json' });
      if (aiResult) {
        try {
          const parsed = JSON.parse(aiResult.text || '{}');
          if (parsed.detectedCategory) {
            detectedCategory = parsed.detectedCategory;
            categoryConfidence = parsed.confidence || 0.95;
            aiSummary = parsed.summary || '';
          }
        } catch {
          // Proceed to fallback
        }
      }
    }

    // Fallback classification if still undefined
    if (!detectedCategory) {
      const lower = combinedText.toLowerCase();
      if (lower.includes('water') || lower.includes('well') || lower.includes('fluoride') || lower.includes('contamination') || lower.includes('filter') || lower.includes('sanitation')) {
        detectedCategory = 'Water Resources & Sanitation';
        categoryConfidence = 0.96;
      } else if (lower.includes('crop') || lower.includes('farmer') || lower.includes('agriculture') || lower.includes('soil') || lower.includes('storage') || lower.includes('millet')) {
        detectedCategory = 'Agriculture & Rural Livelihoods';
        categoryConfidence = 0.95;
      } else if (lower.includes('health') || lower.includes('hospital') || lower.includes('disease') || lower.includes('patient') || lower.includes('clinic')) {
        detectedCategory = 'Healthcare & Telemedicine';
        categoryConfidence = 0.94;
      } else if (lower.includes('solar') || lower.includes('energy') || lower.includes('power') || lower.includes('electricity') || lower.includes('renewable')) {
        detectedCategory = 'Clean Energy & Environment';
        categoryConfidence = 0.93;
      } else if (lower.includes('waste') || lower.includes('garbage') || lower.includes('road') || lower.includes('drain')) {
        detectedCategory = 'Urban Infrastructure & Waste';
        categoryConfidence = 0.92;
      } else if (lower.includes('tribal') || lower.includes('forest') || lower.includes('lac') || lower.includes('mining')) {
        detectedCategory = 'Tribal Crafts, Forestry & Mining Tech';
        categoryConfidence = 0.94;
      } else if (lower.includes('school') || lower.includes('student') || lower.includes('education') || lower.includes('teacher')) {
        detectedCategory = 'Smart Education & Skill Dev';
        categoryConfidence = 0.93;
      } else {
        detectedCategory = 'Public Service Delivery & Accessibility';
        categoryConfidence = 0.88;
      }
    }

    // Find suitable university based on the category (whether AI-detected or manually chosen)
    const match = matchUniversityForProblem(detectedCategory, combinedText, district);

    return res.json({
      success: true,
      detectedCategory,
      categoryConfidence,
      isManualCategory: Boolean(manualCategory),
      matchedUniversity: {
        id: match.id,
        name: match.name,
        department: match.department,
        incubationCenter: match.incubationCenter,
        routingReason: match.routingReason,
        location: match.location,
      },
      alternativeUniversities: match.alternatives,
      summary: aiSummary || `Identified as [${detectedCategory}] and matched to ${match.name} based on domain specialization.`,
      urgencyScore: detectedCategory.includes('Water') || detectedCategory.includes('Health') ? 92 : 84,
      priority: detectedCategory.includes('Water') || detectedCategory.includes('Health') ? 'critical' : 'high',
    });
  } catch (error: any) {
    console.error('Error in detect-category-and-university:', error);
    return res.status(500).json({ error: error.message || 'Detection failed' });
  }
});

// ==========================================
// 2. CHALLENGES API
// ==========================================

// Get all challenges (with optional filter)
app.get('/api/challenges', (req: Request, res: Response) => {
  const { category, district, status, priority, search } = req.query;

  let filtered = [...challengesStore];

  if (category && category !== 'all') {
    filtered = filtered.filter((c) => c.category === category);
  }
  if (district && district !== 'all') {
    filtered = filtered.filter((c) => c.district === district);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (priority && priority !== 'all') {
    filtered = filtered.filter((c) => c.priority === priority);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, challenges: filtered, count: filtered.length });
});

// Get single challenge
app.get('/api/challenges/:id', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id || c.code === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  res.json({ success: true, challenge });
});

// Submit new challenge
app.post('/api/challenges', (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    district,
    blockOrPanchayat,
    submittedBy,
    priority,
    estimatedImpactPeople,
    attachments,
    videoUrls,
    gpsCoordinates,
    aiAnalysis,
    assignedUniversity,
    autoSubmitToUniversity,
    autoSubmittedByAI,
  } = req.body;

  if (!title || !description || !district) {
    return res.status(400).json({ error: 'Title, description, and district are mandatory.' });
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = `YM-JH-2026-${randomNum}`;

  const resolvedCategory = category || 'Agriculture & Rural Livelihoods';

  // Handle Automatic University Routing / Submission
  let finalAssignedUniversity = assignedUniversity;
  const shouldAutoSubmit = autoSubmitToUniversity !== false && (Boolean(assignedUniversity) || autoSubmitToUniversity === true || autoSubmittedByAI === true);

  if (!finalAssignedUniversity && shouldAutoSubmit) {
    const matched = matchUniversityForProblem(resolvedCategory, `${title} ${description}`, district);
    finalAssignedUniversity = {
      id: matched.id,
      name: matched.name,
      department: matched.department,
      assignedDate: new Date().toISOString().split('T')[0],
    };
  }

  const isAssigned = Boolean(finalAssignedUniversity);
  const initialStatus: ChallengeStatus = isAssigned ? 'assigned_hei' : 'submitted';

  const newChallenge: Challenge = {
    id: `ch-${Date.now()}`,
    code,
    title,
    description,
    category: resolvedCategory,
    district,
    blockOrPanchayat: blockOrPanchayat || 'Rural Block',
    submittedBy: {
      name: submittedBy?.name || 'Verified Citizen / Local Body',
      type: submittedBy?.type || 'Citizen',
      contact: submittedBy?.contact,
      email: submittedBy?.email,
      userId: submittedBy?.userId,
      isVerifiedUser: true,
      citizenBeneficiary: submittedBy?.citizenBeneficiary,
      localityVillage: submittedBy?.localityVillage,
      panchayatName: submittedBy?.panchayatName,
      blockName: submittedBy?.blockName,
      certifiedByAuthority: submittedBy?.certifiedByAuthority,
    },
    submittedDate: new Date().toISOString().split('T')[0],
    priority: priority || 'medium',
    status: initialStatus,
    estimatedImpactPeople: Number(estimatedImpactPeople) || 500,
    attachments: attachments || [],
    videoUrls: videoUrls || [],
    gpsCoordinates: gpsCoordinates || undefined,
    aiAnalysis: aiAnalysis || undefined,
    assignedUniversity: finalAssignedUniversity || undefined,
    universityAcceptance: isAssigned ? { status: 'pending' } : undefined,
    proposals: [],
    industryPartners: [],
    milestones: [
      {
        id: `ms-${Date.now()}-1`,
        title: 'Initial Citizen Submission & AI Screening',
        description: 'Challenge catalogued and verified on Yukti Marg portal.',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        status: 'completed',
        completedDate: new Date().toISOString().split('T')[0],
      },
      {
        id: `ms-${Date.now()}-2`,
        title: 'University Department Allocation',
        description: isAssigned 
          ? `Automatically routed and submitted to ${finalAssignedUniversity.name} (${finalAssignedUniversity.department}) via Yukti Marg AI Engine.`
          : 'Routing to matching Higher Education Institution (HEI) in Jharkhand.',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: isAssigned ? 'completed' : 'pending',
        completedDate: isAssigned ? new Date().toISOString().split('T')[0] : undefined,
      },
    ],
    comments: [
      {
        id: `c-${Date.now()}`,
        authorId: 'sys-01',
        authorName: 'Yukti Marg AI Gateway',
        authorRole: 'admin',
        authorOrg: 'Dept of Higher & Technical Education',
        message: isAssigned
          ? `Challenge logged with tracking code ${code}. Automated classification identified domain as [${resolvedCategory}]. Challenge has been automatically submitted to ${finalAssignedUniversity.name} (${finalAssignedUniversity.department}) for immediate academic review.`
          : `Challenge logged with tracking code ${code}. Automated classification identified domain as [${resolvedCategory}]. Awaiting university review.`,
        createdAt: new Date().toISOString(),
        isOfficialNote: true,
      },
    ],
  };

  challengesStore.unshift(newChallenge);

  // Dispatch institutional notification to university if automatically routed
  if (isAssigned && finalAssignedUniversity) {
    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      title: 'Problem Automatically Routed to University',
      message: `Grassroots challenge ${code} ("${title}") from ${district} has been directly submitted by AI to ${finalAssignedUniversity.name} (${finalAssignedUniversity.department}) for technical review.`,
      timestamp: new Date().toISOString(),
      type: 'ai_routing',
      challengeId: newChallenge.id,
      challengeCode: code,
      targetRole: 'university',
      isRead: false,
      actorName: 'Yukti Marg AI Dispatcher',
      actorOrg: 'Government of Jharkhand',
    });
  }

  res.status(201).json({ success: true, challenge: newChallenge });
});

// Update challenge status / assignment (Admin or University)
app.put('/api/challenges/:id', (req: Request, res: Response) => {
  const index = challengesStore.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  challengesStore[index] = {
    ...challengesStore[index],
    ...req.body,
  };

  res.json({ success: true, challenge: challengesStore[index] });
});

// Officially adopt citizen challenge for a University
app.post('/api/challenges/:id/adopt', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { universityId, universityName, department, facultyMentor, remarks } = req.body;

  challenge.assignedUniversity = {
    id: universityId || 'bit-mesra',
    name: universityName || 'Birla Institute of Technology (BIT) Mesra',
    department: department || 'Department of Innovation & Technology',
    assignedDate: new Date().toISOString().split('T')[0],
  };

  challenge.universityAcceptance = {
    status: 'accepted',
    acceptedAt: new Date().toISOString(),
    acceptedBy: facultyMentor || 'University Authority',
    remarks: remarks || 'Officially accepted by University Authority to commence project execution and research team constitution.',
  };

  if (challenge.status === 'submitted' || challenge.status === 'under_review') {
    challenge.status = 'assigned_hei';
  }

  // Update milestone 2 (University Department Allocation & Acceptance) to completed
  const uniMilestone = challenge.milestones.find((m) => m.title.includes('University') || m.id.includes('-2'));
  if (uniMilestone) {
    uniMilestone.status = 'completed';
    uniMilestone.completedDate = new Date().toISOString().split('T')[0];
  }

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: universityId || 'usr-uni',
    authorName: facultyMentor || 'University Authority',
    authorRole: 'university',
    authorOrg: universityName || 'Higher Education Institution',
    message: `Societal problem statement officially accepted by ${universityName || 'University'}${department ? ` (${department})` : ''}. Team constitution unlocked to start work.`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: 'Problem Statement Accepted by University Authority',
    message: `${universityName || 'University'} has accepted problem [${challenge.code}] ("${challenge.title}"). Research team constitution is now active.`,
    timestamp: new Date().toISOString(),
    type: 'adoption',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'all',
    isRead: false,
    actorName: facultyMentor || 'University Authority',
    actorOrg: universityName || 'University',
  });

  res.json({ success: true, challenge });
});

// Explicit University Acceptance Endpoint (User Workflow Step: Accept Problem Statement & Start Work)
app.post('/api/challenges/:id/university-accept', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { acceptedBy, universityName, universityId, department, remarks } = req.body;

  if (!challenge.assignedUniversity) {
    challenge.assignedUniversity = {
      id: universityId || 'bit-mesra',
      name: universityName || 'Birla Institute of Technology (BIT) Mesra',
      department: department || 'Department of Research & Innovation',
      assignedDate: new Date().toISOString().split('T')[0],
    };
  }

  challenge.universityAcceptance = {
    status: 'accepted',
    acceptedAt: new Date().toISOString(),
    acceptedBy: acceptedBy || 'University Authority',
    remarks: remarks || 'Problem statement officially accepted by University Authority. Research team constitution unlocked.',
  };

  if (challenge.status === 'submitted' || challenge.status === 'under_review') {
    challenge.status = 'assigned_hei';
  }

  // Complete university milestone
  const uniMilestone = challenge.milestones.find((m) => m.title.includes('University') || m.id.includes('-2'));
  if (uniMilestone) {
    uniMilestone.status = 'completed';
    uniMilestone.completedDate = new Date().toISOString().split('T')[0];
  }

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: universityId || 'usr-uni',
    authorName: acceptedBy || 'University Authority',
    authorRole: 'university',
    authorOrg: challenge.assignedUniversity.name,
    message: `Problem statement officially accepted by University Authority (${acceptedBy || 'Authorized Lead'}). University is starting work; research team constitution is now unlocked.`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: `Problem Statement Accepted: ${challenge.code}`,
    message: `${challenge.assignedUniversity.name} accepted problem [${challenge.code}]. Team constitution is now unlocked.`,
    timestamp: new Date().toISOString(),
    type: 'adoption',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'all',
    isRead: false,
    actorName: acceptedBy || 'University Authority',
    actorOrg: challenge.assignedUniversity.name,
  });

  res.json({ success: true, challenge });
});

// Submit academic feasibility review by University Authority
app.post('/api/challenges/:id/academic-review', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { reviewerName, reviewerDesignation, feasibilityScore, evaluationSummary } = req.body;

  challenge.universityReview = {
    evaluated: true,
    reviewerName: reviewerName || 'University Authority',
    reviewerDesignation: reviewerDesignation || 'Professor & Faculty Evaluator',
    reviewDate: new Date().toISOString().split('T')[0],
    feasibilityScore: Number(feasibilityScore) || 85,
    evaluationSummary: evaluationSummary || 'Academic and technological feasibility verified.',
  };

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'usr-uni-eval',
    authorName: reviewerName || 'University Evaluator',
    authorRole: 'university',
    authorOrg: challenge.assignedUniversity?.name || 'Higher Education Institution',
    message: `Academic Feasibility Evaluation completed. Feasibility Score: ${feasibilityScore || 85}/100. Assessment: ${evaluationSummary}`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  res.json({ success: true, challenge });
});

// Assign university & constitute multidisciplinary team
app.post('/api/challenges/:id/team', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const team: UniversityTeam = req.body.team;
  challenge.team = team;
  challenge.status = 'team_constituted';
  if (!challenge.assignedUniversity) {
    challenge.assignedUniversity = {
      id: team.universityId || 'uni-default',
      name: team.universityName,
      department: team.mentorDepartment,
      assignedDate: new Date().toISOString().split('T')[0],
    };
  }

  // Add notification comment
  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'usr-uni',
    authorName: team.facultyMentor,
    authorRole: 'university',
    authorOrg: team.universityName,
    message: `Multidisciplinary project team constituted with ${team.studentMembers.length} student researchers under ${team.facultyMentor} (${team.mentorDepartment}).`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  res.json({ success: true, challenge });
});

// Submit Solution Proposal from University
app.post('/api/challenges/:id/proposals', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const proposal: SolutionProposal = {
    id: `prop-${Date.now()}`,
    challengeId: challenge.id,
    universityName: req.body.universityName || challenge.assignedUniversity?.name || 'Birla Institute of Technology (BIT) Mesra',
    universityId: req.body.universityId || challenge.assignedUniversity?.id || 'bit-mesra',
    facultyLead: req.body.facultyLead || challenge.team?.facultyMentor || 'Faculty Principal Investigator',
    proposalTitle: req.body.proposalTitle,
    summary: req.body.summary,
    technologyStack: req.body.technologyStack || [],
    estimatedBudgetINR: Number(req.body.estimatedBudgetINR) || 250000,
    timelineMonths: Number(req.body.timelineMonths) || 4,
    targetDeliverables: req.body.targetDeliverables || ['Functional Prototype', 'Technical Report'],
    status: 'submitted',
    submittedDate: new Date().toISOString().split('T')[0],
    targetIndustryId: req.body.targetIndustryId || undefined,
    targetIndustryName: req.body.targetIndustryName || undefined,
    targetIndustryType: req.body.targetIndustryType || undefined,
    partnershipType: req.body.partnershipType || 'Funding',
    aiSuggestedMatch: Boolean(req.body.aiSuggestedMatch),
    aiMatchReason: req.body.aiMatchReason || undefined,
    proposalFile: req.body.proposalFile || undefined,
    ideaPlanDetails: req.body.ideaPlanDetails || undefined,
  };

  challenge.proposals.push(proposal);
  challenge.status = 'proposal_submitted';

  // Add system comment
  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'sys-prop',
    authorName: proposal.facultyLead,
    authorRole: 'university',
    authorOrg: proposal.universityName,
    message: `Formal solution proposal submitted: "${proposal.proposalTitle}" (Estimated Budget: ₹${proposal.estimatedBudgetINR.toLocaleString('en-IN')}). ${proposal.targetIndustryName ? `Routed to ${proposal.targetIndustryName} for ${proposal.partnershipType || 'Approval & Funding'}.` : 'Open for State approval & Industry sponsorship.'}${proposal.proposalFile ? ` Attached Proposal Plan File: [${proposal.proposalFile.name}] (${proposal.proposalFile.size}).` : ''}`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  // Notification for industry partner and administration
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: `New Proposal Submitted: ${proposal.proposalTitle}`,
    message: `${proposal.universityName} submitted a proposal for [${challenge.code}] routed to ${proposal.targetIndustryName || 'Industry Partners'} for ${proposal.partnershipType || 'Funding & Approval'}.${proposal.proposalFile ? ` Includes proposal file: ${proposal.proposalFile.name}.` : ''}`,
    timestamp: new Date().toISOString(),
    type: 'submission',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'industry',
    isRead: false,
    actorName: proposal.facultyLead,
    actorOrg: proposal.universityName,
  });

  res.json({ success: true, proposal, challenge });
});

// Industrial Partner Decision on Proposal (Accept/Reject Problem, Accept/Reject Funding & CSR Guarantee)
app.post('/api/challenges/:challengeId/proposals/:proposalId/decision', (req: Request, res: Response) => {
  const { challengeId, proposalId } = req.params;
  const { problemDecision, fundingDecision } = req.body;

  let challenge = challengesStore.find((c) => c.id === challengeId || c.code === challengeId);
  if (!challenge) {
    challenge = challengesStore.find((c) => c.proposals?.some((p) => p.id === proposalId));
  }
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  if (!challenge.proposals) {
    challenge.proposals = [];
  }
  if (!challenge.industryPartners) {
    challenge.industryPartners = [];
  }
  if (!challenge.comments) {
    challenge.comments = [];
  }

  let proposal = challenge.proposals.find((p) => p.id === proposalId);
  if (!proposal && challenge.proposals.length > 0) {
    proposal = challenge.proposals[0];
  }
  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const decidedBy = problemDecision?.decidedBy || fundingDecision?.decidedBy || 'Industrial Evaluator';
  const partnerName = problemDecision?.partnerName || fundingDecision?.partnerName || proposal.targetIndustryName || 'Industrial Partner Org';
  const now = new Date().toISOString();

  if (problemDecision) {
    proposal.problemDecision = {
      status: problemDecision.status,
      comments: problemDecision.comments || '',
      decidedBy,
      decidedAt: now,
    };
  }

  if (fundingDecision) {
    const approvedAmount = Number(fundingDecision.approvedAmountINR) || 0;
    const isAccepted = fundingDecision.status === 'accepted';
    const guaranteeAmount = approvedAmount > 0 ? approvedAmount : proposal.estimatedBudgetINR;
    const sanctionRef = fundingDecision.csrSanctionRef || `CSR-JH-${Math.floor(100000 + Math.random() * 900000)}`;

    proposal.fundingDecision = {
      status: fundingDecision.status,
      approvedAmountINR: approvedAmount,
      guaranteeAmountINR: isAccepted ? guaranteeAmount : undefined,
      csrGuaranteeStatus: isAccepted ? 'guaranteed' : 'rejected',
      csrSanctionRef: isAccepted ? sanctionRef : undefined,
      supportType: fundingDecision.supportType || 'CSR Grant & Co-development',
      comments: fundingDecision.comments || '',
      decidedBy,
      decidedAt: now,
    };

    if (isAccepted) {
      proposal.grantAmountINR = guaranteeAmount;
      proposal.sponsoredBy = partnerName;

      // Add or update active CSR pledge in challenge industryPartners
      const existingPledgeIdx = challenge.industryPartners.findIndex((p) => p.partnerName === partnerName);
      if (existingPledgeIdx >= 0) {
        challenge.industryPartners[existingPledgeIdx].pledgeAmountINR = guaranteeAmount;
        challenge.industryPartners[existingPledgeIdx].status = 'active';
      } else {
        challenge.industryPartners.push({
          id: `pld-${Date.now()}`,
          challengeId: challenge.id,
          partnerName,
          partnerType: (proposal.targetIndustryType as any) || 'Industry',
          supportType: (fundingDecision.supportType as any) || 'CSR Grant',
          pledgeAmountINR: guaranteeAmount,
          contactPerson: decidedBy,
          email: 'csr.partner@jharkhand.gov.in',
          notes: `CSR Fund Officially Guaranteed for proposal: "${proposal.proposalTitle}". Sanction Ref: ${sanctionRef}. Remarks: ${fundingDecision.comments || 'Direct Industry CSR Sponsorship Guaranteed.'}`,
          status: 'active',
          date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }

  // Update proposal status & challenge status
  if (problemDecision?.status === 'rejected') {
    proposal.status = 'rejected_by_industry';
  } else if (fundingDecision?.status === 'accepted') {
    proposal.status = 'funding_approved';
    // Return to university with Prototyping Phase active!
    challenge.status = 'prototype_development';
  } else if (fundingDecision?.status === 'rejected') {
    proposal.status = 'funding_rejected';
  } else if (problemDecision?.status === 'accepted') {
    proposal.status = 'accepted_by_industry';
  }

  // Record official comment on challenge
  const probText = problemDecision ? `Problem Statement ${problemDecision.status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}` : '';
  const fundText = fundingDecision ? `CSR Funding ${fundingDecision.status === 'accepted' ? `GUARANTEED & APPROVED (₹${((Number(fundingDecision.approvedAmountINR) || proposal.estimatedBudgetINR)).toLocaleString('en-IN')})` : 'DECLINED'}` : '';
  const combinedRemarks = [probText, fundText].filter(Boolean).join(' | ');

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'ind-decision',
    authorName: decidedBy,
    authorRole: 'industry',
    authorOrg: partnerName,
    message: `Industrial Decision Recorded for Proposal "${proposal.proposalTitle}": ${combinedRemarks}. Official Notes: ${problemDecision?.comments || fundingDecision?.comments || 'CSR Guarantee finalized by industrial partner.'}`,
    createdAt: now,
    isOfficialNote: true,
  });

  // High priority notification to University Authority
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: `CSR Fund Guaranteed by ${partnerName}`,
    message: `${partnerName} has accepted & guaranteed ₹${(fundingDecision?.approvedAmountINR || proposal.estimatedBudgetINR).toLocaleString('en-IN')} CSR funding for ${proposal.universityName} on [${challenge.code}]. Prototyping phase is now active!`,
    timestamp: now,
    type: 'pledge',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'university',
    isRead: false,
    actorName: decidedBy,
    actorOrg: partnerName,
  });

  res.json({ success: true, proposal, challenge });
});

// University Submits Prototype & Deploys it to Industry (Workflow Step 5: Prototype & Deploy)
app.post('/api/challenges/:id/deploy-prototype', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const {
    title,
    version,
    description,
    deliverableFile,
    demoUrl,
    testResultsSummary,
    specifications,
    deployedToIndustryId,
    deployedToIndustryName,
    deployedBy,
  } = req.body;

  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  const targetIndustry = deployedToIndustryName || challenge.industryPartners[0]?.partnerName || challenge.proposals[0]?.targetIndustryName || 'Industry Partner';

  challenge.prototypeDeliverable = {
    id: `proto-${Date.now()}`,
    title: title || 'Functional Prototype Deliverable Package',
    version: version || 'v1.0-release',
    description: description || 'Verified technical prototype and deployable package submitted by university research team.',
    deliverableFile: deliverableFile || undefined,
    demoUrl: demoUrl || undefined,
    testResultsSummary: testResultsSummary || 'Bench testing and initial field validation meet operational specifications.',
    specifications: specifications || ['Field-tested components', 'Telemetry integration', 'Safety certified'],
    submittedDate: dateStr,
    deployedDate: undefined,
    deployedToIndustryId: deployedToIndustryId || undefined,
    deployedToIndustryName: targetIndustry,
    status: 'prototype_submitted',
  };

  // Keep challenge status in prototype development/review stage - NOT 'deployed' until industry accepts!
  challenge.status = 'prototype_development';
  challenge.lifecycleStatus = 'in_progress';

  // Mark prototype development milestone completed, while final deployment milestone remains in progress
  const protoMilestone = challenge.milestones.find((m) => m.title.toLowerCase().includes('prototype') || m.id.includes('-3'));
  if (protoMilestone) {
    protoMilestone.status = 'completed';
    protoMilestone.completedDate = dateStr;
  }

  // Update prototype testing status: testing is verified, ready for industry acceptance
  challenge.prototypeTesting = {
    testedInField: true,
    testingDate: dateStr,
    testLocation: `${challenge.blockOrPanchayat || 'Field Pilot Site'}, ${challenge.district}`,
    testingSummary: testResultsSummary || 'Prototype verified in lab and submitted to industrial sponsor for deployment acceptance.',
    isDeployedInCommunity: false,
    deploymentDate: undefined,
    beneficiaryFeedback: 'Prototype submitted to industrial sponsor for deployment review and acceptance.',
  };

  // Add official comment
  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'uni-deploy',
    authorName: deployedBy || challenge.team?.facultyMentor || 'University Principal Investigator',
    authorRole: 'university',
    authorOrg: challenge.assignedUniversity?.name || 'Higher Education Institution',
    message: `Prototype Deliverable Submitted to Industry Partner (${targetIndustry}): Title: "${title || 'Functional Prototype'}" (Version: ${version || 'v1.0'}).${deliverableFile ? ` Deliverable File: [${deliverableFile.name}] (${deliverableFile.size}).` : ''} Awaiting industry review and deployment acceptance.`,
    createdAt: now,
    isOfficialNote: true,
  });

  // Dispatch notification to Industrial Officer
  notificationsStore.unshift({
    id: `notif-${Date.now()}-ind`,
    title: `New Prototype Awaiting Acceptance: ${challenge.code}`,
    message: `${challenge.assignedUniversity?.name || 'University'} has submitted the prototype deliverable ("${title || 'Prototype'}") to ${targetIndustry}. Please review and accept deployment in the Industry Portal.`,
    timestamp: now,
    type: 'milestone',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'industry',
    isRead: false,
    actorName: deployedBy || 'University Lead',
    actorOrg: challenge.assignedUniversity?.name || 'University',
  });

  // Dispatch notification to Citizen Submitter
  notificationsStore.unshift({
    id: `notif-${Date.now()}-cit`,
    title: `Prototype Submitted to Industry: ${challenge.code}`,
    message: `The university research team has completed the prototype for "${challenge.title}" and submitted it to ${targetIndustry}. Awaiting industry partner acceptance and deployment.`,
    timestamp: now,
    type: 'milestone',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'citizen',
    isRead: false,
    actorName: deployedBy || 'University Lead',
    actorOrg: challenge.assignedUniversity?.name || 'University',
  });

  res.json({ success: true, challenge });
});

// Industry Officer Verifies & Confirms Deployed Prototype Receipt
app.post('/api/challenges/:id/verify-prototype', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { verifiedBy, remarks, partnerName, industryName } = req.body;
  const effectivePartner = partnerName || industryName || 'Industrial Officer';
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  // Industry accepts the prototype and deployment!
  // NOW the status is changed to 'deployed' and lifecycleStatus to 'end'
  challenge.status = 'deployed';
  challenge.lifecycleStatus = 'end';

  if (!challenge.prototypeDeliverable) {
    challenge.prototypeDeliverable = {
      id: `proto-${challenge.id}`,
      title: `Verified Prototype for ${challenge.code}`,
      version: 'v1.0-final',
      description: 'Accepted and verified working prototype deliverable package.',
      submittedDate: dateStr,
      deployedDate: dateStr,
      status: 'verified_by_industry',
    };
  } else {
    challenge.prototypeDeliverable.status = 'verified_by_industry';
    challenge.prototypeDeliverable.deployedDate = dateStr;
  }

  challenge.prototypeDeliverable.verifiedByIndustry = {
    verified: true,
    verifiedBy: verifiedBy || 'Industrial Officer',
    verifiedAt: now,
    remarks: remarks || 'Accepted deployed prototype. Solution successfully deployed in field operations and community production.',
  };

  // Mark deployment milestone completed
  const deployMilestone = challenge.milestones.find((m) => m.title.toLowerCase().includes('pilot') || m.title.toLowerCase().includes('deploy') || m.id.includes('-3') || m.id.includes('-4'));
  if (deployMilestone) {
    deployMilestone.status = 'completed';
    deployMilestone.completedDate = dateStr;
  }

  if (challenge.prototypeTesting) {
    challenge.prototypeTesting.isDeployedInCommunity = true;
    challenge.prototypeTesting.deploymentDate = dateStr;
    challenge.prototypeTesting.beneficiaryFeedback = 'Prototype verified and deployed into community operations by industrial sponsor.';
  }

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'ind-verify',
    authorName: verifiedBy || 'Industrial Officer',
    authorRole: 'industry',
    authorOrg: effectivePartner,
    message: `Deployed Prototype Accepted & Deployed: Industrial Officer has formally verified, accepted, and deployed the prototype deliverable. Status is now updated in University and Citizen portals to "Complete and Deployed" (Status: End).`,
    createdAt: now,
    isOfficialNote: true,
  });

  // Notify University
  notificationsStore.unshift({
    id: `notif-${Date.now()}-uni`,
    title: `Complete and Deployed (Status: End): ${challenge.code}`,
    message: `${effectivePartner} has verified and accepted your deployed prototype. The problem statement lifecycle has reached final state: END.`,
    timestamp: now,
    type: 'approval',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'university',
    isRead: false,
    actorName: verifiedBy || 'Industrial Officer',
    actorOrg: effectivePartner,
  });

  // Notify Citizen Submitter
  notificationsStore.unshift({
    id: `notif-${Date.now()}-cit`,
    title: `Problem Resolved & Deployed (End): ${challenge.code}`,
    message: `Your submitted problem "${challenge.title}" has been successfully resolved! The industrial partner has accepted and deployed the working prototype into the community. Status: Complete and Deployed (End).`,
    timestamp: now,
    type: 'approval',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'citizen',
    isRead: false,
    actorName: verifiedBy || 'Industrial Officer',
    actorOrg: effectivePartner,
  });

  res.json({ success: true, challenge });
});

// AI Suggest Suitable Industry Partner for University Proposal
app.post('/api/ai/suggest-industry-partner', async (req: Request, res: Response) => {
  try {
    const { proposalTitle = '', category = '', summary = '', technologyStack = [], estimatedBudgetINR = 0, partnershipType = 'Funding' } = req.body;

    const prompt = `You are the chief industrial partnership triage specialist for Yukti Marg, Government of Jharkhand.
Recommend the single most suitable industry, startup, MSME, CSR organization, research institution, or innovation hub to sponsor, mentor, or co-develop this university research proposal.

Proposal Details:
Title: "${proposalTitle}"
Thematic Domain: "${category}"
Executive Summary: "${summary}"
Technology Stack: ${JSON.stringify(technologyStack)}
Estimated Budget: ₹${estimatedBudgetINR}
Requested Partnership Track: "${partnershipType}"

Available Ecosystem Partners:
1. "tata-steel-csr": Tata Steel CSR & Technology Incubation (Industry) - Solar Cold Chain, Drinking Water, Rural Livelihoods, Metallurgy, Skills
2. "sail-bokaro": Steel Authority of India (SAIL) Bokaro (Industry) - Slag Recycling, Eco-Bricks, Vocational Training, Tribal Healthcare
3. "ccl-coal-india": Central Coalfields Limited (CCL) / Coal India (Industry) - Mine Water Purification, Afforestation, Community Solar, Rural Electrification
4. "jharkhand-greentech": Jharkhand GreenTech Agritech Solutions (Startup - DPIIT Recognized) - Agro-IoT, Decentralized Cold Chain, Solar Dehydrators, Farmer FPO Linkages
5. "bokaro-msme-cluster": Bokaro Precision Metal MSME Cluster (MSME Consortium) - Light Engineering, Rapid Tooling, Sheet Metal, Testing Rigs
6. "tata-trusts-jharkhand": Tata Trusts - Jharkhand Rural Innovation Cell (CSR Foundation) - Tribal Nutrition, Agro-forestry, Decentralized Energy
7. "csir-cimfr": CSIR - Central Institute of Mining & Fuel Research (Research Institution) - Mining Tech, Fuel Research, Flyash, Water Decontamination, Air Quality Sensors
8. "aic-bit-mesra": Atal Incubation Centre (AIC) BIT Mesra Foundation (Innovation Hub) - Seed Grants, IP Commercialization, FabLab 3D Prototyping, Hardware Incubation

Respond ONLY in valid JSON:
{
  "partnerId": "one of the IDs above",
  "confidenceScore": 94,
  "matchReason": "Clear, precise 2-sentence rationale explaining why this partner is the premier match for this technical proposal and funding track",
  "recommendedEngagementTrack": "Mentoring | Co-development | Funding | Prototyping Lab | Pilot Implementation | Technology Transfer",
  "suggestedSponsorshipINR": 350000,
  "keySynergies": ["Synergy 1", "Synergy 2"]
}`;

    const aiResult = await generateWithGeminiFallback(prompt, { responseMimeType: 'application/json' });
    if (aiResult) {
      try {
        const parsed = JSON.parse(aiResult.text);
        const matchedOrg = industryPartnersStore.find((p) => p.id === parsed.partnerId) || industryPartnersStore[0];
        const alternatives = industryPartnersStore.filter((p) => p.id !== matchedOrg.id).slice(0, 3);
        return res.json({
          success: true,
          suggestedPartner: matchedOrg,
          confidenceScore: parsed.confidenceScore || 92,
          matchReason: parsed.matchReason,
          recommendedEngagementTrack: parsed.recommendedEngagementTrack || partnershipType,
          suggestedSponsorshipINR: parsed.suggestedSponsorshipINR || estimatedBudgetINR,
          keySynergies: parsed.keySynergies || [],
          alternativePartners: alternatives,
          engine: aiResult.model,
        });
      } catch {
        // fallback below
      }
    }

    // Deterministic fallback
    let best = industryPartnersStore[0];
    let reason = 'High CSR alignment with rural engineering interventions and active state innovation funding pool.';
    const combined = `${proposalTitle} ${category} ${summary} ${technologyStack.join(' ')}`.toLowerCase();

    if (combined.includes('water') || combined.includes('mine') || combined.includes('purification') || combined.includes('coal')) {
      best = industryPartnersStore.find((p) => p.id === 'ccl-coal-india') || best;
      reason = 'Focuses on mine water decontamination, rural water filtration, and community energy infrastructure in Jharkhand.';
    } else if (combined.includes('agriculture') || combined.includes('tomato') || combined.includes('crop') || combined.includes('iot') || combined.includes('sensor') || combined.includes('cold')) {
      best = industryPartnersStore.find((p) => p.id === 'jharkhand-greentech') || best;
      reason = 'Premier DPIIT-recognized agritech startup equipped with IoT field testbeds, solar dryers, and farmer FPO linkages.';
    } else if (combined.includes('metal') || combined.includes('tool') || combined.includes('machin') || combined.includes('fabricat') || combined.includes('hardware')) {
      best = industryPartnersStore.find((p) => p.id === 'bokaro-msme-cluster') || best;
      reason = 'Bokaro MSME cluster possesses precision fabrication tooling, sheet metal machining, and testing rigs for hardware prototypes.';
    } else if (combined.includes('tribal') || combined.includes('nutrition') || combined.includes('forest') || combined.includes('lac')) {
      best = industryPartnersStore.find((p) => p.id === 'tata-trusts-jharkhand') || best;
      reason = 'Tata Trusts provides dedicated philanthropic grants and field facilitation for tribal nutrition and forest livelihoods.';
    } else if (combined.includes('patent') || combined.includes('research') || combined.includes('mining') || combined.includes('fuel') || combined.includes('scientific')) {
      best = industryPartnersStore.find((p) => p.id === 'csir-cimfr') || best;
      reason = 'National CSIR scientific laboratory equipped with certified water/air testing and technological validation facilities.';
    } else if (combined.includes('startup') || combined.includes('incubat') || combined.includes('seed') || combined.includes('fablab')) {
      best = industryPartnersStore.find((p) => p.id === 'aic-bit-mesra') || best;
      reason = 'AIM NITI Aayog incubation centre providing FabLab prototyping access, mentor network, and early-stage seed grants.';
    }

    const alternatives = industryPartnersStore.filter((p) => p.id !== best.id).slice(0, 3);
    return res.json({
      success: true,
      suggestedPartner: best,
      confidenceScore: 89,
      matchReason: reason,
      recommendedEngagementTrack: partnershipType || 'Funding & Co-development',
      suggestedSponsorshipINR: estimatedBudgetINR || 350000,
      keySynergies: ['Domain alignment with CSR objectives', 'Accelerated field pilot deployment'],
      alternativePartners: alternatives,
      engine: 'deterministic-heuristic',
    });
  } catch (err: any) {
    console.error('Error in suggest-industry-partner:', err);
    return res.status(500).json({ error: err.message || 'Industry partner suggestion failed' });
  }
});

// Admin Directory & Website Master Control APIs
app.get('/api/admin/directory', (req: Request, res: Response) => {
  res.json({
    success: true,
    universities: universitiesStore,
    industries: industryPartnersStore,
    stats: {
      totalChallenges: challengesStore.length,
      assignedHEI: challengesStore.filter((c) => Boolean(c.assignedUniversity)).length,
      proposalsSubmitted: challengesStore.reduce((sum, c) => sum + (c.proposals?.length || 0), 0),
      industryFunded: challengesStore.filter((c) => (c.industryPartners?.length || 0) > 0).length,
      totalCommittedFundsINR: industryPartnersStore.reduce((sum, i) => sum + i.committedFundingINR, 0),
    },
  });
});

app.post('/api/admin/challenges/:id/override-status', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id || c.code === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { status, priority, adminRemarks, assignedUniversity, certifiedByAuthority, expediteFlag, adminActor } = req.body;
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  const prevStatus = challenge.status;
  if (status) {
    challenge.status = status;
    if (status === 'deployed') {
      challenge.lifecycleStatus = 'end';
      if (!challenge.prototypeDeliverable) {
        challenge.prototypeDeliverable = {
          id: `proto-${challenge.id}`,
          title: `State Deployed Solution for ${challenge.code}`,
          version: 'v1.0-admin-verified',
          description: 'Officially deployed into community operations under State Innovation Directorate sign-off.',
          submittedDate: dateStr,
          deployedDate: dateStr,
          status: 'verified_by_industry',
          verifiedByIndustry: {
            verified: true,
            verifiedBy: adminActor?.name || 'State Directorate Admin',
            verifiedAt: now,
            remarks: 'Administratively verified and deployed in local community.',
          },
        };
      } else {
        challenge.prototypeDeliverable.status = 'verified_by_industry';
        challenge.prototypeDeliverable.deployedDate = dateStr;
      }
    }
  }

  if (priority) {
    challenge.priority = priority;
  }

  if (certifiedByAuthority !== undefined) {
    if (!challenge.submittedBy) {
      challenge.submittedBy = { name: 'Citizen', type: 'Citizen' };
    }
    challenge.submittedBy.certifiedByAuthority = Boolean(certifiedByAuthority);
  }

  if (assignedUniversity) {
    challenge.assignedUniversity = {
      id: assignedUniversity.id,
      name: assignedUniversity.name,
      department: assignedUniversity.department || 'Applied Technology & Engineering Lab',
      assignedDate: assignedUniversity.assignedDate || dateStr,
    };
    if (!challenge.universityAcceptance) {
      challenge.universityAcceptance = {
        status: 'accepted',
        acceptedAt: now,
        acceptedBy: 'State Innovation Director (Administrative Allocation)',
        remarks: 'Direct administrative mandate allocation to Higher Education Institution.',
      };
    }
    if (challenge.status === 'submitted' || challenge.status === 'under_review') {
      challenge.status = 'assigned_hei';
    }
  }

  const remarksText = adminRemarks ? ` Remarks: ${adminRemarks}` : '';
  const changesSummary = [
    status && status !== prevStatus ? `Status moved to [${status.toUpperCase()}]` : null,
    priority ? `Priority set to [${priority.toUpperCase()}]` : null,
    assignedUniversity ? `Allocated to ${assignedUniversity.name}` : null,
    certifiedByAuthority !== undefined ? (certifiedByAuthority ? 'Officially Certified by Directorate' : 'Certification Withdrawn') : null,
    expediteFlag ? 'Marked as State Emergency / Expedited Priority' : null,
  ].filter(Boolean).join(' | ');

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: adminActor?.id || 'sys-admin-override',
    authorName: adminActor?.name || 'State Innovation Director (Admin)',
    authorRole: 'admin',
    authorOrg: 'State Higher & Technical Education Directorate',
    message: `State Administrator Action: ${changesSummary || 'Record updated by Directorate.'}.${remarksText}`,
    createdAt: now,
    isOfficialNote: true,
  });

  // Notify Citizen
  notificationsStore.unshift({
    id: `notif-${Date.now()}-admin-cit`,
    title: `Admin Action on Your Problem: ${challenge.code}`,
    message: `State Innovation Directorate updated your challenge [${challenge.code}]. ${changesSummary || 'Status refreshed.'}.${remarksText}`,
    timestamp: now,
    type: status === 'deployed' ? 'approval' : 'milestone',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'citizen',
    isRead: false,
    actorName: adminActor?.name || 'State Innovation Director',
    actorOrg: 'Higher & Technical Education Directorate',
  });

  // Notify University if assigned
  if (challenge.assignedUniversity) {
    notificationsStore.unshift({
      id: `notif-${Date.now()}-admin-uni`,
      title: `Directorate Directive: ${challenge.code}`,
      message: `State Innovation Directorate issued administrative update for [${challenge.code}]: ${changesSummary}.${remarksText}`,
      timestamp: now,
      type: 'ai_routing',
      challengeId: challenge.id,
      challengeCode: challenge.code,
      targetRole: 'university',
      isRead: false,
      actorName: adminActor?.name || 'State Innovation Director',
      actorOrg: 'Higher & Technical Education Directorate',
    });
  }

  res.json({ success: true, challenge });
});

// Admin adds Official Directive to problem
app.post('/api/admin/challenges/:id/add-directive', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id || c.code === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { directiveText, orderNumber, targetAudience = 'all', adminName = 'State Innovation Director' } = req.body;
  if (!directiveText) {
    return res.status(400).json({ error: 'Directive text is required.' });
  }

  const now = new Date().toISOString();
  const orderRef = orderNumber || `DIR/YM/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

  challenge.comments.push({
    id: `c-dir-${Date.now()}`,
    authorId: 'sys-dir-admin',
    authorName: `${adminName} (Directorate Order Ref: ${orderRef})`,
    authorRole: 'admin',
    authorOrg: 'State Higher & Technical Education Directorate, Govt of Jharkhand',
    message: `OFFICIAL GOVERNMENT DIRECTIVE [${orderRef}]: ${directiveText}`,
    createdAt: now,
    isOfficialNote: true,
  });

  notificationsStore.unshift({
    id: `notif-${Date.now()}-dir`,
    title: `Official Directorate Directive [${orderRef}]`,
    message: `State Innovation Directorate issued official order for [${challenge.code}]: "${directiveText}"`,
    timestamp: now,
    type: 'approval',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: targetAudience,
    isRead: false,
    actorName: adminName,
    actorOrg: 'State Higher & Technical Education Directorate',
  });

  res.json({ success: true, challenge });
});

// Industry Pledge or Sponsorship
app.post('/api/challenges/:id/pledges', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const pledge: IndustryPledge = {
    id: `pld-${Date.now()}`,
    challengeId: challenge.id,
    partnerName: req.body.partnerName,
    partnerType: req.body.partnerType || 'CSR Foundation',
    supportType: req.body.supportType || 'CSR Grant',
    pledgeAmountINR: Number(req.body.pledgeAmountINR) || 0,
    contactPerson: req.body.contactPerson,
    email: req.body.email,
    notes: req.body.notes || 'Collaborative partnership pledge through Yukti Marg.',
    status: 'active',
    date: new Date().toISOString().split('T')[0],
  };

  challenge.industryPartners.push(pledge);

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'ind-pledge',
    authorName: pledge.contactPerson,
    authorRole: 'industry',
    authorOrg: pledge.partnerName,
    message: `Industry partnership pledged: ${pledge.supportType} ${pledge.pledgeAmountINR ? `(₹${pledge.pledgeAmountINR.toLocaleString('en-IN')})` : ''} by ${pledge.partnerName}.`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  res.json({ success: true, pledge, challenge });
});

// Add Milestone or update milestone
app.post('/api/challenges/:id/milestones', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { milestoneId, status, title, description, dueDate } = req.body;

  if (milestoneId) {
    // Update existing
    const ms = challenge.milestones.find((m) => m.id === milestoneId);
    if (ms) {
      if (status) ms.status = status;
      if (status === 'completed' || status === 'verified_by_gov') {
        ms.completedDate = new Date().toISOString().split('T')[0];
      }
    }
  } else {
    // Create new
    const newMs: Milestone = {
      id: `ms-${Date.now()}`,
      title,
      description: description || '',
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'pending',
    };
    challenge.milestones.push(newMs);
  }

  res.json({ success: true, challenge });
});

// Add comment/collaboration message
app.post('/api/challenges/:id/comments', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { authorName, authorRole, authorOrg, message, isOfficialNote } = req.body;

  if (!message || !authorName) {
    return res.status(400).json({ error: 'Message and author are required' });
  }

  const newComment: CollaborationComment = {
    id: `c-${Date.now()}`,
    authorId: `usr-${Date.now()}`,
    authorName,
    authorRole: authorRole || 'citizen',
    authorOrg: authorOrg || 'Public Contributor',
    message,
    createdAt: new Date().toISOString(),
    isOfficialNote: Boolean(isOfficialNote),
  };

  challenge.comments.push(newComment);
  res.json({ success: true, comment: newComment, challenge });
});

// Update Patent or Research Paper record (Stage 5 of Flowchart)
app.post('/api/challenges/:id/patent', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { patentInfo, researchPaperInfo } = req.body;
  if (patentInfo) {
    challenge.patentInfo = patentInfo;
  }
  if (researchPaperInfo) {
    challenge.researchPaperInfo = researchPaperInfo;
  }

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'sys-ip',
    authorName: 'Yukti Marg IP Cell',
    authorRole: 'university',
    authorOrg: challenge.assignedUniversity?.name || 'Academic Consortium',
    message: `Intellectual Property update: ${patentInfo?.status ? `Patent status: ${patentInfo.status} (${patentInfo.applicationNumber || 'Application in review'})` : ''} ${researchPaperInfo?.paperTitle ? `Research paper logged: "${researchPaperInfo.paperTitle}"` : ''}.`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  res.json({ success: true, challenge });
});

// Update Prototype Testing and Community Deployment (Stage 5 of Flowchart)
app.post('/api/challenges/:id/prototype-testing', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { testedInField, testingDate, testLocation, testingSummary, isDeployedInCommunity, deploymentDate, beneficiaryFeedback } = req.body;

  challenge.prototypeTesting = {
    testedInField: Boolean(testedInField),
    testingDate: testingDate || new Date().toISOString().split('T')[0],
    testLocation: testLocation || `${challenge.blockOrPanchayat}, ${challenge.district}`,
    testingSummary: testingSummary || 'Field pilot test successfully completed with local stakeholders.',
    isDeployedInCommunity: Boolean(isDeployedInCommunity),
    deploymentDate: deploymentDate || (isDeployedInCommunity ? new Date().toISOString().split('T')[0] : undefined),
    beneficiaryFeedback: beneficiaryFeedback || 'Community adoption verified by local Gram Panchayat / Body.',
  };

  if (isDeployedInCommunity && challenge.status !== 'deployed') {
    challenge.status = 'deployed';
  } else if (testedInField && challenge.status === 'prototype_development') {
    challenge.status = 'pilot_testing';
  }

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'sys-test',
    authorName: 'Field Validation Cell',
    authorRole: 'admin',
    authorOrg: 'Govt of Jharkhand & University Field Unit',
    message: `Milestone Field Update: ${testedInField ? `Prototype field testing completed at ${testLocation || challenge.district}.` : ''} ${isDeployedInCommunity ? `Full real-world deployment active in community!` : ''}`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  res.json({ success: true, challenge });
});

// ==========================================
// 3. NOTIFICATIONS & COMMUNICATION API
// ==========================================
app.get('/api/notifications', (req: Request, res: Response) => {
  const { role, unreadOnly, challengeId } = req.query;

  let filtered = [...notificationsStore];

  if (role && role !== 'all') {
    filtered = filtered.filter(
      (n) => !n.targetRole || n.targetRole === 'all' || n.targetRole === role
    );
  }

  if (unreadOnly === 'true') {
    filtered = filtered.filter((n) => !n.isRead);
  }

  if (challengeId) {
    filtered = filtered.filter((n) => n.challengeId === challengeId);
  }

  // Sort latest first
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = notificationsStore.filter((n) => !n.isRead).length;

  res.json({
    success: true,
    notifications: filtered,
    total: filtered.length,
    unreadCount,
  });
});

app.post('/api/notifications', (req: Request, res: Response) => {
  const { title, message, type, challengeId, challengeCode, targetRole, actorName, actorOrg } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const newNotification: NotificationItem = {
    id: `notif-${Date.now()}`,
    title,
    message,
    timestamp: new Date().toISOString(),
    type: type || 'submission',
    challengeId,
    challengeCode,
    targetRole: targetRole || 'all',
    isRead: false,
    actorName: actorName || 'Yukti Marg System',
    actorOrg: actorOrg || 'Government of Jharkhand',
  };

  notificationsStore.unshift(newNotification);
  res.status(201).json({ success: true, notification: newNotification });
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notificationsStore.find((n) => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
  }
  res.json({ success: true, notification: notif });
});

app.put('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  notificationsStore.forEach((n) => {
    n.isRead = true;
  });
  res.json({ success: true, unreadCount: 0 });
});

// ==========================================
// 4. AI PROBLEM MANAGEMENT ROUTING & APPROVALS
// ==========================================
app.post('/api/ai/route-challenge', (req: Request, res: Response) => {
  const { challengeId, universityId, universityName, department, facultyMentor, routingReason } = req.body;

  const challenge = challengesStore.find((c) => c.id === challengeId || c.code === challengeId);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  challenge.assignedUniversity = {
    id: universityId || 'bit-mesra',
    name: universityName || 'Birla Institute of Technology (BIT) Mesra',
    department: department || 'Department of Innovation & Technology',
    assignedDate: new Date().toISOString().split('T')[0],
  };

  challenge.status = 'assigned_hei';

  // Mark milestone 2 as completed
  const ms2 = challenge.milestones.find((m) => m.title.includes('University') || m.id.includes('-2'));
  if (ms2) {
    ms2.status = 'completed';
    ms2.completedDate = new Date().toISOString().split('T')[0];
  }

  // Official comment
  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'ai-router-01',
    authorName: 'Yukti Marg AI Curation Hub',
    authorRole: 'admin',
    authorOrg: 'State Higher & Technical Education Council',
    message: `Automated AI Routing Approved: Assigned to ${universityName} (${department || 'Core Research Cell'}). Routing Criteria: ${routingReason || 'High match with faculty publications and incubation lab capacity'}.`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  // Create notification
  const notif: NotificationItem = {
    id: `notif-${Date.now()}`,
    title: `Challenge Routed to ${universityName}`,
    message: `Problem statement [${challenge.code}] has been validated and officially routed to ${universityName}.`,
    timestamp: new Date().toISOString(),
    type: 'ai_routing',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'all',
    isRead: false,
    actorName: 'AI Problem Routing Engine',
    actorOrg: 'Dept of Higher & Technical Education',
  };
  notificationsStore.unshift(notif);

  res.json({ success: true, challenge, notification: notif });
});

// Add Approval to Challenge
app.post('/api/challenges/:id/approvals', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id || c.code === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { stageName, stageCode, approverName, approverRole, approverOrg, decision, comments, officialRefNo } = req.body;

  if (!challenge.approvals) {
    challenge.approvals = [];
  }

  const newApproval: ProjectApproval = {
    id: `appr-${Date.now()}`,
    stageName: stageName || 'Milestone Stage Approval',
    stageCode: stageCode || 'STAGE-REVIEW',
    approverName: approverName || 'Competent Authority',
    approverRole: approverRole || 'government',
    approverOrg: approverOrg || 'Government of Jharkhand',
    approvalDate: new Date().toISOString().split('T')[0],
    decision: decision || 'approved',
    comments: comments || 'Compliance verified and approved for next project stage.',
    officialRefNo: officialRefNo || `GOV-JH-EXP-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  challenge.approvals.unshift(newApproval);

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: `usr-appr-${Date.now()}`,
    authorName: newApproval.approverName,
    authorRole: newApproval.approverRole,
    authorOrg: newApproval.approverOrg,
    message: `Official Approval Logged [${newApproval.decision.toUpperCase()}]: ${newApproval.stageName}. Reference: ${newApproval.officialRefNo}. Remarks: ${newApproval.comments}`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  // Notification
  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: `Official Stage Approval: ${newApproval.stageName}`,
    message: `${newApproval.approverOrg} recorded decision [${newApproval.decision.toUpperCase()}] for ${challenge.code}.`,
    timestamp: new Date().toISOString(),
    type: 'approval',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'all',
    isRead: false,
    actorName: newApproval.approverName,
    actorOrg: newApproval.approverOrg,
  });

  res.json({ success: true, challenge, approval: newApproval });
});

// Add Deliverable to Challenge
app.post('/api/challenges/:id/deliverables', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id || c.code === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { title, category, submittedBy, status, evidenceUrl, notes } = req.body;

  if (!challenge.deliverables) {
    challenge.deliverables = [];
  }

  const newDeliverable: ProjectDeliverable = {
    id: `deliv-${Date.now()}`,
    title: title || 'Project Deliverable',
    category: category || 'Physical Prototype',
    submittedBy: submittedBy || challenge.assignedUniversity?.name || 'Academic Project Lead',
    submissionDate: new Date().toISOString().split('T')[0],
    status: status || 'submitted',
    evidenceUrl: evidenceUrl || 'https://drive.google.com/example-deliverable-dossier',
    notes: notes || 'Verified technical deliverable uploaded for state evaluation.',
  };

  challenge.deliverables.unshift(newDeliverable);

  res.json({ success: true, challenge, deliverable: newDeliverable });
});

// Register Startup from Research Challenge
app.post('/api/challenges/:id/startup', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id || c.code === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { name, incubationCenter, founders, incorporationDate, fundingRaisedINR, dpiitRecognized, description, sector } = req.body;

  const startup: StartupRecord = {
    name: name || 'Yukti AgroTech Innovations Pvt Ltd',
    incubationCenter: incubationCenter || challenge.team?.incubationCenter || 'BIT-TBI Incubation Centre',
    founders: founders || ['Amitabh Soren', 'Prof. Dr. Rajesh K. Verma'],
    incorporationDate: incorporationDate || new Date().toISOString().split('T')[0],
    fundingRaisedINR: Number(fundingRaisedINR) || 1500000,
    dpiitRecognized: dpiitRecognized !== undefined ? Boolean(dpiitRecognized) : true,
    description: description || 'Spin-off technology venture commercializing patented grassroots solutions.',
    sector: sector || challenge.category,
  };

  challenge.startupInfo = startup;

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'sys-startup',
    authorName: 'State Startup Incubation Hub',
    authorRole: 'university',
    authorOrg: startup.incubationCenter,
    message: `Enterprise Spin-off Established: "${startup.name}" incorporated by student-faculty innovators. Seed Funding: ₹${((startup.fundingRaisedINR || 0) / 100000).toFixed(1)} Lakhs. DPIIT Recognized: ${startup.dpiitRecognized ? 'Yes' : 'In Progress'}.`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: `New Startup Spin-off Incorporated: ${startup.name}`,
    message: `Academic research from challenge ${challenge.code} has graduated into a formal registered enterprise under ${startup.incubationCenter}.`,
    timestamp: new Date().toISOString(),
    type: 'adoption',
    challengeId: challenge.id,
    challengeCode: challenge.code,
    targetRole: 'all',
    isRead: false,
    actorName: startup.name,
    actorOrg: startup.incubationCenter,
  });

  res.json({ success: true, challenge, startup });
});

// Record Technology Transfer
app.post('/api/challenges/:id/technology-transfer', (req: Request, res: Response) => {
  const challenge = challengesStore.find((c) => c.id === req.params.id || c.code === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const { transferredTo, transferType, mouDate, commercializationStatus } = req.body;

  challenge.technologyTransferInfo = {
    transferredTo: transferredTo || 'Jharkhand State Agro-Industries Development Corp',
    transferType: transferType || 'Commercial Production',
    mouDate: mouDate || new Date().toISOString().split('T')[0],
    commercializationStatus: commercializationStatus || 'signed',
  };

  challenge.comments.push({
    id: `c-${Date.now()}`,
    authorId: 'sys-tech-xfer',
    authorName: 'Technology Transfer Office',
    authorRole: 'admin',
    authorOrg: 'Higher & Technical Education Directorate',
    message: `Technology Transfer Agreement signed with ${transferredTo} (${transferType}). Status: ${commercializationStatus}.`,
    createdAt: new Date().toISOString(),
    isOfficialNote: true,
  });

  res.json({ success: true, challenge });
});

// ==========================================
// 5. STATE ANALYTICS API
// ==========================================
app.get('/api/stats', (req: Request, res: Response) => {
  const total = challengesStore.length;
  const inProgress = challengesStore.filter((c) =>
    ['team_constituted', 'proposal_submitted', 'prototype_development', 'pilot_testing'].includes(c.status)
  ).length;
  const solved = challengesStore.filter((c) => c.status === 'deployed').length;
  const assigned = challengesStore.filter((c) => c.assignedUniversity).length;

  const totalBeneficiaries = challengesStore.reduce((acc, c) => acc + (c.estimatedImpactPeople || 0), 0);

  // Industry funding pledged
  const totalFundingPledged = challengesStore.reduce((acc, c) => {
    const pSum = (c.industryPartners || []).reduce((sum, p) => sum + (p.pledgeAmountINR || 0), 0);
    return acc + pSum;
  }, 0);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  challengesStore.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // District distribution
  const districtCounts: Record<string, number> = {};
  const districtSolvedCounts: Record<string, number> = {};
  challengesStore.forEach((c) => {
    districtCounts[c.district] = (districtCounts[c.district] || 0) + 1;
    if (c.status === 'deployed') {
      districtSolvedCounts[c.district] = (districtSolvedCounts[c.district] || 0) + 1;
    }
  });

  // Submitter types breakdown
  const submitterTypeCounts: Record<string, number> = {
    'Individual Citizen': 0,
    'Community Group': 0,
    'Panchayati Raj Institution (PRI)': 0,
    'Urban Local Body (ULB)': 0,
    'Government Department': 0,
  };

  challengesStore.forEach((c) => {
    const type = c.submittedBy?.type || 'Citizen';
    if (type.includes('PRI') || type.includes('Panchayat')) {
      submitterTypeCounts['Panchayati Raj Institution (PRI)'] += 1;
    } else if (type.includes('ULB') || type.includes('Urban')) {
      submitterTypeCounts['Urban Local Body (ULB)'] += 1;
    } else if (type.includes('Gov') || type.includes('Agency')) {
      submitterTypeCounts['Government Department'] += 1;
    } else if (type.includes('Community')) {
      submitterTypeCounts['Community Group'] += 1;
    } else {
      submitterTypeCounts['Individual Citizen'] += 1;
    }
  });

  // Flowchart & Lifecycle metrics: Patents, Papers, Prototypes Tested, Startups, Deployments
  const patentsInitiated = challengesStore.filter((c) => c.patentInfo && c.patentInfo.status !== 'none').length;
  const researchPapersCount = challengesStore.filter((c) => c.researchPaperInfo && c.researchPaperInfo.status !== 'none').length;
  const prototypesTested = challengesStore.filter((c) => c.prototypeTesting?.testedInField || c.status === 'pilot_testing' || c.status === 'deployed').length;
  const prototypesDeployed = solved;
  const startupsCreated = challengesStore.filter((c) => c.startupInfo).length + 4; // Including state incubator spin-offs
  const techTransfersExecuted = challengesStore.filter((c) => c.technologyTransferInfo).length + 3;

  // Stage funnel
  const stageFunnel = {
    stage1_intake: total,
    stage2_ai_routed: challengesStore.filter((c) => c.status !== 'submitted').length,
    stage3_hei_teams: challengesStore.filter((c) => ['team_constituted', 'proposal_submitted', 'prototype_development', 'pilot_testing', 'deployed'].includes(c.status)).length,
    stage4_prototyping_testing: challengesStore.filter((c) => ['prototype_development', 'pilot_testing', 'deployed'].includes(c.status)).length,
    stage5_deployed_scale: solved,
  };

  res.json({
    success: true,
    stats: {
      totalChallenges: total,
      inProgress,
      solved,
      assignedToUniversities: assigned,
      totalBeneficiaries,
      totalFundingPledged,
      categoryCounts,
      districtCounts,
      districtSolvedCounts,
      submitterTypeCounts,
      participatingHEIs: UNIVERSITIES.length,
      patentsInitiated,
      researchPapersCount,
      prototypesTested,
      prototypesDeployed,
      startupsCreated,
      techTransfersExecuted,
      studentInnovatorsActive: 84,
      stageFunnel,
      unreadNotificationsCount: notificationsStore.filter((n) => !n.isRead).length,
    },
  });
});

// Universities list
app.get('/api/universities', (req: Request, res: Response) => {
  res.json({ success: true, universities: UNIVERSITIES });
});

// ==========================================
// 4. VITE & STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yukti Marg Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
