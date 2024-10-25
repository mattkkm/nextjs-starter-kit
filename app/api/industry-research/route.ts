// app/api/industry-research/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { startScraping } from '@/lib/scraping/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    console.log('Parsed data:', data);

    const { industryName, description, parameters, majorPlayers } = data;

    // Handle majorPlayers whether it's an array or a string
    const processedMajorPlayers = Array.isArray(majorPlayers) 
      ? majorPlayers 
      : typeof majorPlayers === 'string' 
        ? majorPlayers.split(',').map(player => player.trim()).filter(Boolean)
        : [];

    const industryResearch = await prisma.industry.create({
      data: {
        name: industryName,
        description,
        parameters,
        majorPlayers: {
          create: processedMajorPlayers.map((player: string) => ({ 
            name: player, 
            type: 'MAJOR' 
          })),
        },
        userId,
      },
    });

    // Start the scraping process for this industry
    try {
      await startScraping({
        industryId: industryResearch.id,
        sources: ['LINKEDIN', 'USA_SPENDING'], // Start with these two
        userId
      });
    } catch (scrapingError) {
      console.error('Scraping initialization error:', scrapingError);
      // We still return success since the industry was created
    }

    return NextResponse.json(industryResearch, { status: 200 });
  } catch (error) {
    console.error('Error saving industry research:', error);
    return NextResponse.json({ error: 'Failed to save industry research' }, { status: 500 });
  }
}

// Add GET endpoint to fetch industry research
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(req.url).searchParams;
    const industryId = searchParams.get('id');

    const query = industryId ? { id: industryId, userId } : { userId };

    const industries = await prisma.industry.findMany({
      where: query,
      include: {
        majorPlayers: true,
        companies: {
          include: {
            pppLoanData: true,
            scrapedData: true
          }
        }
      }
    });

    return NextResponse.json(industries);
  } catch (error) {
    console.error('Error fetching industry research:', error);
    return NextResponse.json({ error: 'Failed to fetch industry research' }, { status: 500 });
  }
}