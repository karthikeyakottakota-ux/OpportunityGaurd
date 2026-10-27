import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  increment, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDxuJv4KOH3qKBuioJn_zzkFYmWcv3TX-U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fake-app-detector-305dc.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fake-app-detector-305dc",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fake-app-detector-305dc.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247746085673",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247746085673:web:958f8918b8927457c12d38",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9NNFYF6KYJ"
};

// Initialize Firebase App as Singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore database
export const db = getFirestore(app);

// Initialize Analytics safely on client side only
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn('[Firebase] Analytics initialization skipped:', err?.message);
  });
}

// ─────────────────────────────────────────────────────────────
// Firestore Helper Functions for Trustora
// ─────────────────────────────────────────────────────────────

export interface FirebaseScanRecord {
  title: string;
  company: string;
  sourceType: string;
  rawInput: string;
  riskScore: number;
  riskLevel: string;
  detectedFlags: any[];
  recommendations: string[];
  findings?: any;
  analysisSource: string;
  createdAt?: any;
}

export interface FirebaseCommunityReport {
  id?: string;
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
  createdAt?: any;
}

/**
 * Saves a new scan evaluation result to the Firestore 'scans' collection.
 */
export async function saveScanToFirestore(scan: FirebaseScanRecord): Promise<string | null> {
  try {
    const scansCol = collection(db, 'scans');
    const docRef = await addDoc(scansCol, {
      ...scan,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err: any) {
    console.error('[Firebase] Failed to save scan to Firestore:', err?.message || err);
    return null;
  }
}

/**
 * Saves a community fraud report to the Firestore 'community_reports' collection.
 */
export async function saveReportToFirestore(report: FirebaseCommunityReport): Promise<string | null> {
  try {
    const reportsCol = collection(db, 'community_reports');
    const docRef = await addDoc(reportsCol, {
      title: report.title,
      company: report.company,
      scamType: report.scamType,
      sourceUrl: report.sourceUrl || '',
      contactInfo: report.contactInfo || '',
      description: report.description,
      evidenceUrl: report.evidenceUrl || '',
      status: report.status || 'VERIFIED_SCAM',
      upvotes: report.upvotes || 0,
      downvotes: report.downvotes || 0,
      reporterRole: report.reporterRole || 'Student',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err: any) {
    console.error('[Firebase] Failed to save report to Firestore:', err?.message || err);
    return null;
  }
}

/**
 * Fetches community reports from Firestore with search and category filtering.
 */
export async function getReportsFromFirestore(filterScamType?: string): Promise<FirebaseCommunityReport[]> {
  try {
    const reportsCol = collection(db, 'community_reports');
    let q;

    if (filterScamType && filterScamType !== 'ALL') {
      q = query(reportsCol, where('scamType', '==', filterScamType), limit(50));
    } else {
      q = query(reportsCol, limit(50));
    }

    const snapshot = await getDocs(q);
    const reports: FirebaseCommunityReport[] = [];

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      let createdDate = new Date().toISOString();
      if (data.createdAt instanceof Timestamp) {
        createdDate = data.createdAt.toDate().toISOString();
      }

      reports.push({
        id: docSnapshot.id,
        title: data.title,
        company: data.company,
        scamType: data.scamType,
        sourceUrl: data.sourceUrl,
        contactInfo: data.contactInfo,
        description: data.description,
        evidenceUrl: data.evidenceUrl,
        status: data.status || 'VERIFIED_SCAM',
        upvotes: Number(data.upvotes) || 0,
        downvotes: Number(data.downvotes) || 0,
        reporterRole: data.reporterRole || 'Student',
        createdAt: createdDate,
      });
    });

    return reports;
  } catch (err: any) {
    console.error('[Firebase] Failed to fetch reports from Firestore:', err?.message || err);
    return [];
  }
}

/**
 * Upvotes or downvotes a community report directly in Firestore.
 */
export async function voteReportInFirestore(reportId: string, voteType: 'UPVOTE' | 'DOWNVOTE'): Promise<boolean> {
  try {
    const reportRef = doc(db, 'community_reports', reportId);
    if (voteType === 'UPVOTE') {
      await updateDoc(reportRef, { upvotes: increment(1) });
    } else {
      await updateDoc(reportRef, { downvotes: increment(1) });
    }
    return true;
  } catch (err: any) {
    console.error('[Firebase] Failed to update vote in Firestore:', err?.message || err);
    return false;
  }
}
