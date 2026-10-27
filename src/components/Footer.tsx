import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, ExternalLink, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span className="text-lg font-bold text-white tracking-tight">Trustora</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed text-xs sm:text-sm">
              An AI-powered defense platform dedicated to protecting students and job seekers from fraudulent employment offers, fake scholarship grants, upfront payment scams, and phishing recruiters.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy-first engine. Submitted documents & URLs are evaluated securely.</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  AI Opportunity Scanner
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-emerald-400 transition-colors">
                  Community Scam Database
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-emerald-400 transition-colors">
                  Report a Suspicious Offer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Student Safety Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.ftc.gov/news-events/topics/identity-theft"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-emerald-400 transition-colors"
                >
                  <span>FTC Job Scam Advice</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ic3.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-emerald-400 transition-colors"
                >
                  <span>FBI Internet Crime Center</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
              <li>
                <span className="text-slate-500">University Career Center Helpline</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Trustora. Empowering students against financial fraud.</p>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for student protection worldwide.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
