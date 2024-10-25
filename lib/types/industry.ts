// types/industry.ts
type IndustryResearch = {
    basicInfo: {
      name: string;
      description: string;
      size: string;
      geography: string[];
    };
    marketStructure: {
      fragmentation: string;
      barriers: string[];
      lifecycle: 'Growing' | 'Mature' | 'Declining';
      regulations: string[];
    };
    financials: {
      avgMargins: number;
      valuationMultiples: {
        ebitda: number;
        revenue: number;
      };
      workingCapital: string;
      capexNeeds: string;
    };
    operations: {
      laborIntensity: 'Low' | 'Medium' | 'High';
      techRequirements: string[];
      locationDependency: 'Low' | 'Medium' | 'High';
      seasonality: boolean;
    };
    growth: {
      historicalGrowth: number;
      projectedCagr: number;
      riskFactors: string[];
      consolidationTrends: string;
    };
    players: {
      major: string[];
      small: string[];
      marketShare: Record<string, number>;
    };
  }