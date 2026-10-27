'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  Search, Filter, ThumbsUp, ThumbsDown, ShieldAlert, 
  ExternalLink, Building2, Mail, Calendar, User, CheckCircle2, 
  AlertTriangle, Eye, X, PlusCircle 
} from 'lucide-react';

interface ReportItem {
  id: string;
  title: string;
  company: string;
  scamType: string;
  sourceUrl?: string;
  contactInfo?: string;
  description: string;
  evidenceUrl?: string;
  status: string;
  upvotes: number;
  downvotes: number;
  reporterRole?: string;
  createdAt: string;
}

export default function ExplorePage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScamType, setSelectedScamType] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedReportModal, setSelectedReportModal] = useState<ReportItem | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, 'UPVOTE' | 'DOWNVOTE'>>({});

  const fetchReports = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        scamType: selectedScamType,
        sortBy: sortBy,
      });

      const res = await fetch(`/api/reports?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [searchQuery, selectedScamType, sortBy]);

  const handleVote = async (reportId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    // Optimistic UI update
    const currentVote = userVotes[reportId];
    setUserVotes(prev => ({
      ...prev,
      [reportId]: currentVote === voteType ? (undefined as any) : voteType
    }));

    setReports(prevReports =>
      prevReports.map(r => {
        if (r.id === reportId) {
          let newUp = r.upvotes;
          let newDown = r.downvotes;

          if (currentVote === voteType) {
            // Cancel vote
            if (voteType === 'UPVOTE') newUp -= 1;
            if (voteType === 'DOWNVOTE') newDown -= 1;
          } else if (currentVote) {
            // Switch vote
            if (voteType === 'UPVOTE') { newUp += 1; newDown -= 1; }
            if (voteType === 'DOWNVOTE') { newDown += 1; newUp -= 1; }
          } else {
            // New vote
            if (voteType === 'UPVOTE') newUp += 1;
            if (voteType === 'DOWNVOTE') newDown += 1;
          }

          return { ...r, upvotes: Math.max(0, newUp), downvotes: Math.max(0, newDown) };
        }
        return r;
      })
    );

    try {
      await fetch(`/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, userIdentifier: 'session-user-anon' }),
      });
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const getScamTypeBadge = (type: string) => {
    switch (type) {
      case 'UPFRONT_FEE':
        return { label: '🚩 Upfront Fee', color: 'bg-rose-950/60 text-rose-300 border-rose-800' };
      case 'TELEGRAM_WHATSAPP':
        return { label: '💬 Telegram / WhatsApp Bot', color: 'bg-indigo-950/60 text-indigo-300 border-indigo-800' };
      case 'PHISHING':
        return { label: '🎣 Phishing / PII Fraud', color: 'bg-amber-950/60 text-amber-300 border-amber-800' };
      case 'FAKE_OFFER':
        return { label: '📄 Fake Check Refund', color: 'bg-purple-950/60 text-purple-300 border-purple-800' };
      case 'PAY_TO_WORK':
        return { label: '💼 Pay-to-Work Scheme', color: 'bg-blue-950/60 text-blue-300 border-blue-800' };
      default:
        return { label: '❓ Suspicious Activity', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <span>Community Scam Database</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {reports.length} Verified Reports
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Explore student-submitted fraud reports, fake recruiter handles, and upfront fee schemes.
            </p>
          </div>

          <Link
            href="/report"
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-rose-600/25 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Scam Report</span>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name, recruiter email, or job title..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="upvotes">Most Upvoted / Confirmed</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-400 font-semibold flex items-center space-x-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </span>
            {[
              { id: 'ALL', label: 'All Categories' },
              { id: 'UPFRONT_FEE', label: '🚩 Upfront Fee' },
              { id: 'TELEGRAM_WHATSAPP', label: '💬 Telegram/WhatsApp' },
              { id: 'PHISHING', label: '🎣 Phishing PII' },
              { id: 'FAKE_OFFER', label: '📄 Fake Check Offer' },
              { id: 'PAY_TO_WORK', label: '💼 Pay-to-Work' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedScamType(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  selectedScamType === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
            Loading community scam records...
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Matching Scam Reports Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keywords or filter settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => {
              const badge = getScamTypeBadge(report.scamType);
              const isUpvoted = userVotes[report.id] === 'UPVOTE';
              const isDownvoted = userVotes[report.id] === 'DOWNVOTE';

              return (
                <div
                  key={report.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl"
                >
                  <div className="space-y-3">
                    {/* Header badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {report.status}
                      </span>
                    </div>

                    {/* Title & Company */}
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                        {report.company}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium">{report.title}</p>
                    </div>

                    {/* Contact details */}
                    {report.contactInfo && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="font-mono text-[11px] truncate">{report.contactInfo}</span>
                      </div>
                    )}

                    {/* Description preview */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {/* Footer metadata & vote buttons */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-slate-500">
                      <span className="flex items-center space-x-1 text-[11px]">
                        <User className="w-3 h-3" />
                        <span>{report.reporterRole || 'Student'}</span>
                      </span>
                    </div>

                    {/* Upvote / Downvote buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote(report.id, 'UPVOTE')}
                        className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          isUpvoted
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{report.upvotes}</span>
                      </button>

                      <button
                        onClick={() => handleVote(report.id, 'DOWNVOTE')}
                        className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          isDownvoted
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{report.downvotes}</span>
                      </button>

                      <button
                        onClick={() => setSelectedReportModal(report)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Report Details Modal */}
        {selectedReportModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedReportModal(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-block ${getScamTypeBadge(selectedReportModal.scamType).color}`}>
                  {getScamTypeBadge(selectedReportModal.scamType).label}
                </span>
                <h2 className="text-2xl font-extrabold text-white">{selectedReportModal.company}</h2>
                <p className="text-sm font-semibold text-slate-300">{selectedReportModal.title}</p>
              </div>

              {selectedReportModal.contactInfo && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">Recruiter Contact Info / Handle:</span>
                  <span className="text-rose-400 font-mono">{selectedReportModal.contactInfo}</span>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Incident Description</h4>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  {selectedReportModal.description}
                </p>
              </div>

              {selectedReportModal.evidenceUrl && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Evidence Screenshot / Document</h4>
                  <div className="rounded-xl overflow-hidden border border-slate-800 max-h-60">
                    <img src={selectedReportModal.evidenceUrl} alt="Report Evidence" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Submitted by: {selectedReportModal.reporterRole || 'Student'}</span>
                <span>Date: {new Date(selectedReportModal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
