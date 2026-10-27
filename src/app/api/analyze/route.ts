import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeWithLLM } from '@/lib/llmAnalyzer';
import { analyzeOpportunityHeuristic } from '@/lib/scannerEngine';
import { saveScanToFirestore } from '@/lib/firebase';
import type { AnalysisResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceType, rawInput } = body;

    if (!rawInput || typeof rawInput !== 'string' || rawInput.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid input. Please provide a URL, screenshot text, or opportunity details.' },
        { status: 400 }
      );
    }

    const type = (['URL', 'SCREENSHOT', 'TEXT'].includes(sourceType) ? sourceType : 'TEXT') as 'URL' | 'SCREENSHOT' | 'TEXT';

    // ── Try LLM first, fall back to heuristic ──────────────────────
    let analysis: AnalysisResult;

    const llmResult = await analyzeWithLLM(rawInput, type);
    if (llmResult) {
      analysis = llmResult;
    } else {
      analysis = analyzeOpportunityHeuristic(rawInput, type);
    }

    // ── 1. Save to Firebase Firestore Database ─────────────────────
    let firebaseDocId: string | null = null;
    try {
      firebaseDocId = await saveScanToFirestore({
        title: analysis.title,
        company: analysis.company,
        sourceType: type,
        rawInput,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        detectedFlags: analysis.detectedFlags,
        recommendations: analysis.recommendations,
        findings: analysis.findings,
        analysisSource: analysis.analysisSource,
      });
    } catch (fbErr) {
      console.warn('[Firebase] Warning saving to Firestore:', fbErr);
    }

    // ── 2. Persist to Local Prisma DB as redundant backup ───────────
    const flagsForDb = analysis.detectedFlags.map(f => {
      const emoji = f.severity === 'HIGH' ? '🚩' : f.severity === 'MEDIUM' ? '⚠️' : '🟢';
      return `${emoji} ${f.title}`;
    });

    let savedScanId = firebaseDocId || `scan-${Date.now()}`;
    let createdAt = new Date().toISOString();

    try {
      const savedScan = await prisma.opportunityScan.create({
        data: {
          title: analysis.title,
          company: analysis.company,
          sourceType: type,
          rawInput,
          riskScore: analysis.riskScore,
          riskLevel: analysis.riskLevel,
          flags: JSON.stringify(flagsForDb),
          findings: JSON.stringify(analysis.findings),
          recommendedActions: JSON.stringify(analysis.recommendations),
          domainInfo: JSON.stringify({ source: analysis.analysisSource, firebaseId: firebaseDocId }),
        },
      });
      savedScanId = firebaseDocId || savedScan.id;
      createdAt = savedScan.createdAt.toISOString();
    } catch (prismaErr) {
      console.warn('[Prisma] Scan saved with fallback ID:', prismaErr);
    }

    const displayRiskLevel: 'High Risk' | 'Needs Verification' | 'Low Risk' = 
      analysis.riskLevel === 'HIGH_RISK' ? 'High Risk' :
      analysis.riskLevel === 'LOW_RISK' ? 'Low Risk' : 'Needs Verification';

    return NextResponse.json({
      success: true,
      riskScore: analysis.riskScore,
      riskLevel: displayRiskLevel,
      detectedFlags: analysis.detectedFlags,
      recommendations: analysis.recommendations,
      scanId: savedScanId,
      firebaseId: firebaseDocId,
      analysis: {
        ...analysis,
        displayRiskLevel,
        id: savedScanId,
        createdAt,
      },
    });

  } catch (error: any) {
    console.error('[/api/analyze] Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during evaluation.', details: error?.message },
      { status: 500 }
    );
  }
}
