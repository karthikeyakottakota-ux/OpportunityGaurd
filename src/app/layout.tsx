import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trustora - AI Fake Internship & Scam Detection Platform',
  description: 'Protect students from fake internships, job scams, upfront payment fees, and phishing recruiters.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
