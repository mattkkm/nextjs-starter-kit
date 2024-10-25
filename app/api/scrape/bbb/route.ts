// app/api/scrape/bbb/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

type BBBSearchParams = {
  businessName: string;
  location: string;
  page?: number;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let userId: string | null = null;
  let scrapingJob;

  try {
    const auth = getAuth(req);
    userId = auth.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessName, location, page = 1 }: BBBSearchParams = await req.json();

    scrapingJob = await prisma.scrapingJob.create({
      data: {
        status: 'RUNNING',
        source: 'BBB',
        parameters: { businessName, location, page },
        startedAt: new Date(),
      }
    });

    // Note: This is a placeholder URL - you'll need to replace with actual BBB API endpoint
    const searchUrl = `https://www.bbb.org/api/search?q=${encodeURIComponent(businessName)}&location=${encodeURIComponent(location)}&page=${page}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        // Add any required BBB API authentication headers here
      }
    });

    if (!response.ok) {
      throw new Error(`BBB API returned status: ${response.status}`);
    }

    const data = await response.json();
    const businesses = data.results || [];

    // Store results
    for (const business of businesses) {
      await prisma.scrapedData.create({
        data: {
          source: 'BBB',
          rawData: business,
          processed: false,
        }
      });
    }

    await prisma.scrapingJob.update({
      where: { id: scrapingJob.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        results: businesses,
      }
    });

    // Add scraping history
    await prisma.scrapingHistory.create({
      data: {
        source: 'BBB',
        status: 'SUCCESS',
        resultsCount: businesses.length,
        duration: Date.now() - startTime,
        userId,
      }
    });

    return NextResponse.json({ 
      jobId: scrapingJob.id,
      results: businesses,
      totalPages: data.totalPages || 1
    });

  } catch (error) {
    console.error('BBB scraping error:', error);
    
    if (scrapingJob?.id && userId) {
      await prisma.scrapingJob.update({
        where: { id: scrapingJob.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      });

      await prisma.scrapingHistory.create({
        data: {
          source: 'BBB',
          status: 'FAILED',
          resultsCount: 0,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
        }
      });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch BBB data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}