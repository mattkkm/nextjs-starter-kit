export interface IndustryResearch {
  industryName: string;
  description: string;
  parameters: IndustryParameters;
  majorPlayers: string[];
}

export interface IndustryParameters {
  size: string;
  geography: string;
}

// lib/types/types.ts

// Scraper Types
export type ScraperResult = {
    source: string;
    resultsCount: number;
    estimatedCost: number;
    rateLimit: string;
    creditsUsed?: number;
  }
  
  export type ScraperConfig = {
    name: string;
    costPerRequest: number;
    rateLimit: string;
    enabled: boolean;
  }
  
  export type ScraperTestResult = {
    isLoading: boolean;
    result: ScraperResult | null;
    error: string | null;
  }
  
  // Scraper-specific Parameter Types
  export type GoogleScraperParams = {
    query: string;
    location?: string;
    radius?: string;
    type?: string;
  }
  
  export type YelpScraperParams = {
    term: string;
    location: string;
    limit?: number;
  }
  
  export type BBBScraperParams = {
    businessName: string;
    location?: string;
    limit?: number;
  }
  
  // Scraper Configurations
  export const SCRAPER_CONFIGS: Record<string, ScraperConfig> = {
    GOOGLE_PLACES: {
      name: "Google Places",
      costPerRequest: 0.017,
      rateLimit: "2500 requests/day",
      enabled: true
    },
    YELP: {
      name: "Yelp Fusion",
      costPerRequest: 0,
      rateLimit: "5000 requests/day",
      enabled: true
    },
    BBB: {
      name: "BBB Public Data",
      costPerRequest: 0,
      rateLimit: "100 requests/hour",
      enabled: true
    },
    APOLLO: {
      name: "Apollo",
      costPerRequest: 0.10,
      rateLimit: "Depends on plan",
      enabled: false
    }
  };