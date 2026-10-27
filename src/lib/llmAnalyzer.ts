import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { AnalysisResult, DetectedFlag } from './types';

// ─── System prompt for the LLM ──────────────────────────────────────
const SYSTEM_PROMPT = `You are Trustora, an expert AI security analyst specialised in detecting fraudulent job offers, fake internships, scholarship scams, and phishing recruitment schemes that target university students.

You will receive the raw content of an opportunity (a URL, pasted email/DM text, or OCR-extracted screenshot text). Analyse it thoroughly against these categories:

## 1. FINANCIAL RISK
- Upfront payment requests: application fees, security deposits, equipment costs, training fees, background-check fees.
- Requests for untraceable payment methods: Zelle, CashApp, Venmo, cryptocurrency, wire transfer.
- Fake-check / refund schemes: mailing a check and asking the recipient to wire part of it back.
- Unrealistically high compensation for entry-level or no-experience roles.

## 2. COMMUNICATION RISK
- Contact email uses a generic consumer domain (@gmail.com, @yahoo.com, @hotmail.com, @outlook.com) instead of a verified corporate domain.
- Off-platform communication redirects: Telegram handles, WhatsApp numbers, personal phone numbers.
- No official company email address or career portal mentioned.

## 3. DOMAIN / ORGANISATION RISK
- Suspicious or high-risk TLDs (.xyz, .top, .tk, .click, .site, .work, .live, .online, .club).
- Typosquatting or impersonation of well-known brands (e.g. "micros0ft.com", "g00gle-careers.com").
- Unverifiable company name, no web presence, or recently created domain.

## 4. HIRING WORKFLOW RISK
- Immediate job offer without any interview or screening.
- Pressure/urgency tactics: "reply within 24 hours", "limited positions", "act now".
- Requesting sensitive PII (SSN, passport photo, bank routing number, driver-licence copy) before a signed employment contract.
- Vague or overly generic job descriptions.

## OUTPUT FORMAT
Return **only** valid JSON (no markdown fences, no explanatory text) matching this exact schema:

{
  "riskScore": <integer 0–100>,
  "riskLevel": "Low Risk" | "Needs Verification" | "High Risk",
  "companyName": "<extracted company name or 'Unknown'>",
  "opportunityTitle": "<extracted title or short description>",
  "detectedFlags": [
    {
      "title": "<short flag title>",
      "description": "<1–2 sentence explanation>",
      "severity": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "findings": {
    "financialRisk":      { "score": <0–100>, "summary": "<1 sentence>", "details": "<1–2 sentences>" },
    "communicationRisk":  { "score": <0–100>, "summary": "<1 sentence>", "details": "<1–2 sentences>" },
    "domainRisk":         { "score": <0–100>, "summary": "<1 sentence>", "details": "<1–2 sentences>" },
    "workflowRisk":       { "score": <0–100>, "summary": "<1 sentence>", "details": "<1–2 sentences>" }
  },
  "recommendations": ["<actionable recommendation for the student>"],
  "summary": "<2–3 sentence overall assessment>"
}

Rules:
- riskScore 0–30 → "Low Risk", 31–64 → "Needs Verification", 65–100 → "High Risk".
- Include at least 2 detectedFlags.  Include at least 2 recommendations.
- Be specific—quote exact dollar amounts, email addresses, Telegram handles, domain names found in the input.
- If the content appears to be a legitimate opportunity from a well-known company, still mention any minor concerns and give a low score.`;

// ─── LLM call ────────────────────────────────────────────────────────
export async function analyzeWithLLM(
  input: string,
  sourceType: 'URL' | 'SCREENSHOT' | 'TEXT'
): Promise<AnalysisResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Trustora] GEMINI_API_KEY not set – falling back to heuristic engine.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    });

    const userMessage = `Source type: ${sourceType}\n\nContent to analyse:\n\`\`\`\n${input}\n\`\`\``;

    const result = await model.generateContent([
      { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + userMessage }] },
    ] as any);

    const text = result.response.text();

    // Parse – strip possible markdown fences just in case
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Normalise risk level to internal enum
    let riskLevel: AnalysisResult['riskLevel'] = 'NEEDS_VERIFICATION';
    const rl = (parsed.riskLevel || '').toLowerCase();
    if (rl.includes('low'))  riskLevel = 'LOW_RISK';
    else if (rl.includes('high')) riskLevel = 'HIGH_RISK';
    else riskLevel = 'NEEDS_VERIFICATION';

    // Map detectedFlags
    const detectedFlags: DetectedFlag[] = (parsed.detectedFlags || []).map((f: any) => ({
      title: String(f.title || 'Unknown Flag'),
      description: String(f.description || ''),
      severity: (['HIGH', 'MEDIUM', 'LOW'].includes(f.severity) ? f.severity : 'MEDIUM') as DetectedFlag['severity'],
    }));

    const safeCategory = (cat: any) => ({
      score: Math.min(100, Math.max(0, Number(cat?.score) || 0)),
      summary: String(cat?.summary || 'No data'),
      details: String(cat?.details || ''),
    });

    return {
      title: parsed.opportunityTitle || 'Opportunity Analysis',
      company: parsed.companyName || 'Unknown Organization',
      riskScore: Math.min(100, Math.max(0, Number(parsed.riskScore) || 50)),
      riskLevel,
      detectedFlags,
      findings: {
        financialRisk: safeCategory(parsed.findings?.financialRisk),
        communicationRisk: safeCategory(parsed.findings?.communicationRisk),
        domainRisk: safeCategory(parsed.findings?.domainRisk),
        workflowRisk: safeCategory(parsed.findings?.workflowRisk),
      },
      recommendations: (parsed.recommendations || []).map(String),
      summary: String(parsed.summary || ''),
      analysisSource: 'LLM',
    };
  } catch (err: any) {
    console.error('[Trustora] LLM analysis failed:', err?.message || err);
    return null; // caller will fall back to heuristic
  }
}
