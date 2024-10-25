// app/api/scrape/angi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const ANGI_API_KEY = process.env.ANGI_API_KEY;

type AngiSearchParams = {
  serviceType: string;
  location: string;
  radius?: number;
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

    const { serviceType, location, radius = 25, limit = 50 }: AngiSearchParams = await req.json();

    scrapingJob = await prisma.scrapingJob.create({
      data: {
        status: 'RUNNING',
        source: 'ANGI',
        parameters: { serviceType, location, radius, limit },
        startedAt: new Date(),
      }
    });

    // Angi API endpoint (you'll need to verify the actual endpoint)
    const response = await fetch(`https://api.angi.com/businesses/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANGI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: serviceType,
        location,
        radius,
        limit
      })
    });

    // ... rest of implementation similar to other scrapers
  }
}