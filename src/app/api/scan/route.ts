import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeWithLLM } from '@/lib/llmAnalyzer';
import { analyzeOpportunityHeuristic } from '@/lib/scannerEngine';
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

    // Try LLM first, fall back to heuristic pattern detection
    let analysis: AnalysisResult;
    const llmResult = await analyzeWithLLM(rawInput, type);
    if (llmResult) {
      analysis = llmResult;
    } else {
      analysis = analyzeOpportunityHeuristic(rawInput, type);
    }

    const flagsForDb = analysis.detectedFlags.map(f => {
      const emoji = f.severity === 'HIGH' ? '🚩' : f.severity === 'MEDIUM' ? '⚠️' : '🟢';
      return `${emoji} ${f.title}`;
    });

    // Save scan result to Prisma database
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
        domainInfo: JSON.stringify({ source: analysis.analysisSource }),
      },
    });

    return NextResponse.json({
      success: true,
      scanId: savedScan.id,
      analysis: {
        ...analysis,
        id: savedScan.id,
        createdAt: savedScan.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Scan API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during evaluation.', details: error?.message },
      { status: 500 }
    );
  }
}
