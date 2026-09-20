import { User, UserRole } from '../types';

export interface AuthAccount {
  user: User;
  username: string;
  passwordHash: string; // In-memory/local storage password
}

const STORAGE_USERS_KEY = 'yukti_marg_registered_users';
const STORAGE_CURRENT_USER_KEY = 'yukti_marg_current_user';

// Pre-seeded accounts accessible with username or email & password
const DEFAULT_ACCOUNTS: AuthAccount[] = [
  {
    username: 'citizen',
    passwordHash: 'password123',
    user: {
      id: 'usr-cit-101',
      name: 'Ramesh Kumar Mahto',
      username: 'citizen',
      email: 'citizen@jharkhand.gov.in',
      role: 'citizen',
      organization: 'Resident Citizen / Local Beneficiary',
      department: 'Village Resident',
      district: 'Ranchi',
      block: 'Ormanjhi',
      panchayat: 'Ormanjhi',
      phone: '+91 94311 58210',
      designation: 'Citizen Resident',
      verified: true,
    },
  },
  {
    username: 'mukhiya',
    passwordHash: 'password123',
    user: {
      id: 'usr-cit-102',
      name: 'Smt. Sunita Devi (Mukhiya)',
      username: 'mukhiya',
      email: 'mukhiya.ormanjhi@jharkhand.gov.in',
      role: 'panchayat',
      organization: 'Ormanjhi Gram Panchayat (PRI)',
      department: 'Panchayati Raj Institution',
      district: 'Ranchi',
      block: 'Ormanjhi',
      panchayat: 'Ormanjhi Gram Panchayat',
      designation: 'Gram Panchayat Mukhiya',
      phone: '+91 94311 28945',
      verified: true,
    },
  },
  {
    username: 'panchayat_sec',
    passwordHash: 'password123',
    user: {
      id: 'usr-pri-103',
      name: 'Rajesh Munda (Panchayat Secretary)',
      username: 'panchayat_sec',
      email: 'sec.kanke@jharkhand.gov.in',
      role: 'panchayat',
      organization: 'Kanke Gram Panchayat Office',
      department: 'Panchayati Raj Rural Administration',
      district: 'Ranchi',
      block: 'Kanke',
      panchayat: 'Kanke Gram Panchayat',
      designation: 'Panchayat Secretary',
      phone: '+91 94313 77124',
      verified: true,
    },
  },
  {
    username: 'bdo_officer',
    passwordHash: 'password123',
    user: {
      id: 'usr-gov-101',
      name: 'Amit Kumar Sinha (BDO)',
      username: 'bdo_officer',
      email: 'bdo.ormanjhi@jharkhand.gov.in',
      role: 'government',
      organization: 'Block Development Office, Ormanjhi',
      department: 'Rural Development & Block Administration',
      district: 'Ranchi',
      block: 'Ormanjhi',
      designation: 'Block Development Officer (BDO)',
      phone: '+91 94315 90123',
      verified: true,
    },
  },
  {
    username: 'admin',
    passwordHash: 'password123',
    user: {
      id: 'usr-adm-01',
      name: 'Dr. Sneha Roy, IAS',
      username: 'admin',
      email: 'dir.higheredu@jharkhand.gov.in',
      role: 'admin',
      organization: 'Department of Higher & Technical Education, Govt of Jharkhand',
      department: 'State Directorate of Innovation & NEP 2020 Implementation',
      district: 'Ranchi',
      designation: 'State Innovation Director & Website Administrator',
      phone: '+91 651 240019',
      verified: true,
    },
  },
  {
    username: 'gov_admin',
    passwordHash: 'password123',
    user: {
      id: 'usr-adm-03',
      name: 'Dr. Sneha Roy, IAS',
      username: 'gov_admin',
      email: 'dir.higheredu@jharkhand.gov.in',
      role: 'admin',
      organization: 'Department of Higher & Technical Education, Govt of Jharkhand',
      department: 'State Directorate of Innovation & NEP 2020 Implementation',
      district: 'Ranchi',
      designation: 'State Innovation Director & Website Administrator',
      phone: '+91 651 240019',
      verified: true,
    },
  },
  {
    username: 'university',
    passwordHash: 'password123',
    user: {
      id: 'usr-uni-101',
      name: 'Prof. Dr. Rajesh K. Verma',
      username: 'university',
      email: 'faculty@bitmesra.ac.in',
      role: 'university',
      organization: 'Birla Institute of Technology (BIT) Mesra, Ranchi',
      department: 'Department of Mechanical & Agro-Automation Engineering',
      district: 'Ranchi',
      phone: '+91 98351 44120',
      designation: 'Dean of Research & Innovation',
      verified: true,
    },
  },
  {
    username: 'bit_mesra',
    passwordHash: 'password123',
    user: {
      id: 'usr-uni-101',
      name: 'Prof. Dr. Rajesh K. Verma',
      username: 'bit_mesra',
      email: 'faculty@bitmesra.ac.in',
      role: 'university',
      organization: 'Birla Institute of Technology (BIT) Mesra, Ranchi',
      department: 'Department of Mechanical & Agro-Automation Engineering',
      district: 'Ranchi',
      phone: '+91 98351 44120',
      designation: 'Dean of Research & Innovation',
      verified: true,
    },
  },
  {
    username: 'iit_ism',
    passwordHash: 'password123',
    user: {
      id: 'usr-uni-102',
      name: 'Prof. Dr. Sanjay Mandal',
      username: 'iit_ism',
      email: 's.mandal@iitism.ac.in',
      role: 'university',
      organization: 'Indian Institute of Technology (IIT ISM) Dhanbad',
      department: 'Department of Civil & Mining Engineering',
      district: 'Dhanbad',
      phone: '+91 326 2235001',
      designation: 'Professor, Structural Materials Lab',
      verified: true,
    },
  },
  {
    username: 'nit_jsr',
    passwordHash: 'password123',
    user: {
      id: 'usr-uni-103',
      name: 'Prof. Dr. A. K. Choudhary',
      username: 'nit_jsr',
      email: 'dean.rc@nitjsr.ac.in',
      role: 'university',
      organization: 'National Institute of Technology (NIT) Jamshedpur',
      department: 'Department of Metallurgical & Materials Engineering',
      district: 'East Singhbhum (Jamshedpur)',
      phone: '+91 657 2282220',
      designation: 'Dean of Research & Consultancy',
      verified: true,
    },
  },
  {
    username: 'bau_ranchi',
    passwordHash: 'password123',
    user: {
      id: 'usr-uni-104',
      name: 'Dr. Manoj Kumar',
      username: 'bau_ranchi',
      email: 'head.agrieng@bauranchi.org',
      role: 'university',
      organization: 'Birsa Agricultural University (BAU) Kanke, Ranchi',
      department: 'Department of Agricultural Engineering & Forestry',
      district: 'Ranchi',
      phone: '+91 651 2450056',
      designation: 'Head of Agro-Innovation & Post-Harvest Lab',
      verified: true,
    },
  },
  {
    username: 'rims_ranchi',
    passwordHash: 'password123',
    user: {
      id: 'usr-uni-105',
      name: 'Dr. Vivek Kashyap',
      username: 'rims_ranchi',
      email: 'dean.rims@jharkhand.gov.in',
      role: 'university',
      organization: 'Rajendra Institute of Medical Sciences (RIMS) Ranchi',
      department: 'Department of Preventive Medicine & Rural Health',
      district: 'Ranchi',
      phone: '+91 651 2950505',
      designation: 'Dean & Head of Clinical Innovations',
      verified: true,
    },
  },
  {
    username: 'iiit_ranchi',
    passwordHash: 'password123',
    user: {
      id: 'usr-uni-106',
      name: 'Prof. Dr. Vishnu Priye',
      username: 'iiit_ranchi',
      email: 'director@iiitranchi.ac.in',
      role: 'university',
      organization: 'Indian Institute of Information Technology (IIIT) Ranchi',
      department: 'Department of AI, NLP & Speech Technologies',
      district: 'Ranchi',
      phone: '+91 651 2233000',
      designation: 'Director & AI Research Chair',
      verified: true,
    },
  },
  {
    username: 'ranchi_univ',
    passwordHash: 'password123',
    user: {
      id: 'usr-uni-107',
      name: 'Prof. Dr. Ajit Kumar Sinha',
      username: 'ranchi_univ',
      email: 'vc@ranchiuniversity.ac.in',
      role: 'university',
      organization: 'Ranchi University, Ranchi',
      department: 'Tribal Studies & Ethnobotany Center',
      district: 'Ranchi',
      phone: '+91 651 2208538',
      designation: 'Vice-Chancellor & Research Patron',
      verified: true,
    },
  },
  {
    username: 'vbu_hazaribagh',
    passwordHash: 'password123',
    user: {
      id: 'usr-uni-108',
      name: 'Prof. Dr. Mukul Narayan Deo',
      username: 'vbu_hazaribagh',
      email: 'dean.science@vbu.ac.in',
      role: 'university',
      organization: 'Vinoba Bhave University (VBU) Hazaribagh',
      department: 'Department of Environmental Sciences & Rural Tech',
      district: 'Hazaribagh',
      phone: '+91 6546 264212',
      designation: 'Dean of Science & Rural Innovation',
      verified: true,
    },
  },
  {
    username: 'industry',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-101',
      name: 'Sunil Murmu',
      username: 'industry',
      email: 'csr@tatasteel.com',
      role: 'industry',
      organization: 'Tata Steel CSR & Technology Incubation Division',
      department: 'Social Innovation & Rural Livelihood Cell',
      district: 'East Singhbhum (Jamshedpur)',
      phone: '+91 99341 08521',
      designation: 'Head of CSR Technology Deployments',
      verified: true,
    },
  },
  {
    username: 'tatasteel',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-101',
      name: 'Sunil Murmu',
      username: 'tatasteel',
      email: 'csr@tatasteel.com',
      role: 'industry',
      organization: 'Tata Steel CSR & Technology Incubation Division',
      department: 'Social Innovation & Rural Livelihood Cell',
      district: 'East Singhbhum (Jamshedpur)',
      phone: '+91 99341 08521',
      designation: 'Head of CSR Technology Deployments',
      verified: true,
    },
  },
  {
    username: 'greentech',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-102',
      name: 'Aman Verma',
      username: 'greentech',
      email: 'founder@jharkhandgreentech.in',
      role: 'industry',
      organization: 'Jharkhand GreenTech Agritech Solutions (Startup)',
      department: 'CleanTech & Agro-IoT Incubation',
      district: 'Ranchi',
      phone: '+91 98350 19283',
      designation: 'Co-Founder & CTO',
      verified: true,
    },
  },
  {
    username: 'jharkhand_greentech',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-102',
      name: 'Aman Verma',
      username: 'jharkhand_greentech',
      email: 'founder@jharkhandgreentech.in',
      role: 'industry',
      organization: 'Jharkhand GreenTech Agritech Solutions (Startup)',
      department: 'CleanTech & Agro-IoT Incubation',
      district: 'Ranchi',
      phone: '+91 98350 19283',
      designation: 'Co-Founder & CTO',
      verified: true,
    },
  },
  {
    username: 'bokaro_msme',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-103',
      name: 'Vikas Agrawal',
      username: 'bokaro_msme',
      email: 'cluster@bokaromsme.org',
      role: 'industry',
      organization: 'Bokaro Precision Metal MSME Cluster',
      department: 'Rapid Prototyping & Tooling Consortium',
      district: 'Bokaro',
      phone: '+91 94315 77190',
      designation: 'MSME Cluster Secretary',
      verified: true,
    },
  },
  {
    username: 'coalindia',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-104',
      name: 'Manoj Tirkey',
      username: 'coalindia',
      email: 'csr@centralcoalfields.in',
      role: 'industry',
      organization: 'Central Coalfields Limited (CCL) / Coal India',
      department: 'Mine Water & Rural Energy Division',
      district: 'Ranchi',
      phone: '+91 94313 88120',
      designation: 'Chief General Manager (CSR)',
      verified: true,
    },
  },
  {
    username: 'coal_india_ccl',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-104',
      name: 'Manoj Tirkey',
      username: 'coal_india_ccl',
      email: 'csr@centralcoalfields.in',
      role: 'industry',
      organization: 'Central Coalfields Limited (CCL) / Coal India',
      department: 'Mine Water & Rural Energy Division',
      district: 'Ranchi',
      phone: '+91 94313 88120',
      designation: 'Chief General Manager (CSR)',
      verified: true,
    },
  },
  {
    username: 'sail_bokaro',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-105',
      name: 'Arun K. Singh',
      username: 'sail_bokaro',
      email: 'csr.bokaro@sail.in',
      role: 'industry',
      organization: 'Steel Authority of India (SAIL) Bokaro Steel Plant',
      department: 'Slag Recycling & Community Engineering',
      district: 'Bokaro',
      phone: '+91 94311 44091',
      designation: 'General Manager (CSR)',
      verified: true,
    },
  },
  {
    username: 'tata_trusts',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-106',
      name: 'Debolina Mukherjee',
      username: 'tata_trusts',
      email: 'jharkhand@tatatrusts.org',
      role: 'industry',
      organization: 'Tata Trusts - Jharkhand Rural Innovation Cell',
      department: 'Tribal Nutrition & Decentralized Energy',
      district: 'Ranchi',
      phone: '+91 651 228045',
      designation: 'Lead, State Programs',
      verified: true,
    },
  },
  {
    username: 'csir_cimfr',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-107',
      name: 'Dr. Alok Kumar',
      username: 'csir_cimfr',
      email: 'director@cimfr.res.in',
      role: 'industry',
      organization: 'CSIR - Central Institute of Mining & Fuel Research',
      department: 'Scientific R&D & Environmental Engineering',
      district: 'Dhanbad',
      phone: '+91 326 2296003',
      designation: 'Director of R&D',
      verified: true,
    },
  },
  {
    username: 'aic_hub',
    passwordHash: 'password123',
    user: {
      id: 'usr-ind-108',
      name: 'Dr. Priyaranjan Sharma',
      username: 'aic_hub',
      email: 'ceo@aicbitmesra.org',
      role: 'industry',
      organization: 'Atal Incubation Centre (AIC) BIT Mesra Foundation',
      department: 'AIM NITI Aayog Innovation Hub',
      district: 'Ranchi',
      phone: '+91 651 2275444',
      designation: 'CEO & Incubation Lead',
      verified: true,
    },
  },
  {
    username: 'collectorate_admin',
    passwordHash: 'password123',
    user: {
      id: 'usr-adm-02',
      name: 'Dr. Alok Ranjan, IAS',
      username: 'collectorate_admin',
      email: 'dc.ranchi@jharkhand.gov.in',
      role: 'admin',
      organization: 'Ranchi District Collectorate & Innovation Mission',
      department: 'District Administrative & Innovation Directorate',
      district: 'Ranchi',
      designation: 'District Collector & Super Admin',
      phone: '+91 651 221400',
      verified: true,
    },
  },
];

function getStoredAccounts(): AuthAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed: AuthAccount[] = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Synchronize default accounts to ensure unique IDs, updated roles and designations
      let changed = false;
      for (const def of DEFAULT_ACCOUNTS) {
        const idx = parsed.findIndex((a) => a.username.toLowerCase() === def.username.toLowerCase());
        if (idx === -1) {
          parsed.push(def);
          changed = true;
        } else if (
          parsed[idx].user.id !== def.user.id ||
          parsed[idx].user.role !== def.user.role ||
          parsed[idx].user.name !== def.user.name
        ) {
          parsed[idx] = { ...def, passwordHash: parsed[idx].passwordHash || def.passwordHash };
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
    return DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function saveAccounts(accounts: AuthAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts to localStorage', err);
  }
}

export const authService = {
  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
      return null;
    } catch {
      return null;
    }
  },

  setStoredUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch (err) {
      console.error('Failed to update current user in localStorage', err);
    }
  },

  /**
   * Login with username or email, and password
   */
  login(identifier: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId) {
      return { success: false, error: 'Please enter your username or email address.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    const accounts = getStoredAccounts();
    const found = accounts.find(
      (acc) =>
        acc.username.toLowerCase() === cleanId ||
        acc.user.email.toLowerCase() === cleanId
    );

    if (!found) {
      // If user typed a valid email or username and password of 6+ chars,
      // allow flexible instant sign-in for citizens or explain how to register
      return {
        success: false,
        error: 'No account found with this username or email. Please register as a new citizen or check your credentials.',
      };
    }

    if (found.passwordHash !== cleanPass) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    this.setStoredUser(found.user);
    return { success: true, user: found.user };
  },

  /**
   * Register a new Citizen account
   */
  registerCitizen(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    district: string;
    organization?: string;
    department?: string;
    role?: UserRole;
  }): { success: boolean; user?: User; error?: string } {
    const name = data.name.trim();
    const username = data.username.trim().toLowerCase().replace(/\s+/g, '');
    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();

    if (!name) return { success: false, error: 'Full Name is required.' };
    if (!username || username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters without spaces.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find(
      (a) => a.username.toLowerCase() === username || a.user.email.toLowerCase() === email
    );

    if (existing) {
      return {
        success: false,
        error: 'An account with this username or email already exists. Please log in instead.',
      };
    }

    const newUser: User = {
      id: `usr-cit-${Date.now()}`,
      name,
      username,
      email,
      role: data.role || 'citizen',
      organization: data.organization?.trim() || 'Citizen / Local Resident',
      department: data.department?.trim() || 'Gram Panchayat / Ward Resident',
      district: data.district || 'Ranchi',
      phone: data.phone?.trim() || '',
      verified: true,
    };

    const newAccount: AuthAccount = {
      username,
      passwordHash: password,
      user: newUser,
    };

    accounts.push(newAccount);
    saveAccounts(accounts);
    this.setStoredUser(newUser);

    return { success: true, user: newUser };
  },

  /**
   * Register a new Gram Panchayat / Mukhiya account
   */
  registerPanchayat(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    district: string;
    block: string;
    panchayat: string;
    designation: string; // Mukhiya | Panchayat Secretary | Up-Mukhiya | Ward Member | PRI Representative
  }): { success: boolean; user?: User; error?: string } {
    const name = data.name.trim();
    const username = data.username.trim().toLowerCase().replace(/\s+/g, '');
    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();

    if (!name) return { success: false, error: 'Representative Name is required.' };
    if (!username || username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters without spaces.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }
    if (!data.panchayat) {
      return { success: false, error: 'Gram Panchayat name is required.' };
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find(
      (a) => a.username.toLowerCase() === username || a.user.email.toLowerCase() === email
    );

    if (existing) {
      return {
        success: false,
        error: 'An account with this username or email already exists. Please log in instead.',
      };
    }

    const newUser: User = {
      id: `usr-pri-${Date.now()}`,
      name: `${name} (${data.designation})`,
      username,
      email,
      role: 'panchayat',
      organization: `${data.panchayat} Gram Panchayat (PRI)`,
      department: 'Panchayati Raj Local Governance',
      district: data.district || 'Ranchi',
      block: data.block || '',
      panchayat: data.panchayat,
      designation: data.designation || 'Gram Panchayat Mukhiya',
      phone: data.phone?.trim() || '',
      verified: true,
    };

    const newAccount: AuthAccount = {
      username,
      passwordHash: password,
      user: newUser,
    };

    accounts.push(newAccount);
    saveAccounts(accounts);
    this.setStoredUser(newUser);

    return { success: true, user: newUser };
  },

  /**
   * Register an official Government Body / Administrative account
   */
  registerGovernment(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    district: string;
    block?: string;
    department: string;
    designation: string;
    organization: string;
  }): { success: boolean; user?: User; error?: string } {
    const name = data.name.trim();
    const username = data.username.trim().toLowerCase().replace(/\s+/g, '');
    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();

    if (!name) return { success: false, error: 'Official Name is required.' };
    if (!username || username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters without spaces.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid official email address.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find(
      (a) => a.username.toLowerCase() === username || a.user.email.toLowerCase() === email
    );

    if (existing) {
      return {
        success: false,
        error: 'An account with this username or official email already exists. Please log in instead.',
      };
    }

    const newUser: User = {
      id: `usr-gov-${Date.now()}`,
      name: `${name}, ${data.designation}`,
      username,
      email,
      role: 'government',
      organization: data.organization || `Government Office, ${data.district}`,
      department: data.department || 'District Administration',
      district: data.district || 'Ranchi',
      block: data.block || '',
      designation: data.designation,
      phone: data.phone?.trim() || '',
      verified: true,
    };

    const newAccount: AuthAccount = {
      username,
      passwordHash: password,
      user: newUser,
    };

    accounts.push(newAccount);
    saveAccounts(accounts);
    this.setStoredUser(newUser);

    return { success: true, user: newUser };
  },

  logout(): void {
    this.setStoredUser(null);
  },

  /**
   * For Government Administrator: Get all registered accounts and login details
   */
  getAllAccounts(): AuthAccount[] {
    return getStoredAccounts();
  },

  /**
   * For Government Administrator: Get all university login accounts
   */
  getUniversityAccounts(): AuthAccount[] {
    return getStoredAccounts().filter((a) => a.user.role === 'university');
  },

  /**
   * For Government Administrator: Get all industrial/company login accounts
   */
  getIndustryAccounts(): AuthAccount[] {
    return getStoredAccounts().filter((a) => a.user.role === 'industry');
  },

  /**
   * For Government Administrator: Add or update an official account
   */
  saveOrUpdateAccount(account: AuthAccount): void {
    const accounts = getStoredAccounts();
    const idx = accounts.findIndex(
      (a) => a.username.toLowerCase() === account.username.toLowerCase() || a.user.id === account.user.id
    );
    if (idx >= 0) {
      accounts[idx] = account;
    } else {
      accounts.push(account);
    }
    saveAccounts(accounts);
  },
};
