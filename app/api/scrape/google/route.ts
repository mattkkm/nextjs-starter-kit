// app/api/scrape/google/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// You'll want to store this in .env
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

type GoogleSearchParams = {
    
  query: string;
  location?: string;
  radius?: string;
  type?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, location, radius = '5000', type = 'business' }: GoogleSearchParams = await req.json();

    // First, create a scraping job
    const scrapingJob = await prisma.scrapingJob.create({
      data: {
        status: 'RUNNING',
        source: 'GOOGLE_MAPS',
        parameters: { query, location, radius, type },
        startedAt: new Date(),
      }
    });

    // Make the initial Places API call
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&radius=${radius}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    // console.log()
    // Store the raw results
    const businesses = [];
    const startTime = Date.now(); // Add this at the start

    if (data.results) {
      for (const place of data.results) {
        // Get additional details for each place
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status&key=${GOOGLE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const details = await detailsResponse.json();

        businesses.push({
          name: place.name,
          address: place.formatted_address,
          placeId: place.place_id,
          location: place.geometry?.location,
          rating: place.rating,
          types: place.types,
          details: details.result
        });

        // Store raw data
        await prisma.scrapedData.create({
          data: {
            source: 'GOOGLE_MAPS',
            rawData: details.result,
            processed: false,
          }
        });
      }
    }
    // Update job status
    await prisma.scrapingJob.update({
      where: { id: scrapingJob.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        results: businesses,
      }
    });
    // Add this: Create scraping history entry
    await prisma.scrapingHistory.create({
        data: {
            source: 'GOOGLE_PLACES',
            status: 'SUCCESS',
            resultsCount: businesses.length,
            duration: Date.now() - startTime,
            userId,
        }
        });

    return NextResponse.json({ 
      jobId: scrapingJob.id,
      results: businesses,
      nextPageToken: data.next_page_token 
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape data' }, { status: 500 });
  }
}
