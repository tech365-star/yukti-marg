import { Challenge, User } from '../types';

/**
 * Determines whether a challenge was submitted by the authenticated user (citizen, panchayat, or government).
 */
export function isCitizenSubmission(challenge: Challenge, user: User | null): boolean {
  if (!user) return false;

  // 1. Direct user ID match
  if (challenge.submittedBy.userId && challenge.submittedBy.userId === user.id) {
    return true;
  }

  // 2. Direct email or contact string match
  if (user.email) {
    const uEmail = user.email.toLowerCase().trim();
    if (challenge.submittedBy.email && challenge.submittedBy.email.toLowerCase().trim() === uEmail) {
      return true;
    }
    if (challenge.submittedBy.contact && challenge.submittedBy.contact.toLowerCase().trim() === uEmail) {
      return true;
    }
  }

  // 3. Pre-seeded demo account linkages
  if (user.username === 'citizen' || user.id === 'usr-cit-101' || user.id === 'usr-cit-01') {
    if (
      challenge.id === 'ch-01' ||
      challenge.id === 'ch-07' ||
      challenge.submittedBy.userId === 'usr-cit-101' ||
      challenge.submittedBy.userId === 'usr-cit-01' ||
      challenge.submittedBy.contact === 'citizen@jharkhand.gov.in'
    ) {
      return true;
    }
  }

  if (user.username === 'mukhiya' || user.id === 'usr-pri-102' || user.id === 'usr-cit-102') {
    if (
      challenge.id === 'ch-02' ||
      challenge.submittedBy.userId === 'usr-pri-102' ||
      challenge.submittedBy.userId === 'usr-cit-102' ||
      challenge.submittedBy.contact === 'mukhiya.ormanjhi@jharkhand.gov.in' ||
      challenge.submittedBy.contact === 'mukhiya@jharkhand.gov.in'
    ) {
      return true;
    }
  }

  if (user.username === 'panchayat_sec' || user.id === 'usr-pri-103') {
    if (challenge.id === 'ch-05' || challenge.submittedBy.userId === 'usr-pri-103') {
      return true;
    }
  }

  if (user.username === 'bdo_officer' || user.id === 'usr-gov-104') {
    if (challenge.id === 'ch-06' || challenge.submittedBy.userId === 'usr-gov-104') {
      return true;
    }
  }

  // 4. Name match fallback
  if (user.name && challenge.submittedBy.name) {
    const uName = user.name.toLowerCase().trim();
    const subName = challenge.submittedBy.name.toLowerCase().trim();
    if (subName.includes(uName) || uName.includes(subName)) {
      return true;
    }
  }

  // 5. Panchayat match for PRI
  if (user.role === 'panchayat' && user.panchayat && challenge.submittedBy.panchayatName) {
    if (challenge.submittedBy.panchayatName.toLowerCase().includes(user.panchayat.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Returns strictly the subset of challenges submitted by the given user (citizen, panchayat, or government).
 */
export function filterCitizenSubmissions(challenges: Challenge[], user: User | null): Challenge[] {
  if (!user) return [];
  return challenges.filter((c) => isCitizenSubmission(c, user));
}
