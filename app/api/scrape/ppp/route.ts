// app/api/scrape/ppp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

type PPPSearchParams = {
  companyName: string;
  state?: string;
  city?: string;
  zipCode?: string;
}

type PPPLoanData = {
  name: string;
  amount: number;
  date: Date;
  jobs: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  naicsCode?: string;
  industry?: string;
  lender?: string;
}

const PROPUBLICA_API_BASE = 'https://projects.propublica.org/coronavirus/bailouts/api/v1/search';

async function fetchPPPData(params: PPPSearchParams): Promise<PPPLoanData[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('q', params.companyName);
  if (params.state) queryParams.append('state', params.state);
  
  const response = await fetch(`${PROPUBLICA_API_BASE}?${queryParams.toString()}`, {
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`API returned status: ${response.status}`);
  }

  const data = await response.json();
  
  // Filter results if city/zip provided
  let results = data.results || [];
  if (params.city) {
    results = results.filter(r => r.city?.toLowerCase() === params.city?.toLowerCase());
  }
  if (params.zipCode) {
    results = results.filter(r => r.zip?.startsWith(params.zipCode));
  }

  // Transform the data
  return results.map(loan => ({
    name: loan.name || loan.business_name,
    amount: parseFloat(loan.amount || '0'),
    date: new Date(loan.date_approved || loan.date),
    jobs: parseInt(loan.jobs_reported || loan.jobs_retained || '0'),
    address: loan.address || '',
    city: loan.city || '',
    state: loan.state || '',
    zip: loan.zip || '',
    naicsCode: loan.naics_code,
    industry: loan.industry,
    lender: loan.lender
  }));
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

    const searchParams: PPPSearchParams = await req.json();

    // Input validation
    if (!searchParams.companyName?.trim()) {
      return NextResponse.json({ 
        error: 'Company name is required' 
      }, { status: 400 });
    }

    // Create scraping job
    scrapingJob = await prisma.scrapingJob.create({
      data: {
        status: 'RUNNING',
        source: 'PPP_LOAN',
        parameters: searchParams,
        startedAt: new Date(),
      }
    });

    // Fetch data
    const processedLoans = await fetchPPPData(searchParams);

    // Store results in database
    for (const loan of processedLoans) {
      await prisma.pppLoan.create({
        data: {
          companyId: '', // To be linked with Company model
          loanAmount: loan.amount,
          loanDate: loan.date,
          jobsRetained: loan.jobs,
          rawData: loan,
        }
      });
    }

    // Calculate summary statistics
    const summary = {
      totalLoans: processedLoans.length,
      totalAmount: processedLoans.reduce((sum, loan) => sum + loan.amount, 0),
      totalJobs: processedLoans.reduce((sum, loan) => sum + loan.jobs, 0),
      averageLoanAmount: processedLoans.length > 0 
        ? processedLoans.reduce((sum, loan) => sum + loan.amount, 0) / processedLoans.length 
        : 0,
      byState: Object.entries(
        processedLoans.reduce((acc, loan) => {
          acc[loan.state] = (acc[loan.state] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
    };

    // Update job status
    await prisma.scrapingJob.update({
      where: { id: scrapingJob.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        results: processedLoans,
      }
    });

    // Log to history
    await prisma.scrapingHistory.create({
      data: {
        source: 'PPP_LOAN',
        status: 'SUCCESS',
        resultsCount: processedLoans.length,
        duration: Date.now() - startTime,
        userId,
      }
    });

    return NextResponse.json({
      jobId: scrapingJob.id,
      results: processedLoans,
      summary
    });

  } catch (error) {
    console.error('PPP loan scraping error:', error);
    
    // Update job status if it was created
    if (scrapingJob?.id && userId) {
      await prisma.scrapingJob.update({
        where: { id: scrapingJob.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      });

      // Log failed attempt
      await prisma.scrapingHistory.create({
        data: {
          source: 'PPP_LOAN',
          status: 'FAILED',
          resultsCount: 0,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
        }
      });
    }

    const status = error instanceof Error && error.message.includes('404') ? 404 : 500;
    return NextResponse.json({ 
      error: 'Failed to fetch PPP loan data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const companyId = url.searchParams.get('companyId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const [total, loans] = await Promise.all([
      prisma.pppLoan.count({
        where: { ...(companyId ? { companyId } : {}) }
      }),
      prisma.pppLoan.findMany({
        where: { ...(companyId ? { companyId } : {}) },
        orderBy: { loanDate: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      })
    ]);

    return NextResponse.json({
      data: loans,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching PPP loans:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch PPP loans',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}