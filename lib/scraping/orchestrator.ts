// // lib/scraping/orchestrator.ts
// import { prisma } from '@/lib/prisma';
// import { fetchLinkedInData } from './sources/linkedin';
// import { fetchUSASpendingData } from './sources/usa-spending';
// import type { DataSource } from '@prisma/client';

// lib/scraping/orchestrator.ts
// lib/scraping/orchestrator.ts
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// import { fetchLinkedInData } from './sources/linkedin';
import { fetchLinkedInData } from '@/lib/scraping/sources/linkedin';
import { fetchUSASpendingData } from '@/lib/scraping/sources/usa-spending';
// import { fetchUSASpendingData } from './sources/usa-spending';
// import type { DataSource } from '@prisma/client';
// type DataSource = Prisma.DataSourceScalarFieldEnum;

interface ScrapingRequest {
  industryId: string;
  sources: any[];
//   sources: DataSource[];
  userId: string;
}

export async function startScraping({ industryId, sources, userId }: ScrapingRequest) {
  // Create a scraping job
  const job = await prisma.scrapingJob.create({
    data: {
      status: 'RUNNING',
      source: sources[0], // Start with first source
      parameters: { industryId },
      startedAt: new Date()
    }
  });

  try {
    // Get the industry data to use for scraping
    const industry = await prisma.industry.findUnique({
      where: { id: industryId },
      include: { majorPlayers: true }
    });

    if (!industry) {
      throw new Error('Industry not found');
    }

    // Process each source
    for (const source of sources) {
      const startTime = Date.now();

      let data;
      switch (source) {
        case 'LINKEDIN':
          // Scrape for each major player
          for (const player of industry.majorPlayers) {
            const linkedInData = await fetchLinkedInData(player.name);
            if (linkedInData) {
              await prisma.scrapedData.create({
                data: {
                  source,
                  rawData: linkedInData,
                  processed: true,
                  companyId: null, // Will be linked when company is created
                }
              });
            }
          }
          break;

        case 'USA_SPENDING':
          data = await fetchUSASpendingData(industry.name);
          if (data) {
            await prisma.scrapedData.create({
              data: {
                source,
                rawData: data,
                processed: true,
                companyId: null,
              }
            });
          }
          break;

        default:
          console.warn(`Unsupported source: ${source}`);
      }

      // Log to history
      await prisma.scrapingHistory.create({
        data: {
          source,
          status: 'SUCCESS',
          resultsCount: data ? 1 : 0,
          duration: Date.now() - startTime,
          userId
        }
      });
    }

    // Complete the job
    await prisma.scrapingJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    
    // Update job status
    await prisma.scrapingJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      }
    });

    throw error;
  }
}