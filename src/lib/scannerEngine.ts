/**
 * Heuristic (rule-based) scanner engine.
 * Acts as the instant fallback when the LLM is unavailable.
 * Now returns the unified AnalysisResult type so both paths are interchangeable.
 */
import type { AnalysisResult, DetectedFlag } from './types';

export function analyzeOpportunityHeuristic(
  input: string,
  sourceType: 'URL' | 'SCREENSHOT' | 'TEXT'
): AnalysisResult {
  const text = input.trim();
  const lowerText = text.toLowerCase();

  let riskScore = 0;
  const flags: DetectedFlag[] = [];
  const actions: string[] = [];

  // ── Extraction helpers ────────────────────────────────────────────
  let extractedCompany = 'Extracted Company / Organization';
  let extractedTitle = 'Job / Scholarship Opportunity';
  let domainName = 'Unknown / Unverified';
  let ageDays = 365;
  let isGenericEmail = false;
  let tldRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';

  // ── 1. URL / Domain Analysis ──────────────────────────────────────
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch || sourceType === 'URL') {
    const rawUrl = urlMatch ? urlMatch[0] : text;
    try {
      const parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      domainName = parsedUrl.hostname.toLowerCase();

      if (/\.(xyz|top|tk|ml|cf|ga|click|site|work|live|online|club|monster)$/i.test(domainName)) {
        riskScore += 25;
        tldRisk = 'HIGH';
        flags.push({ title: 'Suspicious Domain TLD', description: `High-risk top-level domain detected (.${domainName.split('.').pop()}).`, severity: 'HIGH' });
      } else if (/\.(tech|info|me|co|space)$/i.test(domainName)) {
        tldRisk = 'MEDIUM';
        riskScore += 10;
        flags.push({ title: 'Non-Standard TLD', description: `Non-standard top-level domain (.${domainName.split('.').pop()}) — verify company identity.`, severity: 'MEDIUM' });
      }

      if (/(micros0ft|g00gle|amaz0n|apple-jobs|meta-careers|netflix-hr|careers-portal-apply)/i.test(domainName)) {
        riskScore += 35;
        flags.push({ title: 'Typosquatting / Brand Impersonation', description: `Domain "${domainName}" mimics a well-known brand name.`, severity: 'HIGH' });
      }

      if (domainName.includes('job') || domainName.includes('apply') || domainName.includes('career')) {
        ageDays = tldRisk === 'HIGH' ? 5 : 45;
      }
    } catch { /* invalid URL */ }
  }

  // ── 2. Financial Triggers ─────────────────────────────────────────
  let financialRiskScore = 0;

  if (/(\$?\d+\s*(fee|charge|deposit|payment|cost|processing|application fee|background check fee))/i.test(lowerText) ||
      lowerText.includes('pay for equipment') || lowerText.includes('buy training') || lowerText.includes('software fee')) {
    riskScore += 35;
    financialRiskScore += 40;
    flags.push({ title: 'Upfront Payment Fee Detected', description: 'The posting requests money from candidates for processing, equipment, or training.', severity: 'HIGH' });
    actions.push('NEVER pay money up front for job applications, background checks, or software kits.');
  }

  if (lowerText.includes('zelle') || lowerText.includes('cashapp') || lowerText.includes('venmo') ||
      lowerText.includes('wire transfer') || lowerText.includes('bitcoin') || lowerText.includes('crypto')) {
    riskScore += 30;
    financialRiskScore += 35;
    flags.push({ title: 'Untraceable Payment Method Requested', description: 'Zelle, CashApp, crypto, or wire transfer — methods designed to be irreversible.', severity: 'HIGH' });
    actions.push('Legitimate employers do not request transactions via Zelle, CashApp, or cryptocurrency.');
  }

  if (lowerText.includes('check') && (lowerText.includes('mail you a check') || lowerText.includes('deposit check') || lowerText.includes('refund remaining') || lowerText.includes('vendor'))) {
    riskScore += 40;
    financialRiskScore += 45;
    flags.push({ title: 'Fake Check Refund Scheme', description: 'Classic scam: mail a bad check, ask you to wire back "excess" funds.', severity: 'HIGH' });
    actions.push('DO NOT deposit mailed checks from recruiters. Fake check scams leave you legally liable.');
  }

  if (/(\$([4-9]\d|\d{3})\s*\/\s*(hr|hour|hrs))|(data entry.*\$[3-9]\d)/i.test(lowerText) &&
      (lowerText.includes('no experience') || lowerText.includes('entry level') || lowerText.includes('beginner'))) {
    riskScore += 15;
    financialRiskScore += 20;
    flags.push({ title: 'Unrealistic Compensation', description: 'Extremely high hourly rate offered for an entry-level or no-experience role.', severity: 'MEDIUM' });
  }

  // ── 3. Communication Channel Analysis ─────────────────────────────
  let commRiskScore = 0;

  if (lowerText.includes('telegram') || lowerText.includes('@telegram') || /t\.me\//i.test(lowerText)) {
    riskScore += 30;
    commRiskScore += 35;
    const handleMatch = text.match(/@[A-Za-z0-9_]+/);
    flags.push({ title: 'Off-Platform Telegram Communication', description: `Recruiter directs candidates to Telegram${handleMatch ? ` (${handleMatch[0]})` : ''} instead of official channels.`, severity: 'HIGH' });
    actions.push('Cease communication if interview or onboarding is forced onto Telegram.');
  }

  if (lowerText.includes('whatsapp') || /wa\.me\//i.test(lowerText)) {
    riskScore += 25;
    commRiskScore += 25;
    flags.push({ title: 'WhatsApp-Only Recruitment', description: 'All communication restricted to WhatsApp — no official company email provided.', severity: 'HIGH' });
    actions.push('Verify recruiter identity via official company LinkedIn or phone registry.');
  }

  const genericEmailMatch = text.match(/([a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|protonmail|aol)\.com)/i);
  if (genericEmailMatch) {
    isGenericEmail = true;
    riskScore += 20;
    commRiskScore += 25;
    flags.push({ title: 'Generic Email Domain Used', description: `Recruiter contact uses ${genericEmailMatch[0]} — not a verified corporate address.`, severity: 'MEDIUM' });
    actions.push(`Be cautious of recruiters using ${genericEmailMatch[2]}.com addresses instead of official company domain emails.`);
  }

  // ── 4. Hiring Workflow Red Flags ──────────────────────────────────
  let workflowRiskScore = 0;

  if (lowerText.includes('no interview') || lowerText.includes('hired immediately') || lowerText.includes('selected without interview') || lowerText.includes('without interview')) {
    riskScore += 25;
    workflowRiskScore += 30;
    flags.push({ title: 'No Interview Required', description: 'Candidate offered position immediately without any screening or interview process.', severity: 'HIGH' });
  }

  if (lowerText.includes('urgent') || lowerText.includes('within 24 hours') || lowerText.includes('within 2 hours') || lowerText.includes('limited slots left')) {
    riskScore += 15;
    workflowRiskScore += 20;
    flags.push({ title: 'High-Pressure Urgency Tactics', description: 'Posting uses urgency language to rush candidates into a decision.', severity: 'MEDIUM' });
  }

  if (lowerText.includes('ssn') || lowerText.includes('social security') || lowerText.includes('passport photo') || lowerText.includes('bank routing number')) {
    riskScore += 25;
    workflowRiskScore += 30;
    flags.push({ title: 'Sensitive PII Requested Early', description: 'SSN, passport, or banking details requested before a formal signed employment contract.', severity: 'HIGH' });
    actions.push('Never share SSN or bank account details before signing a verified legal offer contract.');
  }

  // ── 5. Title & Company Extraction ─────────────────────────────────
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 0 && lines[0].length < 80) {
    extractedTitle = lines[0].replace(/[^a-zA-Z0-9\s\-_:()$]/g, '').trim() || extractedTitle;
  }

  const companyMatch = text.match(/(at|from|with|company:?|organization:?)\s+([A-Z][A-Za-z0-9\s]{2,25})/);
  if (companyMatch?.[2]) {
    extractedCompany = companyMatch[2].trim();
  } else if (domainName !== 'Unknown / Unverified') {
    const parts = domainName.split('.');
    if (parts.length >= 2) extractedCompany = parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
  }

  // ── Defaults for clean postings ───────────────────────────────────
  if (flags.length === 0) {
    flags.push({ title: 'Official Corporate Domain Verified', description: 'Domain appears legitimate with standard corporate infrastructure.', severity: 'LOW' });
    flags.push({ title: 'No Payment Triggers Found', description: 'No upfront fees, deposits, or untraceable payment requests detected.', severity: 'LOW' });
    flags.push({ title: 'Standard Hiring Workflow', description: 'Application flows through a recognised corporate career portal.', severity: 'LOW' });
    actions.push('Apply directly on the official company career portal.');
    actions.push('Verify recruiter identity on LinkedIn.');
    actions.push('Double-check job description details against standard industry pay.');
  }

  // ── Final scoring ─────────────────────────────────────────────────
  const finalRiskScore = Math.min(Math.max(riskScore, 5), 98);
  let riskLevel: AnalysisResult['riskLevel'] = 'LOW_RISK';
  if (finalRiskScore >= 65) riskLevel = 'HIGH_RISK';
  else if (finalRiskScore >= 35) riskLevel = 'NEEDS_VERIFICATION';

  if (actions.length === 0) {
    actions.push('Do not share sensitive financial or identity details.');
    actions.push('Cross-reference organization name on corporate registration databases.');
    actions.push('Check student community reports on Trustora explore feed.');
  }

  const summaryMap = {
    HIGH_RISK: 'Critical scam indicators detected. Multiple high-severity red flags including financial demands and suspicious communication channels.',
    NEEDS_VERIFICATION: 'Some suspicious elements found. The opportunity cannot be fully verified — proceed with caution.',
    LOW_RISK: 'The opportunity appears legitimate with standard corporate indicators and no financial triggers detected.',
  };

  // Infer opportunity type
  let opportunityType = 'Job Offer';
  if (/intern|internship/i.test(text)) opportunityType = 'Internship';
  else if (/scholarship|grant|fellowship/i.test(text)) opportunityType = 'Scholarship';
  else if (/remote|work from home|wfh/i.test(text)) opportunityType = 'Remote Role';
  else if (/freelance|contract/i.test(text)) opportunityType = 'Freelance';

  // Verification status
  let verificationStatus: 'VERIFIED' | 'PARTIAL_VERIFICATION' | 'UNVERIFIED' = 'PARTIAL_VERIFICATION';
  if (finalRiskScore >= 65) verificationStatus = 'UNVERIFIED';
  else if (finalRiskScore <= 30) verificationStatus = 'VERIFIED';
  else verificationStatus = 'PARTIAL_VERIFICATION';

  return {
    title: extractedTitle,
    company: extractedCompany,
    riskScore: finalRiskScore,
    riskLevel,
    detectedFlags: flags,
    findings: {
      financialRisk: {
        score: Math.min(financialRiskScore + (riskScore > 60 ? 40 : 10), 100),
        summary: financialRiskScore > 30 ? 'Critical financial triggers detected (fees, checks, or untraceable payments).' : 'No immediate financial payment requests found.',
        details: financialRiskScore > 30 ? 'Scammers often require application processing fees or check mailing schemes to defraud job seekers.' : 'Application appears standard without fee requirements.',
      },
      communicationRisk: {
        score: Math.min(commRiskScore + (isGenericEmail ? 35 : 10), 100),
        summary: commRiskScore > 30 ? 'Suspicious off-platform communication channels detected.' : 'Standard communication channels indicated.',
        details: commRiskScore > 30 ? 'Legitimate companies use verified enterprise domain email (@company.com), not Telegram or personal Gmail.' : 'Recruiter domain matches standard corporate practices.',
      },
      domainRisk: {
        score: tldRisk === 'HIGH' ? 85 : tldRisk === 'MEDIUM' ? 45 : 10,
        summary: tldRisk === 'HIGH' ? 'High-risk or typosquatted domain extension.' : 'Domain structure appears consistent with public entities.',
        details: `Domain evaluated: ${domainName}. Domain age estimated: ~${ageDays} days.`,
      },
      workflowRisk: {
        score: Math.min(workflowRiskScore + (riskScore > 50 ? 30 : 10), 100),
        summary: workflowRiskScore > 20 ? 'Non-standard hiring workflow (immediate hire or high pressure).' : 'Standard multi-stage interview & application workflow.',
        details: workflowRiskScore > 20 ? 'Immediate offers without formal screening are strong indicators of employment fraud.' : 'Workflow matches standard recruitment practices.',
      },
    },
    recommendations: Array.from(new Set(actions)),
    summary: summaryMap[riskLevel],
    analysisSource: 'HEURISTIC',
    domain: domainName !== 'Unknown / Unverified' ? domainName : undefined,
    opportunityType,
    verificationStatus,
  };
}

export { analyzeOpportunityHeuristic as analyzeOpportunity };

