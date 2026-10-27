# 🛡️ Trustora

**AI-Powered Fake Internship, Scholarship & Job Scam Detection Platform for Students**

Trustora helps students detect fraudulent job offers, fake scholarships, upfront payment scams, and phishing recruiters using a heuristic AI evaluation engine, domain verification, and community-powered scam reporting.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Initialize & seed database
npx prisma db push
node prisma/seed.js

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧩 Features

### 1. AI Opportunity Scanner (`/`)
- **Tabbed Input**: Paste Link, Upload Screenshot (OCR), or Paste Text
- **Animated Loading Pipeline**: Step-by-step analysis visualization
- **Risk Analysis Card** with:
  - Visual Risk Badge (🟢 Low Risk / 🟡 Needs Verification / 🔴 High Risk)
  - Risk Score Gauge (0–100)
  - Categorized Findings (Financial, Communication, Domain, Workflow)
  - Interactive Student Verification Checklist
- **1-Click Demo Presets**: Instantly test High Risk, Low Risk, and Needs Verification scenarios

### 2. Community Reporting (`/report`)
- Submit suspicious opportunities with details: Title, Organization, Scam Type, Source Link, Contact Info, Description, and Evidence
- 6 scam categories: Upfront Fee, Telegram/WhatsApp, Phishing, Fake Check, Pay-to-Work, Other
- Confetti celebration on successful submission

### 3. Scam Database / Explore Feed (`/explore`)
- Filterable & searchable feed of community-reported scams
- Upvote/Downvote system for community verification
- Full-detail modal with evidence screenshots
- Sort by Newest, Most Upvoted, or Oldest

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons |
| **Backend/API** | Next.js API Routes |
| **AI Engine** | Structured heuristic pattern detection (payment triggers, domain analysis, communication channel analysis, workflow risk scoring) |
| **Database** | Prisma ORM + SQLite (swap to PostgreSQL for production) |
| **Styling** | Tailwind CSS with custom risk-themed color palette (deep navy/slate base, emerald/amber/rose badges) |

---

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma       # Database models (User, OpportunityScan, CommunityReport, Vote)
│   ├── seed.js             # Mock data seeder
│   └── dev.db              # SQLite database (auto-generated)
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with metadata
│   │   ├── globals.css     # Global styles & custom animations
│   │   ├── page.tsx        # Home / AI Scanner page
│   │   ├── explore/
│   │   │   └── page.tsx    # Scam Database feed
│   │   ├── report/
│   │   │   └── page.tsx    # Community report submission
│   │   └── api/
│   │       ├── scan/
│   │       │   └── route.ts        # POST: AI scan evaluation
│   │       └── reports/
│   │           ├── route.ts        # GET/POST: community reports
│   │           └── [id]/vote/
│   │               └── route.ts    # POST: upvote/downvote
│   ├── components/
│   │   ├── Navbar.tsx              # Navigation header
│   │   ├── Footer.tsx              # Footer with resources
│   │   └── RiskAnalysisCard.tsx    # Risk evaluation results card
│   └── lib/
│       ├── prisma.ts               # Prisma client singleton
│       └── scannerEngine.ts        # AI heuristic analysis engine
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 🔍 AI Scanner Engine — What It Detects

| Category | Detected Patterns |
|----------|------------------|
| **Financial Risk** | Upfront fees, Zelle/CashApp/Crypto payments, fake check refund schemes, unrealistic salary |
| **Communication Risk** | Telegram handles, WhatsApp-only contact, generic @gmail/@yahoo recruiter emails |
| **Domain Risk** | High-risk TLDs (.xyz, .top, .tk), typosquatting brand domains, newly registered domains |
| **Workflow Risk** | Instant hiring without interview, urgency pressure tactics, SSN/bank detail requests before contract |

---

## 📜 License

MIT — Built with ❤️ for student protection worldwide.
