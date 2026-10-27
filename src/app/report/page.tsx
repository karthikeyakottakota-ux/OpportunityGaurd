'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  ShieldAlert, Send, CheckCircle2, AlertTriangle, FileText, 
  Upload, Link2, Mail, Building2, User, ArrowRight, Sparkles, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

function ReportForm() {
  const searchParams = useSearchParams();

  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [scamType, setScamType] = useState('UPFRONT_FEE');
  const [sourceUrl, setSourceUrl] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [reporterRole, setReporterRole] = useState('Student');

  const [loading, setLoading] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const cParam = searchParams.get('company');
    const tParam = searchParams.get('title');
    if (cParam) setCompany(cParam);
    if (tParam) setTitle(tParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !company || !description) {
      setErrorMsg('Please fill in all required fields (Opportunity Title, Organization Name, and Description).');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          company,
          scamType,
          sourceUrl,
          contactInfo,
          description,
          evidenceUrl,
          reporterRole,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedReport(data.report);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      } else {
        setErrorMsg(data.error || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to reporting server.');
    } finally {
      setLoading(false);
    }
  };

  /* Success Screen */
  if (submittedReport) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-emerald-500/40 p-8 text-center space-y-6 shadow-2xl gradient-border-emerald">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Report Successfully Published!</h2>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            Thank you for protecting student job seekers! Your report for <strong className="text-emerald-400">{submittedReport.company}</strong> has been added to the public scam database.
          </p>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-w-md mx-auto text-left text-xs space-y-1">
          <div className="flex justify-between text-slate-400 font-semibold">
            <span>Report ID:</span>
            <span className="text-slate-200">{submittedReport.id}</span>
          </div>
          <div className="flex justify-between text-slate-400 font-semibold">
            <span>Status:</span>
            <span className="text-emerald-400 uppercase font-bold">{submittedReport.status}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/explore"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <span>View Community Scam Feed</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setSubmittedReport(null)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  /* Form UI */
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Organization / Company Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Nexus Tech Global or Microsoft (Impersonated)"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Role / Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Opportunity Title / Role <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <FileText className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Remote Data Entry Assistant $48/hr"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Scam Type Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Select Primary Scam Category <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'UPFRONT_FEE', label: '🚩 Upfront Fee', desc: 'Demanded cash/Zelle for software or check' },
              { id: 'TELEGRAM_WHATSAPP', label: '💬 Telegram / WhatsApp', desc: 'Off-platform text interview bot' },
              { id: 'PHISHING', label: '🎣 Phishing / PII', desc: 'Stole SSN, passport, or bank details' },
              { id: 'FAKE_OFFER', label: '📄 Fake Check Offer', desc: 'Mailed fake check & asked refund' },
              { id: 'PAY_TO_WORK', label: '💼 Pay-to-Work', desc: 'Forced paid bootcamp training' },
              { id: 'OTHER', label: '❓ Other Fraud', desc: 'Suspicious job or grant posting' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setScamType(type.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scamType === type.id
                    ? 'bg-rose-950/60 border-rose-500/80 text-rose-200 shadow-md shadow-rose-950/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold mb-0.5">{type.label}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Source Link */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Source Link / Listing URL (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="e.g. https://linkedin.com/jobs/view/123456"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Recruiter Contact Info */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Recruiter Email / Telegram / Phone (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. recruiter@gmail.com or @TelegramHandle"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Detailed Description of What Happened <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain how they contacted you, what payment or personal info was requested, and any red flags you noticed..."
            className="w-full p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
          />
        </div>

        {/* Evidence URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Screenshot / Evidence Proof Link (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Upload className="w-4 h-4" />
            </div>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="e.g. Imgur, Drive, or screenshot URL link"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Reporter Role */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Your Student Major / Student Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={reporterRole}
              onChange={(e) => setReporterRole(e.target.value)}
              placeholder="e.g. CS Sophomore, Business Major, Graduate Student"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Publish Scam Report</span>
        </button>

      </form>
    </div>
  );
}

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/80 text-xs font-semibold text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Community Defense Registry</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Report a Suspicious Opportunity or Scam
          </h1>

          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Help protect fellow students. Submit details of fraudulent job offers, upfront fee demands, or phishing recruiters to alert the community.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading report form...</span>
          </div>
        }>
          <ReportForm />
        </Suspense>

      </main>

      <Footer />
    </div>
  );
}
