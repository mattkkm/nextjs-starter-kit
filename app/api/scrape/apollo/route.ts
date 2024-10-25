// app/api/scrape/apollo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;

type ApolloSearchParams = {
  companyName: string;
  domain?: string;
  industry?: string;
  limit?: number;
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

    const { companyName, domain, industry, limit = 10 }: ApolloSearchParams = await req.json();

    scrapingJob = await prisma.scrapingJob.create({
      data: {
        status: 'RUNNING',
        source: 'APOLLO',
        parameters: { companyName, domain, industry, limit },
        startedAt: new Date(),
      }
    });

    const response = await fetch('https://api.apollo.io/v1/organizations/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-API-Key': APOLLO_API_KEY as string,
      },
      body: JSON.stringify({
        q_organization_name: companyName,
        domain,
        industry,
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Apollo API returned status: ${response.status}`);
    }

    const data = await response.json();
    const organizations = data.organizations || [];

    // Store results
    for (const org of organizations) {
      await prisma.scrapedData.create({
        data: {
          source: 'APOLLO',
          rawData: org,
          processed: false,
        }
      });
    }

    await prisma.scrapingJob.update({
      where: { id: scrapingJob.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        results: organizations,
      }
    });

    // Add scraping history
    await prisma.scrapingHistory.create({
      data: {
        source: 'APOLLO',
        status: 'SUCCESS',
        resultsCount: organizations.length,
        duration: Date.now() - startTime,
        userId,
      }
    });

    return NextResponse.json({ 
      jobId: scrapingJob.id,
      results: organizations,
      pagination: data.pagination
    });

  } catch (error) {
    console.error('Apollo scraping error:', error);
    
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
          source: 'APOLLO',
          status: 'FAILED',
          resultsCount: 0,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
        }
      });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch Apollo data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}