// app/api/scraping/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get counts for each status
    const [total, successful, failed, inProgress] = await Promise.all([
      prisma.scrapingHistory.count({
        where: { userId }
      }),
      prisma.scrapingHistory.count({
        where: { userId, status: 'SUCCESS' }
      }),
      prisma.scrapingHistory.count({
        where: { userId, status: 'FAILED' }
      }),
      prisma.scrapingHistory.count({
        where: { userId, status: 'IN_PROGRESS' }
      })
    ]);

    return NextResponse.json({
      total,
      successful,
      failed,
      inProgress
    });

  } catch (error) {
    console.error('Failed to fetch scraping stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}