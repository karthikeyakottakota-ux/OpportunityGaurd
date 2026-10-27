import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { voteReportInFirestore } from '@/lib/firebase';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    const body = await req.json();
    const { voteType, userIdentifier } = body;

    if (!voteType || (voteType !== 'UPVOTE' && voteType !== 'DOWNVOTE')) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    const anonId = userIdentifier || req.headers.get('x-forwarded-for') || 'anon-session-client';

    // Also update vote in Firebase Firestore asynchronously
    voteReportInFirestore(reportId, voteType).catch((err) => {
      console.warn('[Firebase] Warning voting in Firestore:', err?.message);
    });

    // Find if report exists in Prisma
    const report = await prisma.communityReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      // If it's a Firestore-only document, return success
      return NextResponse.json({ 
        success: true, 
        report: { id: reportId, upvotes: voteType === 'UPVOTE' ? 1 : 0, downvotes: voteType === 'DOWNVOTE' ? 1 : 0 }, 
        userVote: voteType 
      });
    }

    // Check if user already voted on this report
    const existingVote = await prisma.vote.findUnique({
      where: {
        reportId_userIdentifier: {
          reportId,
          userIdentifier: anonId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote (toggle off)
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });

        const updatedReport = await prisma.communityReport.update({
          where: { id: reportId },
          data: {
            upvotes: voteType === 'UPVOTE' ? { decrement: 1 } : report.upvotes,
            downvotes: voteType === 'DOWNVOTE' ? { decrement: 1 } : report.downvotes,
          },
        });

        return NextResponse.json({ success: true, report: updatedReport, userVote: null });
      } else {
        // Change vote type (e.g. from DOWNVOTE to UPVOTE)
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });

        const updatedReport = await prisma.communityReport.update({
          where: { id: reportId },
          data: {
            upvotes: voteType === 'UPVOTE' ? { increment: 1 } : { decrement: 1 },
            downvotes: voteType === 'DOWNVOTE' ? { increment: 1 } : { decrement: 1 },
          },
        });

        return NextResponse.json({ success: true, report: updatedReport, userVote: voteType });
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          reportId,
          voteType,
          userIdentifier: anonId,
        },
      });

      const updatedReport = await prisma.communityReport.update({
        where: { id: reportId },
        data: {
          upvotes: voteType === 'UPVOTE' ? { increment: 1 } : report.upvotes,
          downvotes: voteType === 'DOWNVOTE' ? { increment: 1 } : report.downvotes,
        },
      });

      return NextResponse.json({ success: true, report: updatedReport, userVote: voteType });
    }
  } catch (error: any) {
    console.error('Vote API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process vote', details: error?.message },
      { status: 500 }
    );
  }
}
