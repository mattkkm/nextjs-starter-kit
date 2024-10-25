// app/api/scrape/yelp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const YELP_API_KEY = process.env.YELP_API_KEY;

type YelpSearchParams = {
  term: string;
  location: string;
  categories?: string;
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

    if (!YELP_API_KEY) {
      throw new Error('YELP_API_KEY is not configured');
    }

    const { term, location, categories, limit = 50 }: YelpSearchParams = await req.json();

    // Log request parameters
    console.log('Yelp API Request Parameters:', {
      term,
      location,
      categories,
      limit
    });

    scrapingJob = await prisma.scrapingJob.create({
      data: {
        status: 'RUNNING',
        source: 'YELP',
        parameters: { term, location, categories, limit },
        startedAt: new Date(),
      }
    });

    const searchUrl = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(term)}&location=${encodeURIComponent(location)}&limit=${limit}${categories ? `&categories=${categories}` : ''}`;
    
    console.log('Yelp API URL:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Yelp API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Yelp API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Yelp API Response:', {
      totalResults: data.businesses?.length || 0,
      hasData: !!data.businesses
    });

    const businesses = data.businesses || [];

    // Store results
    for (const business of businesses) {
      await prisma.scrapedData.create({
        data: {
          source: 'YELP',
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
        source: 'YELP',
        status: 'SUCCESS',
        resultsCount: businesses.length,
        duration: Date.now() - startTime,
        userId,
      }
    });

    return NextResponse.json({ 
      jobId: scrapingJob.id,
      results: businesses,
      total: data.total || 0
    });

  } catch (error) {
    console.error('Yelp scraping error details:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error,
      requestParams: req.body
    });
    
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
          source: 'YELP',
          status: 'FAILED',
          resultsCount: 0,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
        }
      });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch Yelp data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}