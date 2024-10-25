// app/api/scrape/google/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, location, limit } = await req.json();

    // Make a minimal API call to test
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?` + 
      `query=${encodeURIComponent(query + ' in ' + location)}` +
      `&key=${process.env.GOOGLE_API_KEY}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    const resultsCount = data.results?.length || 0;
    const estimatedCost = resultsCount * 0.017; // $0.017 per request

    return NextResponse.json({
      source: 'GOOGLE_PLACES',
      resultsCount,
      estimatedCost,
      rateLimit: '2500 requests/day',
      creditsUsed: 1
    });

  } catch (error) {
    console.error('Google Places test error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}