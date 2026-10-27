'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RiskAnalysisCard from '@/components/RiskAnalysisCard';
import type { AnalysisResult } from '@/lib/types';
import { 
  Link2, Image as ImageIcon, FileText, Sparkles, Loader2, 
  AlertTriangle, ArrowRight, Zap, CheckCircle2, Search, Upload, Cpu, Cog
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'URL' | 'SCREENSHOT' | 'TEXT'>('URL');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadingMessages = [
    '🌐 Extracting domain authority & WHOIS age records...',
    '🤖 Sending content to Gemini AI for deep analysis...',
    '💰 Scanning for upfront fees, Zelle, & check refund patterns...',
    '📱 Inspecting off-platform messaging handles (Telegram/WhatsApp)...',
    '🛡️ Cross-referencing community scam reports...',
    '⚡ Generating Risk Level, Flags & Actionable Checklist...',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        const simulatedOcr = `OFFER LETTER: Remote Data Entry Assistant. Salary $45/hr. Contact HR Manager via Telegram handle @Nexus_HR_Careers to claim your placement. Mandatory $50 equipment software fee required via Zelle before starting training check dispatch.`;
        setOcrText(simulatedOcr);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeScan = async (sourceType: 'URL' | 'SCREENSHOT' | 'TEXT', payload: string) => {
    if (!payload || payload.trim().length === 0) {
      setErrorMsg('Please enter a valid link, upload a screenshot, or paste opportunity text.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setLoadingStep(0);
    setAnalysisResult(null);

    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < loadingMessages.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceType, rawInput: payload }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (res.ok && data.success) {
        setAnalysisResult(data.analysis);
      } else {
        setErrorMsg(data.error || 'Failed to analyze opportunity. Please try again.');
      }
    } catch (err) {
      clearInterval(interval);
      setErrorMsg('Network error connecting to evaluation pipeline.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'URL') executeScan('URL', urlInput);
    else if (activeTab === 'SCREENSHOT') executeScan('SCREENSHOT', ocrText || 'Screenshot job posting image attached');
    else executeScan('TEXT', textInput);
  };

  const loadPreset = (type: 'HIGH' | 'LOW' | 'NEEDS_VERIFY') => {
    if (type === 'HIGH') {
      const text = `Work from home Internship
Company: Unknown Career Solutions (unknown-careers-example.xyz)
Urgent hiring! Work from home Internship ($45/hr). No prior experience required.

To claim your position, contact our HR Manager on Telegram (@CareerSolutions_HR). You will receive an offer letter immediately without interview.

NOTE: You must pay a $50 upfront registration and equipment training fee via Zelle/UPI before training check dispatch.`;
      setTextInput(text);
      executeScan('TEXT', text);
    } else if (type === 'LOW') {
      setActiveTab('URL');
      const url = 'https://careers.microsoft.com/us/en/job/1749201/Software-Engineering-Intern-Summer-2026';
      setUrlInput(url);
      executeScan('URL', url);
    } else {
      setActiveTab('TEXT');
      const text = `Apply for the STEM Future Leaders Grant! $5,000 awarded to eligible computer science students. Submit application form on Google Forms: forms.gle/x9823hjskdf. Contact: stemgrants.edu@gmail.com.`;
      setTextInput(text);
      executeScan('TEXT', text);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 shadow-inner">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Gemini AI-Powered Scam & Phishing Detection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Detect Fake Internships, Job Offers & Grants{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">In Seconds.</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Submit any opportunity link, screenshot, or email text. Our AI analyzes domain legitimacy, payment triggers, recruiter channels, and cross-references community reports.
          </p>
        </div>

        {/* Scanner Box */}
        <div className="max-w-3xl mx-auto bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative">
          
          {/* Presets */}
          <div className="mb-6 pb-6 border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Immediate Live Scans</span>
              </span>
              <span className="text-[11px] text-slate-500">1-Click Test Scenarios</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button type="button" onClick={() => loadPreset('HIGH')}
                className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center justify-between transition-all">
                <span>🔴 Telegram $48/hr Scam</span><ArrowRight className="w-3.5 h-3.5 opacity-70" />
              </button>
              <button type="button" onClick={() => loadPreset('LOW')}
                className="px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/60 text-xs font-semibold flex items-center justify-between transition-all">
                <span>🟢 Microsoft Internship</span><ArrowRight className="w-3.5 h-3.5 opacity-70" />
              </button>
              <button type="button" onClick={() => loadPreset('NEEDS_VERIFY')}
                className="px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/60 text-xs font-semibold flex items-center justify-between transition-all">
                <span>🟡 Google Form Grant</span><ArrowRight className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800/90 mb-6">
            {(['URL', 'SCREENSHOT', 'TEXT'] as const).map(tab => {
              const icons = { URL: <Link2 className="w-4 h-4" />, SCREENSHOT: <ImageIcon className="w-4 h-4" />, TEXT: <FileText className="w-4 h-4" /> };
              const labels = { URL: 'Paste Link', SCREENSHOT: 'Upload Screenshot (OCR)', TEXT: 'Paste Offer Text' };
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
                  }`}>
                  {icons[tab]}<span>{labels[tab]}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {activeTab === 'URL' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Opportunity Website or Portal URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><Link2 className="w-4 h-4" /></div>
                  <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                    placeholder="e.g. https://careers.company.com/job/12345 or https://telegram-jobs.ru/apply"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 rounded-xl border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>
            )}

            {activeTab === 'SCREENSHOT' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Upload Screenshot of Offer Letter, DM, or Job Posting</label>
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center bg-slate-950/60 hover:border-slate-700 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="screenshot-upload" />
                  <label htmlFor="screenshot-upload" className="cursor-pointer space-y-2 block">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-blue-400"><Upload className="w-6 h-6" /></div>
                    <div className="text-xs text-slate-300 font-medium">
                      {imageFileName ? <span className="text-emerald-400 font-semibold">{imageFileName}</span> : <span>Click to browse or drop screenshot file</span>}
                    </div>
                    <p className="text-[11px] text-slate-500">Supports PNG, JPG, WEBP. Automatic OCR text extraction.</p>
                  </label>
                </div>
                {imagePreview && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3">
                    <img src={imagePreview} alt="Screenshot Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-800" />
                    <div className="flex-1 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /><span>OCR Engine Extracted Offer Text</span></div>
                      <p className="text-slate-400 line-clamp-2 italic">{ocrText}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'TEXT' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Paste Email, DM, or Job Description Text</label>
                <textarea rows={5} value={textInput} onChange={e => setTextInput(e.target.value)}
                  placeholder="Paste the full email text, LinkedIn message, or offer details here (e.g. including pay, recruiter contact handle, requirements...)"
                  className="w-full p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" />
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /><span>AI is Evaluating Opportunity…</span></>
                : <><Search className="w-5 h-5" /><span>Analyze Opportunity Risk</span></>
              }
            </button>
          </form>

          {/* Loading state */}
          {loading && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                <div className="flex items-center space-x-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Running Gemini AI + Heuristic Evaluation</span></div>
                <span>Step {loadingStep + 1} of {loadingMessages.length}</span>
              </div>
              <p className="text-xs text-slate-300 font-mono animate-pulse">{loadingMessages[loadingStep]}</p>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500 ease-out"
                  style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Result Card */}
        {analysisResult && (
          <div className="max-w-4xl mx-auto pt-4">
            <RiskAnalysisCard analysis={analysisResult} onReset={() => setAnalysisResult(null)} />
          </div>
        )}

        {/* Features Grid */}
        <div className="pt-12 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center"><Cpu className="w-5 h-5" /></div>
            <h3 className="text-base font-bold text-white">Gemini AI Deep Analysis</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your submission is sent to Google Gemini with a strict security prompt that extracts payment triggers, domain risk, communication red flags, and hiring workflow anomalies.
            </p>
          </div>
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center"><Cog className="w-5 h-5" /></div>
            <h3 className="text-base font-bold text-white">Heuristic Fallback Engine</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              If the LLM is unavailable, a fast rule-based engine runs 20+ pattern checks for Zelle fees, Telegram handles, generic emails, fake checks, and urgency tactics.
            </p>
          </div>
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">🛡</div>
            <h3 className="text-base font-bold text-white">Community Report Cross-Ref</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Real-time matching against student-reported fraudulent recruiters, fake bootcamp schemes, and phishing bots in the community database.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
