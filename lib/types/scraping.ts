// types/scraping.ts
export interface USASpendingResponse {
    results: Array<{
      amount: number;
      name: string;
      code: string;
      id: number;
    }>;
    page_metadata: {
      page: number;
      total: number;
      limit: number;
    };
  }
  
  export interface LinkedInResponse {
    companySize: string;
    industry: string;
    specialties: string[];
    founded: number;
    headquarters: string;
  }