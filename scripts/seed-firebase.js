const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDxuJv4KOH3qKBuioJn_zzkFYmWcv3TX-U",
  authDomain: "fake-app-detector-305dc.firebaseapp.com",
  projectId: "fake-app-detector-305dc",
  storageBucket: "fake-app-detector-305dc.firebasestorage.app",
  messagingSenderId: "247746085673",
  appId: "1:247746085673:web:958f8918b8927457c12d38",
  measurementId: "G-9NNFYF6KYJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initialReports = [
  {
    title: 'Fake Remote Graphic Design Intern - $150 Software License Fee',
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
  },
  {
    title: 'Telegram Interview Phishing Scam for Cloud Analyst Role',
    company: 'Optima Systems Corp (Impersonated)',
    scamType: 'TELEGRAM_WHATSAPP',
    sourceUrl: 'https://telegram.me/optima_hr_bot',
    contactInfo: '@Optima_Hiring_Manager on Telegram',
    description: 'Scammers set up a fake text-only interview on Telegram using a bot. They asked for full address, driver license copy, and direct deposit routing details for onboarding equipment setup. Never did a video or phone call.',
    evidenceUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
    status: 'VERIFIED_SCAM',
    upvotes: 35,
    downvotes: 0,
    reporterRole: 'Cybersecurity Student',
  },
  {
    title: 'Check Refund Laptop Scam for Virtual Assistant Role',
    company: 'BlueWave Logistics LLC',
    scamType: 'FAKE_OFFER',
    sourceUrl: 'https://bluewavelogistics-jobs.top',
    contactInfo: 'hr@bluewavelogistics-jobs.top',
    description: 'Sent me a check for $3,800 in the mail to buy office furniture from their approved vendor. Asked me to wire back $3,000 immediately. My bank flagged the check as fraudulent 4 days later.',
    evidenceUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
    status: 'VERIFIED_SCAM',
    upvotes: 68,
    downvotes: 2,
    reporterRole: 'Business Administration Senior',
  },
  {
    title: 'Pay-To-Work Training Academy Scheme',
    company: 'SkillUp Global Tech Institute',
    scamType: 'PAY_TO_WORK',
    sourceUrl: 'https://skillup-globaltech.org/guaranteed-internship',
    contactInfo: 'admissions@skillup-globaltech.org',
    description: 'Advertised a Guaranteed Paid Data Science Internship, but upon applying, informed candidates they must first complete a mandatory $899 4-week training bootcamp before receiving internship placement.',
    evidenceUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    status: 'VERIFIED_SCAM',
    upvotes: 29,
    downvotes: 4,
    reporterRole: 'Data Science Junior',
  }
];

async function seedFirebase() {
  console.log('Connecting to Firebase Firestore for project: fake-app-detector-305dc...');
  const reportsCol = collection(db, 'community_reports');

  try {
    const existing = await getDocs(reportsCol);
    if (existing.size > 0) {
      console.log(`Firestore already has ${existing.size} community reports. Skipping seed.`);
      process.exit(0);
    }

    console.log('Seeding initial community scam reports to Firestore...');
    for (const report of initialReports) {
      const docRef = await addDoc(reportsCol, {
        ...report,
        createdAt: serverTimestamp(),
      });
      console.log(`Added report [${report.company}] with ID: ${docRef.id}`);
    }
    console.log('Successfully seeded Firebase Firestore database!');
  } catch (err) {
    console.error('Error seeding Firebase:', err.message);
  }
  process.exit(0);
}

seedFirebase();
