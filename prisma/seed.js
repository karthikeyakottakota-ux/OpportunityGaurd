const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Trustora database...');

  // Clean existing data
  await prisma.vote.deleteMany();
  await prisma.communityReport.deleteMany();
  await prisma.opportunityScan.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@university.edu',
      name: 'Alex Johnson',
      role: 'STUDENT',
    },
  });

  // 1. High Risk Scan Example
  const highRiskScan = await prisma.opportunityScan.create({
    data: {
      title: 'Global Remote Administrative & Data Entry Assistant',
      company: 'Nexus Tech Global (Unverified)',
      sourceType: 'TEXT',
      rawInput: `Congratulations! We reviewed your profile on LinkedIn and selected you for the Data Entry Intern role at Nexus Tech Global. Pay is $48/hour. No prior experience required. 

To proceed, please message our HR manager Mr. Robert on Telegram (@NexusHR_Manager). You will receive an offer letter immediately without interview. 

NOTE: You must pay a $75 background check & home equipment processing fee via Zelle or Wire Transfer before starting your training module. We will mail you a check for $2,500 to purchase your MacBook.`,
      riskScore: 94,
      riskLevel: 'HIGH_RISK',
      flags: JSON.stringify([
        '🚩 Upfront Processing Fee Requested ($75 via Zelle)',
        '🚩 Off-Platform Telegram Communication (@NexusHR_Manager)',
        '🚩 Fake Check Refund Scheme Detected ($2,500 check)',
        '🚩 Instant Hiring Without Interview',
        '🚩 Suspiciously High Pay Rate for Entry Level ($48/hr)'
      ]),
      findings: JSON.stringify({
        financialRisk: {
          score: 95,
          summary: 'Critical financial hazard detected. Upfront Zelle fee and fraudulent check refund scheme.',
          details: 'Scammers frequently issue fake checks, request you to send real money to equipment vendors, and the check bounces days later, leaving you liable for thousands of dollars.'
        },
        communicationRisk: {
          score: 90,
          summary: 'Off-platform messaging on Telegram. No corporate email address provided.',
          details: 'Legitimate employers never conduct official hiring or onboarding solely through Telegram handles or personal WhatsApp accounts.'
        },
        domainRisk: {
          score: 85,
          summary: 'No verified company website found matching Nexus Tech Global.',
          details: 'Company domain is unregistered or missing standard corporate registration credentials.'
        },
        workflowRisk: {
          score: 92,
          summary: 'Immediate job offer without screening or interview process.',
          details: 'Legitimate corporations always conduct structured interviews and background checks through official HR portals.'
        }
      }),
      recommendedActions: JSON.stringify([
        'DO NOT send money via Zelle, CashApp, Wire, or Crypto under any circumstances.',
        'DO NOT deposit any check mailed to you by an unverified recruiter.',
        'Cease all contact with Telegram handle @NexusHR_Manager.',
        'Report this posting to your University Career Center and local law enforcement.',
        'Block and flag the sender on LinkedIn/Email.'
      ]),
      domainInfo: JSON.stringify({
        domain: 'nexustechglobal-careers.xyz',
        ageDays: 4,
        isGenericEmail: true,
        tldRisk: 'HIGH'
      })
    }
  });

  // 2. Low Risk Scan Example (Microsoft Internship)
  const lowRiskScan = await prisma.opportunityScan.create({
    data: {
      title: 'Software Engineering Intern - Summer 2026',
      company: 'Microsoft',
      sourceType: 'URL',
      rawInput: 'https://careers.microsoft.com/us/en/job/1749201/Software-Engineering-Intern-Summer-2026',
      riskScore: 8,
      riskLevel: 'LOW_RISK',
      flags: JSON.stringify([
        '🟢 Verified Official Corporate Domain (microsoft.com)',
        '🟢 Standard Corporate Portal Application Workflow',
        '🟢 SSL Security Certificate Valid',
        '🟢 No Payment Triggers or Off-Platform Messaging'
      ]),
      findings: JSON.stringify({
        financialRisk: {
          score: 0,
          summary: 'Zero payment requests or financial triggers.',
          details: 'Application is completely free through official company portal.'
        },
        communicationRisk: {
          score: 5,
          summary: 'Official corporate communications only via careers.microsoft.com.',
          details: 'Application handled through authenticated corporate career ecosystem.'
        },
        domainRisk: {
          score: 2,
          summary: 'Verified domain owned by Microsoft Corporation.',
          details: 'Domain registered in 1991 with valid EV SSL certificate.'
        },
        workflowRisk: {
          score: 10,
          summary: 'Standard structured multi-stage interview process.',
          details: 'Includes online assessment, technical screens, and HR follow-ups.'
        }
      }),
      recommendedActions: JSON.stringify([
        'Apply directly on careers.microsoft.com.',
        'Verify your resume formatting before submission.',
        'Ensure you keep track of application deadlines.'
      ]),
      domainInfo: JSON.stringify({
        domain: 'careers.microsoft.com',
        ageDays: 12200,
        isGenericEmail: false,
        tldRisk: 'NONE'
      })
    }
  });

  // 3. Needs Verification Scan Example
  const mediumRiskScan = await prisma.opportunityScan.create({
    data: {
      title: 'STEM Future Leaders $5,000 Grant Scholarship',
      company: 'Global STEM Alliance Foundation',
      sourceType: 'TEXT',
      rawInput: 'Apply for the STEM Future Leaders Grant! $5,000 awarded to eligible computer science students. Submit application form on Google Forms: forms.gle/x9823hjskdf. Contact: stemgrants.edu@gmail.com.',
      riskScore: 58,
      riskLevel: 'NEEDS_VERIFICATION',
      flags: JSON.stringify([
        '⚠️ Generic Contact Email Used (@gmail.com)',
        '⚠️ Application hosted on free Google Form instead of organization site',
        '⚠️ Missing clear organization registration details',
        '🟢 No upfront payment fee requested'
      ]),
      findings: JSON.stringify({
        financialRisk: {
          score: 25,
          summary: 'No fee requested, but requests SSN/Bank details for payout in form.',
          details: 'Caution: Never submit SSN or banking details on an unencrypted Google Form.'
        },
        communicationRisk: {
          score: 65,
          summary: 'Contact email stemgrants.edu@gmail.com is an unverified gmail address.',
          details: 'Reputable scholarship foundations utilize custom domain email addresses (e.g., info@stemalliance.org).'
        },
        domainRisk: {
          score: 50,
          summary: 'Hosted on Google Forms without dedicated domain.',
          details: 'Form URL cannot be independently verified against foundation tax records.'
        },
        workflowRisk: {
          score: 45,
          summary: 'Form collects sensitive personal identification data.',
          details: 'Ensure no sensitive PII is shared before confirming legitimacy.'
        }
      }),
      recommendedActions: JSON.stringify([
        'Do NOT enter your Social Security Number or Bank Account details on Google Forms.',
        'Search the official IRS 501(c)(3) tax registry for Global STEM Alliance Foundation.',
        'Contact your university financial aid office to confirm if this grant is listed.'
      ]),
      domainInfo: JSON.stringify({
        domain: 'forms.gle',
        ageDays: 5000,
        isGenericEmail: true,
        tldRisk: 'MEDIUM'
      })
    }
  });

  // Seed Community Reports
  const report1 = await prisma.communityReport.create({
    data: {
      title: 'Fake Remote Graphic Design Intern - $150 "Software License Fee"',
      company: 'Apex Media Design Studio',
      scamType: 'UPFRONT_FEE',
      sourceUrl: 'https://linkedin-job-scam-example.com/apex-media',
      contactInfo: 'recruitment.apexmedia@gmail.com / WhatsApp +1 (555) 019-2834',
      description: 'Received an offer letter after applying on a job board. They claimed I was accepted immediately but required to pay $150 via CashApp to unlock Adobe Cloud enterprise licenses through their distributor. After sending money, they blocked my number.',
      evidenceUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
      status: 'VERIFIED_SCAM',
      upvotes: 42,
      downvotes: 1,
      reporterRole: 'Computer Science Student',
    }
  });

  const report2 = await prisma.communityReport.create({
    data: {
      title: 'Telegram Interview Phishing Scam for Cloud Analyst Role',
      company: 'Optima Systems Corp (Impersonated)',
      scamType: 'TELEGRAM_WHATSAPP',
      sourceUrl: 'https://telegram.me/optima_hr_bot',
      contactInfo: '@Optima_Hiring_Manager on Telegram',
      description: 'Scammers set up a fake text-only interview on Telegram using a bot. They asked for full address, driver license copy, and direct deposit routing details for "onboarding equipment setup". Never did a video or phone call.',
      evidenceUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      status: 'VERIFIED_SCAM',
      upvotes: 35,
      downvotes: 0,
      reporterRole: 'Cybersecurity Student',
    }
  });

  const report3 = await prisma.communityReport.create({
    data: {
      title: 'Check Refund Laptop Scam for Virtual Assistant Role',
      company: 'BlueWave Logistics LLC',
      scamType: 'FAKE_OFFER',
      sourceUrl: 'https://bluewavelogistics-jobs.top',
      contactInfo: 'hr@bluewavelogistics-jobs.top',
      description: 'Sent me a check for $3,800 in the mail to buy office furniture from their "approved vendor". Asked me to wire back $3,000 immediately. My bank flagged the check as fraudulent 4 days later.',
      evidenceUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
      status: 'VERIFIED_SCAM',
      upvotes: 68,
      downvotes: 2,
      reporterRole: 'Business Administration Senior',
    }
  });

  const report4 = await prisma.communityReport.create({
    data: {
      title: 'Pay-To-Work Training Academy Scheme',
      company: 'SkillUp Global Tech Institute',
      scamType: 'PAY_TO_WORK',
      sourceUrl: 'https://skillup-globaltech.org/guaranteed-internship',
      contactInfo: 'admissions@skillup-globaltech.org',
      description: 'Advertised a "Guaranteed Paid Data Science Internship", but upon applying, informed candidates they must first complete a mandatory $899 4-week training bootcamp before receiving internship placement.',
      evidenceUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      status: 'VERIFIED_SCAM',
      upvotes: 29,
      downvotes: 4,
      reporterRole: 'Data Science Junior',
    }
  });

  // Seed sample votes
  await prisma.vote.create({
    data: {
      reportId: report1.id,
      voteType: 'UPVOTE',
      userIdentifier: 'seed-user-1'
    }
  });

  console.log('Database successfully seeded with realistic Trustora data!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
