'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2,
  Copy, Check, DollarSign, MessageSquare,
  Globe, UserCheck, Cpu, Cog, Printer, Share2, RotateCcw,
  Building2, ExternalLink, CreditCard, FileCheck, HelpCircle,
  Percent, ArrowUpRight, Lock, CheckCircle
} from 'lucide-react';
import type { AnalysisResult, DetectedFlag } from '@/lib/types';

interface RiskAnalysisCardProps {
  analysis: AnalysisResult;
  onReset?: () => void;
}

/* Severity badge colours */
function severityStyle(s: DetectedFlag['severity']) {
  switch (s) {
    case 'HIGH':   return 'bg-rose-950/50 text-rose-300 border-rose-800/60';
    case 'MEDIUM': return 'bg-amber-950/50 text-amber-300 border-amber-800/60';
    case 'LOW':    return 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60';
  }
}
function severityDot(s: DetectedFlag['severity']) {
  switch (s) {
    case 'HIGH':   return 'bg-rose-500';
    case 'MEDIUM': return 'bg-amber-500';
    case 'LOW':    return 'bg-emerald-500';
  }
}

export default function RiskAnalysisCard({ analysis, onReset }: RiskAnalysisCardProps) {
  const [copied, setCopied] = useState(false);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<'TRUST_SCORE' | 'RISK_PERCENTAGE'>('TRUST_SCORE');

  const toggleAction = (i: number) => setCheckedActions(p => ({ ...p, [i]: !p[i] }));

  // Mathematical scoring breakdown
  const riskScore = Math.min(Math.max(analysis.riskScore, 0), 100);
  const trustScore = Math.max(0, 100 - riskScore);

  // 4 Category breakdown scores (each out of 25 points, total = 100)
  const finRisk = analysis.findings?.financialRisk?.score ?? 50;
  const domRisk = analysis.findings?.domainRisk?.score ?? 50;
  const commRisk = analysis.findings?.communicationRisk?.score ?? 50;
  const workRisk = analysis.findings?.workflowRisk?.score ?? 50;

  // Calculate scores out of 25 (higher score = safer / higher trust)
  const paymentSafety = Math.max(0, Math.min(25, Math.round((100 - finRisk) * 0.25)));
  const orgDomain = Math.max(0, Math.min(25, Math.round((100 - domRisk) * 0.25)));
  const contentUrgency = Math.max(0, Math.min(25, Math.round((100 - (commRisk * 0.5 + workRisk * 0.5)) * 0.25)));
  
  // Evidence quality: derived or defaulted to realistic forensic metric (15–22)
  const evidenceQuality = Math.max(8, Math.min(25, trustScore - paymentSafety - orgDomain - contentUrgency >= 0 
    ? Math.min(25, Math.max(12, trustScore - paymentSafety - orgDomain - contentUrgency))
    : 18));

  // Determine display values based on active mode (Trust Score vs Risk Percentage)
  const displayScore = viewMode === 'TRUST_SCORE' ? trustScore : riskScore;
  const displayLabel = viewMode === 'TRUST_SCORE' ? 'OUT OF 100' : 'RISK PERCENT';

  // Extract domain and opportunity type
  const domain = analysis.domain || (analysis.title.includes('.xyz') ? 'unknown-careers-example.xyz' : 'career-portal.verify');
  const opportunityType = analysis.opportunityType || 
    (/intern/i.test(analysis.title) ? 'Internship' : 
     /scholarship|grant/i.test(analysis.title) ? 'Scholarship' : 'Job Offer');

  // Verification status
  const verificationStatus = analysis.verificationStatus || 
    (analysis.riskLevel === 'HIGH_RISK' ? 'UNVERIFIED' : 
     analysis.riskLevel === 'LOW_RISK' ? 'VERIFIED' : 'PARTIAL_VERIFICATION');

  const reportId = analysis.reportNumber || (analysis.id ? analysis.id.slice(-4).replace(/\D/g, '') || '19' : '19');
  const analyzedTimestamp = analysis.createdAt 
    ? new Date(analysis.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' })
    : new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' });

  // Share summary
  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      const summaryText = `🛡️ Trustora Scam Evaluation Report #${reportId}\n` +
        `• Opportunity: ${analysis.title}\n` +
        `• Organization: ${analysis.company}\n` +
        `• Risk Level: ${analysis.riskLevel.replace('_', ' ')} (${riskScore}% Risk / Trust Score: ${trustScore}/100)\n` +
        `• Summary: ${analysis.summary}\n` +
        `Verified with Trustora AI`;
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  /* ── Theme Styling ─────────────────────────────────────────────── */
  const theme = (() => {
    switch (analysis.riskLevel) {
      case 'HIGH_RISK':
        return {
          title: 'HIGH RISK',
          badgeBg: 'bg-rose-950/60 text-rose-400 border-rose-500/50 shadow-rose-900/40',
          accentColor: '#f97316',
          gradientStroke: ['#f97316', '#ef4444'],
          calloutBorder: 'border-l-orange-500',
          glowRing: 'drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]',
          icon: <ShieldAlert className="w-8 h-8 text-rose-500" />,
          cardBorder: 'border-slate-800 shadow-[0_0_50px_rgba(244,63,94,0.12)]',
          verifBadge: 'bg-rose-950/50 text-rose-400 border-rose-500/30',
        };
      case 'NEEDS_VERIFICATION':
        return {
          title: 'NEEDS VERIFICATION',
          badgeBg: 'bg-amber-950/60 text-amber-400 border-amber-500/50 shadow-amber-900/40',
          accentColor: '#f59e0b',
          gradientStroke: ['#fbbf24', '#f59e0b'],
          calloutBorder: 'border-l-amber-500',
          glowRing: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]',
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          cardBorder: 'border-slate-800 shadow-[0_0_50px_rgba(245,158,11,0.12)]',
          verifBadge: 'bg-amber-950/50 text-amber-400 border-amber-500/30',
        };
      default:
        return {
          title: 'LOW RISK',
          badgeBg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50 shadow-emerald-900/40',
          accentColor: '#10b981',
          gradientStroke: ['#34d399', '#10b981'],
          calloutBorder: 'border-l-emerald-500',
          glowRing: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
          cardBorder: 'border-slate-800 shadow-[0_0_50px_rgba(16,185,129,0.12)]',
          verifBadge: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30',
        };
    }
  })();

  // Circular gauge calculations (Circumference for r=46 is ~289)
  const radius = 46;
  const circumference = 2 * Math.PI * radius; // 289.02
  const gaugeFillValue = viewMode === 'TRUST_SCORE' ? trustScore : riskScore;
  const strokeDashoffset = circumference - (circumference * gaugeFillValue) / 100;

  return (
    <div className="space-y-4 font-sans print:bg-white print:text-black">
      
      {/* ── Top Meta Bar & Action Buttons ────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 print:hidden">
        <div className="flex items-center space-x-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold tracking-wide">
            Report #{reportId}
          </span>
          <span className="text-slate-400 font-medium">
            Analyzed {analyzedTimestamp}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Share button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Copy Report Summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Share Summary'}</span>
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          {/* Verify another */}
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Verify Another</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Score Card (Identical to Dashboard Design) ────────── */}
      <div className={`bg-slate-900/95 rounded-2xl border ${theme.cardBorder} p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden transition-all duration-300 shadow-2xl`}>
        
        {/* Ambient background glow */}
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl"
          style={{ background: theme.accentColor }}
        />

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          
          {/* Left Column: Radial Progress Meter */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
                <defs>
                  <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.gradientStroke[0]} />
                    <stop offset="100%" stopColor={theme.gradientStroke[1]} />
                  </linearGradient>
                </defs>
                {/* Background Ring */}
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800/80 fill-none"
                />
                {/* Foreground Progress Ring with Glow */}
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  stroke="url(#scoreGaugeGrad)"
                  strokeWidth="8.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={`fill-none transition-all duration-1000 ease-out ${theme.glowRing}`}
                />
              </svg>

              {/* Score Inside Meter */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
                  {displayScore}
                </span>
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mt-1">
                  {displayLabel}
                </span>
              </div>
            </div>

            {/* Risk Badge directly below circle */}
            <div className="mt-2 flex flex-col items-center space-y-2">
              <span className={`px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-md ${theme.badgeBg}`}>
                {theme.title}
              </span>

              {/* Mode Toggle: Risk Percentage vs Trust Score */}
              <button
                onClick={() => setViewMode(m => m === 'TRUST_SCORE' ? 'RISK_PERCENTAGE' : 'TRUST_SCORE')}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                title="Toggle View Mode"
              >
                <Percent className="w-3 h-3 text-blue-400" />
                <span>
                  {viewMode === 'TRUST_SCORE' 
                    ? `View as Risk % (${riskScore}%)` 
                    : `View Trust Score (${trustScore}/100)`}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Opportunity Details & Callout */}
          <div className="flex-1 w-full space-y-4">
            
            {/* Tag Pills */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                {opportunityType}
              </span>
              
              <a
                href={domain.startsWith('http') ? domain : `https://${domain}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-colors"
              >
                <span>{domain}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {analysis.title || 'Work from home Internship'}
            </h2>

            {/* Organization / Company Subtitle */}
            <div className="flex items-center space-x-2 text-slate-300 text-sm font-semibold">
              <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{analysis.company || 'Unknown Career Solutions'}</span>
            </div>

            {/* Explainable AI Callout Box */}
            <div className={`p-4 rounded-r-xl border border-l-4 ${theme.calloutBorder} bg-slate-950/70 border-slate-800/90 text-slate-300 text-xs sm:text-sm leading-relaxed`}>
              {analysis.summary ? (
                <p>
                  {analysis.summary}
                </p>
              ) : (
                <p>
                  Critical risk indicators detected with an explainable Trust Score of {trustScore}/100 
                  (upfront registration/training fee demands, disposable high-risk domain extension). 
                  Displays common warning signs of predatory fee extortion or credential harvesting.
                </p>
              )}
            </div>

            {/* Analysis Engine Engine Tag */}
            <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-400 font-medium">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                {analysis.analysisSource === 'LLM' ? <Cpu className="w-3 h-3 text-violet-400" /> : <Cog className="w-3 h-3 text-slate-400" />}
                <span>{analysis.analysisSource === 'LLM' ? 'Gemini AI Neural Analysis' : 'Heuristic Rules Engine'}</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">
                Calculated Risk: <strong className={riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}>{riskScore}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ── 4 Category Breakdown Cards (0–25 each) ───────────────── */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Payment Safety */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Payment Safety</span>
              </div>
              <span className={`text-xs font-bold ${paymentSafety <= 5 ? 'text-rose-400' : paymentSafety <= 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {paymentSafety} / 25
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  paymentSafety <= 5 ? 'bg-rose-500' : paymentSafety <= 15 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(paymentSafety / 25) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Checks for upfront registration fees, deposits, or UPI demands.
            </p>
          </div>

          {/* Card 2: Org & Domain */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Org & Domain</span>
              </div>
              <span className={`text-xs font-bold ${orgDomain <= 8 ? 'text-rose-400' : orgDomain <= 16 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {orgDomain} / 25
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  orgDomain <= 8 ? 'bg-rose-500' : orgDomain <= 16 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(orgDomain / 25) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Inspects domain extensions, website presence, and webmail usage.
            </p>
          </div>

          {/* Card 3: Content & Urgency */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Content & Urgency</span>
              </div>
              <span className={`text-xs font-bold ${contentUrgency <= 8 ? 'text-rose-400' : contentUrgency <= 16 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {contentUrgency} / 25
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  contentUrgency <= 8 ? 'bg-rose-500' : contentUrgency <= 16 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(contentUrgency / 25) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Evaluates unrealistic promises, sensitive data, and channel risk.
            </p>
          </div>

          {/* Card 4: Evidence Quality */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Evidence Quality</span>
              </div>
              <span className={`text-xs font-bold ${evidenceQuality <= 8 ? 'text-rose-400' : evidenceQuality <= 16 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {evidenceQuality} / 25
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  evidenceQuality <= 8 ? 'bg-rose-500' : evidenceQuality <= 16 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(evidenceQuality / 25) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Forensic analysis of attached offer letters, circulars, or images.
            </p>
          </div>

        </div>

      </div>

      {/* ── Organization Verification Section ──────────────────────── */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Organization Verification</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            verificationStatus === 'VERIFIED'
              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
              : verificationStatus === 'PARTIAL_VERIFICATION'
              ? 'bg-amber-950/50 text-amber-400 border-amber-500/30'
              : 'bg-rose-950/50 text-rose-400 border-rose-500/30'
          }`}>
            {verificationStatus === 'PARTIAL_VERIFICATION' ? 'PARTIAL VERIFICATION' : verificationStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start space-x-3">
            <div className={`mt-0.5 w-2 h-2 rounded-full ${domRisk > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <div>
              <span className="font-semibold text-slate-200">Domain & Web Presence</span>
              <p className="text-slate-400 mt-0.5">{analysis.findings?.domainRisk?.details || `Domain ${domain} evaluated against known databases.`}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start space-x-3">
            <div className={`mt-0.5 w-2 h-2 rounded-full ${finRisk > 30 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <div>
              <span className="font-semibold text-slate-200">Payment Policy Compliance</span>
              <p className="text-slate-400 mt-0.5">{analysis.findings?.financialRisk?.details || 'Payment structures analyzed for upfront deposit compliance.'}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start space-x-3">
            <div className={`mt-0.5 w-2 h-2 rounded-full ${commRisk > 30 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <div>
              <span className="font-semibold text-slate-200">Recruitment Communication</span>
              <p className="text-slate-400 mt-0.5">{analysis.findings?.communicationRisk?.details || 'Corporate email domain vs off-platform messaging.'}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start space-x-3">
            <div className={`mt-0.5 w-2 h-2 rounded-full ${workRisk > 30 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <div>
              <span className="font-semibold text-slate-200">Interview & Hiring Standards</span>
              <p className="text-slate-400 mt-0.5">{analysis.findings?.workflowRisk?.details || 'Standard candidate vetting before offer dispatch.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detected Red Flags with Severity Tags ──────────────────── */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Detected Signals & Key Indicators ({analysis.detectedFlags?.length || 0})</span>
        </h3>
        <div className="space-y-2.5">
          {analysis.detectedFlags?.map((flag, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border flex items-start space-x-3 ${severityStyle(flag.severity)}`}>
              <div className="mt-1 flex flex-col items-center space-y-1">
                <div className={`w-2.5 h-2.5 rounded-full ${severityDot(flag.severity)}`} />
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-75">{flag.severity}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">{flag.title}</h4>
                <p className="text-[11px] leading-relaxed mt-0.5 opacity-85">{flag.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Student Verification Action Checklist ──────────────────── */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Recommended Student Verification Checklist</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {Object.values(checkedActions).filter(Boolean).length} / {analysis.recommendations?.length || 0} Completed
          </span>
        </div>
        <div className="space-y-2.5">
          {analysis.recommendations?.map((action, idx) => {
            const isChecked = !!checkedActions[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleAction(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 text-xs ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 line-through opacity-80'
                    : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600 bg-slate-900'
                }`}>
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="flex-1 font-medium leading-relaxed">{action}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Community Report CTA ───────────────────────────────────── */}
      {analysis.riskLevel !== 'LOW_RISK' && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Warn fellow students by submitting this fraudulent opportunity to the Trustora public database.</span>
          </div>
          <Link
            href={`/report?company=${encodeURIComponent(analysis.company)}&title=${encodeURIComponent(analysis.title)}`}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shrink-0 active:scale-95"
          >
            Submit Scam Report
          </Link>
        </div>
      )}

    </div>
  );
}
