// // lib/services/industry-data.ts
// import { prisma } from '@/lib/prisma';

// export async function collectIndustryData(industryId: string, industryName: string) {
//   try {
//     // 1. Collect LinkedIn Company Data (using their API)
//     const linkedInData = await fetchLinkedInData(industryName);
    
//     // 2. Get Market Size from USASpending.gov
//     const marketData = await fetchUSASpendingData(industryName);
    
//     // 3. Get Public Company Data from SEC EDGAR
//     const secData = await fetchSECData(industryName);

//     // Update industry with collected data
//     await prisma.industry.update({
//       where: { id: industryId },
//       data: {
//         parameters: {
//           marketSize: marketData.size,
//           growthRate: marketData.growth,
//           publicCompanyMetrics: secData,
//           employmentStats: linkedInData.employmentStats
//         }
//       }
//     });

//     return true;
//   } catch (error) {
//     console.error('Error collecting industry data:', error);
//     return false;
//   }
// }

// // LinkedIn Companies API (easiest to start with)
// async function fetchLinkedInData(industryName: string) {
//   try {
//     const response = await fetch(`https://api.linkedin.com/v2/companies`, {
//       headers: {
//         'Authorization': `Bearer ${process.env.LINKEDIN_API_TOKEN}`,
//         'X-Restli-Protocol-Version': '2.0.0'
//       },
//       method: 'GET',
//       body: JSON.stringify({
//         search: {
//           keywords: industryName
//         }
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`LinkedIn API returned ${response.status}`);
//     }

//     const data = await response.json();
//     return processLinkedInData(data);
//   } catch (error) {
//     console.error('LinkedIn API error:', error);
//     return null;
//   }
// }

// // USASpending.gov API (free and accessible)
// async function fetchUSASpendingData(industryName: string) {
//   const response = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_category/', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       filters: {
//         keywords: [industryName],
//         time_period: [
//           {
//             start_date: '2020-01-01',
//             end_date: '2024-01-01'
//           }
//         ]
//       }
//     })
//   });

//   const data = await response.json();
//   return processUSASpendingData(data);
// }

// // SEC EDGAR API (public data)
// async function fetchSECData(industryName: string) {
//   const response = await fetch(`https://data.sec.gov/submissions/CIK-lookup-data.txt`);
//   const data = await response.text();
//   return processSECData(data, industryName);
// }