// lib/scraping/sources/usa-spending.ts
// import type { USASpendingResponse } from '@/types/scraping';

export async function fetchUSASpendingData(industryName: string) {
  try {
    const response = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_category/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filters: {
          keywords: [industryName],
          time_period: [
            {
              start_date: '2020-01-01',
              end_date: '2024-01-01'
            }
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`USASpending API returned status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('USASpending fetch error:', error);
    return null;
  }
}