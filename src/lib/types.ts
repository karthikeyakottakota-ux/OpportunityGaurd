/**
 * Shared types for Trustora Analysis Pipeline.
 * Used by both the heuristic engine, LLM analyzer, API routes, and frontend components.
 */

export interface DetectedFlag {
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CategoryFinding {
  score: number;
  summary: string;
  details: string;
}

export interface AnalysisResult {
  /** Extracted or inferred opportunity title */
  title: string;
  /** Extracted or inferred company / organization name */
  company: string;
  /** Overall risk score 0–100 */
  riskScore: number;
  /** Risk classification */
  riskLevel: 'LOW_RISK' | 'NEEDS_VERIFICATION' | 'HIGH_RISK';
  /** Structured flags with severity tags */
  detectedFlags: DetectedFlag[];
  /** Categorized sub-scores */
  findings: {
    financialRisk: CategoryFinding;
    communicationRisk: CategoryFinding;
    domainRisk: CategoryFinding;
    workflowRisk: CategoryFinding;
  };
  /** Student-facing recommended actions */
  recommendations: string[];
  /** Overall natural-language summary from the AI */
  summary: string;
  /** Whether the result was produced by the LLM or the heuristic fallback */
  analysisSource: 'LLM' | 'HEURISTIC';
  /** Scan ID after DB persistence (set by the API route) */
  id?: string;
  createdAt?: string;
  domain?: string;
  opportunityType?: string;
  reportNumber?: number | string;
  verificationStatus?: 'VERIFIED' | 'PARTIAL_VERIFICATION' | 'UNVERIFIED';
}
