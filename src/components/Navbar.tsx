'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Search, AlertTriangle, FileText, CheckCircle2, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-emerald-400 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Trust<span className="text-emerald-400">ora</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  AI Beta
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Student Scam Protection Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive('/')
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>AI Scanner</span>
            </Link>

            <Link
              href="/explore"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive('/explore')
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Scam Feed</span>
            </Link>

            <Link
              href="/report"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive('/report')
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>Submit Report</span>
            </Link>
          </nav>

          {/* Actions & Metrics */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/20 text-xs font-medium text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>1,420+ Scams Blocked</span>
            </div>

            <Link
              href="/"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Quick Scan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 bg-slate-950/90 text-xs">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-3 ${
            isActive('/') ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span>Scanner</span>
        </Link>
        <Link
          href="/explore"
          className={`flex flex-col items-center py-1 px-3 ${
            isActive('/explore') ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <AlertTriangle className="w-4 h-4 mb-0.5" />
          <span>Explore</span>
        </Link>
        <Link
          href="/report"
          className={`flex flex-col items-center py-1 px-3 ${
            isActive('/report') ? 'text-rose-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>Report</span>
        </Link>
      </div>
    </header>
  );
}
