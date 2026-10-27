import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveReportToFirestore, getReportsFromFirestore } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const scamType = searchParams.get('scamType') || 'ALL';
    const sortBy = searchParams.get('sortBy') || 'newest';

    // 1. Try fetching from Firebase Firestore first
    let firestoreReports = await getReportsFromFirestore(scamType);

    // 2. Fetch from local Prisma database
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { description: { contains: search } },
        { contactInfo: { contains: search } },
      ];
    }
    if (scamType !== 'ALL') {
      whereClause.scamType = scamType;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'upvotes') {
      orderBy = { upvotes: 'desc' };
    } else if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const prismaReports = await prisma.communityReport.findMany({
      where: whereClause,
      orderBy,
    });

    // Merge reports, avoiding duplicates by company + title
    const combinedMap = new Map<string, any>();

    // Add local reports first
    prismaReports.forEach(r => {
      combinedMap.set(`${r.company.toLowerCase()}-${r.title.toLowerCase()}`, {
        ...r,
        source: 'local',
      });
    });

    // Add or override with live Firestore reports
    firestoreReports.forEach(r => {
      const key = `${r.company.toLowerCase()}-${r.title.toLowerCase()}`;
      combinedMap.set(key, {
        id: r.id,
        title: r.title,
        company: r.company,
        scamType: r.scamType,
        sourceUrl: r.sourceUrl,
        contactInfo: r.contactInfo,
        description: r.description,
        evidenceUrl: r.evidenceUrl,
        status: r.status,
        upvotes: r.upvotes,
        downvotes: r.downvotes,
        reporterRole: r.reporterRole,
        createdAt: r.createdAt,
        source: 'firebase',
      });
    });

    let reports = Array.from(combinedMap.values());

    // Apply client search filter to merged list
    if (search) {
      reports = reports.filter(r => 
        r.title?.toLowerCase().includes(search) ||
        r.company?.toLowerCase().includes(search) ||
        r.description?.toLowerCase().includes(search) ||
        r.contactInfo?.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (sortBy === 'upvotes') {
      reports.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (sortBy === 'oldest') {
      reports.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error('Reports API GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community reports', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, company, scamType, sourceUrl, contactInfo, description, evidenceUrl, reporterRole } = body;

    if (!title || !company || !scamType || !description) {
      return NextResponse.json(
        { error: 'Please fill in all required fields (Title, Organization Name, Scam Type, and Description).' },
        { status: 400 }
      );
    }

    // 1. Save directly to Firebase Firestore
    let firebaseId: string | null = null;
    try {
      firebaseId = await saveReportToFirestore({
        title: title.trim(),
        company: company.trim(),
        scamType: scamType,
        sourceUrl: sourceUrl?.trim() || '',
        contactInfo: contactInfo?.trim() || '',
        description: description.trim(),
        evidenceUrl: evidenceUrl?.trim() || '',
        reporterRole: reporterRole?.trim() || 'Student',
        status: 'VERIFIED_SCAM',
        upvotes: 0,
        downvotes: 0,
      });
    } catch (fbErr) {
      console.warn('[Firebase] Warning saving report to Firestore:', fbErr);
    }

    // 2. Persist to local Prisma DB as backup
    const report = await prisma.communityReport.create({
      data: {
        title: title.trim(),
        company: company.trim(),
        scamType: scamType,
        sourceUrl: sourceUrl?.trim() || null,
        contactInfo: contactInfo?.trim() || null,
        description: description.trim(),
        evidenceUrl: evidenceUrl?.trim() || null,
        reporterRole: reporterRole?.trim() || 'Student',
        status: 'VERIFIED_SCAM',
      },
    });

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        firebaseId,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Reports API POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create community report', details: error?.message },
      { status: 500 }
    );
  }
}
